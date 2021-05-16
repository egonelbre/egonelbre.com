---
draft: true
title: 'Five percent heuristic'
description: Lazy approach to perofrmance optimization.
date: ""
tags: ["Go", Performance", "Concurrency"]
---

At some point I started thinking how to condense performance optimization into a bite-sized piece, that can be taught in 30 minutes, but gives you as much benefit as possible.

This article is based on a talk I did at https://systemsconf.io/. If you prefer video, then the talk is available here https://www.youtube.com/watch?v=51ZIFNqgCkA.

This article won't go into details on the examples, however you can definitely ask any follow-up questions in [Gophers Slack](https://invite.slack.golangbridge.org/) #performance channel.

You might ask, "Why lazy?". I think there are many skills that can be learned in 30 minutes that can become really powerful. It's about getting the 80% of the effect, but with 20% of the effort. You won't immediately know how to apply them quickly, but there's no shortcut for that part. 

As with any heuristic, they are fallible in certain scenarios. If you are thinking about special cases where these rules don't apply -- then, yes, they do exist. I show the examples in Go, but the principles are pretty much the same in JavaScript, C and assembly.

# Basic Process of Optimizing

I covered the basic process of optimizing in another post:

{{< biglink link="/a-tale-of-bfs/#introduction" title="A Tale of BFS" >}}

To recap, optimizations can be split into few steps:

1. Measure - knowing what to optimize in the first place,
2. **Make a few hypotheses - guessing why things might be slow,**
3. Formulate few potential fixes - guessing how to fix things,
4. Try all promising solutions (and measure) - trying to fix things,
5. Keep the best solution (if there is one)
6. Keep the second best solution around
7. Repeat

This article is mostly about "making the few hypotheses" and examples how you might go about fixing them.

# 5% Heuristic

Now when I say `5%` heuristic, I actually don't mean `5%`. It's more of approximately `5%`, sometimes it's useful to replace that exact number with `10%` or `2%`, however, I don't think it'll make a significant difference in the outcome.

The general heuristic can be stated as:

> If `?` takes more than 5% then try to reduce it.

There are a lot of things you can use it on:

* The Big Picture
* Communication
* Predictability
* Computation Closeness
* Memory Usage
* Pointers

We'll go over these one-by-one.

# The Big Picture

> Focus in fixing performance on parts that take more than 5%.

It's not hard to understand, that when something takes less than 5% in the whole picture, then at most you can gain in the large scale is 5%. It is much more effective to focus on things that take over 5%. Usually you want to avoid such micro-optimizations, because optimization often reduces readability and maintainability.

But, there's also an other side to this. When all of the things are less than 5%, then the effort to optimize a particular thing is much higher. Usually, you will need to rethink the whole problem, use different data-layout, restructure your whole RPC to be asynchronous or drop-down to assembly. While it's fun to try and squeeze out the last drop of performance, it may not always make sense.

It also gives a good target to aim while optimizing, when you get something to 5%, then it's more useful to find another place to optimize.

## Base 58

One of the performance issues I hit was "base58 decoding/encoding performance".

Before

> You don’t have to implement the perfect solution.

After

## Should I avoid using `...` for performance?

There was a question in #performance whether avoiding variadics is a useful for performance optimization. As an example:

```
// The readable version:
func Example(a int, optional ...interface{})

// The optimized version:
func Example1(a int)
func ExampleMultiple(a int, optional ...interface{})
```

I've done this specific optimization with [great-effect](https://github.com/golang/go/commit/e85ffec784b867f016805873eec5dc91eec1c99a). However, the usefulness of the optimization depends on the context.

Instead of flipping a coin, we can do a better estimation. Let's say creating an empty slice of interfaces takes 2ns (this number is a guess). For the "slice creation" to matter, then it should take more than 5% of the total execution time -- or roughly 20x more, which we guess at 400ns. Because we are dealing with estimates, we can say that func takes less than \~0.5us we can consider replacing variadics with two separate funcs.

# Communication

> Communication should take less than 5% compared to work being done.

We can apply 5% idea to goroutines. For example, let's say you try to figure out an appropriate batch-size for work items. There's a cost to starting a goroutine, let's say it's \~500ns (it's a guess). This suggests that we should pick a batch-size that takes at least `500ns x 20 == 10000ns = 10us`.

We can do similar calculations for:

* CGO calls
* GPU calls
* Disk access
* Database access
* Network calls

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
