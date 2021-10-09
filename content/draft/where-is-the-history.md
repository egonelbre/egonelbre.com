---
draft: true
title: Where is the history?
description: "Discussion on the bias in learning the easy things."
date: ""
tags: []
---

TODO: BETTER INTRO

TODO: David Parnas

TODO: Physics of software

TODO: GoF


<!--
I've been wondering about that for a while, because this also happened with Scrum, Lean, DDD (to some degree), Patterns... I suspect the issue is how programmers teach and learn.

Things that may contribute to it:
1. There's an aversion to anything psychological, which eliminates a lot of foundation from the previous subjects. Similarly, it focuses discussion to the mechanical aspects of things.
2. Concepts are taught in relation to other things. Paradigm shifts require building up the understanding from ground up, otherwise the related concepts end up contaminating the new ideas.
3. Trying to simplify things to their essence or barest minimimum. This ends up removing a lot nuance and context from the problems and solutions.
4. Blogposts and articles end up repeating 1-3, because they are shorter and easier to write. Which ends up causing people to learn the limited version. Effectively, an echo chamber.

Once the ideas have been completely distorted many of the benefits have been lost. Somebody will come up with a new idea X, which ends up going through the cycle again.
-->

## Superficiality of discussion

All of my own problems in trying to understand things were all due to one thing — superficial understanding. It’s easy to get stuck in the easy ideas. We learn the definitions, but never learn how they came to be. We only criticize the implementation, but ignore the vision. We may not even have noticed that _vision_ and _paradigm_ existed. This means, every next person learning will see watered down content.

_This of course is not limited to languages. You can see similar things in Design Patterns, Lean, Agile, Scrum, DDD ... With regards to Agile and OO there is also a great talk_ [_“How Agile and OO have lost their way together”_](https://www.youtube.com/watch?v=DOyNfmqwR98) _by James Coplien._

The main problem isn’t in the “condensing of ideas” but rather that, people learn the “next pop thing”, but repeat same mistakes in paradigms, models and goals. It might have different syntax, but the forces making code unmaintainable are the same. So they will realize that the “next pop thing” creates also terrible code ... and start the “next next pop thing”.

We need to understand what exactly creates the issues”

*   _Is the problem “small methods” or is it “fragmentation of ideas”?_
*   _Is the problem in “large procedures” or “poor organization of large procedures”?_
*   _Is the problem in “inheritance” or ”sparse code”?_
*   _Is the problem in “design patterns” or “the GoF variant of patterns”?_
*   _Is the problem in “callbacks” or “broken stack-traces and unclear flow”?_
*   _Is the problem in “objects” or “that we try to fit everything into a single paradigm”?_

Now it may seem that I suggest that the latter are the root causes — far from it. There isn’t a root cause. I think we are quite far from understanding the actual forces that are essential in code. _But, I do have high hopes for_ [_Physics of Software by Carlo Pescio_](http://www.physicsofsoftware.com/)_._

I’m not saying that you will like something after learning it in depth. You might think some parts are good, some bad, some completely idiotic. However, it helps us avoid going in circles and actually have a meaningful discussion, rather than blanket statements such as “objects are stupid”.

Maybe we can figure out [better ways of thinking](http://worrydream.com/MediaForThinkingTheUnthinkable/note.html), create [better tools](http://handmade.network/) and create [better languages](http://witheve.com/). Eventually, we might even figure out how to write valuable software every single time.

## Trying to improve the state-of-art

In the end with regards to programming we should figure out:

1.  How do we naturally think about the problem? [\[1\]](http://alumni.cs.ucr.edu/~ratana/PaneRatanamahatanaMyers00.pdf)
2.  What is the best way of thinking about a certain problem?
3.  What is the best implementation for representing those thoughts?

The first question tries to ensure that the “paradigm” and “language” are not too [esoteric](http://www.dangermouse.net/esoteric/piet.html) for people to understand and it will make easier to talk with non-programmers. The second tries to avoid the problems caused by “the natural way of thinking”. The third tries to make the translation from our thinking to paper is as easy as possible.