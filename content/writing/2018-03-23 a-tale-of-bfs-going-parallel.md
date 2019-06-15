---
date: "2018-03-23T12:00:00+03:00"
title: "A Tale of BFS: Going Parallel"
summary: Optimizing a breadth first search by making it parallel.
star: true
tags: ["Go", "Performance", "Concurrency"]
reviewers: ["Taavi Kivisik", "Seth Bromberger", "Damian Gryski"]
---

_This is the second part of optimizing Breadth First Search, please go take a look at_ [A Tale of BFS](/a-tale-of-bfs)_, otherwise this won’t make much sense.  
All the code is at_ [https://github.com/egonelbre/a-tale-of-bfs](https://github.com/egonelbre/a-tale-of-bfs)

When we reached the end of single core optimizations, we were about 2x faster than the original. However, we still have multiple cores unused.

## Optimizing for multiple-cores

Optimizing for multiple-cores might look easy on the surface, but there are many pitfalls and bugs that occur only once in every million runs.

Even if we manage to avoid some of the common mistakes, such as data-races. We may still end up with an implementation that is slower than the single-core version.

For anyone adventuring to using atomics and mutexes, I highly recommend [The Little Book of Semaphores](http://greenteapress.com/wp/semaphores/). It has many examples of how you can get them wrong.

For more advanced algorithms I don’t know a better resource than the awesome [Dmitry Vyukov](https://twitter.com/dvyukov/) [http://www.1024cores.net/](http://www.1024cores.net/). He has explanations on lockfreedom, waitfreedom, HPC among many others.

## First Try

While I went to sleep [Seth Bromberger](http://www.bromberger.com/) and #performance started working on the parallel version of the code.

First thing that needed updating was the `visited` bit-vector.

```go
func (set NodeSet) Contains(node graph.Node) bool {
	bucket, bit := set.Offset(node)
	return atomic.LoadUint32(&set[bucket])&bit != 0
}

func (set NodeSet) Add(node graph.Node) {
	bucket, bit := set.Offset(node)
	addr := &set[bucket]
	for {
		old := atomic.LoadUint32(addr)
		if old&bit != 0 || atomic.CompareAndSwapUint32(addr, old, old|bit) {
			return
		}
	}
}
```

Contains loads the current state of bucket using `atomic.LoadUint32`. `Add` finds the location where to save the value with `atomic.StoreUint32` and since there are multiple cores writing there simultaneously, it may not succeed the first try ... hence it will retry until either the bit becomes set or it succeeds.

It’s useful to do things in blocks and we can use channels to send the blocks to each goroutine:

```go
func process(ch chan<- []graph.Node, g *graph.Graph, block []graph.Node, visited *NodeSet) {
	for _, v := range block {
		neighbors := make([]graph.Node, 0)
		for _, neighbor := range g.Neighbors(v) {
			if !visited.Contains(neighbor) {
				visited.Add(neighbor)
				neighbors = append(neighbors, neighbor)
			}
		}
		ch <- neighbors
	}
}
```

`ch` is used to send to the `nextLevel`. Of course we also need to calculate the appropriate blocks and start the worker goroutines. We can use a `WaitGroup` to wait for their completion.

``` go
var wg sync.WaitGroup

chunkSize := (len(currentLevel) + np - 1) / np
var workblocks [][]graph.Node
for i := 0; i < len(currentLevel); i += chunkSize {
    end := i + chunkSize
    if end > len(currentLevel) {
        end = len(currentLevel)
    }
    workblocks = append(workblocks, currentLevel[i:end])
}

ch := make(chan []uint32, len(workblocks))
wg.Add(len(workblocks))
for _, block := range workblocks {
    go func(block []graph.Node) {
        process(ch, g, block, &visited)
        wg.Done()
    }(block)
}
go func() {
    wg.Wait()
    close(ch)
}()

for ns := range ch {
    nextLevel = append(nextLevel, ns...)
}

zuint32.SortBYOB(nextLevel, currentLevel[:cap(currentLevel)])
```

First, we split the `currentLevel` into equal chunks and spun up the processes. Let’s see how well we did:

{{< figure src="/_images/a-tale-of-bfs/measurement-10.png" >}}

So, we managed to make the code over 10x slower.

Also, did you notice the bug? It’s probably the second most common non-obvious mistake after a data-race.

### Atomic Contains and Add

Effectively, the bug is here.

``` go
if !visited.Contains(neighbor) {
    visited.Add(neighbor)
    neighbors = append(neighbors, neighbor)
}
```

Do you see it? If no, then imagine two threads reached that place with the same `neighbor`.

```go
goroutine 1                                     |  goroutine 2
                                                |
for _, neighbor := range g.Neighbors(v) {       |  for _, neighbor := range g.Neighbors(v) {
    if !visited.Contains(neighbor) {            |
                                                |      if !visited.Contains(neighbor) {
        visited.Add(neighbor)                   |
                                                |          visited.Add(neighbor)
        neighbors = append(neighbors, neighbor) |          neighbors = append(neighbors, neighbor)
    }                                           |      }
}                                               |  }
```

This is something that the Go race-detector cannot detect. Although we access things atomically we still get a race condition.

You might think, “so what ... it probably won’t cause a panic.” Except, this thing can indeed cause a panic. Well, at least theoretically.

``` go
zuint32.SortBYOB(nextLevel, currentLevel[:cap(currentLevel)])
```

Since `nextLevel` isn’t bounded by the graph node, this means that the scratch buffer might be not big enough for sorting. When the `SortBYOB` doesn’t have enough buffer, it will panic.

The fix is to replace `Contains` and `Add` with a single atomic `TryAdd`.

``` go
func (set NodeSet) TryAdd(node graph.Node) bool {
	bucket, bit := set.Offset(node)
	addr := &set[bucket]
retry:
	old := atomic.LoadUint32(addr)
	if old&bit != 0 {
		return false
	}
	if atomic.CompareAndSwapUint32(addr, old, old|bit) {
		return true
	}
	goto retry
}
```

Here we ensure that `true` is only returned once per unique `node`.

### Using only channels

I got a question in Reddit for the previous post:

> Have you tried just using an infinite for loop and a buffered channel as a queue? Send the root node on the channel and then:
>
>     for {
>         select {
>             case node := <- ch: // Send all children on channel
>                 // do work on node default
>                 // nothing left in queue break
>         }
>     }


As Go programmers it is indeed a common reaction to use channels. In many cases that is the correct reaction, however channels do come with a cost. They are less flexible than buffers and have a communication overhead.

As a good approximation you can think channel send having a cost of `50ns`. The number of course varies a lot on what you are sending and it will improve together with Go compiler.

Anyways, the code will look like this:

``` go
currentLevel := make(chan graph.Node, g.Order())
nextLevel := make(chan graph.Node, g.Order())

level[source] = 1
visited.Add(source)
currentLevel <- source

levelNumber := 2
for len(currentLevel) > 0 {
    async.Run(procs, func(gid int) {
        runtime.LockOSThread()
        for {
            select {
            case node := <-currentLevel:
                for _, neighbor := range g.Neighbors(node) {
                    if visited.TryAdd(neighbor) {
                        level[neighbor] = levelNumber
                        nextLevel <- neighbor
                    }
                }
            default:
                // queue is empty
                return
            }
        }
    })

    // :( we cannot sort here

    levelNumber++
    currentLevel, nextLevel = nextLevel, currentLevel
}
```

Unfortunately, we had to throw out our sorting optimization. Let’s see how it does:

{{< figure src="/_images/a-tale-of-bfs/measurement-11.png" caption="i7–2820QM with -B" >}}

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

{{< figure src="/_images/a-tale-of-bfs/load-balancing.png" >}}

Effectively G3 ends up stalling everything else and G1 and G2 are starving for new work.

Knowing these two lessons there are two things to be balanced:

1.  batch things such that we offset the communication overhead; and
2.  too large batches can make some cores starve for work.

This leads us to an implementation of a batched array. For reading we can do this:

``` go
type Frontier struct {
	Nodes []graph.Node
	Head  uint32
}

func (front *Frontier) NextRead() (low, high uint32) {
	high = atomic.AddUint32(&front.Head, ReadBlockSize)
	low = high - ReadBlockSize
	if high > uint32(len(front.Nodes)) {
		high = uint32(len(front.Nodes))
	}
	return
}
```

{{< figure src="/_images/a-tale-of-bfs/frontier.png" >}}

Every worker can call `NextRead` for their next block to process. We also use the length of `Nodes` to track when we have finished reading the whole array.

For the writing part we start giving out batches to write to:

``` go
type Frontier struct {
	Nodes []graph.Node
	Head  uint32
}

func (front *Frontier) NextWrite() (low, high uint32) {
	high = atomic.AddUint32(&front.Head, WriteBlockSize)
	low = high - WriteBlockSize
	return
}

func (front *Frontier) Write(low, high *uint32, v graph.Node) {
	if *low >= *high {
		*low, *high = front.NextWrite()
	}
	front.Nodes[*low] = v
	*low += 1
}
```

Here we also have a convenience method `Write` that allows to make our code easier to read:

```go
    writeLow, writeHigh := uint32(0), uint32(0)
    for i := 0; i < 100; i++ {
        frontier.Write(&writeLow, &writeHigh)
    }
```

However, we now have another problem. We might end-up with gaps in our write buffer. But, we can make one node id “special” denoting it’s empty. Putting all of this together:

```go
func process(g *graph.Graph, currentLevel, nextLevel *Frontier, visited NodeSet) {
    writeLow, writeHigh := uint32(0), uint32(0)
    for {
        readLow, readHigh := currentLevel.NextRead()
        if readLow >= readHigh {
            break
        }

        for _, node := range currentLevel.Nodes[readLow:readHigh] {
            for _, n := range g.Neighbors(node) {
                if visited.TryAdd(n1) {
                    nextLevel.Write(&writeLow, &writeHigh, n)
                }
            }
        }
    }

    for i := writeLow; i < writeHigh; i += 1 {
        nextLevel.Nodes[i] = SentinelNode
    }
}
```

{{< codetitle caption="Unrolling removed for clarity." >}}

When we make the `Sentinel = ^graph.Node(0)` it will be larger than any other node, so when we sort the array, all of them will end-up as last nodes.

So wiring all of this up:

```
func BreadthFirst(g *graph.Graph, source graph.Node, level []int, procs int) {
	if len(level) != g.Order() {
		panic("invalid level length")
	}

	visited := NewNodeSet(g.Order())

	maxSize := g.Order() + WriteBlockSize*procs

	currentLevel := &Frontier{make([]graph.Node, 0, maxSize), 0}
	nextLevel := &Frontier{make([]graph.Node, maxSize, maxSize), 0}

	level[source] = 1
	visited.TryAdd(source)
	currentLevel.Nodes = append(currentLevel.Nodes, source)

	levelNumber := 2

	for len(currentLevel.Nodes) > 0 {
		async.Run(procs, func(i int) {
			runtime.LockOSThread()
			process(g, currentLevel, nextLevel, visited)
		})

		zuint32.SortBYOB(nextLevel.Nodes[:nextLevel.Head], currentLevel.Nodes[:cap(currentLevel.Nodes)])

		for nextLevel.Head > 0 && nextLevel.Nodes[nextLevel.Head-1] == SentinelNode {
			nextLevel.Head--
		}
		for _, neighbor := range nextLevel.Nodes[:nextLevel.Head] {
			level[neighbor] = levelNumber
		}

		levelNumber++
		currentLevel, nextLevel = nextLevel, currentLevel

		currentLevel.Nodes = currentLevel.Nodes[:currentLevel.Head]
		currentLevel.Head = 0

		nextLevel.Nodes = nextLevel.Nodes[:cap(nextLevel.Nodes)]
		nextLevel.Head = 0
	}
}
```

`async.Run` is part of my utility functions that spawns `N` go routines and waits for all of them to complete.

After all of this work, the results are:

{{< figure src="/_images/a-tale-of-bfs/measurement-12.png" >}}

Finally, improvement over the single-core version.

## Almost sorting

When you look at the previous results, it’s quite obvious that we are not properly parallel, because the improvement from going 4 cores to 8 cores is not significant.

One obvious thing we are not doing in parallel is the sorting. But implementing parallel sort is somewhat annoying, and I haven’t yet found a good parallel radix sort after few searches.

But, do we actually need it? There’s a quote saying:

> It’s easy to be fast if you don’t have to be correct.

Often it’s used in contexts where you managed to screw up an algorithm to make it faster, but the results are wrong. However, there is also another side to it. When you don’t need “full correctness”, then you can trade it for some additional speed.

Remember that we used the sorting to optimize our cache accesses. Maybe it’s sufficient to sort it partially.

{{< figure src="/_images/a-tale-of-bfs/partial-sorting.png" >}}

Of course, now we can end up with the sentinels in the middle of our read buffer ... but we can just skip them in all places.

``` go
async.Run(procs, func(i int) {
    runtime.LockOSThread()
    process(g, currentLevel, nextLevel, visited)
})

async.BlockIter(int(nextLevel.Head), procs, func(low, high int) {
    runtime.LockOSThread()
    zuint32.SortBYOB(nextLevel.Nodes[low:high], currentLevel.Nodes[low:high])
})

for _, neighbor := range nextLevel.Nodes[:nextLevel.Head] {
    if neighbor == SentinelNode {
        continue
    }
    level[neighbor] = levelNumber
}
```

While we are at it, we can make assigning the `levelNumber`\-s in parallel as well.

``` go
async.BlockIter(int(nextLevel.Head), procs, func(low, high int) {
    runtime.LockOSThread()
    zuint32.SortBYOB(nextLevel.Nodes[low:high], currentLevel.Nodes[low:high])
    for _, neighbor := range nextLevel.Nodes[low:high] {
        if neighbor == SentinelNode {
            break
        }
        level[neighbor] = levelNumber
    }
})
```

The results:

{{< figure src="/_images/a-tale-of-bfs/measurement-13.png" >}}

Just making the sorting parallel seems to slow things down with fewer cores on smaller machines. Also, it seems that this optimization doesn’t play that well with bounds-checks.

I did experiment different values for `ReadChunkSize` and `WriteChunkSize` however, the sweet-zone for i7–2820QM seemed to be `256`.

By the way, there might be other possibilities with writing a broken “sort”, that works faster than radix, but that seemed too much effort.

_Reminder: while optimizing I did many fewer measurements than seen on the results table. I focused on i7–2820QM with -B on 8 cores._

## Fetch buckets early

One extremely useful technique for coming up with ideas is taking a break.

While I was walking around in Tartu. I was thinking, “We are still stalling on accessing data and visiting data ... maybe the processor isn’t properly [pipe-lining these accesses](https://en.wikipedia.org/wiki/Instruction_pipelining)?” I would like the processor to start getting the values before actually using them. In principle, we would like to ask the processor to start fetching things before we actually use them.

{{< figure src="/_images/a-tale-of-bfs/pipelining.png" >}}

There are prefetching instructions, but Go has (at least as of now) a significant overhead when calling them. So I just thought of fetching the visited bit-vector early. Because we have the buckets already, we can reuse that value later.

```
for ; i < len(neighbors)-3; i += 4 {
    n1, n2, n3, n4 := neighbors[i], neighbors[i+1], neighbors[i+2], neighbors[i+3]
    x1, x2, x3, x4 := visited.GetBuckets4(n1, n2, n3, n4)
    if visited.TryAddFrom(x1, n1) {
        nextLevel.Write(&writeLow, &writeHigh, n1)
    }
    if visited.TryAddFrom(x2, n2) {
        nextLevel.Write(&writeLow, &writeHigh, n2)
    }
    if visited.TryAddFrom(x3, n3) {
        nextLevel.Write(&writeLow, &writeHigh, n3)
    }
    if visited.TryAddFrom(x4, n4) {
        nextLevel.Write(&writeLow, &writeHigh, n4)
    }
}
```

The adjustment to bit-vector looks like:

```
func (set NodeSet) GetBuckets4(a, b, c, d graph.Node) (x, y, z, w uint32) {
	x = atomic.LoadUint32(&set[a>>bucket_bits])
	y = atomic.LoadUint32(&set[b>>bucket_bits])
	z = atomic.LoadUint32(&set[c>>bucket_bits])
	w = atomic.LoadUint32(&set[d>>bucket_bits])
	return
}
```

Of course there are many ways to load the buckets early:

```
for ; i < len(neighbors)-3; i += 4 {
    n1, n2, n3, n4 := neighbors[i], neighbors[i+1], neighbors[i+2], neighbors[i+3]
    x3, x4 := visited.GetBuckets2(n3, n4)
    if visited.TryAdd(n1) {
        nextLevel.Write(&writeLow, &writeHigh, n1)
    }
    if visited.TryAdd(n2) {
        nextLevel.Write(&writeLow, &writeHigh, n2)
    }
    if visited.TryAddFrom(x3, n3) {
        nextLevel.Write(&writeLow, &writeHigh, n3)
    }
    if visited.TryAddFrom(x4, n4) {
        nextLevel.Write(&writeLow, &writeHigh, n4)
    }
}

and

for ; i < len(neighbors)-3; i += 4 {
    n1, n2, n3, n4 := neighbors[i], neighbors[i+1], neighbors[i+2], neighbors[i+3]

    x2 := visited.GetBuckets1(n2)
    if visited.TryAdd(n1) {
        nextLevel.Write(&writeLow, &writeHigh, n1)
    }
    x3 := visited.GetBuckets1(n3)
    if visited.TryAddFrom(x2, n2) {
        nextLevel.Write(&writeLow, &writeHigh, n2)
    }
    x4 := visited.GetBuckets1(n4)
    if visited.TryAddFrom(x3, n3) {
        nextLevel.Write(&writeLow, &writeHigh, n3)
    }
    if visited.TryAddFrom(x4, n4) {
        nextLevel.Write(&writeLow, &writeHigh, n4)
    }
}
```

The results were the following:

{{< figure src="/_images/a-tale-of-bfs/measurement-14.png" >}}

We got a minor speed-up on the smaller machines ... however for the Xeon E5–2670, it was ~1.5x speed-up.

This idea seemed good, so I also tried it with the single-core version, but that change made things slower (about 10%). My guess is that in the single-core case the `visited` data is not being removed from the cache, because there are no other writes to it. However for the many-core version, there is much more write contention, so it’s more helpful try to load things earlier.

## Multilevel bitmaps

I also lamented that I was running out of ideas regarding what to do with the bit vector in the #performance channel. [Damian](https://twitter.com/dgryski) mentioned that he thought about multilevel bitmaps.

```
func (set NodeSet) TryAdd(node graph.Node) bool {
	bucket := uint32(node >> bucket_bits)
	bit := uint32(1 << (node & bucket_mask))
    empty := set[bucket]&bit == 0
	if empty {
		set[bucket] |= bit
	}
	return empty
}
```
{{< codetitle caption="inlined single core version of TryAdd" >}}

Notice here that we are doing a lot of shifts, whereas the `set[bucket]` might be completely full and we could shave off a few computations.

I did a quick measurement to see how often this happens. It was about 90% of the time hitting a `set[bucket]` where all the bits are set. The measuring was itself pretty easy:

```
var (
    FullCount int64
    PartialCount int64
)

func (set NodeSet) TryAdd(node graph.Node) bool {
	bucket := uint32(node >> bucket_bits)
	bit := uint32(1 << (node & bucket_mask))

    if set[bucket] == ^uint32(0) {
        FullCount++
    } else {
        PartialCount++
    }

    empty := set[bucket]&bit == 0
	if empty {
		set[bucket] |= bit
	}
	return empty
}
```
{{< codetitle caption="Global variables \o/" >}}

The idea seemed promising. When we fill a bucket, also store a bit at higher level, about filling the bucket:

{{< figure src="/_images/a-tale-of-bfs/multilevel-bitmap.png" >}}

Putting in an extra-level over bit vector.

``` go
func (set NodeSet) TryAdd(node graph.Node) bool {
	bucket, bit := set.Offset(node)
	bucket_index, bucket_bit := set.Offset(bucket)

    if set.First[bucket_index] & bucket_bit != 0 {
        return false
    }

    empty := set.Second[bucket]&bit == 0
	if empty {
		set.Second[bucket] |= bit
        if set.Second[bucket] == ^uint32(0) {
            set.First[bucket_index] |= bucket_bit
        }
	}

	return empty
}
```
{{< codetitle caption="untested implementation" >}}

Unfortunately this made things slower about 10%. _And, yes, I tried placing the offset computations in different places and optimizing them manually._

While in this case it didn’t help, discussing ideas with people can be very useful. They can straight up give you a better solution or the discussion itself gives you new insight that eventually leads to an improvement.

## Long live workers

One thing that I was bothered in the previous parallel implementation was that on each level we are spawning new goroutines. Maybe by avoiding them we can shave off some additional acycles?

I knew from my Master’s thesis that taking this approach was going to be annoying.

### One thread to rule them all

First idea was to have a “controlling thread” that workers communicated with and then scheduled the phases.

``` go
worker := func(gid int) {
    runtime.LockOSThread()
    for !alldone {
        // wait for work
        // process nodes

        // signal controller that a worker has finished
        // wait for sorting signal and block
    }
}

async.Spawn(procs, worker)

for len(currentLevel) > 0 {
    // send work to all workers
    // wait for workers to complete

    // assign blocks for sorting
    // wait for workers to complete

    // setup next level
}

// signal all done
```
{{< codetitle caption="pseudocode" >}}

However the synchronization with channels, `sync.WaitGroup`s became a nightmare to write. _You can try to get it working, but I gave up :P._

### One WaitGroup

So the next idea was to use a more shared control ... i.e. there is no “controlling” thread.

Hmm, a light-switch might be useful. What’s a light-switch? It’s one of several common idioms in parallel computations. The problem that it solves is to clean-up or finish a parallel computation.

``` go
waiting := int64(10)
for gid := 0; gid < waiting; gid++ {
    go func(gid int) {
        process(gid)
        if atomic.AddInt64(&waiting, -1) == 0 {
            // this is guaranteed to run after
            // all workers have completed
        }
    }(gid)
}
```

The analog is that the last person leaving the room switches off the lights. It can be quite helpful to avoid detecting when everything has properly completed.


``` go
waiting := int64(procs)
worker := func(gid int) {
    runtime.LockOSThread()
    for !alldone {
        process(currentLevel)
        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for sorting

            // release other workers
        } else {
            // wait for last one
        }

        sort(nextLevel)

        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for next level
            // also check whether we are done
            // release other workers
        } else {
            // wait for last one
        }
    }
}

async.Run(procs, worker)
for gid := 0; gid < waiting; gid++ {
    go func(gid int) {
        process(gid)
        if atomic.AddInt64(&waiting, -1) == 0 {
            // this is guaranteed to run after
            // all workers have completed
        }
    }(gid)
}
```

Now to implement we can use a `sync.WaitGroup`.

``` go
var wg sync.WaitGroup
waiting := int64(procs)
worker := func(gid int) {
    runtime.LockOSThread()
    for !alldone {
        process(currentLevel)
        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for sorting
            atomic.StoreInt64(&waiting, procs)
            wg.Done()
            wg.Add(1)
        } else {
            wg.Wait()
        }

        sort(nextLevel)

        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for next level
            // also check whether we are done
            atomic.StoreInt64(&waiting, procs)
            wg.Done()
            wg.Add(1)
        } else {
            wg.Wait()
        }
    }
}
```

Well... that resulted in this:

```
sync: WaitGroup misuse: Add called concurrently with Wait
```

And, yes I tried moving the `Add`, `Done` and `Wait` around. However the underlying problem is that when we release all the other threads from `Wait` the sorting might take no-time (because there is not sufficient work for all workers). This means that they can directly skip over the second `wg.Wait` without actually waiting.

### Two WaitGroups

I wasn’t able to get it working, but I realized the solution is to use two waitgroups:

``` go
var wg sync.WaitGroup
waiting := int64(procs)
worker := func(gid int) {
    runtime.LockOSThread()
    for !alldone {
        process(currentLevel)
        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for sorting
            atomic.StoreInt64(&waiting, procs)
            wg2.Add(1)
            wg1.Done()
        } else {
            wg1.Wait()
        }

        sort(nextLevel)

        if atomic.AddInt64(&waiting, -1) == 0 {
            // setup for next level
            // also check whether we are done
            atomic.StoreInt64(&waiting, procs)
            wg1.Add(1)
            wg2.Done()
        } else {
            wg2.Wait()
        }
    }
}
```

After integrating that piece of logic with [rest of the code](https://github.com/egonelbre/a-tale-of-bfs/blob/master/15_worker/search.go#L120), we get results:

{{< figure src="/_images/a-tale-of-bfs/measurement-15.png" >}}

Unfortunately not much luck.

### BusyGroup

I was thinking, maybe replacing WaitGroup with something spinning would help.

``` go
type BusyGroup struct{ sema int32 }

func (bg *BusyGroup) Add(v int) { atomic.AddInt32(&bg.sema, int32(v)) }
func (bg *BusyGroup) Done()     { bg.Add(-1) }

func (bg *BusyGroup) Wait() {
	for atomic.LoadInt32(&bg.sema) != 0 {
		runtime.Gosched()
	}
}
```

But I wouldn’t recommend this, as it can completely lock Go code. _(I’ve ensured that it wouldn’t happen in the experiment code.)_

{{< figure src="/_images/a-tale-of-bfs/measurement-16.png" >}}

And this made things even worse. Oh, well ... you cannot win with all of your experiments.

## Summary

So we went from ~50 seconds to (roughly, because we didn’t do too many runs on the big graph) ~3.6 seconds. And the full table of experiments looks like this:

{{< figure src="/_images/a-tale-of-bfs/measurement-final-0.png" >}}

{{< figure src="/_images/a-tale-of-bfs/measurement-final-1.png" >}}

I’m almost certain that I forgot a lot of tiny experiments, moving computations around and so forth. I usually don’t keep the intermediate results around, unless I know it has to be run in multiple situations. _In this case I reimplemented all the intermediate steps for educational purposes._

## Good enough?

While we got significant improvements we could still do more. My intuition tells that there must be at least 20% performance on the table, if not more.

At this point I would rewrite the exact code in C to see what code `clang`, `icc` and `gcc` create. Maybe there are ideas that can be stolen from their assembly.

We could also take a huge step by trying to rewrite it for SIMD; or write few critical parts in assembly; or try to write it for a GPU. Not sure whether GPU really helps here, but might be worth a look.

Optimizations often make the rest of your code significantly harder to read. It could be beneficial to weigh the costs of maintaining the code and tuning back some of the optimizations.

Overall, I am satisfied with the result.