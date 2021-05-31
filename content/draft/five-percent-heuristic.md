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


> Removing the  branch or interface is better.
> But, often takes more effort.

# Computation Closeness

> Pay attention when you have over 5% memory accesses outside 5MB range.

# Memory Usage

> Reduce memory usage for things that vary less than 5% of the time.

# Pointers

> Reduce pointer usage if they take over 5% of the memory.

# Putting all the ideas together

# Conclusion: 5% Heuristic

* The Big Picture - less than 5% doesn’t matter.
* Communication - overhead should be less than 5% of work.
* Predictability - don’t mispredict over 5% of the time.
* Computation Closeness - keep computations to 5MB range.
* Memory Usage - compact data with less than 5% variance.
* Pointers - should take less than 5% of your memory.

This 5% heuristic is not perfect, however I think it's pretty useful.
