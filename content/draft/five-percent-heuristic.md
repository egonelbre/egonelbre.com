---
draft: true
title: 'Five percent heuristic'
description: Lazy approach to perofrmance optimization.
date: ""
tags: ["Go", Performance", "Concurrency"]
---

_This article is based on a talk I did at https://systemsconf.io/. If you prefer video, then the talk is available here https://www.youtube.com/watch?v=51ZIFNqgCkA._

At some point I started thinking how to condense performance optimization into a bite-sized idea, that can be taught in 30 minutes. Obviously it the simplification wouldn't be perfect, but hopefully it gives guidance to beginners.

You might ask, "Why lazy?". I think there are many skills that can be learned in 30 minutes that can become really powerful. It's about getting the 80% of the effect, but with 20% of the effort. You won't immediately know how to apply them quickly, but there's no shortcut for that part.

As with any heuristic, they are fallible in certain scenarios. If you are thinking about special cases where these rules don't apply -- then, yes, they do exist. I show the examples in Go, but the principles are pretty much the same in JavaScript, C and assembly.

# Basic Process of Optimizing

Optimizing is quite a large topic and there are a lot of parts to it. I covered the basic process of optimizing in another post:

{{< biglink link="/a-tale-of-bfs/#introduction" title="A Tale of BFS" >}}

To recap, optimizing can be split into a few steps:

1. Measure - knowing what to optimize in the first place,
2. **Make a few hypotheses - guessing why things might be slow,**
3. Formulate few potential fixes - guessing how to fix things,
4. Try all promising solutions (and measure) - trying to fix things,
5. Keep the best solution (if there is one)
6. Keep the second best solution around
7. Repeat

This article is mostly about the "making the few hypotheses" step.

# 5% Heuristic

Now when I say `5%` heuristic, I actually don't mean `5%`. It's approximately `5%`, sometimes it's useful to replace that number with `10%` and sometimes with `2%`, however, I don't think it'll make a significant difference in the outcome.

The general heuristic can be stated as:

> If `?` takes more than 5% then try to reduce it.

This probably doesn't say much at the moment, but it can be applied in serveral scenarios:

* The Big Picture
* Communication
* Predictability
* Computation Closeness
* Memory Usage
* Pointers

We'll go over these one-by-one.

# The Big Picture

> Focus in fixing performance on parts that take more than 5%.

It's not hard to understand, that when something takes less than 5% in the whole picture, then at most you can gain in the large scale is 5%. It is much more effective to focus on things that take over 5%. You usually also want to avoid optimizing things that take less than 5%, because micro-optimization often reduces readability and maintainability.

But, there's also an other side to this. When all of the things are less than 5%, then the effort to optimize a particular thing is much higher. Usually, you will need to rethink the whole problem, use different data-layout, restructure your whole RPC to be asynchronous or start using SIMD. While it's fun to try and squeeze out the last drop of performance, it does not always make sense.

It also gives a good target to aim while optimizing, when you get something to 5%, then it's more useful to find another place to optimize.

## Example: Base 58

One of the performance problems I noticed was "base58 decoding/encoding performance".

The hot part of the code was something like:

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

The issue here is comes from using `big.Int`, which is in infinite in precision and hence it is slow. We can calculate the required uint size to avoid overflow.

```
least_common_multiple(58, 256) / 58 = 128 bytes
```

This would suggest that we need to implement `uint1024` to represent these calculations. However, this isn't in the spirit of "being lazy".

> You don’t have to implement the perfect solution.

It would be sufficient to make that function to take less than `~5%` time it did previously. So, instead of implementing `uint1024`, we can try to reduce calls to `big.Int.Div`. In principle we can do this, by dividing the big.Int by `58^10` to avoid individual divisions. Why `58^10`, because it's the largest number that still fits into `uint64`.

The idea in pseudo-code is:

```
for x > 0 {
	// Convert base 256 to base 58^10 using big.Int
	mod10 := x % pow(radix, 10)
	x = x / pow(radix, 10)
	// Convert base 58^10 to base 58 using uint:

	for k := 0; k < 10; k++ {
		answer = append(answer, encoding[mod10 % radix])
		mod10 = mod10 / radix
```

Of course, in practice you also need to handle the edge cases. You can take a look at [this commit](https://github.com/btcsuite/btcutil/pull/183/commits/9254c287db4f1a8034772f95cf6ac19331f34b6a) for the full change.

Overall, this optimization gave \~10x performance improvement to that function.

## Example: Should I avoid using `...` for performance?

There was a question in `#performance` whether avoiding variadics is a useful for performance optimization. As an example:

```
// The readable version:
func Example(a int, optional ...interface{})

// The optimized version:
func Example1(a int)
func ExampleMultiple(a int, optional ...interface{})
```

I've done this specific optimization with [great-effect](https://github.com/golang/go/commit/e85ffec784b867f016805873eec5dc91eec1c99a). However, the usefulness of the optimization depends on the context. Instead of flipping a coin, we can do a back of the envelope calculation to figure it out.

Let's guess that creating an empty slice of interfaces takes 2ns. For the "slice creation" to matter, then it should take more than 5% of the total execution time -- or roughly 20x more, which we can guess at 400ns. Because we are dealing with estimates, we can say that func takes less than \~0.5us and it's in a hot path, then we can consider replacing variadics with two separate functions.

# Communication

> Communication should take less than 5% compared to work being done.

Similarly to function calls we can apply the 5% calculation to communication overheads. There are plenty of places where there is communication overhead:

* GPU calls
* Disk access
* Database access
* Network calls
* CGO calls

If there's over 5% spent on these then maybe it's possible to either make them non-blocking or batch multiple requests together.

## Example: Goroutines

Let's say you are trying to figure out an appropriate batch-size for goroutines to work on. There's a cost to starting a goroutine, let's guess it's \~500ns. This suggests that we should pick a batch-size that takes at least `500ns x 20 == 10000ns = 10us` to process.

Similarly, sending a value over channels can be around \~150ns (your milage may vary). This means that to produce or consume each item should be \~3000ns+.

# Predictability

> Avoid branches/calls that have mispredictions above 5%.

One common reason for slowness is mispredictions in the CPU pipeline. CPU-s work really hard to avoid working one instruction at a time, but intead work at multiple things at a time. There's a great write up on branching effects http://igoro.com/archive/fast-and-slow-if-statements-branch-prediction-in-modern-processors/.

Similar effects are also present with func/method calls. If the compiler doesn't know ahead which code it should run.

Of course, removing the branch, interface or dynamic call would be even better, however this can often take much more effort, compared to sorting.

## Example: sorting values

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
		total += fn(v)
	}
	return total
}

