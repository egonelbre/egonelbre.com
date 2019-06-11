---
date: "2018-04-24T12:00:00+03:00"
title: "Fast Permutation Compression"
summary: Compressing a permutation as small as possible.
tags: ["Go", "Performance"]
---


_All code variations can be found at_ [_https://github.com/egonelbre/exp/blob/master/permutation/code.go_](https://github.com/egonelbre/exp/blob/master/permutation/code.go)_._

Given a permutation what is the best way to convert it into a smaller data-structure?

Let’s say you have a permutation of 12 items. A trivial approach would be to store each item in a separate byte. This of course works, but can we do better?

```
type Permutation [12]byte
```

It’s easy to see that the maximum number we need to store is 12, but the byte can store 256 entries. By fitting it into 4 bits, it would be possible to store it in `12*4 = 48 bits`.

```
func PackNybble(perm Permutation) uint64 {  
    r := uint64(0)  
    for _, v := range perm {  
        r = r<<4 + uint64(v)  
    }  
    return r  
}
```

We can actually do better, by encoding using base 12 directly, instead of rounding it to 16.

```
func PackBase12(perm Permutation) uint64 {  
    r := uint64(0)  
    for _, v := range perm {  
        r = r*12 + uint64(v)  
    }  
    return r  
}
```

This will end up using `log2(12^12) = 43.0195 bits` . We know that there are exactly `12!` permutations. This would mean that in the perfect world, we could pack all of this into `log2(12!)=28.835bits`.

Some basic permutation theory gives us that we can assign a unique index to each permutation and convert it to and back. One of such numbering is [Lehmer code](https://en.wikipedia.org/wiki/Lehmer_code).

I found one description of the algorithm for converting a permutation to code from here [https://www.researchgate.net/figure/The-Lehmer-code-A-complete-translation-from-permutation-to-decimal-by-way-of-the_fig1_230831447](https://www.researchgate.net/figure/The-Lehmer-code-A-complete-translation-from-permutation-to-decimal-by-way-of-the_fig1_230831447)

{{< fig src="/_images/lehmer-code.jpg" >}}

_We can imagine this as reducing the problem at each stage to a smaller problem. At first there are `12!` possibilities for using the index. We know that for permutation of size 11, there are `11!` of them. This means when we partition the permutations into 12 equal chunks, based on some criteria, figure out which chunk it belongs to and then multiply that by `11!` then we get our first reduction. Each next step won’t spill over to the next partition, because they are smaller than `11!`._

The implementation required a little tinkering, but wasn’t anything too complicated.

```
func Code(perm [12]byte) uint64 {  
    r := uint64(0)  
    for min := byte(0); min < 11; min++ {  
        z := 0  
        n := base - min  
        for i, v := range perm[:n] {  
            if v == min {  
                z = i  
                break  
            }  
        }  
        copy(perm[z:], perm[z+1:n])  
        r += uint64(z) * fact(11 - min)  
    }  
    return r  
}
```

It really gives the smallest encoding possible, but compared to the just packing we have worse performance. I implemented few variations, to see whether it would be possible to improve upon it. However the first variant was pretty good already.

```
BenchmarkCopy                         199 ns/op  
BenchmarkCount                        312 ns/op  
BenchmarkTable                        284 ns/op  
BenchmarkTable2                       524 ns/op  
BenchmarkPackNybble                   17.3 ns/op  
BenchmarkPackNybbleUnroll2            4.94 ns/op
```

So, it’s ~40 times slower than just packing. Can we do better?

Notice that we are able to pack the whole permutation into a uint64 with very low cost.

The core of the loop is the following:

```
z := find the index of min in the permutation  
remove z from the permutation  
r += z * min!
```

Bit-parallel search is a good way to find that index. Bit-parallel is easier to show in an example, let’s take a permutation `[1,2,3,0]` and lets search for number `2`.

```
01.  decimal               1    2    3    0  
02.                        ---- ---- ---- ----  
03.  packed                0001 0010 0011 0000  
04.  mask                  1101 1101 1101 1101  
05.    
06.  f1 := packed ^ mask   1101 1111 1110 1101  
07.  f2 := f1 >> 2           11 0111 1111 1111  
08.  f3 := f1 & f2         0001 0111 1110 1101  
09.  f4 := f3 >> 1          000 1011 1111 0110  
10.  f5 := f4 & f3         0000 0001 1110 0100  
11.    
12.  f5 := f4 & f3         0000 0001 1110 0100  
13.  onemask                  1    1    1    1  
14.  s := f5 & onemask     0000 0001 0000 0000  
15.                                  .... ....
```

At step 03 we see the bit representation of that packed sequence. First we need a mask to detect number `2` at all positions at the same time. We can use the complement of number `2` and use xor for that. This leaves us with a result where only the matching nybble contains all ones. This can be seen as the result `f1`.

Now we need to find the index, where all the numbers are one. For this we can and them all together using steps 7 to 10. Finally we need to remove all the other bits that aren’t relevant with Step 14.

Our result is the number of zeros after the number. Note that this result still needs to be divided by 4 to get the final result. Once we translate this idea into code, it looks roughly like this:

```
mask := masks[min]  
filtered := perm ^ mask  
filtered &= filtered >> 2  
filtered &= filtered >> 1  
filtered &= onemask  
z4 := byte(bits.TrailingZeros64(filtered))
```

We can now need a way to remove that element from the sequence:

```
upper := (perm >> (z4 + 4)) << z4  
lower := perm &^ (^uint64(0) << z4)  
perm = upper | lower
```

Here we construct the upper part, by cutting off the bottom part. And then get the lower part by masking out all the upper parts. Then we combine them back together.

Benchmarking the code gives us a speed up from ~200ns to ~120ns.

```
BenchmarkCopy            199 ns/op  
BenchmarkCopyBit         123 ns/op
```

The final (uncensored) code was this:

```
func CodeCopyBit(perm [base]byte) int {  
    return codebit(uint64(PackNybbleUnroll(perm)))  
}

func codebit(perm uint64) int {
    r := 0
    for min, mask := range masks {
        filtered := perm ^ mask
        filtered &= filtered >> 2
        filtered &= filtered >> 1
        filtered &= maskstarts
        z := byte(bits.TrailingZeros64(filtered))
        upper := (perm >> (z + 4)) << z
        lower := perm &^ (fullmask << z)
        perm = upper | lower
        r += int(z/4) * reverse_factorial[min]
    }
    return r
}
```

When there aren’t many elements then using bit-parallel approaches can get rid of branches and reduce cycles. Of course, when we have much larger sequences, then this approach becomes more cumbersome to write and might also end up slower.

This probably can be made even faster by unrolling the whole loop. However, it’s sufficient for this time.

_PS: When there are very few elements then this whole thing can be replaced by a lookup table._

---

Robert Clausecker suggested even better [approaches in Reddit](https://www.reddit.com/r/golang/comments/8ems5n/fast_permutation_compression/dxxm8et/). His descriptions in [StackOverflow](https://stackoverflow.com/questions/39623081/how-can-i-effectively-encode-decode-a-compressed-position-description/39706321#39706321) are quite nice. His benchmarks are here [https://github.com/fuzxxl/permcode](https://github.com/fuzxxl/permcode).

```
BenchmarkCopy          205.0 ns/op  
BenchmarkCopyBit       126.0 ns/op  
BenchmarkShuffle        69.2 ns/op  
BenchmarkShuffleUnroll  39.2 ns/op
```

His best approach is doing a [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) in reverse, which is brilliant. We can think of permuting an array `[0, 1, 2, 3 .. 11]` as picking random number and eliminating them. By finding the “random” numbers used to generate that we get a sequence, where each “maximum random” is smaller than the previous. So maximally we can only get a sequence `[11, 10, 9, 8 .. 0]`. We can convert that into a number using [factoriadics](https://en.wikipedia.org/wiki/Factorial_number_system) (each element multiplied by the factorial).