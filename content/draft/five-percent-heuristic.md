---
draft: true
title: 'Layman's guide to performance optimization'
description: "5% Heuristic for performance"
date: ""
tags: ["Go", Performance", "Concurrency"]
---

At some point I started thinking how to condense performance optimization into a bite-sized idea, that could be taught in 30 minutes. Obviously, such teaching wouldn't be comprehensive and had to take some shortcuts.

Nevertheless, there are quite a lot you can learn in 30 minutes and surprisingly they cover a lot of the ground. It's mostly about getting the 80% effect, but with 20% effort. This doesn't mean you'll immediately be 10x better after reading this, but it should give some understanding how it might be done.

As with any heuristic, they are fallible. If you are thinking about special cases where these rules don't apply -- then, yes, they do exist. The examples are about Go, but they apply similarly to JavaScript, C and assembly.


## Basic Process of Optimizing

<!--
Optimizing is quite a large topic and there are a lot of parts to it. I covered the basic process of optimizing in another post:

{{< biglink link="/a-tale-of-bfs/#introduction" title="A Tale of BFS" >}}
-->

Optimizing is quite a large topic and there are a lot of parts to it. The optimization as a practice can be split into a few steps:

1. Measure - knowing what to optimize in the first place,
2. **Make a few hypotheses - guessing why things might be slow,**
3. Formulate few potential fixes - guessing how to fix things,
4. Try all promising solutions (and measure) - trying to fix things,
5. Keep the best solution (if there is one)
6. Keep the second best solution around
7. Repeat

This article is mostly about the "making the few hypotheses" step.


## 5% Heuristic

Now when I say `5%` heuristic, I actually don't mean `5%`. It's approximately `5%`, sometimes it's useful to replace that number with `10%` and sometimes with `2%`. Whichever nubmer you'll choose, usually the outcome is similar.

The general 5% heuristic is:

> If `?` takes more than 5% then try to reduce it.

At the moment, it doesn't have much significance, but we'll show how to apply this in multiple scenarios:

* The Big Picture
* Communication
* Predictability
* Computation Closeness
* Memory Usage
* Pointers


## The Big Picture

> Focus in fixing performance on parts that take more than 5%.

When something takes less than 5% in the whole picture, then at most you can gain in the large scale is 5%. It is much more effective to focus on things that take over 5%. You also want to avoid optimizing things that take less than 5%, because micro-optimization often reduces readability and maintainability.

Finally, when everything is below the 5% threshold, then often the best way forward is not to try to micro-optimize, but make changes to the algorithms, data-structures, RPC, or go to SIMD altogether.

The 5% is also a good target to aim for optimization. It's quite easy to get overly focused on a specific part. After reaching less 5% then switch to another part to optimize.

### Storytime: Base 58

One of the performance problems I noticed was base58 decoding and encoding. The hot part of the code looked like:

```go
var bigRadix = big.NewInt(58)

x := new(big.Int)
x.SetBytes(b)
answer := make([]byte, 0, len(b)*136/100)
for x.Cmp(bigZero) > 0 {
	mod := new(big.Int)
	x.DivMod(x, bigRadix, mod) // <-- hot function
	answer = append(answer, alphabet[mod.Int64()])
	...
```

The issue here is comes from using `big.Int`. For base calculations you don't need to have arbitrary-precision, if you can figure out the proper multiple then you can use that specific type instead. We can calculate the required number of bytes for the `uint` type:

```
least_common_multiple(58, 256) / 58 = 128 bytes
```

This would suggest that we need to implement `uint1024` to represent these calculations. However, this isn't in the spirit of "being lazy".

> You don’t have to implement the perfect solution.

It would be sufficient to make that function to take less than 5% time it did previously. Instead of implementing `uint1024`, we can try to reduce calls to `big.Int.Div`. Let's fit as much of the calculations into uint64 and then do the rest using `big.Int`. We can fit a 10 digit base58 number (`58^10`) into `uint64`. Hence, we can use a calculation:

```
for x > 0 {
	// Convert base 256 to 10 digits base 58 using big.Int
	mod10 := x % pow(radix, 10)
	x = x / pow(radix, 10)
	// Convert the 10 digits to single digits using uint:
	for k := 0; k < 10; k++ {
		answer = append(answer, encoding[mod10 % radix])
		mod10 = mod10 / radix
```

Of course, in practice you also need to handle the edge cases. You can take a look at [this commit](https://github.com/btcsuite/btcutil/pull/183/commits/9254c287db4f1a8034772f95cf6ac19331f34b6a) for the full change.

Overall, this optimization gave \~10x performance improvement to that function. If that function becomes a problem again, then we would need to implement the `uint1024` approach.

### Storytime: Should I avoid using `...` for performance?

There was a question in Gophers `#performance` Slack whether avoiding variadics is a useful for performance optimization. As an example:

```
// The readable version:
func Example(a int, optional ...interface{})

// The optimized version:
func Example1(a int)
func ExampleMultiple(a int, optional ...interface{})
```

I've implemented this specific optimization with [great-effect](https://github.com/golang/go/commit/e85ffec784b867f016805873eec5dc91eec1c99a). However, the usefulness of the optimization depends on the context. Instead of flipping a coin, we can do a back of the envelope calculation.

Let's guess that creating an empty slice takes 2ns. For the "slice creation" to matter, then it should take more than \~5% of the total execution time -- or 20x more, which we can guess at 400ns. So we can say that if a func takes less than \~0.4us and it's in a hot path, then we should consider replacing variadics with two separate functions.


## Communication

> Communication should take less than 5% compared to work being done.

There are plenty of places where there is communication overhead:

* GPU calls
* Disk access
* Database access
* Network calls
* CGO calls

If there's over 5% spent on these then try to make them non-blocking, batch multiple requests or even better remove them altogether.

### Example: What should I use as goroutine batch size?

Let's say you are trying to figure out an appropriate batch-size for goroutines to work on. There's a cost to starting a goroutine, let's guess it's \~1us. This suggests that we should pick a batch-size that takes at least `1us x 20 == 20us` to process.

Similarly, sending a value over channels can be around \~150ns (your milage may vary). This means that both the producer or consumer should work at least \~3us.


## Predictability

> Avoid branches/calls that have mispredictions above 5%.

One common reason for slowness is mispredictions in the CPU pipeline. CPU-s work really hard to avoid working one instruction at a time and mispredictions are a common problem. There's a great write up on branching effects at http://igoro.com/archive/fast-and-slow-if-statements-branch-prediction-in-modern-processors/.

There are similar effects with method calls. If the compiler doesn't know ahead which code it should run.

Of course, removing the branch, interface or dynamic call would be even better, however this can often take much more effort, compared to sorting.

### Example: Sorting Values

A classic example of this problem is effects you observe from sorting your data.

```go
var input = func() []int {
	input := make([]int, 1e4)
	for i := range input {
		input[i] = rand.Intn(100)
	}
	return input
}

func count50(vs []int) (total int) {
	for _, v := range vs {
		total += largerThan50(v)
	}
	return total
}

//go:noinline
func largerThan50(v int) int {
	if v < 50 {
		return 0
	} else {
		return 1
	}
}

func BenchmarkCount50(b *testing.B) {
	total := 0
	for k := 0; k < b.N; k++ {
		total += count50(input)
	}
}
```

_The `go:noinline` pragma is necessary to prevent some compilation optimizations from happening._

If we benchmark this with sorted and unsorted data, we'll get that the unsorted runs at `~69us/op` and the sorted runs at `~23.5us/op`, this is a 3x performance difference from just sorting the data.

A practical example can be seen in [sorting nodes in graph traversal](https://egonelbre.com/a-tale-of-bfs/#sorting-vertices).

### Example: Sorting Types

As mentioned, we can have similar effects in interface method overhead:

```go
type Shape interface {
	Area() float32
}

type Circle struct { Radius float32 }
type Square struct { Side float32 }

func (s Circle) Area() float32 {
	return math.Pi * s.Radius * s.Radius
}
func (s Square) Area() float32 {
	return s.Side * s.Side
}

func TotalArea(shapes []Shape) (total float32) {
	for _, shape := range shapes {
		total += shape.Area()
	}
	return total
}

var shapes = func() []Shape {
	shapes := make[[]Shape, 1e4]
	for i := range shapes {
		if rand.Intn(2) == 0 {
			shapes[i] = Circle{rand.Float32()}
		} else {
			shapes[i] = Square{rand.Float32()}
		}
	}
	return shapes
}

func BenchmarkShapes(b *testing.B) {
	total := float32(0)
	for k := 0; k < b.N; k++ {
		total += TotalArea(shapes)
	}
}
```

If we keep the `shapes` unsorted we'll end up with `~88us/op`, however if we sort the slice based on the types it'll run at `~39us/op`, or \~2x faster.


## Memory Closeness

> Pay attention when you have over 5% memory accesses outside 5MB range.

Another important CPU feature is cache hierarchy. CPU-s have multiple places of to store data closer to the CPU. The closer it is, then the less time CPU-s need to wait for RAM. As an approximation, if your memory accesses only use 5MB of memory, then they will be in L2 cache... most of the time. The specifics will vary from processor to processor.

You can read more on the effects of memory hierarchy in http://igoro.com/archive/gallery-of-processor-cache-effects/.

Many of the cache-oblivious algorithms and data-strcutures are designed to take into account the memory hierarchy. Sometimes it's useful to redo some calculations than to fetch the result from a table.


## Data Closeness

> If you only access 5% of the data, most of the time, then add a cache.

You can also reinterpret the "5% heuristic" for data slightly differently. There are quite a few data-structures to bring data the closer. It's quite widely known that data access patterns are not randomly uniform.

I roughly divide these data structures that bring "data closer" into two categories:

* Caches - things that keep some of the data somewhere closer.
* Reductions - things that aggregate the data together to speed up calculating the answer.

Both of these ideas can be combined together to make custom data-structures.

### Caches

Caches in principle copy the data or parts of the data into something that's faster to accesss. The cache might keep frequently accessed copies of data in RAM instead of accessing them from the database all the time. Of course, caches introduce a new problem -- they need to be kept up-to-date.

There are many variations on [caching policies](https://en.wikipedia.org/wiki/Cache_replacement_policies), but, usually it's good to try either:

* LRU - least recently used
* RR / 2-random - random replacement

_Of course, these shouldn't be implemented using linked lists._

The main reason to start with these two, is that they are relatively easy to implement and understand. Similarly, they perform well in a variety of settings.

### Reductions

I'm sure there's a more formal name for these, but I name these "reductions". Their main idea is that you combine (i.e. "reduce") the data into "summaries". Things that help you either find the data you are looking for or answer questions about the data.

* Trees
* Bloom/Cuckoo filters
* (Multilevel) bitmaps

## Memory Usage

> Reduce memory usage for things that vary less than 5% of the time.

There's a lot of struct fields that don't vary that much, so it can be really helpful to treat the other 95% in a special manner.

### Example: an ID

_I have forgotten some of the exact details about the problem, but hopefully it gets the idea across._

At some point I had an ID type, ehere the possible character values were `a`-`z`, `0`-`9`, `-`, `_`, and few more. Total of 41 different characters.

```
type ID [12]byte
```

There were quite a lot of them needed to be kept in-memory for lookups. To reduce memory usage it would be nice to replace these with a smaller data-type, e.g. uint64. However, the data doesn't trivially fit into it.

One easy solution would be to use a lookup table, e.g. `type Lookup map[ID]uint64`. However, this added a lot of overhead to the lookup itself, negating the win from smaller datatype.

At some point, I realized, that I don't need to treat all the ID-s in the same way. ID-s starting with some symbols, such as `-` and `_`, were much rarer.

To fit the ID to an uint64 it would require `log2(pow(41,12)) = 64.290 bits`. I noticed that if the ID were smaller, you could directly use uint64: `log2(pow(41,11)) = 58.933`. I wasn't able to change the ID type, but what if I treated some of the values differently `log2(33 * pow(41, 11)) = 63.977`.

So I came up with this solution:

```
// MaxEncoding = 24 * pow(41, 11)
const MaxEncoding = 24 * 41 * 41 * 41 * 41 * 41 * 41 * 41 * 41 * 41 * 41 * 41

func Encode(id ID) (encoded uint64, ok bool) {
	if id[0] < 'a' || id[0] > 'z' {
		return 0, false
	}

	for _, p := range id {
		encoded = encoded * 41 + encoding[p]
	}
	return encoded, true
}
```

This still left me quite a lot of uint64-s to have a separate lookup table for those values that this scheme wouldn't encode. In the end, this scheme allowed to encode 99% of the ID-s with an uint64.

## Pointers

> Reduce pointer usage if they take over 5% of the memory.

There are quite a few drawbacks to using a "pointery" data-structure:

* pointers use up memory,
* data is indirect (harder to predict),
* data is usually not one the same cache line,
* it makes GC slower (for languages that have it)

For example, we can take a really simple linked-list:

```go
type Node struct {
	Value int
	Next  *Node
}
```

We can calculate that 50% of this data structure is made of pointers. To remedy the situation we can try increasing number of "data points per pointer":

```go
type Node struct {
	Count byte
	Value [64]int
	Next  *Node
}
```

Alternatively, we can try using indexing instead of pointers. This won't get rid of the indirection overhead, however it does reduce memory usage.

```
type Nodes []Node
type Node struct {
	Value  uint16
	Offset uint16
}
```

Many tree and graph algorithms can be optimized in a similar manner. These optimization can lead to a 2x performance improvement.

## Case Study: Trie

Here's a final example where all of these ideas have been put together into optimizing a trie data-structure.

The most basic formulation of trie is:

```go
type Node struct {
	Label rune
	Term  bool
	Edges []Node
}
```

One common optimization is to avoid single-node chains and combine them into a single string.

```go
type Node struct {
	Label  rune
	Term   bool
	Suffix string
	Edges  []Node
}
```

The next thing is to avoid fragmenting the memory and avoiding the pointer in edges slice:

```go
type Trie []Node

type Node struct {
	Label  rune
	Term   bool
	Suffix string

	EdgeCount  byte
	EdgeOffset uint32
}

func (t Trie) Edges(n Node) []Node {
	off := int(n.EdgeOffset)
	count := int(n.EdgeCount)
	return t[off:off+count]
}
```

Similarly, since most text doesn't use runes we can replace it with a single byte. _This is not the case for all languages, they would need a different optimization._

```go
type Node struct {
	Label  byte
	Term   bool
	Suffix string

	EdgeCount  byte
	EdgeOffset uint32
}
```

We still have a hidden pointer in `string` that we would like to get rid of.

```go
const MaxSuffix = 2

type Node struct {
	Label  byte
	Term   bool
	Suffix [MaxSuffix]byte

	EdgeCount  byte
	EdgeOffset uint32
}
```

In the particular usecase it didn't have `0` runes, so we can use that to terminate the suffix. We can benchmark to find the appropriate value for `MaxSuffix`.

Finally Term and EdgeCount both use a byte, however, for the bool only 1 bit out of 8 are being used. For EdgeCount it's using more, but still not the full 8. Lets combine them:

```go
type Node struct {
	Label  byte
	Flags  byte // (EdgeCount << 1) | Term
	Suffix [MaxSuffix]byte

	EdgeOffset uint32
}
```

Overall the data-structure performance difference:

```go
// Naive version
type Basic struct {
	Label  rune
	Term   bool
	Suffix string
	Edges  []Node
}

// Optimized version
const MaxSuffix = 2

type Nodes []Node

type Node struct {
	Label  byte
	Flags  byte // (EdgeCount << 1) | Term
	Suffix [MaxSuffix]byte

	EdgeOffset uint32
}
```

|  | Sorted Strings | Basic | Optimized |
|-|-|-|-|
| Search | 196ns per key | 198ns per key | 95ns per key |
| Size | 1.9MB |  | 2.3MB |
|  |  |  |  |

Overall, this ended up making things much faster. Also that specific trie implementation ended up being trivial to mmap to disk.

## Conclusion: 5% Heuristic

Hopefully this gives a quick tool to figure out different ideas on what to optimize when you notice something being slow.

* The Big Picture - less than 5% doesn’t matter.
* Communication - overhead should be less than 5% of work.
* Predictability - don’t mispredict over 5% of the time.
* Memory Closeness - keep computations to 5MB range.
* Data Closeness - add a cache when you need 5% of data most of the time.
* Memory Usage - compact data with less than 5% variance.
* Pointers - should take less than 5% of your memory.

This 5% heuristic is not perfect, however I think it's pretty useful.
