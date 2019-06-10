---
date: "2018-03-23T12:00:00+03:00"
title: "A Tale of BFS: Going Parallel"
summary: Optimizing a breadth first search by making it parallel.
tags: ["Go", "Performance", "Concurrency"]
reviewers: ["Taavi Kivisik", "Seth Bromberger", "Damian Gryski"]
---

_This is the second part of optimizing Breadth First Search, please go take a look at_ [A Tale of BFS](/blog/a-tale-of-bfs)_, otherwise this won’t make much sense. All the code is at_ [https://github.com/egonelbre/a-tale-of-bfs](https://github.com/egonelbre/a-tale-of-bfs)

When we reached the end of single core optimizations, we were about 2x faster than the original. However, we still have multiple cores unused.

## Optimizing for multiple-cores

Optimizing for multiple-cores might look easy on the surface, but there are many pitfalls and bugs that occur only once in every million runs.

Even if we manage to avoid some of the common mistakes, such as data-races. We may still end up with an implementation that is slower than the single-core version.

For anyone adventuring to using atomics and mutexes, I highly recommend [The Little Book of Semaphores](http://greenteapress.com/wp/semaphores/). It has many examples of how you can get them wrong.

For more advanced algorithms I don’t know a better resource than the awesome [Dmitry Vyukov](https://twitter.com/dvyukov/) [http://www.1024cores.net/](http://www.1024cores.net/). He has explanations on lockfreedom, waitfreedom, HPC among many others.

## First Try

While I went to sleep [Seth Bromberger](http://www.bromberger.com/) and #performance started working on the parallel version of the code.

First thing that needed updating was the `visited` bit-vector.

![](https://cdn-images-1.medium.com/max/800/1*AulJ98zfIpwZsB7SN8e02g.png)

Contains loads the current state of bucket using `atomic.LoadUint32`. `Add` finds the location where to save the value with `atomic.StoreUint32` and since there are multiple cores writing there simultaneously, it may not succeed the first try… hence it will retry until either the bit becomes set or it succeeds.

It’s useful to do things in blocks and we can use channels to send the blocks to each goroutine:

![](https://cdn-images-1.medium.com/max/800/1*oe2mZGZu3c4gemHAPweARA.png)

`ch` is used to send to the `nextLevel`. Of course we also need to calculate the appropriate blocks and start the worker goroutines. We can use a `WaitGroup` to wait for their completion.

![](https://cdn-images-1.medium.com/max/800/1*vgganzzqGlV6dXxj3t7cXA.png)

First, we split the `currentLevel` into equal chunks and spun up the processes. Let’s see how well we did:

![](https://cdn-images-1.medium.com/max/800/1*nuBbgsvYdg5tdDcWzAt6UQ.png)

So, we managed to make the code over 10x slower.

Also, did you notice the bug? It’s probably the second most common non-obvious mistake after a data-race.

### Atomic Contains and Add

Effectively, the bug is here.

![](https://cdn-images-1.medium.com/max/800/1*o3tbTvPLcTubcYUpLPym7Q.png)

Do you see it? If no, then imagine two threads reached that place with the same `neighbor`.

![race condition](https://cdn-images-1.medium.com/max/800/1*ogd25bLLkbwNPO2fcavq9g.png)
race condition

This is something that the Go race-detector cannot detect. Although we access things atomically we still get a race condition.

You might think, “so what… it probably won’t cause a panic.” Except, this thing can indeed cause a panic. Well, at least theoretically.

![](https://cdn-images-1.medium.com/max/800/1*wHOBjOigYKLP-MnWdEZhCA.png)

Since `nextLevel` isn’t bounded by the graph node, this means that the scratch buffer might be not big enough for sorting. When the `SortBYOB` doesn’t have enough buffer, it will panic.

The fix is to replace `Contains` and `Add` with a single atomic `TryAdd`.

![](https://cdn-images-1.medium.com/max/800/1*qC_5kHjWm5mTzsUUXiGZoQ.png)

Here we ensure that `true` is only returned once per unique `node`.

### Using only channels

I got a question in Reddit for the previous post:

> Have you tried just using an infinite for loop and a buffered channel as a queue? Send the root node on the channel and then:
>
> ```
> for {
>     select {
>         case node := <- ch: // Send all children on channel
>             // do work on node default
>             // nothing left in queue break
>     }
> }
> ```

As Go programmers it is indeed a common reaction to use channels. In many cases that is the correct reaction, however channels do come with a cost. They are less flexible than buffers and have a communication overhead.

As a good approximation you can think channel send having a cost of `50ns`. The number of course varies a lot on what you are sending and it will improve together with Go compiler.

Anyways, the code will look like this:

![](https://cdn-images-1.medium.com/max/800/1*Y8T71jbvSb62ozKI1xI0bA.png)

Unfortunately, we had to throw out our sorting optimization. Let’s see how it does:

![i7–2820QM with -B](https://cdn-images-1.medium.com/max/800/1*LGW0pRffbVMViTfxBuLFSg.png)
i7–2820QM with -B

_I have only measurement for the Windows computer, because I implemented this after all other measurements._

We managed to make it faster than the baseline. However, it’s still slower than the optimized single core version. This is mostly because we had to remove sorting.

There’s another troubling number here. When going from 4 cores to 8 cores it became slower. My guess is that because we are sharing the channel between all goroutines, then all of them are hammering on a similar memory location and writing to the same atomic variables. Which in turn means that no core can keep things properly in cache.

You might think, “oh, the horror!”. But, these both are good starting points for making them better. As in the single-core, the starting point doesn’t have to be perfect. Even if it’s slower than the single-core version, it can still be a good starting point.

## Experience

While iteratively improving the previous implementations, sometimes you can take a shortcut because of experience or learning from other people.

While writing my Master’s thesis  [_\[PDF\]_](https://github.com/egonelbre/spexs2/raw/master/_doc/Thesis.pdf) I dug quite deep on parallel graph processing. I managed to make quite a lot of mistakes, while implementing those algorithms.

Notice that each neighbor is quite a small thing to process, so sending work via channels will have a significant cost. When the work is small you usually want to do it in batches. Since the amount of memory we need to communicate is on the order of tens of gigabytes, copying that information multiple times is a bad idea.

The other lesson I learned was that non-uniform work amounts can easily stall your parallel implementation.

Let’s assume we have three goroutines G1, G2 and G3. We give each 4 items to work with. G1 and G2 run approximately at the same speed. However G3 is 2.5x slower than G1 and G2.

![](https://cdn-images-1.medium.com/max/800/1*gUTh7UBSW74WcFZ9U7MW_g.png)

Effectively G3 ends up stalling everything else and G1 and G2 are starving for new work.

Knowing these two lessons there are two things to be balanced:

1.  batch things such that we offset the communication overhead; and
2.  too large batches can make some cores starve for work.

This leads us to an implementation of a batched array. For reading we can do this:

![](https://cdn-images-1.medium.com/max/800/1*yY_Y3Od0wLXVBALoVczEEw.png)
![](https://cdn-images-1.medium.com/max/800/1*NYJ8riyFsYkycsdhKnIe5Q.png)

Every worker can call `NextRead` for their next block to process. We also use the length of `Nodes` to track when we have finished reading the whole array.

For the writing part we start giving out batches to write to:

![](https://cdn-images-1.medium.com/max/800/1*2UAiMUhVF_QTb7i_7h8Xdg.png)

Here we also have a convenience method `Write` that allows to make our code easier to read:

![](https://cdn-images-1.medium.com/max/800/1*Fhses8B2YO0QXpn0OtdZIg.png)

However, we now have another problem. We might end-up with gaps in our write buffer. But, we can make one node id “special” denoting it’s empty. Putting all of this together:

![_Unrolling removed for clarity_](https://cdn-images-1.medium.com/max/800/1*3jz-oBp8gLgPS2YEllshdQ.png)
_Unrolling removed for clarity_

When we make the `Sentinel = ^graph.Node(0)` it will be larger than any other node, so when we sort the array, all of them will end-up as last nodes.

![](https://cdn-images-1.medium.com/max/800/1*etZyyIuscS-1isglIXopgg.png)

So wiring all of this up:

![](https://cdn-images-1.medium.com/max/800/1*5bdtM74euI5YCpEEMIPirw.png)

`async.Run` is part of my utility functions that spawns `N` go routines and waits for all of them to complete.

After all of this work, the results are:

![](https://cdn-images-1.medium.com/max/800/1*o4d799Y9ujh5eeLxfqvucA.png)

Finally, improvement over the single-core version.

## Almost sorting

When you look at the previous results, it’s quite obvious that we are not properly parallel, because the improvement from going 4 cores to 8 cores is not significant.

One obvious thing we are not doing in parallel is the sorting. But implementing parallel sort is somewhat annoying, and I haven’t yet found a good parallel radix sort after few searches.

But, do we actually need it? There’s a quote saying:

> It’s easy to be fast if you don’t have to be correct.

Often it’s used in contexts where you managed to screw up an algorithm to make it faster, but the results are wrong. However, there is also another side to it. When you don’t need “full correctness”, then you can trade it for some additional speed.

Remember that we used the sorting to optimize our cache accesses. Maybe it’s sufficient to sort it partially.

![](https://cdn-images-1.medium.com/max/800/1*NewObRFBDCtowh23nQQ7tw.png)

Of course, now we can end up with the sentinels in the middle of our read buffer… but we can just skip them in all places.

![](https://cdn-images-1.medium.com/max/800/1*2s8LubTH-SN9SI8EhbeLwA.png)

While we are at it, we can make assigning the `levelNumber`\-s in parallel as well.

![](https://cdn-images-1.medium.com/max/800/1*qHgj7UGXDHU8C3ogPfETaA.png)

The results:

![](https://cdn-images-1.medium.com/max/800/1*rTwre0WkT5M_AlrfDkoT5w.png)

Just making the sorting parallel seems to slow things down with fewer cores on smaller machines. Also, it seems that this optimization doesn’t play that well with bounds-checks.

I did experiment different values for `ReadChunkSize` and `WriteChunkSize` however, the sweet-zone for i7–2820QM seemed to be `256`.

By the way, there might be other possibilities with writing a broken “sort”, that works faster than radix, but that seemed too much effort.

_Reminder: while optimizing I did many fewer measurements than seen on the results table. I focused on i7–2820QM with -B on 8 cores._

## Fetch buckets early

One extremely useful technique for coming up with ideas is taking a break.

While I was walking around in Tartu. I was thinking, “We are still stalling on accessing data and visiting data… maybe the processor isn’t properly [pipe-lining these accesses](https://en.wikipedia.org/wiki/Instruction_pipelining)?” I would like the processor to start getting the values before actually using them. In principle, we would like to ask the processor to start fetching things before we actually use them.

![](https://cdn-images-1.medium.com/max/800/1*WkUAFl-Cf9kiuu2KCi2ViA.png)

There are prefetching instructions, but Go has (at least as of now) a significant overhead when calling them. So I just thought of fetching the visited bit-vector early. Because we have the buckets already, we can reuse that value later.

![](https://cdn-images-1.medium.com/max/800/1*DIMpm3sc2qCh4J4eUWggZA.png)

The adjustment to bit-vector looks like:

![](https://cdn-images-1.medium.com/max/800/1*cdIzg3UPr5afgRSLT6n46w.png)

Of course there are many ways to load the buckets early:

![early2 and earlyR](https://cdn-images-1.medium.com/max/800/1*SgbhZa23mBAJnqQuKSqiGA.png)
early2 and earlyR

The results were the following:

![](https://cdn-images-1.medium.com/max/800/1*8UFU0hBOBBIbWf--AvKxbA.png)

We got a minor speed-up on the smaller machines… however for the Xeon E5–2670, it was ~1.5x speed-up.

This idea seemed good, so I also tried it with the single-core version, but that change made things slower (about 10%). My guess is that in the single-core case the `visited` data is not being removed from the cache, because there are no other writes to it. However for the many-core version, there is much more write contention, so it’s more helpful try to load things earlier.

## Multilevel bitmaps

I also lamented that I was running out of ideas regarding what to do with the bit vector in the #performance channel. [Damian](https://twitter.com/dgryski) mentioned that he thought about multilevel bitmaps.

![inlined single core version of TryAdd](https://cdn-images-1.medium.com/max/800/1*J3SZdaPa-KVxhoCaPFSmKQ.png)
inlined single core version of TryAdd

Notice here that we are doing a lot of shifts, whereas the `set[bucket]` might be completely full and we could shave off a few computations.

I did a quick measurement to see how often this happens. It was about 90% of the time hitting a `set[bucket]` where all the bits are set. The measuring was itself pretty easy:

![Global variables \\o/](https://cdn-images-1.medium.com/max/800/1*vrRt3NONedPwfrWBzoKHIA.png)
Global variables \\o/

The idea seemed promising. When we fill a bucket, also store a bit at higher level, about filling the bucket:

![](https://cdn-images-1.medium.com/max/800/1*SL5HWGtUyUkjev5X35mPxg.png)

Putting in an extra-level over bit vector.

![untested implementation](https://cdn-images-1.medium.com/max/800/1*j9EAdZxCVsMj2BOaXXl-2g.png)
untested implementation

Unfortunately this made things slower about 10%. _And, yes, I tried placing the offset computations in different places and optimizing them manually._

While in this case it didn’t help, discussing ideas with people can be very useful. They can straight up give you a better solution or the discussion itself gives you new insight that eventually leads to an improvement.

## Long live workers

One thing that I was bothered in the previous parallel implementation was that on each level we are spawning new goroutines. Maybe by avoiding them we can shave off some additional acycles?

I knew from my Master’s thesis that taking this approach was going to be annoying.

### One thread to rule them all

First idea was to have a “controlling thread” that workers communicated with and then scheduled the phases.

![rough pseudo-code](https://cdn-images-1.medium.com/max/800/1*VIE_dbUkuMm66iEKygOk7A.png)
rough pseudo-code

However the synchronization with channels, `sync.WaitGroup`s became a nightmare to write. _You can try to get it working, but I gave up :P._

### One WaitGroup

So the next idea was to use a more shared control… i.e. there is no “controlling” thread.

Hmm, a light-switch might be useful. What’s a light-switch? It’s one of several common idioms in parallel computations. The problem that it solves is to clean-up or finish a parallel computation.

![](https://cdn-images-1.medium.com/max/800/1*2qW-XgkybOx4Sc8B8GpoKQ.png)

The analog is that the last person leaving the room switches off the lights. It can be quite helpful to avoid detecting when everything has properly completed.

![](https://cdn-images-1.medium.com/max/800/1*8VF-GUe0XIKC2BK8CAy0nA.png)

Now to implement we can use a `sync.WaitGroup`.

![](https://cdn-images-1.medium.com/max/800/1*vTtV2FW6fhypixPEA0oLBw.png)

Well… that resulted in this:

sync: WaitGroup misuse: Add called concurrently with Wait

And, yes I tried moving the `Add`, `Done` and `Wait` around. However the underlying problem is that when we release all the other threads from `Wait` the sorting might take no-time (because there is not sufficient work for all workers). This means that they can directly skip over the second `wg.Wait` without actually waiting.

### Two WaitGroups

I wasn’t able to get it working, but I realized the solution is to use two waitgroups:

![](https://cdn-images-1.medium.com/max/800/1*qTCkFHgxrgjTQc9yDuI5gQ.png)

After integrating that piece of logic with [rest of the code](https://github.com/egonelbre/a-tale-of-bfs/blob/master/15_worker/search.go#L120), we get results:

![](https://cdn-images-1.medium.com/max/800/1*bvL2JIga8Dx4gfqncszHeg.png)

Unfortunately not much luck.

### BusyGroup

I was thinking, maybe replacing WaitGroup with something spinning would help.

![](https://cdn-images-1.medium.com/max/800/1*_QzonroVXXs1I7xzzAXinQ.png)

But I wouldn’t recommend this, as it can completely lock Go code. _(I’ve ensured that it wouldn’t happen in the experiment code.)_

![](https://cdn-images-1.medium.com/max/800/1*Md-srM0TKDKYF80D0D7_Vg.png)

And this made things even worse. Oh, well… you cannot win with all of your experiments.

## Summary

So we went from ~50 seconds to (roughly, because we didn’t do too many runs on the big graph) ~3.6 seconds. And the full table of experiments looks like this:

![](https://cdn-images-1.medium.com/max/800/1*vFQeeHcd2k6Z8sZnDbiUNg.png)
![](https://cdn-images-1.medium.com/max/800/1*NQcJkAuA51cHpfhSw4Z6xg.png)

I’m almost certain that I forgot a lot of tiny experiments, moving computations around and so forth. I usually don’t keep the intermediate results around, unless I know it has to be run in multiple situations. _In this case I reimplemented all the intermediate steps for educational purposes._

## Good enough?

While we got significant improvements we could still do more. My intuition tells that there must be at least 20% performance on the table, if not more.

At this point I would rewrite the exact code in C to see what code `clang`, `icc` and `gcc` create. Maybe there are ideas that can be stolen from their assembly.

We could also take a huge step by trying to rewrite it for SIMD; or write few critical parts in assembly; or try to write it for a GPU. Not sure whether GPU really helps here, but might be worth a look.

Optimizations often make the rest of your code significantly harder to read. It could be beneficial to weigh the costs of maintaining the code and tuning back some of the optimizations.

Overall, I am satisfied with the result.