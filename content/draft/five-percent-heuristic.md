---
draft: true
title: 'Five percent heuristic'
description: Lazy approach to perofrmance optimization.
date: ""
tags: ["Go", Performance", "Concurrency"]
---

At some point I started thinking how to condense performance optimization into a bite-sized piece, that can be taught in 30 minutes, but gives you most of the benefit.

This article is based on a talk I did at https://systemsconf.io/. If you prefer video, then the talk is available here https://www.youtube.com/watch?v=51ZIFNqgCkA.

This article won't go into details on the examples, however you can definitely ask any follow-up questions in [Gophers Slack](https://invite.slack.golangbridge.org/) #performance channel.

You might ask, "Why lazy?". I think many of the things can be learned within 30 minutes and then become effective after 20 hours. It's about getting the 80% of the effect, but with 20% of the effort.

As with any heuristic, they are fallible in certain scenarios. If you are thinking about special cases where these rules don't apply -- then, yes, they do exist. I do show examples in Go, but the principles are pretty much the same in JavaScript, C and assembly.

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

Now when I say 5% heuristic, I actually don't mean 5%. It's more of approximately 5%, sometimes it's useful to replace that exact number with 10% or 2%, however I don't think it'll make a significant difference in the outcomes.

As the general idea the heuristic can be stated as:

> If `?` takes more than 5% then try to reduce it.

There are a few places where you could apply this:

* The Big Picture
* Communication
* Predictability
* Computation Closeness
* Memory Usage
* Pointers

We'll go over these one-by-one.

# The Big Picture

> Focus in fixing performance on parts that take more than 5%.

It's not hard to understand that when something takes less than 5% in the whole picture, then at most you can gain by improving it is 5%. It is much more effective to focus on things that take over 5%.

But, there's also an other side to this -- when all of the things are less than 5%, then the effort to optimize is often much higher. Usually this means that you need to rethink the whole problem, use different data-layout, use a different layout or drop-down to assembly. While it's fun to try and squeeze out the last drop of performance, it may not always make sense.

## Base 58

T

> You don’t have to implement the perfect solution.

## Should I avoid using `...` for performance?

There was a question in #performance whether avoiding variadics is a useful for performance optimization. These functions look like:

```
// The readable version:
func Example(a int, optional ...interface{})

// The optimized version:
func Example1(a int)
func ExampleMultiple(a int, optional ...interface{})
```

I've done this specific optimization with [great-effect](https://github.com/golang/go/commit/e85ffec784b867f016805873eec5dc91eec1c99a). However, the usefulness of the optimization depends on the context.

Instead of flipping a coin, we can do a better estimation. Let's say creating an empty slice of interfaces takes 2ns (this number is probably wrong). For the "slice creation" to be less than 5% the func should take 95% of the time -- or roughly 20x more, which is 400ns. With very rough estimation, the function should take less than 0.5us for this optimization to be useful. If it's at the "exact" 0.5us mark, then we probably should do exact measurements, however if the func takes 10us, it won't make sense to optimize.

# Communication

> Communication should take less than 5% compared to work being done.

Similar concepts apply to:

* CGO calls
* GPU calls
* Disk access
* Database access
* Network access

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
