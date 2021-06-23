---
date: "2019-06-04T12:00:00+03:00"
title: "Value in Software"
summary: Understanding what is valuable.
star: true
tags: ["Software Concepts"]
reviewers: ["Peter Seebach", "Taavi Kivisik"]
---

{{< figure src="/_images/value/seedling.jpg" >}}

Why do we write programs in the first place? It’s easy to get lost in the technological details, but this is not the primary goal. This might sound obvious but, **we need to provide value to people**.

> There is a central quality which is the root criterion of life and spirit in a man, a town, a building, or a wilderness. This quality is objective and precise, but it cannot be named.
>
> -- Christopher Alexander, “The Timeless Way of Building”

Understanding _Value_ helps us understand why we are doing things in the first place. If you are not creating something of value, then you are creating waste.


{{< figure src="/_images/value/tree.jpg" >}}

## Valuable

To understand _Value,_ we must first understand why do we call things Valuable.

In the simplest terms, when **X** is valuable to someone **Y**, it means, that **X** has importance to **Y**, it can bring benefit to **Y** in some way.

The definition is not rocket science:

*   the internet is valuable because it can connect people to information with minimal cost,
*   a keyboard is valuable because it allows interacting with the computer and
*   a text editor is valuable because it allows to change and adjust the text with ease.

We know and feel when something is valuable to us, and we can empathize when something is valuable to someone else.


{{< figure src="/_images/value/context.jpg" >}}

## The Context

However, understanding Value is not that easy. We must always bear in mind that the value of something possesses is tied to the context.

*   If there isn’t information on the internet, then it’s not as valuable.
*   If there is no computer for the keyboard, then the keyboard is not that useful.
*   If you have nothing to write, then a text editor is not valuable.

The previous is all common sense, but these examinations help us examine more interesting questions. Let’s take something more challenging.

> Does a ‘login system’ have Value? The first reaction would be to say, _“Yes, of course it does.?”_
>
> But, have you ever gone home and said: _“I got so much value from logging into the system?”_ I doubt it. Should we conclude that _“No, of course logins have no value, they are only an annoyance?”_
>
> As you may have already guessed, neither answer is correct.
>
> -- paraphrased example from [James Coplien](http://www.leansoftwarearchitecture.com/)

The goal of “logging in” is to protect value, rather than to be of value. If there is no login screen for a system that you don’t use, then it is not of importance to you. When it’s an online bank login, the login is as valuable to you, as how much money you have on your accounts. For the banks, the login system is very important, although it may not be of any explicit value.

It’s never as simple as _“Does something have value?”_ because we need to take the context into account.

{{< figure src="/_images/value/looking.jpg" >}}

## Evaluator

You should also have noticed that Value will also depend on who is doing the evaluating. We have to keep in mind that there is always an evaluator when looking at value.

When creating things, we should always look through the eyes of the person benefiting from the Value. In the [value stream](https://sites.google.com/a/scrumplop.org/published-patterns/value-stream), there can be many stakeholders who can benefit from it. Let’s say we are building a wooden box.

*   In the simplest case, we are providing value for the end-user. You make a wooden box, and the end-user uses it.
*   We could provide value to some other person in your team. You cut a few boards and give them to another person to assemble. The end-user doesn’t care about those boards, and they are not valuable to him.
*   We could provide value to ourselves. I could make a jig that allows me to cut boards faster and with less effort. However, neither the person doing assembling the box or the end-user using the box, will care about the jig. But, they do care about the faster cutting.

We shouldn’t restrict our minds to creating _boxes_, but instead see the bigger picture.

How is the box valuable to the end-user, how will they use it? Does he hold very lightweight things in it -- this means we can make the box sides thinner and reduce waste. Does he need to store different things, maybe we can add separators into the box?

Understanding what we create and why it is valuable to people is essential to making the right decisions.

{{< figure src="/_images/value/tree-swing.jpg" >}}

## Outside the box

We should have a bigger view and understand that we can get the same value from multiple solutions. Engineering is about understanding these different solutions and picking the most appropriate one.

When we look at the “login system” case, if the data can be public, then we won’t need a login. If we are only using it on our computer or intranet, then there is no login necessary.

Look for multiple solutions, and you can avoid a lot of work this way. Even better, you might end up with a product that is more valuable overall.

Understanding Value should be at the core of our decision making. It helps to give us clarity about why we are doing something and not doing something else. Always understand how value is provided for the end-user. Otherwise, we are bound to build something unnecessary.

In the next blog post, we’ll take a look at how we put this understanding into practice.

{{< biglink link="/building-with-value" title="Building With Value" description="How to use value as primary driver for developing." >}}