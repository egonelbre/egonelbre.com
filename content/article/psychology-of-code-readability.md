---
date: "2018-10-12T12:00:00+03:00"
title: "Psychology of Code Readability"
summary: Analysis on how programmers perceive code.
tags: ["Psychology"]
---

I think one of the things every programmer strives for is writing better code. Readability is one of the aspects of “good code”. There have been many papers and books written on the topic, however I find many of them lacking. Not because of the recommendations, but rather the analysis part.

What makes some piece of code more readable than another? It’s one thing to say that it uses better variable names, but what makes a certain variable name easier to read? I really mean digging deeper into human psyche. It is our brain that is doing all the processing after all.

---

## Psychology Primer

As any programmer knows we have limited capacity to think about things. This is our working memory limit. There’s an old myth going around that we can hold 7±2 objects in our head. It is known as “The Magical Number Seven” and it isn’t entirely accurate. This number has been refined to 4±1 and some even suggest there isn’t a limit, but rather a degradation of ideas over time. For all intents and purposes we can assume that we have a small number of ideas we can process in our head at a given time. The exact number isn’t that important.

But some would still confidently say that they can handle problems involving more than 4 ideas. Luckily there’s another process going on in our brain called chunking. Our brain automatically groups information pieces into larger pieces (chunks).

> Two levels of chunking of a date.

From these chunks we build up our long term memory. I like to imagine it as a large web of consisting many chunks, chunk sequences and groupings.

You might guess from this image that moving from one place to another in memory is slow. And you would be right. In UX there’s a concept called singular focus of attention. Which means that we can focus at a single thing at a time. It also has a friend called locus of attention, which says that our attention is also localized in space.

You might think this is the same thing as working memory limit, however there is a slight difference. Working memory capacity talks how big our focusing area is, the focus/locus of attention say that we can only do that when there is a place in our brain that contains the ideas.

The focus and locus of attention are important to know, because switching cost is significant. It is even slower when we need to create new chunks and groupings. It also goes the other way, the more familiar something is the less time it takes to make it our focus.

We also remember things better when we are in a similar context. This is called encoding specificity principle. This means by designing our encoding and recalling conditions we can design better what we remember.

> In an experiment divers were assigned to memorize words on land and under water. Then recall them on land or in water. The best results were for people who memorized and recalled on land. Surprisingly the second best were the people that memorized and recalled on water. This showed that the context where you learn things has an impact on how well you can remember things.

To make things shorter, I’ll use context to refer to “focus and locus of attention” and how it relates to other chunks and loci. Effectively our brain is moving from one context to another. When we move our focus of attention we also remember what our previous contexts were, until our memory fades.

From these contexts and chunks we build up mental representations and a mental model. There’s a slight difference between these two things. Mental representation is our internal cognitive symbol for representing the external world or a mental processes. Mental model can be thought of as a explanation of a mental representation. Often these terms are used interchangeably.

Mental models have a vital importance in our ability to precisely describe a solution to a problem. There are many different mental models possible for a single problem each having their own benefits and problems.

All of these ideas sound nice and precise, however our brains are quite imprecise. There are many other problems with our brain.

Our brains need to do more work when dealing with abstractions.

When ideas are similar their chunks are related and linked in our brains in a similar way. This leads to our brain being unable to “rebuild the contexts properly” because we are uncertain which chunk is the right one. Example: I and 1; O and 0.

Ambiguity is another source for uncertainty. When a thing is ambiguous then there are multiple interpretations for the same thing. Homonyms are the best example of this property. Example: Crane — the bird or the machine.

Uncertainty causes us to slow down. It might be a few milliseconds, but that can be enough to disrupt our state of flow or make us use more working memory than necessary.

There are of course interruptions that can disrupt our working memory, but there are also “smaller interruptions” called noise. If someone is saying random numbers and you are trying to calculate, then we can end-up accidentally start processing them and use up some of our working memory. This can happen also visually on screen when there are many irrelevant things between the important things.

Our brains also have trouble processing negation, with support from many studies. The effect of negation depends on the context, but negation should be used with care.

All of these together add up to cognitive load. It is the total amount of mental effort being used. Our processing capacity decreases with prolonged cognitive load and it is restored with rest. With prolonged cognitive load our minds also start to wander.

If this is new information to you, then I highly suggest taking a break now. These form fundamental properties that code analysis will rest upon.

---

I’m going to use the term programming artifact. By that I mean everything that is created as a result of programming. It might be a method you write, type declarations for a function, variable names, comments, Unreal Engine Blueprints, UML diagrams etc. Effectively anything that is a direct result of programming.

Here are a few recommendations, rules-of-thumb and paradigms analyzed in the context of psychology. By no means is this an exhaustive list or even a guide on what exactly to do. Probably there are many places where the analysis could be better, but this is more about showing how we can gain deeper insight into code readability by using psychology.