---
date: "2011-02-19T12:00:00+03:00"
title: "Exact Imprecision"
summary: Compressing floating points by using C macros.
tags: ["C", "Experiment"]
---

Sometimes you need nicely packable floating point values. I started thinking about this problem after reading Iñigo Quílez's article [storing floating point in 4k](http://www.iquilezles.org/www/articles/float4k/float4k.htm). The problem is that using full floating point precision  makes the code less compressable.

For example 1.9f will be translated to hex 0×3ff33333 whereas it would be much better to use 0×3ff30000. If there are a lot of values ending with zeros then they can be compressed quite efficiently.

Iñigo Quílez's idea was to precalculate and define each value from 0.00 to 1.99 that give an exact hex number in a header file and then use the defined values. This method can get a little long when you would try this with more values.

My idea was to do the calculation at compile time with macros.

First thing I tried was the most obvious - convert the floating point value to it's IEEE format, mask out the values and then convert it back. Unfortunately this ended with problems as gcc doesn't let you convert float to int that easily. First I had to get the address of the value then convert it to void, then to int pointer then to int and then mask it out - then get address, void, float pointer, float. Problem is that during compile-time we don't know where the value is and therefore we have to use a temporary variable. Basically I didn't find a way that compiler could optimize it out.

Then the second thing I tried was using multiplication, masking and division:

``` c
((float)((int)(x*256) & ~((1 << (ilog(x) - 1)) - 1) )/256.0f)
```

Then tested to find a values that provide the least amount of errors and found out that this method is also easily modifiable for different sizes of imprecision. That means you can truncate different amount of nybbles quite easily.

Anyway here's the full <a href="https://gist.github.com/egonelbre/261a0e093a4c900e57e5">imprecision.h</a>.

``` c
// add here more values if more range is needed
#define ilog(x) \
	x < 2 ? 1 : x < 4 ? 2 : x < 8 ? 3 : x < 16 ? 4 : \
	x < 32 ? 8 : x < 64 ? 9 : x < 128 ? 10 : x < 256 ? 11 : \
	x < 512 ? 12 : 13

// imprecision macro P4 ( 4 bytes for float )
// (0.00 .. 1.99) avg err = 0.00375, max err = 0.0075
// (2.00 .. 3.99) avg err = 0.0075, max err = 0.0150
// (4.00 .. 7.99) avg err = 0.0150, max err = 0.0300
// works in range (0.0 ...  4111.9)
#define _P(x,y) ((float)((int)(x*(int)y) & ~((1 << (ilog(x) - 1)) - 1) )/y);
#define P4(x) _P(x,256.0f)
// P3 (0.00 .. 1.99) avg 0.06, max 0.12
#define P3(x) _P(x,16.0f)
// P5 (0.00 .. 1.99) avg 0.00023, max 0.00046
#define P5(x) _P(x,4096.0f)
// for global precision changes
#define P(x) P4(x)
```


P4 won't use more than 4 nybbles of hex values and the same goes for the others. So it's easy to use with different precisions.
