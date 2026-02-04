---
title: "Done with Papervision3D. Hate Away3D... Love Away3DLite!"
date: 2010-11-22
categories: [devblog]
tags: [Away3D, Away3DLite, BasicRenderer, FastRenderer, Papervision3D, useFloatZSort, zSorting]
description: "After frustration with Papervision and Away3D, I found Away3DLite to be the perfect solution."
image: "/assets/img/blog/companion_cubes.jpg"
---

Ok, so the last 2-3 posts were pretty hate filled because a papervision bug almost threw my game in the toilet. People say how much better and similar Away3D is to Papervision, because it's a 'branch' or derivative. But the only similarity you're likely to see these days is the painter's algorithm. That's where the similarities stop. There are several reasons I don't like Away3D. First of all, if feels **bloated**. Secondly, you have to create an object to pass parameters in the constructor of every object. Come on. **Strongly typed variables or GTFO**.

I'm not happy about it. Away3D performance is terrible compared to Papervision3D, and the only way it can possibly be useful is if I use Away3DLite, a minimal 'branch' of Away3D. And oh lets see... It's been optimized and stripped of all the flashy features. Well that's nice.

### Behold the beauty!

![Companion Cubes!](/assets/img/blog/companion_cubes.jpg){: .align-center }
*Yeah, I love it so much that I felt obligated to add Companion Cubes, the best kind of cube ever.*

The answer to all my troubles is **Away3DLite**. It's strongly typed, fast, small, sexy... **Just amazing**. It's missing some features I would consider critical, but I've already coded solutions to all my problems. (Mainly involving modifying _uvtData and setting up tiling/offsets. Now it actually functions **better** than Papervision ever did!)

![OK. I've "switched."](/assets/img/blog/3lights.jpg){: .align-center }
*OK. I've "switched."*

What do you mean I can't tile a bitmapMaterial? What do you mean that this is simple to accomplish in the full-fledged Away3D, but this total game-killing function doesn't exist in Away3DLite!? Holy crap. How much crap do I have to go through to make Away3D useful!?

![WOW. WHAT A CUBE!](/assets/img/blog/and_god_said_let_there_be_cube.jpg){: .align-center }
*Col huh? 10x10x10 cube.*

It doesn't UV tile yet, but here's my Cube primitive that uses 6 different materials, instead of that single 3x2 material BULLCRAP. Is it as fast as a Cube6? No, but on a 30x30x30 cube I'm only seeing a difference of 2FPS. I guess that's because it uses multiple materials! Whoopie!

### FastRenderer vs BasicRenderer. What's the difference?

![Wooooooowwwwwww](/assets/img/blog/rainbow_puke.jpg){: .align-center }
*It's so amazing!*

First, let me start off by mentioning that Papervision3D has much better/ more extensive documentation. This of course being because it's been around longer... Oh wait, that's a shitty excuse. My google searches for things in Away3DLite often yield crappy results, or those annoying as hell email/threads where you have to click on each reply to see any answers. For fucks sake, Away3DLite needs a good forum or something. Also, the Away3D site is ugly. For having so many users and whatnot, I find it hard to believe that an artist/designer can't be found. I've also felt that the API Documentation is far too empty. If I get the time, I might just go ahead and start documenting things on my own. Hell, some of my fixes should probably be posted online too. Go open source!

![FastRenderer](/assets/img/blog/fastrenderer.jpg){: .align-center }
*Here you can see some small z-sorting mistakes caused by FastRenderer*

There's 2 renderers, **FastRenderer** and **BasicRenderer**. The main difference between the two is the way they handle z-sorting. FastRenderer sets up sorting based on a single object point, while BasicRenderer sorts all the faces in the scene. Seeing as the physics engine inside of my game seperates objects pretty well, and intersections are minimal, I've went ahead and left the decision up to the user. The game will start out using the BasicRenderer, but if your machine sucks, and you can get a boost from using the FastRenderer, you'll have an option to do so.

### Using "useFloatZSort"

There's also another property you can change that'll help with z-sorting. "view.renderer.useFloatZSort". This allows the renderer to use a slightly more accurate, Number based z-sorting algorithm. It's a bit slower, but if you're on a quad-core rig like me, you'll like to have the option to have the prettiest game possible.

![BLAM](/assets/img/blog/my_head.jpg){: .align-center }

Anyway, I've been up for... I dunno it's been around a day and a half now. My head hurts! I need sleep! More on this later.

Oh, also Away3DLite's support for rendering to different layers/sprites is awesome. No more crappy Papervision hacks for me!
