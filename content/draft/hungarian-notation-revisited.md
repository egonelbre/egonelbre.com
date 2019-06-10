---
draft: true
title: Hungarian Notation Revisited
description: >-
  Hungarian notation is one of those things that has gotten a bad rap, because
  the common use has diverged quite a lot from the ideas that…
date: ""
tags: []
---

Hungarian notation is one of those things that has gotten a bad rap, because the common use has diverged quite a lot from the ideas that tried to enforce.

How you usually see it:

ulCount     // unsigned long count  
strUserName // string user name  
pUser       // pointer to user  
hUser       // pointer to user in heap

The idea is to use “prefix notation” to indicate some notion about the variable. I completely agree that this kind of use is outdated and probably should be left for the history-books.

However, the inventor of Hungarian Notation, Charles Simony, used them in a much more insightful way. He used them to encode more useful information about the variable. For example he used them in ways like:

xlText // x coordinate, relative to layout, Text  
xwText // x coordinate, relative to window, Text

usText // unsantized string  
sText  // sanitized string

It encodes information that is cumbersome to encode with types. I probably wouldn’t encourage to use shorthands, unless they were really common and you had a glossary for them.

You can still use the “encoding of intent or properties” in naming. And it’s actually more common than you think:

unsafeString, safeString  
UserModel, CompanyModel // Model suffix indicates relation to MVC

We can also encode ideas how the variable can be used. For example in graphics matrix transformations you can use them to show how different matrices and points should be combined:

model\_point \*   
   model\_to\_world\_Player \*  
   world\_to\_view\_Matrix \*   
   view\_to\_screen\_Matrix

// or using a shorthand

mPoint \* mwMatrix \* wvMatrix \* vsMatrix

msMatrix := mwMatrix \* wvMatrix \* vsMatrix

Since the first and last “notation” need to match it’s much more obvious when there is a typo in multiplication order.

  

  

More Information:

*   [https://www.joelonsoftware.com/2005/05/11/making-wrong-code-look-wrong/](https://www.joelonsoftware.com/2005/05/11/making-wrong-code-look-wrong/)
*   [https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-6.0/aa260976(v=vs.60)](https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-6.0/aa260976%28v=vs.60%29)
*   [http://www.byteshift.de/msg/hungarian-notation-doug-klunder](http://www.byteshift.de/msg/hungarian-notation-doug-klunder)

  

  

func (db \*database) rxmUpdateVersion(v int) {  
 db.version = v

db.rx()  
}

func (db \*database) UpdateVersion(v int) {  
 db.mu.Lock()  
 defer db.mu.Unlock()

db.unsafeUpdateVersion(v)  
}