---
date: "2018-03-22T12:00:00+03:00"
title: "A Tale of BFS"
summary: Optimizing a breadth first search
tags: ["Go", "Performance"]
reviewers: ["Taavi Kivisik", "Seth Bromberger", "Damian Gryski"]
---

_This is the first part of optimizing Breadth First Search. All of the code for this post is available at_ [_https://github.com/egonelbre/a-tale-of-bfs_](https://github.com/egonelbre/a-tale-of-bfs)_._

Breadth First Search is one of those fundamental graphs algorithms and also is foundation to many other problems. The basic idea is to move through a graph starting from a source node and visit everything one layer at a time.

![Breadth-First Traversal](https://cdn-images-1.medium.com/max/800/1*edoEmM90erbPQMAtm0KB_A.png)
Breadth-First Traversal

So, [Seth Bromberger](http://www.bromberger.com/) posted a question in Go slack #performance channel:

> \[snip\] I have some code that does breadth-first search on a good-sized graph ([https://snap.stanford.edu/data/com-Friendster.html](https://snap.stanford.edu/data/com-Friendster.html)).
>
> The performance for a single-run, single-threaded BFS is as follows: C++: 26s, Julia: 37s, Go: 80s

The main catch is that they are analyzing a graph with 65 million nodes on a 24 core hyper-threaded machine.

As a good first approximation, Go should be at most 3x slower than C++ (ignoring SIMD optimizations). This to me says that, yes, there probably are ways to improve this code.

## Baseline

Before we get to optimizing let’s see what we are working with.

There are many ways of storing graphs. Most of the basic ways involve tons of pointers. Luckily, in this case we already had a Compact Adjacency List for the graph. Which looks like:

```
type Node = uint32

type Graph struct {  
    List []Node  
    Span []uint64  
}

func (graph *Graph) Neighbors(n Node) []Node {  
    start, end := graph.Span[n], graph.Span[n+1]  
    return graph.List[start:end]  
}
```

![](https://cdn-images-1.medium.com/max/800/1*I1j33t95cfiQdksVMaZmWA.png)

Effectively, each node holds his neighbors in an array. We have a slice that holds index to that neighbors array.

For implementing breadth first traversal we also need something to store the visited nodes. That node set is implemented with a bit vector:

```
const (  
    bucket_bits = 5  
    bucket_size = 1 << 5  
    bucket_mask = bucket_size - 1  
)

type NodeSet []uint32

func NewNodeSet(size int) NodeSet {  
    return NodeSet(make([]uint32, (size+31)/32))  
}

func (set NodeSet) Offset(node graph.Node) (bucket, bit uint32) {  
    bucket = uint32(node >> bucket_bits)  
    bit = uint32(1 << (node & bucket_mask))  
    return bucket, bit  
}

func (set NodeSet) Add(node graph.Node) {  
    bucket, bit := set.Offset(node)  
    set[bucket] |= bit  
}

func (set NodeSet) Contains(node graph.Node) bool {  
    bucket, bit := set.Offset(node)  
    return set[bucket]&bit != 0  
}
```

![](https://cdn-images-1.medium.com/max/800/1*eFadDLKxUCLBOkPvKLAVYQ.png)

For each node there is a corresponding bit in a large array of `uint32`s.

The implementation itself looks like this:

![](https://cdn-images-1.medium.com/max/800/1*xPPdECa5HHqxmdz-cdlwlQ.png)

I was running all measurements on a Windows 10 i7–2820QM machine. But for comparison I also include results from my Mac i5–5257U and the big machine Linux Xeon-E5–2670v3.

_All measurements are in milliseconds._

![](https://cdn-images-1.medium.com/max/800/1*CW2_GQIhMQfr_zL0IS6xcQ.png)

## Introduction

Before we get to optimizing it, let’s revisit the basic process that is going to happen. Algorithmics and optimizing might look like an arcane art where bright minds come up with insane ideas. In practice, however, for each improvement in the algorithm, there are 5 failed attempts and each idea is backed with studying 5 other algorithms and code. _(And, yes, I did make up those numbers.)_

Let’s say you don’t know much about optimizing and don’t have intuition, then there’s the exhaustive approach:

1. Measure
2. Make a few hypotheses why those things in the profile are slow
3. Formulate few solutions to each of the the hypotheses
4. Try all promising solutions (and observe for more hypotheses)
5. Keep the best solution (if there is one)
6. _Keep the second best solution around, just in case_
7. goto 1.

Knowledge helps you come up with solutions and hypotheses. Experience helps you iterate faster and identify the most promising roads faster. The most important part is — **you will have ideas that will fail**. Luckily, people will see only the successes. _Except when you are going to write them up in a blog post for everyone to see_.

The common things to do are:

**Use better algorithms:** it’s obvious that when you do less work, it will be faster. To use better algorithms you must know about them. _For more details look at books like_ [_Algorithm Design Manual_](https://www.amazon.com/Algorithm-Design-Manual-Steven-Skiena/dp/1849967202) _or search_ [_arxiv_](http://arxiv.org/) _for the relevant subject._

**Make it predictable:** processors try to speculatively execute and optimize your code for execution, but they cannot do that when it’s unable to predict what is going to happen. A good example of this is to ensure that in your loops your _if_\-s don’t toggle back and forth randomly. _For details see_ [_Fast and Slow if Statements_](http://igoro.com/archive/fast-and-slow-if-statements-branch-prediction-in-modern-processors/)_._

**Use less memory:** the more memory you use, the more processor has to communicate with the RAM or Disk. Sometimes it’s faster to decompress data than to wait for the memory. _For details see_ [_Latency numbers every programmer should know_](https://gist.github.com/hellerbarde/2843375)_._

**Use fewer pointers:** pointers mean it’s harder to predict what is going to happen. Pointers also mean that the data-structures may use more memory than necessary. For languages with Garbage Collection, it also affects scanning times.

**Keep computations close:** processors have many levels of caches and accessing recently used things means you will more likely hit a cache. _For details see_ [_A Gallery of Processor Cache Effects_](http://igoro.com/archive/gallery-of-processor-cache-effects/)_._

There are many more machine specific things and heuristics that can help you, but I guess these will do for now. [Damian Gryski](https://twitter.com/dgryski) is writing a book [go-perfbook](https://github.com/dgryski/go-perfbook) that contains a much more extensive review.

These are most of the concepts I will be using in this post. Although the text may look like it was linear thoughtful process, in practice it was closer to the steps outlined before.

## Observing

To understand where to make changes it’s necessary to have tools to measure and inspect the code. Processors are complex beasts and guessing can get only so far.

If at all possible, measure the results on the target hardware. While large changes improve things across all computers, the tiny details may not.

All major languages have specialized tools for finding places that take time. But beware, as in quantum mechanics, measuring the system will change the result and different tools change the results differently. For Go, take a look at [https://golang.org/doc/diagnostics.html](https://golang.org/doc/diagnostics.html?h=pprof).

There are general purpose tools that help you detect what’s going inside the processor and why it cannot predict your code. For Linux there is [perf](http://www.brendangregg.com/perf.html) and Mac has [Instruments](https://developer.apple.com/library/content/documentation/DeveloperTools/Conceptual/InstrumentsUserGuide/index.html) and Windows has many options, where probably the best one is [Intel VTune](https://software.intel.com/en-us/intel-vtune-amplifier-xe).

Compilers can give out significant information on how well they were able to optimize things and why some optimization was not done. At the basic level you might look for functions that weren’t inlined, what was allocated on the heap and where were bounds checks. For Go you can get this output by compiling with `-gcflags "all=-m -m -d=ssa/check_bce/debug"`. There is a lot of data, so at some point I wrote a tool [view-annotated-file](https://github.com/loov/view-annotated-file) to show that code inside the source itself.

Reading assembly can give a lot of insight into what the machine is actually trying to do. You can use `go tool objdump` to see that. For smaller snippets [godbolt.org](http://go.godbolt.org/) is just awesome. While assembly shows what the processor is trying to do, it won’t show what it is actually doing.

Even, if you don’t have access to such tools, for some reason, you can throw basic performance measurements together with `QueryPerformanceCounter` or `clock_gettime`. These are especially helpful in scenarios where you want very specific details and don’t want profiling to mess with your measurements so much.

## Simple experiments

Before doing extensive analysis, sometimes there are things that you can enable, disable or try. Maybe you can get the necessary performance win with very little work.

### Bounds checks

Bounds checks can be a significant overhead, but luckily there often are ways to disable or avoid them. In Go you can disable them with `-gcflags all=-B`. Even, if you cannot enable that in production it shows you how much removing bounds checks can help.

Let’s see what it does:

![](https://cdn-images-1.medium.com/max/800/1*eixvbk8-rbyHRGuuIMfOIw.png)

Hmm… absolutely nothing. Except on the big machine, where it made things worse. I have no clue why, except guessing it’s machine noise.

When we are not getting any performance gain, this means that the bottleneck is not in bounds checks.

### Try the tip

Try the latest version of your compiler. In some cases, waiting 6 months for the next release might be sufficient to make your code faster. Using the tip, made the code ~10% faster.

### Try disabling Garbage Collection

In some cases it’s possible to completely disable GC and run that in production. However, even if it’s not, measurements from disabling GC can give an indication how much benefit you may gain from optimizing for GC.

In this case there aren’t many allocations in the core-loop, so we can effectively disable them… mainly to reduce noisiness of results. Sometimes, it would be even possible to use this approach in production.

## Reusing level

One of the first thing I noticed that `level` contains all the necessary information to detect whether a node has been visited or not. Effectively, lets remove `visited` set completely:

![](https://cdn-images-1.medium.com/max/800/1*qOctr9UDVTNblYj7K1_1qQ.png)

And, the results speak for themselves:

![](https://cdn-images-1.medium.com/max/800/1*Dwzv2mOZ-Ad9RL-2t704Og.png)

Yay, ~10% improvement… hmm… kind of:

![](https://cdn-images-1.medium.com/max/800/1*0px6qftOnu7uaR1CnmQQpg.png)

Although we managed to make code for the small graph faster, the large dataset became 2x slower.

The problem is that while we did make less memory accesses, they were slower. `visited` was a nice data-structure that mostly fit into cache and hence it was much faster compared to accessing `level`.

![Cache is a limited resource.](https://cdn-images-1.medium.com/max/800/1*DyQUVfnS6L5-W32TjF3aSg.png)
Cache is a limited resource.

This also highlights an important thing about optimizing — it is highly dependent on the data. We cannot win in all scenarios. Try to use representative data for your problem, otherwise you will come to the wrong conclusions.

## Loading faster

After requesting a larger data-set of 5M nodes, I hit an annoying thing, each run took way too long.

It was obvious that the problem was parsing in the data. Whatever you try to develop try to make your iteration speed as fast as possible. This will lead to more experiments and hence better end-result and faster.

To make loading faster I replaced parsing the graph with mapping the whole file into memory. Using `encoding/gob` is also a good choice, it’s not as fast, but it’s a hell lot more convenient. Luckily, in this case, we only had two float slices that needed to be saved.

After switching from parsing a text file to `mmap`, the loading time went from 22 seconds to 2.6 seconds. Which for development speed is a huge win.

## Sorting vertices

One of the things that profiling highlights is accessing both visited slice and getting neighbors list and actual neighbors.

![](https://cdn-images-1.medium.com/max/800/1*lEu-LhTy2ZLmqGSahWr_aA.png)

When accessing slices is slow, one good suspect is waiting behind memory. Effectively, processor isn’t able to predict what you are accessing and it won’t be in cache.

![](https://cdn-images-1.medium.com/max/800/1*ycMZv-IOuszsboM3swuE2A.png)

One way to make accesses predictable, is to sort the data. While we can still miss a lot caches for some specific graphs, but it will be significantly better.

![](https://cdn-images-1.medium.com/max/800/1*Cum4iAFOn8V30-uOlsmrEw.png)

So, just throwing in a `sort.Slice` only made 1% difference, but that actually made me optimistic, because I knew that the default sorting is not great for tight loops. So a quick search and switch over to a version with hardcoded `uint32` gives us…

![](https://cdn-images-1.medium.com/max/800/1*HnSHXjQekvndhrScRsSLkA.png)

~20% improvement. After posting the improvement results, [Damian Gryski](https://twitter.com/dgryski) reminded me of Radix sort… so that gave another boost.

![](https://cdn-images-1.medium.com/max/800/1*PWjJ3jCg1asUAOJ59BuUnA.png)

After that our code looks like this:

![Note that we are able to use currentLevel as a scratch buffer.](https://cdn-images-1.medium.com/max/800/1*Z6O49cCz2iaFuhddgLb3Nw.png)
Note that we are able to use currentLevel as a scratch buffer.

Keeping data sorted or even almost sorted can have many benefits: faster data accesses, better branching and better data compression.

## Moving randomness

One thing that I noticed was that, while the frontier itself is iterated in sorted order, the neighbors themselves can still be all over the place. But, we can lift `level` assignments outside the iteration loop and do it after sorting.

![](https://cdn-images-1.medium.com/max/800/1*Z87SGHaP69DS8mOzfrPz6g.png)

Although, we will do a second pass over `nextLevel`, the faster access to `level` makes up for it.

![](https://cdn-images-1.medium.com/max/800/1*D8WqUw716QiIAvNbfumLJw.png)

## Slow visiting

We are still slow in calls to “visited” so I tried a few things. I had a few other ideas as well.

![](https://cdn-images-1.medium.com/max/800/1*VWszDShrIsozUSi8LNCQGQ.png)

### Reordering things

We have those IsSet and Set functions, maybe if we move them around, we can make things faster.

![](https://cdn-images-1.medium.com/max/800/1*Yw4SL_D3ORIi-nJFqy5faA.png)

One thought would be to fuse IsSet and Set into a single method. One approach would be always to write the value, the other to only write when the value has changed.

![](https://cdn-images-1.medium.com/max/800/1*6hziwZZQGXs1vasKn72NqA.png)

I guessed that the version without the if, would be faster, but… nope. I reasoned that the version with “if” is faster, because then the computer doesn’t have to later move the changed value back into main memory.

![](https://cdn-images-1.medium.com/max/800/1*_Pb-d1kL0apUjdls0kaFlg.png)

### Deduplicate later?

Maybe we can skip most of those IsSet altogether by collecting together all neighbors, sorting them and then deduplicating them?

This ended up horribly, because on each level we have 10x more neighbors, and sorting that takes significantly more time. For a very sparse graph, it might be a better idea.

### Cuckoo and Bloom Filter

One common solution when checking something is slow, is to put a cuckoo or bloom filter in front of it.

![](https://cdn-images-1.medium.com/max/800/1*lK1os_bXJoUZ1pG1vFWxaw.png)

This was a complete failure. I even didn’t implement the whole thing. Just adding things into the Cuckoo filter, so in practice it might be even slower.

## Unroll

In very tight code the overhead of a loop can be quite significant. The common fix for that is to handle multiple items per loop iteration or more commonly known as [loop unrolling](https://en.wikipedia.org/wiki/Loop_unrolling). It’s common enough that many compilers know how to do it. Unfortunately, Go compiler doesn’t know much about unrolling. But, even compilers that know how to do it, such as C, can be sometimes helped with adding [pragmas](https://en.wikipedia.org/wiki/Directive_%28programming%29).

![Unrolling mainly helps because there is less loop construct overhead.](https://cdn-images-1.medium.com/max/800/1*xGxHih0vUdSzBF2yRrb7Vw.png)
Unrolling mainly helps because there is less loop construct overhead.

After unrolling, the code looks like this:

![](https://cdn-images-1.medium.com/max/800/1*NdkOhKFUeIode0pe-NXp4A.png)

There are of course many ways to unroll. You could pick 8 at a time and then do the single loop. Or pick 8 at a time, and then 4 at a time or just 4 at a time.

![](https://cdn-images-1.medium.com/max/800/1*zENfC9w4zkgcN_3qzs9xQQ.png)

For my Windows computer the best results were for unrolling 4 at a time, so I rolled with that solution.

## Noise in the Machines

While Seth Bromberger was testing the last result on the big machine, he noticed a huge difference between runs on the big machine:

BFS done: 56.323602893s  
BFS done: 32.353618877s

Usual suspect in such cases would be that there are other processes running on the system, but it definitely wasn’t that. There aren’t any other processes running on the system.

Maybe there’s some other goroutine setting itself up in init? A panic in an inner-loop to dump the goroutines. _Damian also mentioned that using Ctrl-\\ on Unix-y machines to send SIGQUIT will do a similar thing. But, no luck._

Let’s use `perf` to record some information:

![Fast](https://cdn-images-1.medium.com/max/800/1*hqRm_EEIRTjSFBOz-KURbA.png)
Fast![Slow](https://cdn-images-1.medium.com/max/800/1*9Lz2LVbAAdQ7pGDy5sAaxA.png)
Slow

Due to cpu-migrations, maybe a `runtime.LockOSThread` will help? But, nope.

Seth then thought maybe forcing into a particular core would avoid some of the problems:

> If you move from one core to another core on a different socket, you have a different L3 cache, so it can be expensive. The idea is to switch cores on the same socket, which is cheaper.

Armed with `taskset` Seth managed to get a consistent result.

Whereas I managed to find a link to [http://perf.readthedocs.io/en/latest/system.html#numa](http://perf.readthedocs.io/en/latest/system.html#numa) — which says that on some machines, depending on which core you are running on, the memory access speed will be different.

Lesson learned — sometimes the core you are running on makes your code significantly slower.

---

## Summary

So we went from 50 seconds to 25 seconds. Which beat their C++ version, at that time. I’m not saying that C++ is slow, on the contrary I would expect the same code be faster in C++. But it does show how far mechanical sympathy and basic algorithmics knowledge can go.

![](https://cdn-images-1.medium.com/max/800/1*zpydMHsCWrOopySqB5dodA.png)

While this may look like a lot of work, in reality… I spent more time writing this whole post than doing these improvements.

For the second part take a look at [A Tale of BFS: Going Parallel](/blog/a-tale-of-bfs-going-parallel) where we get that big graph down to ~3.6 seconds.