---
date: "2018-07-12T12:00:00+03:00"
title: "What is a Layer"
summary: How could we automatically detect layer mixing.
tags: ["Software Concepts"]
reviewers: ["Taavi Kivisik"]
---

This question was bothering me a long time. I mean there are often suggestions for readability such as, don’t mix business and database layer or don’t mix abstraction layers.

On the surface, it seems like an easy question, and it looks like there are answers to that question:

> In object-oriented design, a layer is a group of classes that have the same set of link-time module dependencies to other modules. In other words, a layer is a group of reusable components that are reusable in similar circumstances. In programming languages, the layer distinction is often expressed as “import” dependencies between software modules.  --  [Wikipedia](https://en.wikipedia.org/wiki/Layer_%28object-oriented_design%29)

and

> In computing, an abstraction layer or abstraction level is a way of hiding the implementation details of a particular set of functionality, allowing the separation of concerns to facilitate interoperability and platform independence.\[snip\] An abstraction layer is a generalization of a conceptual model or algorithm, away from any specific implementation.  --  [Wikipedia](https://en.wikipedia.org/wiki/Abstraction_layer)

However, this really doesn’t fully answer the question.

*   How would you write a program to detect a layer?
*   How would you write a program that detects a mixing of layers?
*   Why is mixing layers bad for readability?

When does database layer transition over into domain layer? Could you write a program that draws the line between layers when they are mixed?

_Before proceeding I recommend to think about it a little, because I’m interested in other opinions on it as well._

![](https://cdn-images-1.medium.com/max/800/1*fNbhSBQK05H4A8pvJ1AKiQ.png)

My first realization was that there really isn’t a fixed line between layers. It is something which is chosen by a programmer. There is always a gradient from one layer to another. For example Data Access Object is partly related to a domain and partly to a database.

Considering that there is a gradient from one layer to another, it’s not that surprising that we misclassify things or have trouble classifying. Sometimes these “misclassifications” end up as [leaky abstractions](https://en.wikipedia.org/wiki/Leaky_abstraction), or in other words, things that leak leak hidden implementation details.

![](https://cdn-images-1.medium.com/max/800/1*HYSXFFOVjCU9IctsD9Fd7w.png)

This might seem like we are getting further away from a measurable “layer”, but it gives one important insight:

> Layers are a human concern not a technical one.

Let’s imagine having code which includes both database interaction and some inline-assembly. This is often called mixing of “abstraction layers”. However in an high-performance numeric library, using inline assembly (or [intrinsics](https://en.wikipedia.org/wiki/Intrinsic_function)) might be completely fine.

One of the major reasons to use abstractions is to remove and hide the non-essential. That way we can focus more on the given task at hand.

In other words, it’s about keeping our locus of attention in a specific place in our code and mental model. The way we think about domain concepts is somewhat different from the way machine works. When we switch between those ways of thinking we are also switching between ideas.

With the high-performance numeric library using machine level details, such as SIMD, doesn’t add significant mental overhead, because for high-performance you already need to think how the machine operates. Effectively how machine operates is part of high-performance mental model.

For all intents and purposes, switching between layers has all the same downsides as multitasking.

---

We see a layer encouraging:

*   mental model cohesion
*   code reuse

Initially we asked how we would detect mixing of layers. Code reuse detection is conceptually not that complicated. When several projects end-up copying the same code with minor differences it can be classified as repeated code.

How do we detect mental model cohesion? I’m going to suggest using machine learning, which obviously isn’t as easy as I make it sound.

We could learn a [word embedding](https://en.wikipedia.org/wiki/Word_embedding) using books on different topics. For example we could learn the domain of accounting from different laws or books. Then learn things from database books. Learn coding from coding books. In a sense, we could say that mental model cohesion is approximately the same as word distance in books.

Having learned the embedding, we can see whether the code at hand has terminology from different clustered areas. When a name which is not strongly aligned with the other words in a scope, then it may indicate a bad name, and possibly mixed layers. _Of course, there are many tiny things that need to be considered to make this model useful. If you do end up implementing it, I’m definitely interested in the results._

---

After understanding these concepts, I think _layer_ is a bad name and evokes bad imagery when used to describe the problems.

I think visualizing these things as bubbles of ideas that we want to keep as clear as possible is more useful than trying to stack things on top of each other. It’s important to note that in reality the classification has many more dimensions than would fit on a single flat image.

![cohesion of ideas](https://cdn-images-1.medium.com/max/800/1*P6BJmiUhxbdJu5zjM2AxEA.png)
cohesion of ideas

There are few important parts to layers / abstractions:

1.  mental model cohesion
2.  code reuse
3.  [_shearing layers_](https://en.wikipedia.org/wiki/Shearing_layers) _(which we ignored in this post)_

We could also potentially add _hiding information_ as well, but I think that it comes implicitly with _mental model cohesion_.

Thinking in terms of cohesive ideas is more vague, however, it makes us notice why we are organizing things in the first place. It gets us closer to visualizing the fundamental forces that created the layers in the first place.