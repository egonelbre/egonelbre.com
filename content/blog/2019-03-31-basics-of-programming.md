---
title: Basics of programming
subtitle: A Model of Problem Solving
draft: false
tags:
  - psychology
date: 2019-03-31T11:51:02.268Z
---
In the simplest terms programmer is a problem solver. There are some things that make reaching solution easier, some that make it harder. Programming can also create quite extreme emotional states - therefore to understand the whole picture we must take it into account.

<!--more-->

Here's how these things work together:

.. image:: https://raw.githubusercontent.com/egonelbre/spark/master/graphics/model.png

Let's call the things that affect programmer forces and give them some names:

* movement: things that make you move towards your goal
* friction: things that make your movement harder and hinder you from reaching your goal
* uppers: things that make you feel good
* downers: things that make you feel bad

Keep in mind that the "mood" axis is an abstract concept.

It's much easier to explain the model with sudoku, since more people are familiar with it. Also the time frame where you experience all of these steps are much shorter.

When we start solving the sudoku we have some eagerness

1. stage, we realize the actual difficulty of the problem and become focused. We also start filling the easier parts.
2. stage, we have some difficult step, where we need to have more effort to move forward. Once we break this difficult stage, we get this small high of solving a small problem.
3. stage, we realize that we know how to solve the puzzle and quickly fill in the missing parts.
4. stage, we finsihed it, finally we have this "high" from reaching the goal and feeling smart.

This same emotional fluctuation and final high is what causes the addicitiveness of sudokus. This is also the reason why programmers can easily get into this state flow and lose track of time. (Flow as described by Mihaly Csikszentmihalyi.)

Let's see how to decompose the forces into simpler things:

* uppers = progress + solving subgoals + acquiring new skills + understanding + serendipity
* downers = no progress + failures + perceived difficulty + feeling stupid + pressure
* friction = difficulty + bad tools + bad mood
* movement = perceived reward * ( skills + knowledge + good tools + good mood )

In sudoku difficulty means how easy it is to derive the next number. If we use a bad tool such as pen or nothing at all the required skill level must be higher. If we have a pencil we can do try out different things and erase them as neccessary. Skills are things that help us derive new numbers and knowledge is how a number looks like.

Perceived reward makes us want to apply our knowledge and struggle against friction more, hence it affects all other parts of movement. This suggests that learning theory without a goal requires more effort than trying to solve a problem while learning theory as a solution. This means learning must start from a problem, not from theory.

We can see that by learning we can affect knowledge, tools and skills. This also means that learning must affect all of them.

If we consider programming the force decomposition stays the same. One area that is often discussed when starting to learn programming is what language, framework, toolchain to use. The force that these things affect is friction - and to some smaller degree required knowledge.

So the question is actually how much friction is neccessary for learning. If we lower friction we are also lowering the skill required to accomplish a task - which may not be the best solution for learning. Programmers must be able deal with the friction - how to keep going towards goal, even if everything is working against you. So there is a necessity for skills that deal with friction.

The problem with friction is that it makes people feel stressed and stupid - if some limit is crossed then people will cheat or get help. In everyday life this friction is very common. Although it may look that good programmers don't feel the stress and bad feelings it is more likely that they ignore it.

> "Keep trying even if you feel lost, it's just one part of problem solving."

Let us consider what happens if a person "cheats" while learning.

.. image:: https://raw.githubusercontent.com/egonelbre/spark/master/graphics/model-shortcut.png

Imagine you are solving a sudoku and at stage 2, where you hit your first difficult problem, someone else comes and solves the sudoku for you. This would mean that you won't feel the "high" and are less likely to try solving a sudoku again. The perceived reward has also decreased. More importantly you fail to learn skills required to overcome obstacles 2 and 3.

The same applies to programming. This could also include skills how to learn new skills and how to deal with friction. Any hint about solution will increase the knowledge, but it will not increase skills. Therefore any helping should be focused on which skills to apply or use, not what is the quickest way to the solution.

> "You don't train for the olympics by driving a car."

In programming "the skills" are much more important than knowledge and tools. Skills help us learn new skills and gain knowledge. For "how to teach programming" the most important question is "What is the most effective set of skills and knowledge that helps overcome friction and can produce any other skill and knowledge required?" This Doesn't necessarily mean the minimal set, since "learn a new thing" wouldn't work that effectively.

HtDP_ ("How to Design Programs") puts all these ideas together quite nicely:

> "Programming a computer requires patience and concentration. Only attention to minute details will avoid frustrating grammatical mistakes. Only rigorous planning and adherence to the plan will prevent serious logical mistakes in our designs. But when we finally master the design of programs, we will have learned skills that are useful far beyond the realm of programming."

So what are the programming skills that are the main drivers of movement. What is the most basic knowledge and skills that makes people programmers?

> "The most important skill is how to acquire skills and knowledge effectively. Everything else can be acquired effectively."