//go:noinline
func fn(v int) int {
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

If we benchmark this with sorted and unsorted data, we'll get that the unsorted runs at `~69000ns/op` and the sorted runs at `~23500ns/op`, this is a 3x performance difference from just sorting the data.

We can see similar effects when sorting [graph nodes for traversal](todolinktoBFS).

## Example: sorting types

We can observe similar effects from method call overhead:

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

If we keep the `shapes` unsorted we'll end up with `~88000ns/op`, however if we sort the slice based on the types it'll run at `~39000ns/op`, or \~2x faster.

# Memory Closeness

> Pay attention when you have over 5% memory accesses outside 5MB range.

One other common thing is to consider the cache hierachy. You can roughly assume that, if your memory accesses only use 5MB of memory, then they will be in L2 cache -- most of the time. The specifics will vary from processor to processor.

You can read more on the effects of memory hierarchy in http://igoro.com/archive/gallery-of-processor-cache-effects/.

Many of the cache-oblivious are designed to take into account the memory hierarchy. Effectively, they design data-structures to look at fewer cache-lines, but maybe at the cost of more cpu instructions.

# Data Closeness

> If you only access 5% of the data most of the time, then add a cache.

You can also reinterpret the "5% heuristic" for data slightly differently. There are quite a few data-structures to bring data the closer. It's quite widely known that data access patterns are not randomly uniform.

I roughly divide these data structures that bring "data closer" into two categories:

* Caches - things that keep some of the data somewhere closer.
* Reductions - things that aggregate the data together to speed up calculating the answer.

Both of these ideas can be combined together to make custom data-structures.

## Caches

Caches in principle copy the data or parts of the data into something that's faster to accesss. The cache might keep frequently accessed copies of data in RAM instead of accessing them from the database all the time. Of course, caches introduce a new problem -- they need to be kept up-to-date.

There are many variations on [caching policies](https://en.wikipedia.org/wiki/Cache_replacement_policies), but, usually it's good to try either:

* LRU - least recently used
* RR / 2-random - random replacement

_Of course, these shouldn't be implemented using linked lists._

The main reason to start with these two, is that they are relatively easy to implement and understand. Similarly, they perform well in a variety of settings.

## Reductions

I'm sure there's a more formal name for these, but I name these "reductions". Their main idea is that you combine (i.e. "reduce") the data into "summaries". Things that help you either find the data you are looking for or answer questions about the data.

* Trees
* Bloom/Cuckoo filters
* (Multilevel) bitmaps

# Memory Usage

> Reduce memory usage for things that vary less than 5% of the time.

There's a lot of struct fields that don't vary that much, so it can be really helpful to treat the other 95% in a special manner.

## Example: an ID

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

# Pointers

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

# Case Study: Trie

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

# Conclusion: 5% Heuristic

Hopefully this gives a quick tool to figure out different ideas on what to optimize when you notice something being slow.

* The Big Picture - less than 5% doesn’t matter.
* Communication - overhead should be less than 5% of work.
* Predictability - don’t mispredict over 5% of the time.
* Memory Closeness - keep computations to 5MB range.
* Data Closeness - add a cache when you need 5% of data most of the time.
* Memory Usage - compact data with less than 5% variance.
* Pointers - should take less than 5% of your memory.

This 5% heuristic is not perfect, however I think it's pretty useful.
