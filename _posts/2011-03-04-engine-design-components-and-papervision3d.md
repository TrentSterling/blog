---
title: "Engine design, components, and Papervision3D"
date: 2011-03-04
categories: [devblog]
tags: [Design, Papervision3D]
description: "Implementing a component-based entity system with FlashPunk-inspired architecture."
image: "/assets/img/blog/drawing.png"
---

So I just got finished implementing components to replace my inheritance based entity system. Getting used to factories and pooling has been a bit of a battle, but I feel as though I'm ready to start actual game production. My engine has fake lighting, which adds another draw call, and it slows things down a bit. Typically you can get away with 1000-1500 triangles in a Papervision3D scene without worrying about the CPU melting, but I've limited my game scenes to around 500 triangles, which is 250 quads or 40-ish cubes.

Luckily culling can smooth out those numbers a bit and I can get away with more. The entire engine will have a hard focus on culling triangles from the viewport, and culling objects in general. By removing physics bodies and making models invisible at a distance, I can have many objects in a level. It's all about effective culling and sparse distribution of objects. Also, I can focus on designing good looking levels with many static objects, as they aren't as resource intensive as dynamic moving objects.

Speaking of CPU usage and lighting, here's an image I just took showing 100 GameObjects with several components attached. The draw function is called twice, once with a normal blendmode, and again with the multiply blendmode (lighting). Surprisingly the CPU usage isn't too high, but then again, I'm on a 2.4GHz quadcore. I want my game to be playable on a netbook, even if it does drain the battery a bit. I haven't decided if I want to go to 30FPS. It would cut my CPU usage down in half, but I feel like **30FPS is choppy**!

![Drawing cubes](/assets/img/blog/drawing.png){: .align-center }
*Drawing cubes*

Anyway, now that I have fairly quick rendering, and a component based architecture, I feel that it's time for me to get some interactive-ness back into my game. This is probably the 6th iteration of my engine. I have rebuilt it so many times that it isn't the same thing anymore. It's something smarter...faster...awesome..er!

EDIT: As you can see from the image above, I've stolen my naming conventions from [FlashPunk](http://flashpunk.net/). Before I had a much crazier folder/class structure.

![Invincible structure, or too complicated?](/assets/img/blog/old_engine.png){: .align-center }
*Invincible structure, or too complicated?*

I felt as though this set up was the best, but then I saw the simplicity in [FlashPunk](http://flashpunk.net/).
