---
draft: true
title: Approximating Readability
description: "Idea on how to automatically approximate code readability."
date: ""
tags: []
---

I’ve written quite a few articles on readability and this is one of the reasons. The state-of-art in code-quality measurement isn’t that impressive. \[TODO link to articles\]

I will outline a method for approximating readability using psychological factors as our baseline. I’m open to suggestions how this could be better.

All of the following assumes you are familiar with previous posts and familiar with some code metrics, such as LOC or Halstead-V.

1.  [Psychology of Code Readability](https://medium.com/@egonelbre/psychology-of-code-readability-d23b1ff1258a)
2.  [Learning Code Readability](https://medium.com/@egonelbre/learning-code-readability-a80e311d3a20)
3.  [What Is a Layer?](https://medium.com/@egonelbre/what-is-a-layer-948bb1a26b5d)
4.  Thoughts on Code Organization

## Goals

There are few things that a good code readability metric should do:

**_The metric should strongly correlate with how people would rate readable code._**

I think this is one of the examples that highlights how poorly existing code metrics approximate readability. This code is only about changing the whitespace, however it significantly changes readability.

**_The metric should have actionable meaning._**

It’s not sufficient to show a some number that gives ordering to code examples. We want metrics such that we can improve code with as little trial and error.

**_The metric should have understandable meaning._**

Actionable metric implies that we can understand what the metric means. Not just how it’s calculated, but how it impacts how well we can read a particular piece of code. We also cannot give 100 different numbers, since it would be overwhelming and hard to use.

Ideally the system would also give recommendations how to change the code to be better or what are the largest offenders in readability.

**_The metric should be applicable to all different languages._**

While it’s hard to implement a single thing that works across all languages at the same time, it should be possible to use similar principles for imperative, functional, logical and visual languages.

**_The metric should assume as little as possible._**

When we disallow coding specific rules and get similar results, it means we have found concepts that are more fundamental.

The following approach definitely does not capture all the ideals outlined. Consider it as a first draft.

## Reader skill

We have to understand that there are multiple people readers that could be reading the code. If we would take the metric relative to the person “who knows nothing”, then we would have to start by analyzing complexity of reading letters.

It would be too time-consuming to create a reading target group manually. It also would be biased. It is easy to assume that the skill level of people creating the metric is higher than the average, hence they would underestimate the complexity. There are a few candidates for the “reader”.

**Beginner **—we could try to figure out what is the minimal skill to work with the language. This usually corresponds to knowledge present in a beginners book. However this is not a good measurement baseline, since for beginners even basic ideas such as variables and scopes can be difficult.

**Professional **— a better approach would be to try and measure what are the skills that are needed in practice to work with usual code-bases. Of course this doesn’t mean most popular, since most of code-bases are not popular.

**Company or Project**—instead of using the global baseline, we should also consider that some problems are intrinsically more complex and require more skill. For example it is safe to assume that anyone working with game programming should have basic understanding of vectors.

In essence take a set of code-bases that represent the things that most people work with. Then extract the appropriate baseline for measurements.

\[EXAMPLE\]

## Direct and Indirect

We also can make a difference between local and system metric. For example even though all of your methods might be under five lines of code the system itself could be extremely hard to follow. We should be able to measure both.

## Confusion

## Idioms

familiarity / idioms

mining familiarity

pattern recognition

## Working Memory

locality

context switching

context stacking

distance

## Mental Models


## Case Studies

### Whitespace

```
a := b + c

vs.

a := b                 +
				 c
```

```
u.X = z.X - r.X
u.Y = z.Y - r.Y
v.X = z.X + r.X
v.Y = z.Y + r.Y

vs.

u.X = z.X - r.X
u.Y = z.Y - r.Y

v.X = z.X + r.X
v.Y = z.Y + r.Y
```

### Idioms

```
for i := 0; i < len(items); i++ {
	...
}

vs.

for i := 0; len(items) > i; i++ {
	...
}
```

### Pattern Matching

```
v.X = z.X + r.X
v.Y = z.Y + r.Y

vs.

v.X = z.X + r.X
v.Y = r.Y + z.Y
```

### Context Stacking

```
a := open()
b := open()
b.Close()
a.Close()

vs.

a := open()
b := open()
a.Close()
b.Close()
```

```
a := open()
b := open()
b.Close()
a.Close()

vs.

a := open()
b := open()
a.Close()
b.Close()
```

```
for i := 0; i < N; i += 2 {
    ...
}

vs.

for i := 0; i < N; i++ {
    ...
    i++
}
```

### Naming

```
var lfjncauk int

vs.

var total int

vs.

var ttl int

vs.

var t int
```