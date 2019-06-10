---
date: "2017-10-13T12:00:00+03:00"
title: "Relearning OOP"
summary: About the initial concepts of OOP.
tags: ["Software Concepts"]
---

Sometimes conversations push you into a new direction which gives a fundamental shift in understanding. One of these things for me was OOP and what the paradigm was founded on.

_Before continuing, it is recommended to read_ [_“Paradigm is not the Implementation”_](/article/paradigm-is-not-the-implementation)_._

There is a lot of talk about how [OOP is bad](https://www.reddit.com/r/oopisbad/). It’s not that I disagree with the statements; what bothers me, is the imprecision when people discuss the drawbacks. Often there is “inheritance is bad” without analysis, why it’s bad, what are the forces at play. _And I do not mean here “look how terrible this code is”._

Now the issue in that isn’t criticism of OO, but rather that the lessons are not properly learned — effectively moving from one issue to another. “Inheritance hell” becomes “callback hell” and “polymorphism” becomes “ad hoc polymorphism”.

I really don’t care that much whether OO “survives” the criticisms or not, but I do care that our understanding about software development improves.

Now we’re past the disclaimer. So, you know OO already? Right? Let’s start with a simple question then:

> _What are your opinions on Piaget’s theories?_

If you do know Piaget and how he’s related to OO — awesome. Anyways, when not… here’s my story about learning about OO.

## First introduction

I learned my “first objects” from university OOP course, well almost, I also read about them independently before… it was the usual:

1.  Encapsulation
2.  Inheritance
3.  Polymorphism
4.  Abstraction
5.  Classes

I wish I moved further from those definitions much earlier, but I spent way too much time trying to understand how to build things with these concepts. These are the [concepts that people quote](http://agp.hx0.ru/oop/quarks.pdf) when asked what OO is and, unfortunately, these are what most books start and end with.

I don’t see any of them as vital in OO. I see these pieces just as an “implementation detail”, the paradigm is a separate concept from the implementation.

## What is Object Oriented Paradigm?

Over time I’ve realised that it’s hard to understand a fundamental concept without reading history and the forces that shaped it.

Definitions can give awful impressions, to the extent that they can hinder understanding of the concept. Big ideas aren’t clear definitions. They start from a bunch of fuzzy ideas and that are incrementally transformed into something more refined and clearer. After the “big idea” is published, it gets mistranslated and mistreated, like a 40 year-long “Telephone Game”.

_I try my best to be historically accurate and communicate the ideas, but since there’s a lot of it, I’m bound to make mistakes… So, corrections are always welcome._

### The Vision

There were two central motivations for OOP:

> The large scale one was to find a better module scheme for complex systems involving hiding of details, and the small scale one was to find a more flexible version of assignment, and then to try to eliminate it altogether. As with most new ideas, it originally happened in isolated fits and starts.   
> — [Early History of Smalltalk](http://worrydream.com/EarlyHistoryOfSmalltalk/#p4)

It’s interesting to think that most of our current “OO” languages are just filled with assignments.

There were multiple inspirations for OOP. One of the first was [“Sketchpad: A man-machine graphical communication system” by Ivan Sutherland](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-574.pdf). It had the primitive resemblance to an OO system. You were manipulating real things on the screen, even constraints between things had visual representation. Internally it had “master drawings” and “instance drawings” — which quite well match the idea of “objects” and “prototypes”.

{{< youtube code="6orsmFndx_o" title="Sketchpad Demo" >}}

The other inspiration was [Simula by Ole-Johan Dahl and Kristen Nygaard](https://en.wikipedia.org/wiki/Simula). Arguably the first object oriented language. It contained activities and processes, that were similar to classes and instances.

These advancements gave Kay an insight and confidence that it must be something important. He envisioned those as a general idea of “recursive computers”:

> For the first time I thought of the whole as the entire computer and wondered why anyone would want to divide it up into weaker things called data structures and procedures. Why not divide it up into little computers, as time sharing was starting to? But not in dozens. Why not thousands of them, each simulating a useful structure? — Alan Kay

The humane side of object orientation came from Doug Engelbart, what he called “personal computing”. Engelbart was trying to “augment human intellect”, so that the computer isn’t just a tool, but rather an extension of your life.

_Sidenote: many fundamental ideas were invented by Engelbarts research group at ARPA, which can be seen in the “Mother of All Demos”. It demonstrated mouse, video conferencing, teleconferencing, hypertext, word processing, hypermedia, object addressing, dynamic linking, bootstrapping and a collaborative text-editor_ **_in 1968_**_._

{{< youtube code="yJDv-zdhzMY" title="The Mother of All Demos" >}}

Engelbart’s vision to extend the human mental models into the computer became an early goal of object-oriented programming. To capture the humane way of thinking together with the computer.

> We feel that a child is a “verb” rather than a “noun”, an actor rather than an object; he is not a scaled-up pigeon or rat; he is trying to acquire a model of his surrounding environment in order to deal with it; his theories are “practical” notions of how to get from idea A to idea B rather than “consistent” branches of formal logic, etc. We would like to hook into his current modes of thought in order to influence him rather than just trying to replace his model with one of our own.

> — [“A Personal Computer for Children of All Ages“, Alan Kay 1972](http://mprove.de/diplom/gui/kay72.html)

Kay also was aware of human mental models as a vital part of programming. He tried to include [Piaget’s Stages of Cognitive Development](http://www.simplypsychology.org/piaget.html) into the paradigm.

> Two of Piaget’s fundamental notions are attractive from a computer scientist’s point of view.

> The first is that knowledge, particularly in the young child, is retained as a series of operation models, each of which is somewhat ad hoc and need not be logically consistent with the others. (They are essentially algorithms and strategies rather than logical axioms, predicates and theorems.) It is much later in development that logical is used and even then through extralogical strategies.

> … Another point which will be important later on is that language does not seem the mistress of thought but rather the handmaiden, in that there is considerable evidence by Piaget and others that such thinking is nonverbal and iconic.

> — [“A Personal Computer for Children of All Ages“, Alan Kay 1972](http://mprove.de/diplom/gui/kay72.html)

So in a crude way, OO was based on two principles:

* Recursive computers communicating with messages.
* Being able to build your mental-model into the software.

### The implementations

All of these ideas lead to a first implementation — [Smalltalk](https://en.wikipedia.org/wiki/Smalltalk) system. I call it a system, because Smalltalk is more than just the language, it’s a whole environment that is built on those ideas.

However when people got hold of Smalltalk they saw the new ideas, but instead of adapting, they brought their habits from Simula and FORTRAN. The focus became Abstract Data Types, not communicating things and building a humane mental model.

{{< fig src="oop-vs-class-oriented.png" title="OOP vs Class-Oriented" >}}

The class-oriented thinking was rooted by C++ and Java. Of course, the ADT-s and Class-oriented thinking already started in Smalltalk-72, when people wanted to make Smalltalk “production ready”. An idea that was in beta stage was put into production before it had been iterated on.

### The ignorance of vision

Communicating all of these deep ideas in human psychology is quite difficult. I’m sure people could understand them when they are willing to invest, but the reality is that people have deadlines and hence “properly learning something” is a low priority.

These deep ideas eventually were reduced into sound-bites such as “objects must match the real-world”. _Which is just absurd, it would be the same as saying “inventors can only invent things that exist”._

Basically, the paradigm was lost, but the implementation stayed. People came from their procedural background and started to write classes and their mental-models stayed the same. Over time the “implementation” became the standard and Object Oriented thinking became about Classes and Inheritance.

OO became this amalgamation of different ideas from Kay, Nygaard, Simula, Smalltalk, Java, ADT-s, C++ … and much much more… [It’s not suprising that noone can agree on a definition](http://c2.com/cgi/wiki?DefinitionsForOo).

It helps to get back on track and see what OO was trying to achieve.

### The original vision

The goal of Object Oriented thinking is about giving substance to thoughts. It’s about being directly able to manipulate ideas and make them interact. It’s about extending human mental model. Just as easily as you would be able to draw a diagram to explain how a ball flies through the air, you should be able to construct a program that simulates it or explores the ideas of a ball flying through the air.

Implementation of Object Oriented Paradigm doesn’t have to be a language either. Many game engines implement an OO editor:

{{< fig src="oop-unreal-engine.jpeg" title="Unreal Engine" >}}

You place objects in the scene and make them interact. They might hold some state and you can modify their behaviour… It’s much closer to the OO vision than many class-oriented languages. It could have been written in C and the Editor would still be Object Oriented. _Sure, it is not general-purpose OO._

Such tools enable people, without any extensive programming knowledge, to build awesome things. As an example, game built by five 3D artists in a few days:

{{< youtube code="6LBvemFE5ks" title="Hack_Switch Gameplay" >}}

## It is not done

Now it might look like OO is set in stone, but there are still people trying to improve it, _for better or worse_. Once you stop seeing as “Java” and “Smalltalk” as the pinnacle of OO, there can be lots of improvements to them.

> However, I am no big fan of Smalltalk either, even though it compares very favourably with most programming systems today (I don’t like any of them, and I don’t think any of them are suitable for the real programming problems of today, whether for systems or for end-users). — [Alan Kay](http://www.computerworld.com.au/article/352182/z_programming_languages_smalltalk-80/)

So, how could we improve:

* What if, you had implicit type checking with Objects (and without classes and inheritance)?
* What if, you had a language with only immutable Objects (and without classes and inheritance)?
* What if, you had a OO language where the order of statements didn’t matter?
* What did the initial OO paradigm miss, what was left uncaptured in human thought?
* What concepts from human psychology are missing?
* Your thoughts?

It might not be suitable to call it OO after those improvements, but it’s just taxonomy. Maybe these questions have already been answered and we just haven’t heard about them?

In general:

* What is your mental model when you write code?
* What is the best mental model for prototyping?
* What is the best mental model for building fault-tolerant systems?
* What is the best mental model for high-performance systems?
* What is the best mental model for solving scheduling problems?

Well you can further extend these questions as far as you like.

---

## For more information

* [_“The Early History of Smalltalk” by Alan Kay_](http://worrydream.com/EarlyHistoryOfSmalltalk)
* [_”A Personal Computer for Children of All Ages” by Alan Kay_](https://mprove.de/diplom/gui/kay72.html)
* [_“The DCI Paradigm” by Coplien and Reenskaug_](http://fulloo.info/Documents/CoplienReenskaugASA2012.pdf)
* [_Programming Languages and Piaget’s Stages of Cognitive Development_](http://www.lispcast.com/programming-language-stages-of-development)
* [_“Sketchpad: A man-machine graphical communication system” by Ivan Sutherland_](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-574.pdf)
* [https://www.reddit.com/r/oopisbad](https://www.reddit.com/r/oopisbad/)/