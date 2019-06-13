---
date: "2018-10-20T12:00:00+03:00"
title: "Thoughts on Code Organization"
summary: Examination on common ways to organize code and their tradeoffs.
tags: ["Software Concepts"]
reviewers: ["Taavi Kivisik"]
---

There are many ways code could be structured. I was pondering a lot what is the best way. I rather reached an unsatisfying conclusion  --  depending on the situation one could be better than some other. Structuring code means to slice up the program in different ways for better comprehension.

One of my major insights was:

> When the code-base is less than 30,000 lines of code, then code organization isn’t a big hindrance in getting work done.

This number also suggests that you cannot draw any significant conclusions from code-bases that have less than 30K LOC (lines of code).

_Note: the actual size is actually more related to how much variance and how many ideas the implementation has. For example, on a website you probably would need 5 different domain ideas, where each is represented by 5 entities, all of them being manipulated and inter-connected. The 30K LOC cutoff serves more as a heuristic._

{{< fig src="/_images/code-organization/dictionary.png" caption="Vocabulario en lengua de Mechuacan" link="https://archive.org/details/vocabularioenlen00gilb" >}}

## Alphabet

Why do people organize things in the first place? First, it helps with finding things. Take dictionary for example. I can find “serendipity” just by finding the letter “s” and then each following letter one at a time.

In a dictionary with words sorted in alphabetical order each word acts like a road sign pointing from where you are to where you want to go.

It would be wrong to conclude that organizing everything alphabetically is the right thing to do. Often the question is how to organize. For example when I would like to find all words ending with “-logy” then alphabetical order would be very difficult to use. There are specialized dictionaries that help with that exact question, but those in turn make finding a words with the same beginning more difficult.

When organizing we need to think:

> **Where is the value in a specific order?**

One important implication of this is, that when we make something easier, something else becomes more difficult. The code structure should cater to our problems and needs.

{{< fig src="/_images/code-organization/pieces-pile.png" >}}

## No Organization

What does disorganized mean? It’s easy to state that something is disorganized, but how do we know whether something is organized?

Organization can be largely separated into three principles:

*   grouping
*   showing similarity
*   showing relationships

Grouping creates a unifying idea that helps us find or situate something. In psychology terms, we create a new chunk out of multiple ideas. Showing relations or similarity helps us find the other idea and how it is situated in the bigger picture.

As stated before, a dictionary has alphabetical order. This creates implicit groupings. Each word might have a description or “see also” notes, which show relations to other words.

So, when we talk about no organization, it often means one of the following:

*   there is no understandable grouping
*   it is unclear how something is related to everything else

It’s important to notice that it’s about “understanding” and “clarity”. When you look at a reverse word dictionary, the usefulness probably won’t be visible immediately. It might be easy to say it’s unorganized or useless. However, when you understand the usefulness it “magically” becomes organized.

{{< fig src="/_images/code-organization/reverse-dictionary.png" caption="A Rhyming, Spelling, and Pronouncing dictionary" link="https://archive.org/details/rhymingspellingp00walkrich/" >}}

In most cases we also need to consider ease-of-learning the organization. Complicated approaches can become an overhead when trying to modify artifacts. A simplistic approach may not give useful benefits. More on that later.

{{< fig src="/_images/code-organization/smalltalk-76.png" caption="Smalltalk-76 Code Browser" link="https://github.com/livingcomputermuseum/ContrAlto" >}}

## Code

Code is mainly organized using the following language constructs:

*   folders and files;
*   modules, units or packages;
*   types, classes, nested classes and objects;
*   interfaces, traits, contexts, roles and aspects;
*   methods, functions, nested functions and code blocks.

However, there are other ways to describe structures:

