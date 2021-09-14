---
draft: true
title: Demystifying Technical Debt
description: "Trying to pin down technical debt."
date: ""
tags: ["physics-of-software"]
---

"Techincal debt" has been bothering me for a while. It's seems somehow a catchall for different design mistakes, code worsening over time and legacy code bases and intentional design mistakes due to time constraints. You can take a look the list of causes in [Wikipedia](https://en.wikipedia.org/wiki/Technical_debt#Causes) if you don't believe me. It makes feel like the code is collecting dust when it's not being maintained, but clearly that cannot be the correct since the code might be unchanged.


Let's take this piece of code from BOOK. It has bee unchanged since YEAR. Has the technical debt risen for this code? When we talk about things collecting dust, the book example would definitely have more chance being dusty than code stored digitally. However, most people wouldn't consider it technical debt, just old code.

TODO: image of code

To push the metaphore to breaking, how do you measure technical debt and how large is the interest? How much code would I need to write to pay off all of the debt? If I have a lot of code, can I give a technical loan to other people?

But I digress, I think this unclear "technical debt" metaphor has caused bad decisions in codebases that don't need fixing -- and also the other way around, not understanding it caused people to overlook actual problems.

Before we get to tackle "technical debt" we need to take a small detour.

# Quality and Effort

First problem we need to tackle is "quality". When we are talking about code quality, we usually have the following things in mind:

* Fit for purpose - whether and how well the code does, what it is supposed to do
* Reliability - does it break on every tuesday between 1AM - 2AM
* Security - can we access, modify or break information that isn't meant for us
* Flexibility - how well can the code accomodate new needs
* Efficiency - how many trees we need to burn to run an operation
* Maintainability - how many hours and lines of code we need to modify to add, fix or remove a feature

When we talk about "technical debt", usually, we are concerned about maintainabilty. There definitely are hints of the other aspect in there as well, however maintainability does seem to be dominant.

One way to summarize "maintainability" is to treat it as "effort needed to make a change". We can dissect this effort into several pieces -- or in other words, places where we use up our energy:

The most obvious part is *effort in code modification*. We can modify many different aspects of the code:

* types, structs, variables, methods - the usual langugage primitives
* packages, modules - the grouping and organization of code
* tests - things that verify that the code works
* frontend, ux - how things look and how you interact with the system
* documentation - things that describe what the code or program does
* tooling, databases - changes to programs that the code needs to interact
* makefiles, build system - changes in how we run, build the code

By no means is that list exhaustive. The less obvious part in effort is *effort in understanding*. The understanding here doesn't necessarily mean just understanding, but also clarifying and modifying things that help understanding. We can dissect it into:

* code structure - how clear is how things interact and how things are connected
* mental model - how we think about the problem and how it relates to the product
* product - how should the product work
* business value - how does the product give value to its users

The third major category is about people. Rarely you are building a product alone. Even if you are the solo coder and owner of the company, you probably still need to communicate with your users. So, there's *effort in communication*:

* other developers - asking for help, discussing code design
* code reviewers - giving and getting feedback on things that can be improved
* product owners - discussing how the product should work
* end-users - understanding their needs and where they would get most value

Obviously we could dive deeper, but the main point is that *effort* is not one dimensional and involves a lot of human factors beside "typing code".

# Change in effort

One important observation is that the amount of effort needed to make changes changes over time. There are several tendencies.

The **change in code modification effort** usually increases over time, because:

* features are rarely removed
* features are usually added
* there's more code to handle the features
* the user interface is larger

We can see similar tendencies in **understanding effort**. Usually:

* percentage of understood about the project decreases, because the projects get larger
* understanding of the business needs increases
* knowledge of older unmaintained parts are forgotten
* decreases when people change companies

With **communication effort**, it's slightly more complex. The effort:

* increases with company growth,
* decreases with clarifying processes. 

Overall, we can state that:

> The effort to maintain a project increases, without activities that actively reduce it.

It would be now easy to conclude that this "increase in effort" is the "technical debt". However when we look back at the initial question about old code.

TODO: code image

This code has been years in a book without any new additions, noone communicating about it, however some would still consider it technical debt. There must be things that are missing from our understanding.


# Perception

One fundamental laws of software development is that you make mistakes. Technical debt is often associated with bad decisions in the past. So, how do we recognize mistakes?

When we notice a difference between:

* what we see
* what we expect

So, there's something that we "perceive" and realize that it's not in it's "ideal" state. This is the same for realizing a mistake in "effort" or "maintainability".

We can visualize this as:

TODO: image

Our "ideal effort" decreases when we realize how things could be better and when we learn things. Of course, it also decreases, when we forget things.

So, there's "potential improvement" that we evaluate. Roughly speaking we can say that:

> Technical Debt == Perceived Effort - Ideal Effort

Obviously, you don't have to agree with my approach to it. If it makes you feel better, you can replace "Technical Debt" with "Effort Debt".

