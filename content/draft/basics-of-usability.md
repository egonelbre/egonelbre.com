---
draft: true
title: "Basics of Usability"
description: "Summary of usability concepts."
date: ""
tags: []
---

I think a lot of usability can be best explained in terms of psychology. I definitely didn’t come up with this approach myself. As a starter, [The Humane Interface](https://en.wikipedia.org/wiki/The_Humane_Interface) by Jef Raskin is awesome guide into the world of usability.

### Flesh and Blood

We keep forgetting that humans are interacting with our system.

![Sketchpad: A Man-Machine Graphical Communication System (1962) by Ivan Sutherland](https://cdn-images-1.medium.com/max/800/0*oFZHk5_9KG5WXlYj)
Sketchpad: A Man-Machine Graphical Communication System (1962) by Ivan Sutherland

We get tired, we lose focus, we make mistakes, we forget, we stumble, we are interrupted by a coffee falling our lap.

#### Audience

It’s easy to chunk people into a certain category. States

Whom are you designing it for?

Why is vim still so popular?

### Cognetics

Ergonomics — the study of how people physically work

Cognetics — the study of how people mentally work

#### Locus of Attention

We can focus on only one thing in one area.

**Distraction**

![It’s funny until you see it in production.](https://cdn-images-1.medium.com/max/800/0*4qTojeli2mat-cKF)
It’s funny until you see it in production.

Visual Noise

No point to focus nor grouping.

I really want to believe that this is a joke.

You probably won’t make this mistake ... although.

**Notifications**

Immediate notifications when receiving email and or message.

Red Dot on a Web Page

![](https://cdn-images-1.medium.com/max/800/0*VZPwAV7mnFfjUYfK)

  

**Leading Attention**

Attention is precious resource, the better we guide, the less confused a person will be.

Where should the labels go?

We can guide and orient in several ways

1.  Grouping
2.  Order
3.  Contrast
4.  Size

#### Multitasking

People are mentally challenged.

Also known as “doing things the hard way”.

Also known as “giving up 40% of our productivity”.

Also useful to keep in mind that while doing user-testing make sure that they are doing other things that they usually do.

Someone working at a counter.

#### Modal Screens

These create a subtask that we need to orient ourselves.

[**What research is there suggesting modal dialogs are disruptive?**  
_Generally speaking, disruptions and distractions negatively affect human performance, a common finding in cognitive ..._ux.stackexchange.com](https://ux.stackexchange.com/questions/12637/what-research-is-there-suggesting-modal-dialogs-are-disruptive/15056 "https://ux.stackexchange.com/questions/12637/what-research-is-there-suggesting-modal-dialogs-are-disruptive/15056")[](https://ux.stackexchange.com/questions/12637/what-research-is-there-suggesting-modal-dialogs-are-disruptive/15056)

[**Modal & Nonmodal Dialogs: When (& When Not) to Use Them**  
_To better understand the difference between modal and nonmodal dialogs, let's look at what the terms "dialog" and ..._www.nngroup.com](https://www.nngroup.com/articles/modal-nonmodal-dialog/ "https://www.nngroup.com/articles/modal-nonmodal-dialog/")[](https://www.nngroup.com/articles/modal-nonmodal-dialog/)

Measurable effects:

45%: Forgetting the as-left conditions

25%: Forgetting to return to the original task

17%: Original task out of control during distraction

13%: Not knowing changes after returning to original task

On average, errors were made 7.14% (SD = 8.06%), 17.26% (SD = 7.28%) and 25.89% (SD = 9.88%) of the time in the zero-, one- and two-interruption conditions respectively

#### Magic Number 4

Working memory capacity

More stuff than this — hopeless

Cognitive load in general

**Placeholders**

Only limited amount of working memory.

Don’t require people to remember stuff they don’t have to.

Obviously has to be balanced with distracting attention.

[**Placeholders in Form Fields Are Harmful**  
_In-context descriptions or hints can help clarify what goes inside each form field, and therefore improve completion ..._www.nngroup.com](https://www.nngroup.com/articles/form-design-placeholders/ "https://www.nngroup.com/articles/form-design-placeholders/")[](https://www.nngroup.com/articles/form-design-placeholders/)

### Learnability

Doesn’t necessarily mean easy-to-learn ...

Sometimes making something learnable or efficient means making the learning harder.

#### Gestures

> A _gesture_ is an action that you finish without conscious thought once you have started it.

Counting things that we do instead of clicks.

Command line.

Tying things together.

Typing certain commands, sequences of actions.

Precision, Faults, Length, Time, Complexity

#### Blindness in Actions

  

![](https://cdn-images-1.medium.com/max/800/0*BUOnyj1JPV1-GeE0)

When we can use interfaces blindly

1.  we are more effective
2.  they require less mental resources
3.  less likely to make mistakes

We habituate

If you are showing a warning 90% of the time, it’s useless.

If you are showing a warning 50% of time, it’s very annoying.

**Undoing**

Even when we are careful, we make mistakes.

Warnings don’t help, we habituate and still make mistakes.

When we are afraid, we lose our ability to rely on habits.

[**Never Use a Warning When you Mean Undo**  
_Are our web apps as smart as they should be? By failing to account for habituation (the tendency, when presented with a ..._alistapart.com](https://alistapart.com/article/neveruseawarning "https://alistapart.com/article/neveruseawarning")[](https://alistapart.com/article/neveruseawarning)

**Monotony**

Example: changing menus

We can make learning gestures harder by changing them every-time or by having multiple of them.

One function == one gesture.

Improves learnability and predictability.

The order of things change — hence there are multiple gestures.

Duplicate, if it improves consistency.

Use similar button placement.

**User pacing**

![](https://cdn-images-1.medium.com/max/800/0*oHBLTQWnGPHHakqX)

We should also think how these gestures compose and work together.

Countdown timers

Animations for a single gesture no more than 0.2s

When it’s longer, gesture is split

Slows down users unnecessarily

### Visibility

#### Affordances

Following Norman’s adaptation of the concept, _affordance_ has seen a further shift in meaning where it is used as an [uncountable noun](https://en.wikipedia.org/wiki/Uncountable_noun), referring to the easy discoverability of an object or system’s action possibilities, as in “this button has good affordance”.

_Pakub võimalust._

Glass affords transparency, but not blocking — hence birds fly into it.

Affordance — what things can do.

Perceivable affordance — what people think they can do.

#### Signifiers

Signifiers are signals, communication devices. These signs tell you _about_ the possible actions; _what_ to do, and _where_ to do it.

Signifiers try to signal what you can do.

_A grey link on the screen might afford clicking (truth). But you might perceive it just as a non-interactive label (perception). Styling it as a button (background, shadow etc.) is a signifier that makes it clearer that the link can be clicked._

**Outline and Focus**

Removed, because it doesn’t look nice.

![](https://cdn-images-1.medium.com/max/800/0*YM6fQnFb5X8iISvt)

**Flat UI**

How many of you like Flat UI?

Enticed into beauty

![](https://cdn-images-1.medium.com/max/800/0*tEgQ26Nlb_Ei2-d0)

On average participants spent **22% more time** (i.e., slower task performance) looking at the pages with weak signifiers.

[**Flat UI Elements Attract Less Attention and Cause Uncertainty**  
_The popularity of flat design in digital interfaces has coincided with a scarcity of signifiers. Many modern UIs have ..._www.nngroup.com](https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/ "https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/")[](https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/)

Lack of signifiers means people:

*   Don’t find things
*   Don’t know what can be clicked
*   Misclick
*   Get confused

**Icons**

![](https://cdn-images-1.medium.com/max/800/0*D1PFL_ADKmMMYNgy)

1.  Just use text
2.  Just use the old boring font, people know how to read it already.

Use the **5-second rule**: if it takes you more than 5 seconds to think of an appropriate icon for something, it is unlikely that an icon can effectively communicate that meaning.

[**Icon Usability**  
_In addition to conveying brand personality through color and style, icons must first and foremost communicate meaning ..._www.nngroup.com](https://www.nngroup.com/articles/icon-usability/ "https://www.nngroup.com/articles/icon-usability/")[](https://www.nngroup.com/articles/icon-usability/)

> Humans are not perfect, but humane interfaces accommodate for that.

Recap

1.  Users of flesh and blood
2.  Locus of attention
3.  Multitasking
4.  Working memory
5.  Gestures
6.  Monotony
7.  Signifiers