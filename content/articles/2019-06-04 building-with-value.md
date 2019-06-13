---
date: "2019-06-04T13:00:00+03:00"
title: "Building with Value"
summary: How to use value as primary driver for developing.
tags: ["Software Concepts"]
reviewers: ["Peter Seebach"]
---

{{< figure src="/_images/value/tree-swing.png" >}}

Beginners often overwhelm their brain with decisions and things they need to do. Which usually turns into a mess of trying to implement everything at once. Alternatively, programmers end up making very short-sighted decisions that end up becoming problematic later.

The most important part of programming is that you cannot do everything at once. The human mind is very limited in how much it can process at a time. To combat this limitation, we need to build things piece-by-piece to ensure that everything will fit together nicely.

> Speaking as a builder, if you start something, you must have a vision of the thing which arises from your instinct about preserving and enhancing what is there ... If you’re working correctly, the feeling doesn’t wander about.  
>    
> -- Christopher Alexander

The question is -- how do we pick the pieces we develop? How do we ensure that our mind and feeling doesn’t wander around?

## Understanding Value

I covered some of the aspects of understanding value already in Value in Software.

{{< biglink link="/value-in-software" title="Value in Software" >}}

When we are starting out writing some software, there is so much we could implement. There are also so many ways we could organize and implement things. This overwhelming amount of concerns can quickly push people into Analysis Paralysis.

One approach would be to start from what is easy to implement; however, if we do that, we may implement many things that are not valuable or even worse, not get to implementing valuable stuff at all. 

Let’s take an Issue Tracker as our example to investigate the problems.

Let’s say we start by implementing login to the system as the first thing. As discussed in another article, it’s not that valuable to people. As a programmer, you might think -- I’ve done this many times, it’s easy, and I already have a lot of that code necessary. No doubt, you get something that looks nice and can interact with the page, but what are the downsides?

For one, we would need to login to the site before we can interact with the actual things; this slows down every step of our development. Similarly, our code base will end up more substantial. Hence, we have more distractions and more things that could break. We also might get new requests for login, e.g., password recovery, user management, user groups. Triaging extra features sinks time from other vital parts of the code.

We could also start implementing the end goal. For issue tracking, this might be managing large projects with several teams. However, a big goal can take too much time before it can become practically useful.

Implementing larger things has an even more significant drawback: we make larger changes and hence we are likely to miss many mistakes.

> Yet, to date, there is little recognition of the following commonsense point: If indeed the programs are so complex, then it is likely that they, too, will be potentially subject to hundreds of thousands, perhaps millions of egregious mistakes of adaption. Here I am not only talking about “bugs” -- failures which stop a program from running altogether. I am talking about mistakes of adaptation, ways in which the program fails to do what it is supposed to do, fails to meet the needs of the people who use it, or is more awkward, more annoying, less useful, than it is supposed to be.
>
> -- Christopher Alexander, “The Process of Creating Life”

How do we avoid making mistakes in the Valuable parts of the system and at the same time, be as valuable as possible?

It somehow seems obvious and not-so-obvious at the same time to start with the most valuable thing we can complete right now.

For an issue tracker, the most valuable thing we can quickly complete is the Issue. We can detect the importance already from our conversation about the product. To do anything in the system, we need to be able to manage Issues. The rest of the system has no significant value without it.

The benefit we gain from this is that when we implement “Issue” as the first thing the thing support, we can already start using it in code and people may get a little value from it.

You might be asking, “What about Projects?” It’s quite easy to start multiple instances of the same server and track them on different URL-s.

Alternatively, “What about login?”. If it’s only for internal use, we could put it up on our intranet and actually trust your coworkers. If we really need outside access, we can add a proxy for authentication.

_Just to clarify, I don’t think avoiding “login system” makes a huge difference in the project, however, it is a good example._

There are also other benefits we gain from putting Valuable things first.

We start to learn about them much sooner and understand how they fit together better, without being distracted by less important things. Maintaining Valuable parts gives us more insight into how it might provide even more value.

The code usually will reflect this as well. Since these are the things we implement first, the code will be cleaner and contain fewer bugs. Even more, the developers need to always think about why they are doing things, rather than crunching out features.

It’s important to figure out what is more valuable than something else; otherwise, we may end up back with Analysis Paralysis. Even, if we later discover we were wrong, it’s essential for figuring out what to do.

---

## The _Simplified_ Process

