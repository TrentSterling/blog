---
title: "Away3DLite and New Recording Software"
date: 2010-12-02
categories: [devblog]
tags: [away3dlite, dynamite-max, memory-leak, papervision3d, performance, flash]
description: "Switching from Papervision3D to Away3DLite - rebuilding the engine and dealing with memory issues."
---

Engine was stripped down, rebuilt using Away3DLite. Now I have to turn it back into a game.

[![Pretty huh? Too bad it's not a game yet.](/assets/img/better_performance_lower_memory_shits_working.jpg)](/assets/img/better_performance_lower_memory_shits_working.jpg)

Well, what can I say? Switching to Away3DLite was a larger task than I thought it would be, and now that things seem to be working, I'll have to copy/paste a lot of my old work back into the project, and adapt it to work with the rebuilt engine. Isn't making games fun?

<iframe src="//www.youtube.com/embed/7QRTQUf7vdI" frameborder="0" allowfullscreen></iframe>

So I've made the switch to Away3DLite, partially because of a memory issue in Papervision, and partially because I figured it's time to move to something that gets updated more frequently.

Coming from a Papervision3D background, I generally dislike Away3D and the way it is set up. The constructors seem dumb to me, and Away3DLite is pretty limited. I've had to create a new cube primitive that acts more like the cube in Papervision, although I must say that it's nice to only use 1 material and set tiling on the cube surface, instead of setting maxU and maxV on the material itself.

Anyway, long story short, my game got kicked in the nuts, and I am attempting to heal said nuts with Away3DLite. Perhaps I'll be able to help more people switch, seeing as Papervision3D seems to be dead.

![Yeah, like that.](/assets/img/300px-kicked_in_the_nuts.jpg)

Oh, I almost forgot. I've switched from some crappier recording software (which I loved except for the fact that when I switched to Away3DLite, it bugged out hard as hell), to VHCapture. It's nice. Not enough options, but it records well!

The game stays at a rock solid 60FPS, but I noticed some lag in the video playback, which I assume is the recorder's fault. I'll tinker with the options...
