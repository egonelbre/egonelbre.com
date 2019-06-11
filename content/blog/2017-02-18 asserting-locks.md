---
date: "2017-02-18T12:00:00+03:00"
title: "Asserting Locks"
summary: Custom Locks for better debugging.
tags: ["Go", "Concurrency", "Debugging"]
---

One of the problems I’ve encountered few times is avoiding mistakes with threaded programs and locks.

{{< fig src="/_images/asserting-locks.png" >}}

_Whether you should be using locks is a different discussion. There are plenty of places where other approaches, such as channels, can be much easier to read and understand._

A basic example of my problem can be seen below:

```
package example

import (
	"io"
	"sync"
)

type Channel struct {
	mu      sync.Mutex
	clients map[string]io.ReadWriter
}

func (channel *Channel) Connect(name string, client io.ReadWriter) {
	channel.mu.Lock()
	defer channel.mu.Unlock()

	channel.broadcast(name + " connected")
	channel.clients[name] = client
}

func (channel *Channel) Disconnect(name string) {
	channel.mu.Lock()
	defer channel.mu.Unlock()
	channel.disconnect(name)
}

func (channel *Channel) disconnect(name string) {
	// channel.mu must be held
	delete(channel.clients, name)
	channel.broadcast(name + " disconnected")
}

func (channel *Channel) broadcast(message string) {
	// channel.mu must be held
	for name, client := range channel.clients {
		n, err := client.Write([]byte(message))
		if err != nil || n != len(message) {
			channel.disconnect(name)
		}
	}
}
```

See those comments “_channel.mu must be held_”. The more complicated the logic is, the harder it will be to ensure that these comments are being followed. This gets extra complicated when you have multiple locks involved.

Also, in some languages you don’t have a race or static checker so an easy fix is to implement a method that fails when the Mutex is not properly held. The fixed code would look like this:

So how do we implement it? Easy -- track who owns the lock:

```
package example

import (
	"io"
	"github.com/egonelbre/exp/sync2"
)

type Channel struct {
	mu      sync2.Mutex
	clients map[string]io.ReadWriter
}

func (channel *Channel) Connect(name string, client io.ReadWriter) {
	channel.mu.Lock()
	defer channel.mu.Unlock()

	channel.broadcast(name + " connected")
	channel.clients[name] = client
}

func (channel *Channel) Disconnect(name string) {
	channel.mu.Lock()
	defer channel.mu.Unlock()
	channel.disconnect(name)
}

func (channel *Channel) disconnect(name string) {
	channel.mu.MustOwn()
  
	delete(channel.clients, name)
	channel.broadcast(name + " disconnected")
}

func (channel *Channel) broadcast(message string) {
	channel.mu.MustOwn()
  
	for name, client := range channel.clients {
		n, err := client.Write([]byte(message))
		if err != nil || n != len(message) {
			channel.disconnect(name)
		}
	}
}
```

The code isn’t completely correct (a brief period where “MustOwn” panics with the wrong message), but it’s still helpful and can find bugs. The whole implementation only needs a way to identify the current thread/goroutine. In Go it is a little problematic, [but doable](http://blog.sgmansfield.com/2015/12/goroutine-ids/).

There’s also the question of, what do we do when we want to Lock and then give the mutex to another thread without Unlocking. The problem can be solved by implementing a “Take” method that changes the owner.

The implementation is not limited to Go and can easily be re-implemented in C, D or Delphi -- whatever languages you need to use.

That’s it. Hopefully it helps someone.