*   spatial placement of code structures;
*   similar naming (for example [Hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation) or [Design Patterns](https://en.wikipedia.org/wiki/Software_design_pattern));
*   regions ([such as in C#](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/preprocessor-directives/preprocessor-region));
*   comments, documentation and diagrams.

It might be easy to forget that types serve as a way to organize code. Things derived from the same base-class (or object) are explicitly related. Using another type as a field in a structure is an implicit link to understanding that structure as well. The following descriptions applies to any or combination of these.

{{< fig src="/_images/code-organization/canonical-layout.png" >}}

## Canonical Layout

One of the most obvious ways of organizing things is the same way as everyone else does. This gives rise to structures that look very similar to each other.

You can recognize Java by its structure `lib`, `src/main/java`, `src/main/resources`, `src/test` etc. Or Linux by `etc`, `mnt`, `dev`. You also have `model`, `view`, `controller`. But there’s no real reason for naming these folders that way other than that everyone else does it the same way.

I’m not talking about the specific content that these folders have, but just the names. It could be `library`, instead of `lib`; it could be `mdl` or `models` instead of `model`. Keeping consistency can help a lot with understandability.

> Familiarity is a useful feature as it helps us understand new things quicker by relying on what we know already.

My own rule is that when I cannot argue for more than 5% better results by naming it some particular way, then I will use the canonical approach; because the hit from non-familiarity (see [principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)) when other programmers read it, is bigger.

Often there are reasons why something ended up being named like the way it did. Usually they are human reasons. Someone thought that “this is clear to me” and other people picked it up. The benefit comes from familiarity rather than anything else.

{{< fig src="/_images/code-organization/by-technology.png" >}}

## Group by Dependency or Technology

Separating things by having a common dependency is another easy way of categorizing.

For example you might have a component that relies on Windows or Linux system calls, so it can be helpful to separate them with a folder. Similarly a database implementation built on top of Postgres and MongoDB might end up in different files or folders.

Separating things by dependency often makes it easier to do compilation where you don’t pull in a particular dependency. Similarly, separating by dependency allows you to focus more on the “abstraction” that the different dependencies need to implement.

This clear separation might end up with more lines of code compared to using things like [C-macros](https://en.wikipedia.org/wiki/C_preprocessor#Conditional_compilation) `[IFDEF](https://en.wikipedia.org/wiki/C_preprocessor#Conditional_compilation)`[s](https://en.wikipedia.org/wiki/C_preprocessor#Conditional_compilation). Similarly, the “abstraction” that describes both adds more code.

{{< fig src="/_images/code-organization/by-team.png" >}}

## Group by Team

> “organizations which design systems  ... are constrained to produce designs which are copies of the communication structures of these organizations.”  
> \- M. Conway

Grouping by team makes it clearer when coordination between teams is needed. For example `ui`, `backend` and `db` need expertise from different teams. Hence, it becomes more obvious who is responsible for which part of the codebase.

However such separation can break locality of information of how something works. Locality of information itself can make harder to grasp the system as a whole. The isolation itself may result in `ui`, `backend` and `db` not fitting together nicely.

A change in the model often propagates through all of the groups. This increases communication or it may require more effort to define stable interfaces.

{{< fig src="/_images/code-organization/by-use.png" >}}

## Group by Use

A grouping that focuses on usability is “group things that are used together”. Sometimes it is difficult to define a single clear grouping other than these things are used together.

Most languages have some sort of `math` or `string` manipulation package, with functions like `power`, `log` and `trim`, `join`.

Effectively these groups are _toolboxes_ that you can use. The problem with such toolboxes is that they can easily degrade into _kitchen sinks_, where all sorts of arbitrary things end up together. You need to clearly figure out what belongs or doesn’t belong in there to avoid such problems.

{{< fig src="/_images/code-organization/by-connections.png" >}}

## Group by Connections

One similar approach to grouping by use, is grouping by connections. We can see this in abundance when looking at declarations of classes and it’s methods.

A method is tied to the class declaration because it operates on the fields that a class has declared. Of course it is declared there because we see it as a behavior of the type. We declare them together, because they are strongly bound together, so it helps to keep a locus of attention.

This is not limited to class oriented languages, all languages have a preference of keeping functions, procedures or predicates close to the type, datatype or struct.

The problem with this approach is similar to grouping by use. Commonly used structures can start accumulating features from all of the places it’s being used. This can make the structure itself less clear. Good examples are data-structures ([Scala](https://www.scala-lang.org/api/current/scala/collection/Seq.html), [C#](https://docs.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1?view=netframework-4.7.2#methods)). Of course, you do get a lot of convenience from this approach.

{{< fig src="/_images/code-organization/by-classification.png" >}}

## Group by Classification

Grouping by classification is about organizing things based on the function that things serve in a bigger picture.

One of the most recognizable ones would be [Ruby on Rails folder structure](https://github.com/jwipeout/rails-directory-structure-guide).

{{< fig src="/_images/code-organization/ruby-on-rails.png" >}}

Many frameworks force a particular folder structure. It’s common to see folders such as `models`, `views`, `controllers` and `components`. For games you would see folders such as `textures`, `scripts`, `materials` and `meshes`.

In some projects there is also a single separate folder such as `plugins` that serves as pluggable parts. This helps to organize and make it clear that the rest of the system doesn’t depend on them directly.

Separation by category can help and simplify framework implementation to automate and find things. For example web renderer can look `views` folder to find appropriate content to render. Similarly, micro-architecture problems are more visible. For example, it is much more visible when “models” requires “views” by accident.

With frameworks that require such layout it’s necessary to learn the proposed structures. The more complicated the layout, the more learning is needed. However, given a good layout this can significantly help getting small and medium sized projects up and running, since you don’t have to relearn how to do everything.

However the bigger the project the more likely it is that you need [exceptions in your design](https://www.youtube.com/watch?v=FAZ4GjPKmVI). The fixed folder structure means you either end up creating new folders for capturing the exception or the folder becomes “dirty” because the artifacts don’t necessarily align with the category.

The classification problem can also happen with inheritance. [“Evolve Your Hierarchy”](http://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/) describes this problem in game programming context. For example having a base class “Movable” and then a derived “Vehicle”. However, when we add a “Trebuchet”, which needs to be deployed, it makes the object “Unmovable”. We would then move all the different behaviors up to the base class or create a new base-class “MostlyMovable”. We can manage it, but the fundamental problem is about treating it as a classification problem rather than composition of properties.

{{< fig src="/_images/code-organization/by-feature.png" >}}

## Group by Feature

Instead of thinking in terms of classification we can also think of features that work together.

For example, you would end up with ideas `blog`, `admin`, `user`, `comment`, `feed` for a blog site. You still might have models and views, but in these folders (`blog/model` , `blog/view` etc).

This organization makes it much clearer what the software does and how it’s built. It also shows how different things communicate. It places less importance on technical considerations and more on the value proposal of the whole system.

It also makes it much easier to have variation in how things are implemented. For example some particular feature might much better be expressed as a `model-view` or `page`.

You can still have [cross-cutting features](https://en.wikipedia.org/wiki/Cross-cutting_concern), such as administration of pages. So you would need to figure out how to exactly implement it. One way would be to have a single folder `admin` with `admin/blog`, `admin/users` etc. An alternative would be `blog/admin`, `user/admin` etc. In the first case we make it easier to write the admin system itself. In the second case it’s easier to manage a particular feature in isolation.

When we have given less importance to technical considerations it becomes more difficult to enforce a particular micro-architecture and consistency between features. However, it is still possible to use code-review and specialized linters can also ensure such constraints.

With performance oriented projects it might become much more difficult to ensure that the system as a whole works tightly and with low-memory, because we may have separated the pieces that are commonly running together.

This approach also has problems when prototyping, when you are still figuring out what “features” you need.

{{< fig src="/_images/code-organization/by-value.png" >}}

## Group by Value

In all of the previous groupings we have discussed pros and cons of different approaches. “Group by Value” can be seen as an mix of all them.

You start by figuring out what is “valuable” and important in your project. This can vary in different sections, classification or features. Then derive the organization.

{{< fig src="/_images/code-organization/go-project.png" >}}

This kind of organization can be seen in many projects that do not have an idiomatic way of writing things. You can look at [Kubernetes](https://github.com/kubernetes/kubernetes/tree/master/pkg) as an example that uses many of these. Similarly many other command-line utilities, database implementations.

This kind of structure happens quite naturally when taking an incremental approach to building things.

One of the major downfalls of this approach is that it is difficult to explain and difficult to do well. Contrary to all the previous organization approaches, you need to be able to evaluate pros/cons of all of them instead of just one. Explaining these ideas to junior programmers is also difficult.

Grouping by value requires a good understanding of why and how your software is valuable. Getting a deep understanding can take a lot of time. And as I mentioned in the beginning, the extra effort of organizing may not pay-off when your project is small. Then again, with large projects forcing people to think about what is valuable can have big benefits, not just in code-organization, but also the product itself.

---

{{< fig src="/_images/code-organization/ready.png" >}}

I try to think less about organizing code and more about organizing ideas about the software. Then again, it’s about finding a good balance between different approaches. There is no “right way”, but they do give more clarity to different aspects of a project.

> “Just organizing things” doesn’t necessarily create value.

The question is, which organization gives the most value to you?