[_Christopher Alexander in “The Process of Creating Life”_](https://en.wikipedia.org/wiki/The_Nature_of_Order) _describes a fundamental process, how life and things we consider living, evolve. The process of creating complex structures, like software, does not differ._

_However, it’s hard to describe “The Fundamental Differentiating Process” without also describing the foundations of Centers and Structure-Preserving Transformations, which in itself would take several articles._

_The following is a simplification of the “Fundamental Process” combined with concepts from “The Timeless Way of Building”. It loses some of its generality and beauty in favor of pragmatic concerns. While the following is very useful, it’s not the whole story._

### Structure Follows Value

We dedicated a lot of time explaining what Value is and why it is important. To ensure that we build something of value, we need to understand the value it provides and how it provides it. The better we can distinguish value, the better we can make decisions.

#### Decomposition

When we roughly know what we are building, then we can find the next step by trying to eliminating things. We can visualize the project as a graph of dependencies and associations:

{{< figure src="/_images/value/decomposition-01.png" >}}

We ignore things we cannot implement right now, can mock out, can achieve with other means or live without. Implementing data repositories don’t make sense without actually knowing what we need to store so that we can cross them out:

{{< figure src="/_images/value/decomposition-02.png" >}}

Since Projects without Issues are less valuable than Issues themselves, we can cross it out.

{{< figure src="/_images/value/decomposition-03.png" >}}

Since we can use Issues without Users and tracking Issues are more valuable than tracking Users, we can cross out users.

{{< figure src="/_images/value/decomposition-04.png" >}}

Since View requires the existence of an Issue, we can also cross it out.

{{< figure src="/_images/value/decomposition-05.png" >}}

Of course, different people may reach different conclusions on what is the most valuable thing, but it’s more consistent than inconsistent. If you are in doubt, ask another person what would they rather have “Issues” or “Issues View.”

Sometimes the value is so similar that it’s quite impossible to break the tie, but it is critical to do it nevertheless. You could pick the one that is the least understood, the one that is easier to implement or roll a die. If we do not create this ordering, we can end up overwhelming ourselves.

#### Enhancement

A slightly better approach is to do this in reverse and think of things in terms of unfolding. We ask ourselves which change would enhance the system wholeness and value the most.

This approach is more difficult to explain and to do, but it also works when we don’t exactly know what we are building. This approach requires feeling and a good understanding of the wholeness of the system.

You might think that when you start a new project, there is no system to enhance, but there always is. There’s always a reason you are implementing the project. In an Issue Tracker, there exist people, who want to use the system, and want to get an overview of what is happening. There are also many ideas on how things should work. World, People, and Ideas are a part of the system like any piece of code you write.

### Spiking

Implementing ideas one-by-one would eventually cause problems since we might make mistakes from integrating with the rest of the system. We also shouldn’t try to implement too much, since our working memory cannot handle it.

If we try to break the previously discovered “Value” into 2–4 changes, we minimize the chance of the changes fitting into our working memory. We outline these changes as rough drafts called Spikes. For Spikes, you can use method declarations, type definitions, comments, or anything else that helps to get a feel for how things fit together. We could even do the spiking on a whiteboard or CRC cards.

_Spiking in software development has its roots in_ [_Extreme Programming_](http://www.extremeprogramming.org/rules/spike.html) _for getting a feel for and understanding whether we are on the right track and notice potential problems. The spiking idea comes from architecture, where architects would put spikes into the ground to get a better feeling of the building and the environment._

### Gradual Stiffening & Cleanup

Once the spikes roughly fit and integrate with the rest of the system, we can start making the draft changes. We begin to implement methods, rough out testing, update documents, and so on.

While making these 2–4 changes, we also need to pay close attention to how things fit together and have a keen eye on how the process flows.

> Recognize that you are not assembling a building from components like an erector set, but that you are instead weaving a structure which starts out globally complete, but flimsy; then gradually making it stiffer but still rather flimsy; and only finally making it completely stiff and strong. We believe that in our own time, the most natural version of this process is to put up a shell of sheet materials, and then make it fully strong by filling it with a compressive fill.
>
> -- [“A Pattern Language” by Christopher Alexander](http://www.iwritewordsgood.com/apl/patterns/apl208.htm)

If we use a wrong type name and code doesn’t compile, it can be an important signal that the type could have a better name. We need to have an awareness of the whole.

This could even result in us moving our spikes or going back to evaluate what is the most valuable thing we are doing. If you are unsure, take notes they help remind where things can be further improved.

Gradual Stiffening and Cleanup happen together. One is about improving things, and the other is about observing the wholeness and fixing small mistakes.

### Putting it all together

It might not be easy to comprehend this without practical examples, but the best analogy might be Drawing.

You don’t start drawing like a matrix printer; starting from the top-left corner and proceed to the right side and then the next line.

More often, the process looks like:

1. First, you figure out what you are drawing and what are the things you are going to draw _(structure follows value)_ and the purpose of the drawing.  
2. Then you do a few rough sketches until you see that the picture will work nicely _(spiking)_.  
3. Then you start to refine the sketches and draw more delicately _(gradual stiffening)_.  
4. Finally, you clean all the sketch lines and color it _(cleanup)_.

The basic process of programming is the same. The process also may unfold recursively on different levels of abstraction. In a company, you will have multiple people doing similar processes in parallel.

This skill of being aware of value and wholeness takes time to develop, but the better you get at it, the more fluid and faster the process becomes.

In the next article, we’ll take a look at how one iteration of this process might look like:

{{< biglink link="/building-with-value-an-example" title="Building With Value: An Example" >}}