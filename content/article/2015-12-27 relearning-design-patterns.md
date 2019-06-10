---
date: "2015-12-27T12:00:00+03:00"
title: "Relearning Design Patterns"
summary: Design Patterns and what they were meant to be.
tags: ["Software Concepts"]
reviewers: ["Reena Purret"]
---

Design Patterns have gotten a bad rap, mainly because of the book “Design Patterns: Elements of Reusable Object-Oriented Software” by Erich Gamma, et al (henceforth GoF book). It described Patterns rather superficially. However, before we can go on to bashing the book we should go back to the beginning and understand “Design Patterns” as they were written.

For now, let’s imagine that GoF book doesn’t exist and forget everything related to it. Let’s start from a clean sheet.



## Origin

The idea of design patterns was introduced by architect [Christopher Alexander](https://en.wikipedia.org/wiki/Christopher_Alexander) and was explained in [“The Timeless Way of Building”](https://en.wikipedia.org/wiki/The_Timeless_Way_of_Building). If you want to thoroughly understand things, I would suggest reading it from the source. It was followed by [“A Pattern Language”](https://en.wikipedia.org/wiki/A_Pattern_Language), which is a very good reference to what patterns should look like. Don’t take my word for it, read the source.

But if you are too lazy, the following will hopefully give the essence of patterns. I will incrementally build up to _patterns_, but this isn’t the way they were discovered.



## A Rule

Let’s start with something easier, a single rule: “When X then do Y”. One of such nice rule is the [Dragon curve](https://en.wikipedia.org/wiki/Dragon_curve): “Make a 90 ° bend in each line segment”. Here is how it will evolve:

{{< fig src="/images/dragon-curve.gif" title="Dragon curve construction by Guillaume Jacquenot / Wikipedia" >}}

It is quite amazing that such a single rule can create such intricate complexity. Obviously there are more rules that can create interesting effects. Mandelbrot set falls into the same category. The equation _Z[n+1] = Z[n]²+c_ can be used to generate the following:

{{< fig src="/images/mandelbrot-animation.gif" title="Mandelbrot animation by Michael James Dean / Wikipedia" >}}

By repeatedly applying the one rule we get amazing results. It makes you wonder, what can we do with multiple rules?



## L-System

Since now we have multiple rules, we can talk about a rule system, where rules complement each other. [L-System](https://en.wikipedia.org/wiki/L-system) is one fascinating example of such systems.

{{< fig src="/images/l-system-example.jpeg" title="Dragon trees / Wikipedia" >}}

It allows us to describe an infinite set of plants by selecting the right rules. And all the rules are simple — _“When X then do Y and Z; When Y then do Z and X”_. By repeatedly applying the rules we create very complex structures.

Of course, such rule-based systems are not restricted to structures, we can do something similar for behavior.



## Boids

[Boids](https://en.wikipedia.org/wiki/Boids) is an artificial life program where each entity has three rules:

1. separation: steer to avoid crowding local flockmates;
2. alignment:  steer towards the average heading of local flockmates;
3. cohesion: steer to move toward the average position (center of mass) of local flockmates.

Try to imagine what the result will be.

{{< youtube code="86iQiV3-3IA" title="Craig Reynolds — Original 1986 Boids simulation" >}}

It is fascinating how closely they can mimick flocks of animals. We get very complicated and smart behavior with few simple rules.

Of course all of these are quite artificial, very rigid. What if we let people apply the rules and use their instincts to get the results that they want? And the “rules” are designed around solving a very complicated problem?

## Pattern

Now we are quite close to [Design Patterns](https://en.wikipedia.org/wiki/Design_pattern). Instead of having strict rules to follow, we shall have patterns:

> ... pattern describes a problem that occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice.
> — Christopher Alexander

Just to give a short gist of [what a pattern looks like](http://www.patternlanguage.com/apl/aplsample/apl159/apl159.htm):

> 159\. **LIGHT ON TWO SIDES OF EVERY ROOM**

We have a clear distinct name for a pattern.

> **When they have a choice, people will always gravitate to those rooms which have light on two sides, and leave the rooms which are lit only from one side unused and empty.**

We have a set of forces that need to be resolved.

> Therefore:
>
> **Locate each room so that it has outdoor space outside it on at least two sides, and then place windows in these outdoor walls so that natural light falls into every room from more than one direction.**

Then we have a suggestion.

> [...] The importance of this pattern lies partly in the social atmosphere it creates in the room. Rooms lit on two sides, with natural light, create less glare around people and objects; this lets us see things more intricately; and most important, it allows us to read in detail the minute expressions that flash across people’s faces, the motion of their hands . . . and thereby understand, more clearly, the meaning they are after. **The light on two sides allows people to understand each other.**

We have analysis of the problem and reasons why light from two sides is essential.

> [...] And finally, if a room simply has to be more than eight feet deep, but cannot have light from two sides — then the problem can be solved by making the ceiling very high, by painting the walls very white, and by putting great high windows in the wall, set into very deep reveals, deep enough to offset the glare. Elizabethan dining halls and living rooms in Georgian mansions were often built like this. Remember, though, that it is very hard to make it work.

We have in-depth analysis of alternative solutions and where it has been used.

> [...] Don’t let this pattern make your plans too wild — otherwise you will destroy the simplicity of POSITIVE OUTDOOR SPACE (106), and you will have a terrible time roofing the building — ROOF LAYOUT (209). [...]

And we have “links” to other patterns and what should be considered when combining multiple of them.

> Place the individual windows to look onto something beautiful — WINDOWS OVERLOOKING LIFE (192), NATURAL DOORS AND WINDOWS (221); and make one of the windows in the room a special one, so that a place gathers itself around it — WINDOW PLACE (180). Use DEEP REVEALS (223) and FILTERED LIGHT (238). [...]

We also have “links” to other patterns that should be implemented next.

This formula seems trivial, but what is described in the pattern is also important. For example it’s quite easy to come up with patterns, such as CORNER, because every house has one. But, it is not important, we don’t have any in-depth wisdom about it, it doesn’t make the rooms more alive. So it won’t make a good pattern. Pattern LIGHT ON TWO SIDES OF EVERY ROOM, however, is rooted in human psychology. It’s better to be in a room with light from two sides.

This is one mistake GoF book made, it took “repeating boilerplate code” and converted them into patterns. It’s the same, if I were to make a pattern “Have a corner in your house, because every house has a corner.” It offers no wisdom, it just contains information about accidental complexity of using perpendicular walls.

“A Pattern” is not the whole story. We are still missing the big picture with regards to patterns. Notice that I’m talking about patterns not just one pattern.



## A Pattern Language

We don’t just want a single pattern that is profound and useful — we want a system of patterns where they support each other and naturally flow into each other. By following one pattern to another the act of designing becomes directed and clear.

Think about it. We saw how three rules could make a flock of birds. We saw how an L-System was able to create plants. What patterns would be necessary to build houses, towns, cities or entire countries? Not just any house, a house that is nice to live in, a house that makes you feel more energetic. How about a community that encourages working together? This is the content of [A Pattern Language: Towns, Buildings, Construction](https://en.wikipedia.org/wiki/A_Pattern_Language). Each pattern refined and researched.

This is where GoF book severely falls short, it doesn’t guide you how to create a whole. By using GoF alone, we would end up with OOM (object-oriented masturbation). _NOTE: so you won’t misunderstand me, GoF book is a nice idioms book, however not a good patterns book._

This is what a Pattern Language is, a directed set of Patterns which guides you to design something wonderful and of value. Each pattern deeply depending on what you want to create and what you value. It might seem like a fluffy idea, but take a look at the boid rules again — they are not fluffy, they are concrete, but give arise to complex behavior.

Imagine a code repository over time, first one file, then two, then some folders are added, then more code … at the same time, all those decisions, which things to add, were guided by patterns and each decision made by people. Each iteration more useful and more valuable than the previous. If you can imagine that, then you understand what patterns should do. _We’ll leave what software design patterns should look like for another time._

You might be asking — if patterns are such a good idea, why doesn’t everybody use it? Well the answer to that is complicated, but most use it... they just don’t know it.



## The Timeless Way of Building

Christopher Alexander noticed that this is how people design. They have a _pattern language_ in their heads, which tells them what to do and how to do it. It’s sometimes verbalized as rules of thumb. Sometimes as words of wisdom. Often it’s learned via observing someone else build.

This doesn’t mean everyone has a “perfect pattern language”, they might contain patterns that are bad, some decent and some that are great. Alexander also wrote how to find the great patterns, how to research them and how to write them down. Of course there is always more...



## The Things I Missed and Forgot

Now you might be excited and want to exclaim your newfound knowledge. I want to remind you, this is only two pages of text whereas “The Timeless Way of Building” and “A Pattern Language” are together 1723 pages. It’s a very safe bet that I haven’t covered the topic completely or that I misunderstood some parts. _This reminds me, I should reread “The Timeless Way of Building”_

Instead of taking my word for it, read “The Timeless Way of Building” and tell me what I missed.

*I also want to say a special thanks to [James Coplien](https://en.wikipedia.org/wiki/Jim_Coplien) for “forcing” me to read Alexander’s work. I probably would have ignored my own stupidity, if he hadn’t challenged me.*