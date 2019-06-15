---
date: "2017-02-25T12:00:00+03:00"
title: "Paradigm is not the Implementation"
summary: Clarifying the concept of a paradigm.
star: true
tags: ["Software Concepts", "Psychology"]
---


One of the terms that has caused me a lot of confusions is “paradigm”. For way too long I mixed paradigm and implementation and thought they were the same thing. Or maybe, I never thought they might be different things.

It was until I came across trying to understand [DCI](http://fulloo.info/). Of course, I was intrigued and wanted to understand it, but I kept on stumbling on little things and people kept telling me I was wrong and ignorant and did not understand things properly. The feeling I got was confusion, anger, annoyance and lots of other feelings  --  but, I just wanted to use DCI.

It’s one thing when you are called ignorant by random people on the internet, I really don’t care. Of course, when people like [Trygve Reenskaug](https://en.wikipedia.org/wiki/Trygve_Reenskaug) and [James Coplien](https://en.wikipedia.org/wiki/Jim_Coplien) are saying _“You don’t understand OOP”_ and _“You are missing the point”_ is a completely different matter. Then you cannot just “brush off” the statements, you have to take them seriously and do the [research and read the articles](http://fulloo.info/Documents/).

_They weren’t saying those things in a mean way and the statements here are rephrased. To shift paradigms there is no easy route and you have to put in the effort. I wanted the “quick-answer”, but that’s not how you get a good understanding. Also, yes, the word “ignorant” was the most appropriate word._

I kept stumbling a lot. And, I can trace it back to one thing in particular

**paradigm**

As in “DCI **Paradigm**” and “Object Oriented **Paradigm**”. I understood the **implementation** of DCI and OO, but I didn’t understand the **paradigm**. Dictionary definitions weren’t particularly helpful with that word either.

_So what is a_ **_paradigm_**_, you ask?_

There’s actually a better question for understanding it:

## Why is programming in assembly difficult?

There are plenty of places to screw-up in assembly, but following the code and what it does is quite straight-forward. Every line does something very easy.

The main difficulty is in translating our thoughts into assembly. When change is required, then we need to reverse-engineer some of the thoughts from assembly, modify our ideas and re-translate them into assembly.

{{< figure src="/_images/paradigm-not-implementation/translating-to-assembly.jpg" caption="Translating our thoughts into assembly." >}}

There is a significant difference how we think and how the machine operates. The first languages, _assembly among them_, were designed to make this translation into machine code easier. They replaced few registers with “unlimited” amount of variables that helped to remember what was where, so you could use _lineBuffer_ instead of _0x000180F4_.

{{< figure src="/_images/paradigm-not-implementation/translating-to-higher.jpg" caption="Translating our thoughts into a higher level language." >}}

This smoothed the gap between humans and computers. However with the increase of program size there are still problems. There are so many different thoughts and ideas, we have to start organizing our thoughts. This is where the “paradigm” comes in:

{{< figure src="/_images/paradigm-not-implementation/translation-via-mental-model.jpg" caption="Translating from our mental model to a language." >}}

Initially it probably happened informally, people started to draw diagrams of code. Over-time these concepts came more rigorous and defined in such classics as [“On the criteria to be used in decomposing systems into modules” by David Parnas](http://repository.cmu.edu/cgi/viewcontent.cgi?article=2979&context=compsci).

For example, I could design modules “Input”, “Circular Shift”, “Alphabetizing”, “Output” and “Master control”. The idea of “modules” has organized our thoughts and we can more easily reason about. But our thoughts could have just as well been “read from file each line and store them somewhere and print the output”, which might have worked, but the clarity would have suffered.

> [**Paradigm is how we view and analyse the subject.**](https://en.wikipedia.org/wiki/Paradigm)

_Sure, in practice the border between “implementation” and “paradigm” is often fuzzy. Even to the degree where a paradigm might be defined in-terms of implementation details._

Obviously, there isn’t a best way to think about everything, it would be absurd, but there are several different ways. These different ways of organizing our thinking gives arise to the [paradigms we have](https://en.wikipedia.org/wiki/Programming_paradigm)  --  dataflow, logic, constraint-based, imperative, functional, data-oriented, object-oriented, class-oriented, role-oriented to name a few. It should be obvious that these are not mutually exclusive and that there are some yet to be invented.

## Languages and Paradigms

Now that we have separated _paradigm_ from _implementation_ it’s interesting to think, what does question “Is Go an Object Oriented Language?” mean. Or how multi-paradigm languages, such as C++, relate to these.

I think that the main issue is that the _question itself is based on a wrong premise_. It still assumes that _“paradigmness”_ is an inherent property of a language. When we separate them then the ideas will be much easier to understand.

It’s better to ask “How well does Go support Object Orientation?”. To the causal observer these questions might look the same ... but let’s also ask “How well does Go support functional programming?”, or “How well does Go support logic programming?” ...

These are much more interesting questions  --  these questions require to understand what is the “paradigmatic way of thinking.”

{{< figure src="/_images/paradigm-not-implementation/cost-of-translation.jpg" caption="Cost of translating from our mental-model." >}}

Basically, we are asking “How difficult is to translate the paradigm into a particular implementation.” or “How well the language code represents our mental model”.

It’s interesting to note that there can be several ways to translate the paradigm into code. You could even write Object Oriented code in assembly, however the translation would require significant effort. Which is why we wouldn’t call assembly an OO language, but we could write OO in assembly.

_It is true that some languages were designed in some paradigm in mind, but due to the need to gap the mental model and computer we always leave some pieces uncaptured in the implementation._

## Mismatch of paradigm

There’s also an interesting case, when our mental model doesn’t match the “language paradigm”. For example, when you are writing high-performance code, you are required to model what the machine does:

{{< figure src="/_images/paradigm-not-implementation/mismatch-of-paradigm.jpg" caption="Our mental model may not match the language we are using." >}}

Our language has made implementing things more complicated. Now we need to model the machine, then translate into high-level language and then also try to guess what the high-level code translates into.

You will see similar mismatches when you try to use a functional language with imperative paradigm. Or, if you try to write functional code with language designed for OO. Or, try to convey complex mathematical equations with Scratch.

When we take into account the customers, business people, end-users, domain experts, programmers, front-end developers, back-end developers, then the picture gets even more complicated:

{{< figure src="/_images/paradigm-not-implementation/multiple-people.jpg" caption="domain expert -- developer -- language" >}}

We don’t have to just worry about how we think, but also [how we communicate how we think](https://en.wikipedia.org/wiki/Communication), how others think, how they talk about their thoughts, how I interpret their thoughts, how I represent my ideas etc ...

_Trying to smooth the translating between different mental-models gives arise to different ways of designing software (e.g. DDD)._

The bigger the translation at each step, the bigger chance for mistakes and misunderstanding. Then again, some thoughts are better thought and implemented in some particular way.

> Perspective is worth 80 IQ points.  --  Alan Kay

## Anyways

Assuming you are working on X, then:

* _What is the best way of thinking and communicating about X?_
* _Does your language support that way of thinking?_
* _Does everyone involved think it’s the best way of thinking about it?_

As usual, paradigms are about trade-offs. A paradigm makes thinking about some things easier and as a consequence some other things become more complicated.

> All models are wrong but some are useful.  --  George Box

Taking a step further, _“Some models are better than others in certain situation.”_

It is good to think about how we think, it may provide significant insight into how we do what we do. I’ll leave my analysis about paradigms for another time.