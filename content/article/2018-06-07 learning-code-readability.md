---
date: "2018-06-07T12:00:00+03:00"
title: "Learning Code Readability"
summary: Tips for developing your code writing skills.
tags: ["Psychology"]
---


_While I’m procrastinating the harder articles, I thought about writing a followup to “_[_Psychology of Code Readability_](https://medium.com/@egonelbre/psychology-of-code-readability-d23b1ff1258a)_”._

One of the questions I got was how do you actually learn or become better in writing readable code.

There’s a problem with “properly analyzing” the code. You are often still guessing, instead of knowing. Unfortunately, until we have proper peer-reviewed studies we will be guessing. It’s important to keep this in mind, your interpretation may not match other people.

A few people mentioned that the examples were rather local in nature and don’t have big impact to readability. I agree with that. However, such small things often add up. Understandably, the bigger impact comes from the project structuring. The psychological factors are all the same in all different levels.

For example, in text readability these are referred to as [local and global coherence](https://en.wikipedia.org/wiki/Readability#Measuring_coherence_and_organization). Effectively, one is about how you make a paragraph readable and which words to use, the other is how you make chapters and the whole book comprehensible.

As a thought experiment what are the psychological implications of different ways of organizing code:

```
model             user
    - user            - model
    - post            - view
view                  - controller
    - user        post
    - post            - model
controller            - view
    - user            - controller
    - post
```

_You can replace MVC with whatever you are familiar with or whatever you are currently working on._

Improving your code writing and analysis skills is mostly about two things:

1. expanding your vocabulary and
2. understanding tradeoffs.

Both are pretty obvious. I will recommend a lot of things, it’s definitely not necessary to do all of them, pick what you enjoy.

## Read books and articles

Books are the jump-start to finding out different ways of writing code. Articles are the place where you find information about a specific subject.

My first recommendations would be:

1. [“On the Criteria To Be Used in Decomposing Systems into Modules”](https://repository.cmu.edu/cgi/viewcontent.cgi?article=2979&context=compsci) by David Parnas
2. [“Clean Code”](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Robert Martin
3. [“The Practice of Programming”](https://www.amazon.com/Practice-Programming-Addison-Wesley-Professional-Computing/dp/020161586X) by Brian Kernighan and Rob Pike

## Reading Code

To me this is weird, we spend all our time writing code and rarely read unrelated code. Read different projects written in different languages by different people. It’s easy to get into a echo chamber of doing things, the only way out, is to get out of your comfort zone.

By reading I do not mean, you look at code and say “this is terrible”, but rather try to understand:

1. What is good about it?
2. What is bad about it?
3. How did it end up that way?

Any large program evolves over time and does not just materialize in a single commit. Many of decisions are made due to time-constraints or committer didn’t know better at that time. It would be false to assume that the person thinks that it is the best way to write things. Maybe it’s not that valuable to rewrite or there’s not enough time to rewrite or the person has moved on to other projects.

As a starting point I would recommend, in no particular order:

*   Your commonly used frameworks
*   [The Architecture of Open Source Software](http://aosabook.org/en/index.html)
*   [Beautiful Code](https://www.amazon.com/Beautiful-Code-Leading-Programmers-Practice/dp/0596510047)
*   Your language standard-library
*   _feel free to suggest more in comments_

I would recommend reading real-world projects written in different **paradigms**. Try to understand how people using that paradigm think, how do they solve problems and in what order do they write programs.

History of a paradigm can be more enlightening than the paradigm description on Wikipedia. There is a lot of interesting insights that have been lost due to long [game of telephone](https://en.wikipedia.org/wiki/Chinese_whispers).

Note, there’s also a lot to learn from the process of seeing code being written. The end result often hides many mistakes, error and changes. I would recommend [Per Vognsen](https://www.youtube.com/user/pervognsen), [Sean Barret](https://www.youtube.com/user/silverspaceship/videos), [Casey Muratori](https://www.youtube.com/user/handmadeheroarchive) and [Jonathan Blow](https://www.youtube.com/channel/UCCuoqzrsHlwv1YyPKLuMDUQ).

## Code Review

Taking time to read some irrelevant code can be hard to justify at work. However, there is a great way to do that at work. Yes, code-reviews. It’s also quite effective in preventing bugs, but there are few other interesting aspects in code-review.

It ensures that other people in your team can read your code and you can read code written by other people. When you are a junior, then you will learn how things work inside the system. When you are a senior you will learn how to avoid complicated code.

Effectively it helps to homogenize the code-skill-level in the team.

I should point out that the goal is not to “make the code perfect”, because many of these small things don’t add value to the product. One major goal is to ensure that every next commit is slightly better.

There are many blog posts in how to do good code-reviews, but the short version is:

1. Assume best intentions by both sides,
2. Don’t take it personally and don’t make it personal,
3. Review at most 500 LOC at a time, otherwise review fatigue can kick in.

Read more here: [Smart Bear -- Best Practice for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/), [Code Review Best Practices](https://medium.com/palantir/code-review-best-practices-19e02780015f), [10 Principles of a Good Code Review](https://dev.to/codemouse92/10-principles-of-a-good-code-review-2eg).

## Ask for reviews

Let’s say you don’t have anyone to review your code. Popular language communities have a place for newbies. Even if you are a seasoned programmer, I suggest posting your code when you are learning a new language.

The old saying “you can write FORTRAN in any language” certainly applies here. You probably won’t like some of the suggestions. I would suggest trying the suggestions for a few weeks, especially if the the person suggesting has a lot of experience with the language. Many of the things will fade away as non-important for you, but make code more readable to the community.

Keep in mind that people don’t have an extended amount of time to look at your code, so make your code easy to run and browse.

If you are already experienced with the language, start giving suggestions. Don’t just post “do this instead”, but rather try to explain different solutions and why you picked that one out of ten other solutions.

It should go without saying, don’t take comments personally, discussion can quickly become heated due to different set of values, experience and domains.

When arguing about different aspects, ask yourself, is this discussion really worth it. How much you would pay a person to have this discussion, whatever his stance is?

## Naked/Ironman CRC

There are few techniques in trying to understand the cognitive impact of a piece of code. One of my favorites is “Naked CRC” described by Micheal Feathers in [“Working Effectively with Legacy Code”](https://www.amazon.com/Working-Effectively-Legacy-Michael-Feathers/dp/0131177052).

The whole thing can be described as taking [class-responsibility-collaboration cards](https://en.wikipedia.org/wiki/Class-responsibility-collaboration_card) and erasing all the information on them. I’ve found the approach equally effective in modeling any [code artifact](https://en.wikipedia.org/wiki/Artifact_%28software_development%29).

The step-by-step guide:

1. take empty post-it notes,
2. assign meaning to each post-it note (e.g. this is a function, class, object),
3. place them on table according to how they are related to each other

If others can’t follow you or you keep forgetting what something meant then the relations are probably too complicated and it might be possible to make them clearer.

## Exercise: Infinite Possibilities

A good beginner thing is to write one code-example in 10+ different ways. Take a simple thing such as “converting between temperatures”. Then try to analyze what are the pros-cons of each approach. Also try to use different language.

Count it as a separate solution when it has different pros/cons list from others. Try to make the pros/cons list more profound than just “people who know language X understand this better”.

The goal is not to find as many solutions as possible, but rather to explore the design space as widely as possible.

## Exercise: Cut the Red Wire

It’s interesting to notice how our tools end up influencing how we write code and how we offload our mental activity to tools. IDE-s being a shining example of this.

When our IDE helps with our “working memory” we can write more complex code, for better and for worse. This means that we end up noticing much later how complicated our code actually is, usually when we start debugging. There’s also a secondary effect of not learning to write better code because we are not exercising our cognitive abilities as much.

> Imagine there is a person trying to train for the 100m sprint by driving a car on 100m track. It probably won’t be very effective.

I realized that one kata described by [Carlo Pescio in “Cut the red wire!”](http://www.carlopescio.com/2011/06/cut-red-wire.html) shows how much you rely on tooling.

The concept is pretty simple:

1. You take a non-trivial exercise (e.g. [Yathzee](http://codingdojo.org/kata/Yahtzee/)).
2. You write a program to solve it.
3. You run it.
4. When it runs successfully, you have passed level one.
5. Make modifications to the program (e.g. update to [real Yahtzee rules](http://www.yahtzee.org.uk/rules.html), don’t look before implementing first version)
6. You run it.
7. When it runs successfully, you have passed level two.

The main catch is that you may run it only once. So no tests, no proof-of-concepts, no type checks, no linters, no IDE-s, no syntax-highlighting nothing. You have only one chance to get it right. You can make the exercise even harder by not using documentation.

Effectively, it’s similar to writing your code on paper with instructions how to run it, and another person should be able to run it.

It’s interesting to notice how it affects how you write and analyze your code. How much does it differ from your usual way of writing code?

Let me know how you did.