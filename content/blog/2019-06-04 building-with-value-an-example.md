---
date: "2019-06-04T14:00:00+03:00"
title: "Building with Value: An Example"
summary: Example on how to develop software with little effort.
tags: ["Go", "Software Concepts"]
reviewers: ["Peter Seebach"]
---

{{< fig src="/_images/value/basic-tree.png" >}}

Previously I described a process for developing software while trying to provide as much value and create understanding as early as possible.

{{< biglink link="/building-with-value" title="Building with Value" >}}

How would one iteration of this process look like?

_We use Go as our example language and avoid using things that do too much for us, so that we can observe the process more clearly. In practice, many tools and approaches can help speed up development._

We’ll continue with the example from the previous post, an Issue Tracker.

### The Simplified Process

1.  Structure Follows Value: we try to figure out what is the most valuable thing we could implement right now.
2.  Spiking: we create a rough draft of 2–4 changes.
3.  Gradual Stiffening: we incrementally build up the changes,
4.  Cleanup: and observe the wholeness and try to notice any small mistakes.

## Structure Follows Value

Here is our first important question. “What provides most Value in an Issue Tracker that we can implement right now?”

We may notice the essential pieces from the language used.

*   I need to get an overview of the **issues**.
*   I need to find information about this **issue**.
*   I don’t have good visibility on **issue** progress.

We may also get this information from a domain expert. We also should try to understand why exactly it is important and how it fits into the rest of the system:

*   It shows what we are doing.
*   It shows what we have done.
*   It shows what we still need to do.

Issue is definitely a valuable part. Hence we must capture it in code.

## Spiking

To ensure that we can adequately represent the complexity of an Issue, we should create a package for it. That way, we make it significant and clear. At the same time, we create a locus of attention which allows to understand and examine the feature wholly and whether it is complete.

Of course, packages are not the only way to group things -- there are also packages, classes, functions, methods, constraints, etc. What you use to represent the idea will depend on how large, detailed, or important the contained thing is.

_It is better to start with a notch larger grouping than is needed, and it is not difficult to make it smaller. However, the reverse, moving from smaller container to larger, is usually more complicated. e.g. Going from multiple packages to a single package vs. going from a single package to multiple._

We’ll add our first Spike to `issue/info.go`:

```
package issue

type ID int  
type Status string

const (  
    Created Status = "Created"  
    Closed         = "Closed"  
)

type Info struct {  
    ID      ID  
    Caption string  
    Desc    string  
    Status  Status  
}
```

We must have an `issue.ID` to identify an issue uniquely. Each issue usually has an `issue.Status` associated with it. We need something to bring all the attributes together `issue.Info`. Keep in mind that we are sketching the code and are not committed to this structure. We are not looking perfection, but rather a global view of how things will work together.

_Notice that I don’t use long names such as IssueStatus, IssueInfo because the package for them already contains_ `_issue_`_._

We also need some way to store and load those `issues`. The way we store and load them can change. Hence we should abstract this knowledge away. We create an interface `issue.Manager` for it. We put it into `issue/manager.go`:

```
type Manager interface {  
    Create(info Info) (ID, error)  
    Load(id ID) (Info, error)  
    Close(id ID) (error)  
    List() (issues []Info, error)  
}
```

To get an overview how we will use it, we write some usage code into main.go:

```
package main

import (  
    "fmt"

    "example.com/tracker/issue"  
)

func check(err error) {  
    if err != nil {  
        panic(err)  
    }  
}

func main() {  
    var manager issue.Manager

    id, err := manager.Create(issue.Info{  
        Caption: "Hello",  
        Desc: "World",  
        Status: issue.Created,  
    })  
    check(err)

    info, err := manager.Load(id)  
    check(err)

    fmt.Println(info)

    infos, err := manager.List()  
    check(err)  
    fmt.Println(infos)  
}
```

It doesn’t matter in which order you create these pieces, and sometimes it is easier to create the usage code first, other times it is easier to create the implementation first. The thing that does matter is that both exist to ensure that we have the implementation details right and that we can integrate it with the rest of the code.

The usage code can also be sketched as a test; this depends on how the sketched code will be used, how it needs to integrate with the rest of the system and other factors.

## Gradual Stiffening

Notice that we don’t have any runnable code yet, it’s fine, because until now we were trying to grasp what we are implementing and that all the pieces work together as intended.

Now we will step-by-step start to flesh out the actual structure, until we have a reliable and stable runnable code. We are in the beginning stages of our project, so there isn’t much to worry about. We should skim over our code and notice anything that doesn’t feel nice.

The first thing we may notice is `issue.Created`. What would `info.Status == issue.Created` mean? This suggests that we haven’t captured the intent as well as we should have. Let’s refine our sketch, `info.Status == issue.Open` sounds much better. Hence we change `issue/info.go`:

```
const (  
    Open Status = "Open"  
    Done        = "Done"  
)
```

In `main.go` the `manager` doesn’t feel clear; it feels like a fuzzy concept without specific meaning. There probably will be more things that need to “manage” things. Is there a better name for it?

What does the `manager` do? “It manages and tracks issues.” Here is a clue for a nicer name `Tracker`. We shall refine `issue/manager.go` into `issue/tracker.go` and change:

```
type Tracker interface {  
    Create(info Info) (ID, error)  
    Load(id ID) (Info, error)  
    Close(id ID) (error)  
    List() (issues []Info, error)  
}
```

We also make all the necessary adjustments to `main.go`. At the end of this, we should have code that compiles however, it’s okay if it is not yet completely bug-free. _We will do this in the next step, but gradual stiffening and cleanup are usually finished with a final cleanup pass._

## Cleanup

Now we have a good idea about the feature and how to put it into code, we shall go over and fill in all the missing details and ensure that we have comments and a few tests and can use it in some form.

Here we could add a in-memory implementation of the tracker and then write some tests for it.

The other thing what we want to do here is to make it easier to understand and ensure whether the code behaves as it should. In most cases, you would wish to unit or behavior tests, but they are not the only way. You could also write property tests. Or write output that could be verified by hand, if the correct behavior is difficult to describe in code.

Few interesting bits while solidifying code. When you come across questions, mark them as such. For example, while writing the tracker test case, I made a mistake while writing:

```
tracker.Close(id)  
// ...  
expect := Info{  
    ID:      id,  
    Caption: "Caption",  
    Desc:    "Desc",  
    Status:  Closed,     // compilation error, should be Done  
}
```

I mixed up two things: the method is called `Close` , and the resulting status is `Done`. Because I made a mistake while writing this, it suggests to me that the code is not clear enough, but I’m not sure how to improve it. It probably isn’t that important, so I’ll mark it as a **TODO** and move on to other things:

```
const (  
    // TODO: should tracker.Create renamed to "Open"  
    Open = Status("Open") // Open means that issue is in progress  
    // TODO: should "Done" be renamed to "Closed"  
    Done = Status("Done") // Done means that issue is completed and delivered  
)
```

I could try to figure out this immediately, but I really don’t think I have the necessary information right now and I will probably find out the details while implementing other things. In a similar vein we might reconsider Tracker method names.

---

Now we have captured something of value in the code. It can’t be used easily right now, but we have something that someone would like to use.

It might look that it was an involved process that created only these few lines of code. In reality, it’s pretty fluid and moves quite quickly.

---

Hopefully, this will give a rough idea of how to work on a project of any scale. This process doesn’t change with scale, however, you might have more things you can consider valuable.