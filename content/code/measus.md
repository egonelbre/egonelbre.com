---
date: "2011-09-13T12:00:00+03:00"
title: "measus"
tags: ["perl", "code"]
---

Measus is a perl script that automates speed testing 
multiple programs over different files and arguments.

<!--more-->

For example you have programs brute-force, shift-or, 
kmp and grep. You want to test pattern searching with 
patterns “aaaa”, “bbbb”, “ababba”. Also you want to 
test with different files “abc.txt” and “bbb.txt”. 
Also testing only one run is useless so you want to 
run each test 10 times. To do this testing you’ll need 
to create a setup file:

{{% highlight perl %}}
	$iterations = 10;

	@programs = (
		"grep => grep -c PAT FILE",
		"brute-force => ./bf PAT FILE",
		"shift-or => ./sor PAT FILE",
		"kmp => ./kmp PAT FILE",
	);

	@patterns = (
		"aaaa",
		"bbbb",
		"ababba",
	);

	@files = (
		"abc 16MB => ../data/abc.txt",
		"b* 16MB => ../data/bbb.txt",
	);
{{% /highlight %}}

Then you can run it with:

{{% highlight sh %}}
	./measus.pl log_tabdelim.pl setup.pl
{{% /highlight %}}

Download from here: [measus.tar.gz](/files/measus.tar.gz)
