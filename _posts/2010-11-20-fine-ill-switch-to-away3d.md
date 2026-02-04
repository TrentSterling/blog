---
title: "FINE! I'LL SWITCH TO AWAY3D."
date: 2010-11-20
categories: [devblog]
tags: [Away3D, Away3DLite, Papervision3D]
description: "Memory leak in Papervision forces me to consider switching to Away3D."
image: "/assets/img/blog/well-now-thats-not-gonna-be-very-good-for-business.jpg"
---

So I started to notice a little bit of a performance drop, and I could swear I smelled memory leak. I've been using an older version of FlashDevelop, and noticed that the newer versions came with a memory profiler! Awesome!

Long story short, Papervision3d has some problems with ViewportLayers. I submitted some issues to the googlecode and how to fix some of them, but now I have to trace down what's doing this.... Or... I could switch to Away3D.

![Shit.](/assets/img/blog/well-now-thats-not-gonna-be-very-good-for-business.jpg){: .align-center }
*Shit.*

Even though the performance is worse than Papervision3D in all of my testing, Away3D has much better support for ViewportLayers... Or I guess it's just 'layers' now. Sorry Papervision3D. Maybe I'll come back to you whenever you get patched up. I just can't deal with Papervision3D's terrible ViewportLayers. They're unfinished. I submitted a bug report on the googlecode and posted a minor fix, but it still leaks memory. Spewing it everywhere!

![SPEWING MEMORY!](/assets/img/blog/uncontrollable_vomit_600.jpg){: .align-center }
*SPEWING MEMORY!*

[![Away3D Logo](/assets/img/blog/away3d_logo.jpg){: .align-left }](http://away3d.com/)

I'll be using the 'lite' version of Away3D. I like things small, and I don't need anything more than cubes and viewport layers... Actually, upon further inspection, I don't see how you tile UV coordinates with this piece of crap. All I see is this bitmapMaterial.repeat(), which is just a boolean, not a tileX or tileY.... Quick google search pulls up some people complaining about it..... God damn it, time to start digging. FUUUUUUUUUUUUUUUUUUUUUUUUUUUUU
