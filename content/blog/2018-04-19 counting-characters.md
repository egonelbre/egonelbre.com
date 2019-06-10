---
date: "2018-04-19T12:00:00+03:00"
title: "Counting Characters"
summary: A deceptively simple exercise.
tags: ["Go", "Unicode"]
---


Let’s start with a simple problem: “How many characters are in a string?”. Our first implementation:

```
func CharacterCount1(s string) int {  
    return len(s)  
}

fmt.Println(CharacterCount1`("hello"))  
// Output: 5`
```

_Yay, all done, right?_

Anyone who has encountered unicode strings, knows that this returns the number of bytes not the number of characters.

```
fmt.Println(CharacterCount1("你好"))  
// Output: 6
```

Let’s try again:

```
func CharacterCount2(s string) int {  
    return len(([]rune)(s))  
}  
fmt.Println(CharacterCount2("你好"))  
// Output: 2
```

_Huh, is it now correct?_

Not quite.

```
fmt.Println(CharacterCount2("hĕllŏ"))  
// Output: 7
```

So, still not right. It looks like 5 characters, however to delete that string, you would need to press backspace 7 times. The catch is that characters can be composed of multiple symbols. Do you see the little **_u_** shape on top of e and o. That is a diacritic and represented by a separate rune and then combined with the previous letter.

There are examples of the reverse as well. For example ligature “ﬃ” requires single backspace to delete, but looks like three characters smushed together. There are many other examples including ㈎ and ẛ̣.

The “number of characters” depends on the context. But, what do you actually want to know? The “correct” answer is out of the scope of this article, but it rarely is the number of runes. Here’s a comparison of different ways of counting characters:

```
Output:
   bytes   runes   NFC     NFD     NFKC    NFKD    Regex   Graph.. Text
   5       5       5       5       5       5       5       5       "hello"
   6       2       2       2       2       2       2       2       "你好"
   9       7       5       5       5       5       5       5       "hĕllŏ"
   12      8       4       4       4       4       4       4       "l̲i̲n̲e̲"
   3       1       1       1       2       2       1       1       "ﬁ"
   3       1       1       1       3       3       1       1       "ﬃ"
   3       1       1       1       3       3       1       1       "㈎"
   5       2       1       1       1       1       1       1       "ẛ̣"
```

[https://play.golang.org/p/X6k-\_9uy2ec](https://play.golang.org/p/X6k-_9uy2ec)

_I’m aware that some of these give the same answer, but usually you want to do something else with the string, not just count the characters._

PS: this is the wrong way to write a word reversing function:

```
func Reverse(s string) string {
	chars := []rune(s)
	for i, j := 0, len(chars)-1; i < j; i, j = i+1, j-1 {
		chars[i], chars[j] = chars[j], chars[i]
	}
	return string(chars)
}

func main() {
	fmt.Println(Reverse("hĕllŏx"))
	// Output: x̆oll̆eh
}
```

[https://play.golang.org/p/W49YBTiQ060](https://play.golang.org/p/W49YBTiQ060)

As an exercise, try implementing a string reverse that does the right thing with “hĕllŏ”, “ﬃ”, “㈎” and “你好”.

Read more at:

* [https://blog.golang.org/strings](https://blog.golang.org/strings)
* [https://blog.golang.org/normalization](https://blog.golang.org/normalization)
* [http://www.unicode.org/reports/tr29/#Grapheme\_Cluster\_Boundaries](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries)
* [https://unicode.org/reports/tr15/](https://unicode.org/reports/tr15/)
* [https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/Strings/Articles/stringsClusters.html](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/Strings/Articles/stringsClusters.html)
* [https://mathias.gaunard.com/unicode/doc/html/unicode/introduction\_to\_unicode.html](https://mathias.gaunard.com/unicode/doc/html/unicode/introduction_to_unicode.html)