There are several interesting observations here.

When there's a breakthrough in technology (e.g. go cross compilation, React model), people realize that there's a much better way to do something. Hence, they feel that their project has technical debt and they should fix it. Although, the actual effort to maintain the project hasn't changed.

When we "borrow technical effort", then we make a decision to implement a less maintainable solution in favor of finishing the job faster.

It's also interesting to thing about what is "quality debt". That's outside of this blog post.

However, it's important to realize that improving "quality" can sometimes increase "effort" to main software. The easiest example is that if you don't care about security it's much easier to implement than when you do.

# Nobody's Perfect

It might seem that these "perceived effort" and "ideal effort" are values that are easy to measure, but they have quite a lot of dimensions and different people may come to different conclusions.

The first question, whom effort? For "average developer", "average developer in the company", "average junior developer", "average game developer"?

The second question, what change? Any change? Usual changes? Architectural changes?

Besides these we also need to consider who is evaluating these. Every person has their own biases.

If the person is hyped, working with systems they know very well and tools that they know very well. They can easily underestimate the "average effort".

Similarly when the person has preference for other tools, the system has flaky behavior, the person doesn't understand the system... then they can overestimate the effort needed to maintain.

It's interesting to note that people tend to not notice things that work well in a given system.

Similarly, we tend to overestimate the effort needed to maintain old languages. This is true to some degree, however, given that there's a new framework every month and people are able to keep up to date with that... then learning a old system should be easier.

It's interesting that people tend to also overestimate the effort needed to use another language, when it's familiar enough, but has different language features. A C++ programmer starting to use Go would feel overly restricted and hence conclude that they will be significantly slower when writing that language. Similarly, a Go programmer feels they would be overwhelmed by when starting use Rust due to the amount of features available. Both are right in some regards, but mostly, because they need to relearn how to do some things, not due to the amount of features. After getting the basic down, the difference in effort isn't that significant. There would be still a perception bias towards the language you like more.

Of course, the less familiarity you have with a particular thing the larger the error in your estimation.

# Technical Debt by Ward Cunningham

Initially when Ward Cunningham came up with the metaphor, he only had the "code mismatching business ideas" in mind.

https://www.youtube.com/watch?v=pqeJFYwnkjE
http://wiki.c2.com/?WardExplainsDebtMetaphor

> And that said that if we failed to make our program align with what we then understood to be the proper way to think about our financial objects, then we were gonna continually stumble over that disagreement and that would slow us down which was like paying interest on a loan.
>
> Ward Cunningham

# What can you do about it?

## Rewrite??

Rewriting should be last resort.

The larger the piece you are rewriting the more likely you will introduce new faults.

Second system effect.

People don't notice things that work well in the given system and mess it up.

## Continuos Learning

Set aside reading time for developers. The more they know, the less they learn later.

Experiment with multiple ideas. The more ways you know how to solve a problem, the more informed your decision is. See also infinite possibities exercise.

Ask for help and guidance. There are plenty of experienced programmers that can offer their services to review your code and suggest improvements.

## Code Reviews

Similarly code reviews significantly help with both disseminating understanding about the system and learning early about things that could be done better.

First thing you should do, is to automate linting as much as possible and automate formatting. In general, code reviews should avoid style questions as much as possible to ensure that feedback is useful.

Try to ensure that the quality of pull requests increases over time. Every next commit should be 1% better, for some definition of better.

Strive for gradual improvement of the codebase rather than large improvements.

Ideally, target less than 400 LOC per change. When the change is over 400 loc, the reviewer fatigue kicks in and reviewers starts missing more bugs. Similarly, when commits are small, they get merged faster and are less likely to go stale. This is based on SmartBear study.

While reviewing you should always consider, whether 2 similar commits would make it difficult to maintain? If yes, then the next change into that codebase should be accompanied with an improvement to the structure.

## Maintenance

Do regular reviews architecture reviews, whether everything feels right. Mark down places where people waste their effort and try to improve those places.

Sometimes a video explaining the whole system can be much more effective than a large refactor.

Try to isolate problem areas. Some third-party packages and libraries are pervasive and can seriously affect the rest of the code base. By creating a wrapper for those systems, they can be made less benign. See anti corruption layer.

## Acceptance

The final advice is about acceptance, there will be always places where you can improve the system:

> “Not all of a large system will be well designed...”
>
> Eric Evans

You don't have to re-write your bash scripts in Haskell for the glory of purity. Time to develop systems are limited and try to figure out where you can make the most significant impact.

# Conclusion

Technical debt is not "dust" that accumulates on your code, but rather it's an inherent part of code. Over time you learn and start noticing those mistakes. I think using "technical debt accumulates" is the wrong mentality, instead it should be "discovering technical debt".

> Technical Debt is not a Monster.
>
> It's just the realization that you could do better.