---
title: "3D Rendering in Flash"
date: 2010-10-29
categories: [devblog]
tags: [3D, Alternativa, Away3D, Flash, ND3D, Papervision3D, Performance]
description: "A 2010 ActionScript 3D renderer comparison covering Papervision3D, ND3D, Alternativa and Away3D Lite, with a focus on UV tiling and speed."
---

Been playing around with different rendering engines. Each has their own set of features, and I'm not sure what I want to use.

Found a good list here: [AS3 Quick Guides - Open Source 3D Engines](http://matteley.wordpress.com/2009/10/11/as3-quick-guides-open-source-3d-engines/)

Now that Alternativa has been released, I'll probably try it out. My project currently uses Papervision3D, and I was planning on moving to the much smaller ND3D, but it's missing some essential features (UV tiling, multiple viewport layers).

I might also try out Away3D Lite, seeing as it gives good performance, has the features I need, and it's not TOO much different than Papervision. Going to do some performance tests because rendering speed is all that matters!


## Archive context (2026)

This early Flash post documents a technology choice while the game was still moving between engines. Papervision3D was in use, ND3D looked appealing for its size but lacked required UV tiling and multiple viewport layers, and Away3D Lite was worth testing because it seemed to offer a workable compromise between features and performance. Alternativa was another new option on the list. None of these comparisons imply that all four engines ended up in one shipped game.

The linked third-party engine roundup is an artifact of the period. The post itself is better read as an engineering decision log than a present-day recommendation for any of these retired Flash-era technologies.

### Looking back (editorial)

The through-line is already familiar: the best renderer isn't necessarily the most impressive one; it's the one that draws what the game needs quickly enough. This technical fork comes just before the [2011 component-and-culling write-up](/blog/posts/engine-design-components-and-papervision3d/), where the consequences of that performance-first approach become concrete.
