---
date: "2015-10-19T12:00:00+03:00"
title: "Obliterate Facilitated Code"
summary: Compressing floating points by using C macros.
tags: ["Rant"]
---

One of the things that has been annoying me is facilitated code. You know all the examples how a class `Bunny` is derived from class `Animal` and class `Car` is composed of classes `Engine` and `Tire`. Please let’s stop using stupid facilitated examples.

You cannot make any reasonable decisions or arguments with those examples nor can you learn new things from them. They rarely serve good purpose.

Let’s examine the common cases.



## Missing information

This is often encountered in forums asking for help. It usually looks like:

> Let's say I have a class `A` and class `B`. How do I make them work
together?

There’s no hint what the person is trying to do and why he is trying to do it in the first place. Maybe the person reached that situation through a severe session of [yak shaving](http://sethgodin.typepad.com/seths_blog/2005/03/dont_shave_that.html).

Maybe the person is trying to save the readers some effort and trying to explain the “gist” of their problem. Of course, by doing that, he has removed all information regarding why the problem happened in the first place.

You may think _“But I know what is sufficient information to solve the problem.”_ You asked a question, but how do you know what is necessary for the solution, if you don’t know what the solution is?

It’s hard to come up with a solution for a problem that you don’t know. Be sure that you give sufficient information to people to help you. If you don’t have a good idea on what is sufficient, see [How To Ask](https://github.com/golang/go/wiki/howtoask).

* real-world examples: [persistent sequence](https://groups.google.com/forum/#!msg/golang-nuts/otnhVwA1Mw0/_EjZQczExbUJ)
* how it should be: [avoid import cycles](https://groups.google.com/forum/#!msg/golang-nuts/mgsLIZGGID4/9k720SsPyrIJ)



## Unknown Premise

This happens when people argue for a specific solution. They try to show their solution in the best light possible:

```
// You know how good it would be to have a feature to eliminate
// duplicate letters in variables. Let me show you an example:
var xxxxxx = 1;
var xxxxx = 2;
return xxxxxx + xxxxx;
// It would be much more readable with:
var x~6 = 1;
var x~5 = 2;
return x~6 + x~5;
```

No one in their right mind would believe this is a good _feature_. Technically the argument is sound — the second version does look better. However, it is based on a wrong premise — that you have variables consisting of only single letters multiple times. Once we try to put this into a real world context, we will have a harder time of showing that this _feature_ is valuable.

By using facilitated code we hide the premise and all the design process that lead to the solution. We could have made a mistake in our design process, we could have had better starting code, we may have forgotten some important detail that makes the solution useless. When you eliminate the premise, you eliminate practicality of the solutions.

Facilitated code makes more difficult to analyse the solution. It’s also not always obvious whether the solution translates to real-world. Let’s start with real-world problems when proposing solutions.

* real-world examples: [arguing for tuples](https://groups.google.com/forum/#!topic/golang-nuts/lFU2bNGVtJU/discussion), [first-class cancellation](https://groups.google.com/forum/#!msg/golang-nuts/TQ5TdJEBamY/UWKKfDec5qYJ), [error handling and repetition](https://groups.google.com/forum/#!topic/golang-nuts/68J-mLCC1JI/discussion)



## Learning Without Context

Way too often we try to take shortcuts when learning things:

```
// Let's learn inheritance:

public class Animal {
    public abstract void move();
}
public class Dog extends Animal {
    public void move() {
         System.out.println("Running...");
    }
}
public class Cat extends Animal {
    public void move() {
         System.out.println("Prancing...");
    }
}

// Let's learn a "Design Pattern":

public class Thing {
    public class abstract void foo();
}
public class Thingerer {
    Thing thing;
    public void foo() {
        thing.foo();
    }
}
```

Has anyone actually needed to write that code in production?

I’ve seen many such explanations, for inheritance, traits, monads, design patterns, flux... All of them miss the important point of the solution — the design process that lead to that design decision. We skip learning why it was necessary in the first place. Without real-world examples it’s even harder to derive the reasoning.

If you ever wondered why people end up with `AbstractFactoryBuilders`, then this is the main reason. Patterns are learned without learning the design decisions that lead to that solution.

Show real-world examples and explain the domain. Stop assuming that you don’t have time to explain the full complexity of the domains. Find a simpler domain, if you need to. If you don’t have time to explain the full complexity of domain, explain parts of it and ensure that you actually understand the full complexity yourself.

* real-world examples: [builder pattern](https://en.wikipedia.org/wiki/Builder_pattern), [lazy initialization](https://en.wikipedia.org/wiki/Lazy_initialization), [inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html).
* how it should be: [Game Programming Patterns](https://gameprogrammingpatterns.com/), [Game Programming Gems](http://www.satori.org/game-programming-gems/), [The Architecture of Open Source Appliactions](http://aosabook.org/en/index.html)



## Unknown practical use

When browsing frameworks I often encounter:

```
services.Register("BunnyFactory", &bunny.Factory{})
bunnies := services.Get("BunnyFactory").(Factory)
```

What am I supposed to do with this? Does this framework solve any real problems or is it just something someone threw together?

If you build your library using facilitated examples, then, how do you know that it will work in the real-world? There can be lots of little details that need to be taken account when writing real-world code.

Also… real-world examples can help with your design, a lot. You will notice pieces that can be simplified or removed completely.

Quick short references for examples are fine as long as you have a real-world application demonstrating its use.

Few real-world things that you could show: Hotel Booking, ToDo List, Issue Tracker, Twitter (or similar), Chat, Reddit

* real-world examples: [goldi](https://github.com/fgrosse/goldi/blob/8bb09dd2be1b6e592353f4a02532860835d771fa/README.md#usage)
* how it should be: [Revel: Booking](https://github.com/revel/examples), [TodoMVC](http://todomvc.com/)



## Finally

> First a disclaimer: I mean no disrespect to people involved in the linked examples. Whether their arguments are valid is a separate discussion and it is not meant as a comment on those ideas. I only tried to highlight that the examples can be improved.

I know, finding small real-world examples is difficult, it’s much easier to throw something together, rather than to think things through. When you feel that facilitated examples bring out your thoughts out clearer… ensure that you have real-world examples to back them.

I know it is a tall order to get rid of all “facilitated examples”, hell, even I used them here to illustrate the points better.

I’m not saying that the “facilitated examples” are completely useless, they can be a valuable tool for trying out different ideas. However, if you cannot come up with a real-world example you probably haven’t analyzed things in depth.

Let’s stop using “facilitated examples” when we teach and try to find solution to a problem. Problems are meant to be solved in a particular context, not in our fluffy imaginary world.