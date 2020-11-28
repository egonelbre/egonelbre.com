---
draft: true
title: The Nature of Technical Debt
description: "Trying to pin down technical debt."
date: ""
tags: ["physics-of-software"]
---

"Techincal debt" has been bothering me for a while. It's seems somehow a catchall for different design mistakes, code worsening over time and legacy code bases or you can take a loan that you need to repay later. You can take a look the list of causes in [Wikipedia](https://en.wikipedia.org/wiki/Technical_debt#Causes) if you don't believe me.

Let's take FORTRAN as an example. There's still a lot of numerical code that was and is written with it. Let's say there's a piece of code that hasn't changed for 20 years, however, the "debt" of that code has risen. What is the "thing" that actually caused that difference?

On the other side, how do you measure technical debt, how large is the "interest" in a code-base? How much do I need to "pay" to pay it off? If I have plenty of "money", can I loan it to someone else?

But I digress, I think this unclear "technical debt" has caused bad decisions in codebases and trying to fixing things that don't need fixing. 

Before we get to tackle "technical debt" we need to take a small detour.

# Nature of Change

One easier thing we can observe in code-bases is difficulty of change. If I want to replace a class in some codebase it will take some effort.

I'll use ideas from [Physics of Software](http://www.physicsofsoftware.com/papers.html) by Carlo Pescio. He describes it in [Friction in the Artifacts World](http://www.carlopescio.com/2010/10/notes-on-software-design-chapter-11.html), although I recommend the whole series.

Let's define some terminology to be clearer and more precise in our definitions.

We need a way to talk about classes, structs, functions, methods, modules, constants, documentation without actually naming each every time. We'll call them *artifacts*. All of them together form an *artifact space*.

Programming is the act of causing change in that *artifact space*. We can imagine moving a class from one package to another package as a change. Similarly creating or deleting an *artifact* is change.

There is some effort needed to do any change. In simplest form it's the Joules energy we used up physically. We can also thing of it as how much mental energy used. It also requires spending some time.

Carlo Pescio introduces *viscosity* to describe resistance of change in artifact space. Deleting code that's not needed is usually easier to adding that code was in the first place.

Viscosity 

http://www.physicsofsoftware.com/uploads/9/8/5/4/9854624/compressivestrength.pdf

Mass = Difficulty of the Code

Volume = Lines of Code

Force

Strength = Knowledge of person

# Change in time


## Volume

Usually, over time the volume (lines of code) of the code increases.

* Changing requirements
* Need to handle more interactions and corner cases.

## Mass

Usually, over time the mass (complexity) of the code increases.

* New features are added that need to interact with the rest of the system.

## Knowledge

Usually, average knowledege about the whole system decreases over time.

* Volume of the system increases.
* People don't need to change working software pieces and forget details about it.
* People change work places.
* New people don't have insight into why something evolved into X.

## Viscosity and Energy

These lead to increased viscosity and energy required to make changes.

# Essential vs Accidental Viscosity



# Technical Debt

It would be easy to think of this "increase" of the previous metrics as the "technical debt" increase. Let's imagine adding a new senior programmer to view code legacy. They would immediately notice "technical debt". This suggests that the "technical debt" doesn't have to do anything with the previous state of the codebase, but rather something else.

I think the important thing we missed is the "imagined best viscosity". In some, senior programmers can already imagine how a codebase can be better.

The difference between "actual viscosity" and "imagined best viscosity" is the technical debt and behaves as you would expect.

Over time it increases because the "actual viscosity" increases.

Over time the "imagined best viscosity" decreases over time:

* people know and discover better solution, (e.g. Recat)
* tools often improve, (e.g. compilers)

One really important thing about "imagined best viscosity" is that it's imagined. As developers it's easy to imagine things the things that will be better and miss things that will be worse. So when you "pay off technical debt" or in other words move the codebase nearer the "imagined best viscosity" is that you might worsen some other places.

There's also an important thing, different people will have different understanding how large the "debt" is and how to "pay it off".

If you know very little about the system the "technical debt" seems larger than when you know more (because your imagined best viscosity contains a lot of mistakes).

The more different ways of solving a problem you know, the larger the "technical debt" is.

And finally, as long as you have a good imagination, you can never pay off techincal debt -- there will always be some.

Changing "essential viscosity" is more difficult than "accidental viscosity".

# Pragmatic Change

If we treat technical debt as the difference between "effort to change the existing system" and "perceived possible effort to change existing system" it becomes clearer and how to make changes.

First we need to consider whether "effort to change a particular artifact" is even relevant?

There might be some terrible code that should've never seen the light of day, however has worked flawlessly for 10 years -- is it worth fixing?

Second, how realistic is the "percieved best viscosity" does it consider all the aspects of the current system?

However, one major problem with improving viscosity is that over time it becomes more difficult both to improve and extend.