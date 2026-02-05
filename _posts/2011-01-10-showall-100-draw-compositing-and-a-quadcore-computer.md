---
title: "ShowAll, 100%, draw, compositing, and a quadcore computer"
date: 2011-01-10
categories: [devblog]
tags: [Effects, Lighting, Papervision3D, Performance, Programming]
description: "Deep dive into Flash CPU usage, draw calls, and performance testing with multiple cores."
image: "/assets/img/blog/editor_framerate.png"
---

After a little debate in FGL chat about framerate (30 looking choppy and 60 being smooth), I went and looked back on an earlier version of my engine. At that point I had lighting implemented, and was able to have around 500 triangles with a rock solid 60fps. The old engine wasn't too optimized, and wasn't built for garbage collection, so I went in a new direction.

Fast forward to today, where I have pretty much the same functionality, lighting, spiffy displacementMap effects, and a level editor that garbage collects correctly. Things are looking better, and I get about the same framerate, minus a few frames here and there. Someone in chat had mentioned CPU usage with high framerates, and I was stress testing the engine with about 60 lightsources. The framerate was about 28 when the target FPS was set to 60. To test everyone's theory about setting the target at 30 to lessen the blow to the CPU, I set the target at 30 and ran the same test. This time around, I was only getting 24FPS, **showing that a smaller chunk of the pie was given, and that 30FPS sucks balls**. I looked at the CPU usage, and it was the same for both tests, around 60% usage on my quadcore machine.

![Editor with 10 lights and some colored boxes](/assets/img/blog/editor_framerate.png){: .align-center }
*Editor with 10 lights and some colored boxes*

I thought to myself, wait a minute, 60% usage? Flash isn't multithreaded is it? Before finding the answer to that, I decided to open an older version of the engine, and was shocked to see around 25% usage with around 500 triangles. Lighting and everything was in place, except for the displacementMapFilter **(Which easily adds 10-15% more CPU usage!!)**. I then set the process's affinity to use only 1 core, and saw that it was playable, although it was maxing out that core. Doing the same thing on my current engine cuts the framerate almost directly in half, so I've decided that I have a serious problem.

Among all this crap, I also noticed that I'm getting better performance when the window is stretched with the stage set to ShowAll, even though in previous tests I've seen better performance by setting the stage to 100%. Now I'm not sure, and if ShowAll is faster, it means I've wasted my time making my renderer and editor work with various stage sizes. FUUUUUUUUUUU-

I've come to the conclusion that my old engine did the lighting and stuff in separate draw functions, and would draw the lighting on top of bitmap data. My current engine tried to use only 1 draw function (which I figured was faster/more optimized), and have all of the lighting layers directly on top of the game objects layers, which is apparently slower (proper hierarchy is slow. Go figure!)... for whatever reason... I guess because it's easier to composite pixel data rather than the 3d/raster stuff that papervision spits out (I'd assume its because each triangle has to be composited.) Shouldn't multiple draw functions be killing my performance? I notice that with each draw I get about 15% more usage. 5% just to rendering/Box2D. 15% for drawing the scene. 15% for drawing the lighting (with about 10 visible lights). That's about 35% CPU usage on a quadcore rig, and 100% usage on a singlecore machine with a dip in framerate. I really can't wait for molehill. I could be using 5% CPU for the entire game with hardware acceleration. God damn it.

![DirectX](/assets/img/blog/directx.jpg){: .align-center }
*LET ME USE IT!*

Anyway, I'll be doing all of my tests with 1 core in the future, so that I can have more realistic expectations, and so that I don't feel like things are going smoothly all of the time. Lag/stutter/poor framerate is an indication of something going wrong, and I need to be able to see when my game is killing itself. **But hey, at least everything garbage collects now!** 8)
