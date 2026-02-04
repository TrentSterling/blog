---
title: "Going back to Papervision3D."
date: 2010-12-10
categories: [devblog]
tags: [Away3D, Away3DLite, Papervision3D]
description: "After extensive testing, Papervision3D still proves to be faster."
image: "/assets/img/blog/funny-polar-bear-pic-img121.jpg"
---

...Away3DLite was a fun detour, but I'm gonna go ahead and drop it and go back to my old system. I've tracked down my memory leak when using Papervision, so I'm getting back on that boat (I'll probably switch again when molehill shows up).

![Doh!](/assets/img/blog/funny-polar-bear-pic-img121.jpg){: .align-center }
*Doh!*

**Papervision is faster**. That's all there is to it. It can display **more objects with steady performance**. Sorry Away3DLite!

I've looked at many different performance tests, and I've gotten some interesting results. I had switched to Away3DLite because of a few issues with Papervision3D. I had created a cube with 100 segments each direction, and noticed that I got better performance from Away3DLite. From that I had determined that it was time to switch, and **moved my entire game over to Away3DLite**. (Note to self: Don't ever do anything so stupid again!)

It wasn't until yesterday that I had done extensive testing on the NUMBER of objects in the scene. Simply put, Papervision can handle 360 planes with a bitmapMaterial much better than Away3DLite can. I'm familiar with the FastRenderer, sortObjects, and useZFloat and tried everything I could to get better performance from Away3D.

And because Away3DLite is still early in development, it's missing some game-critical features, and some things feel unfinished. I also noticed a bug where setting an object3d's layer property only worked right if it had it's own material. I played around with Away3DLite for 3 weeks, and I feel that I've learned a bit, but gained nothing substantial.

I don't want to be a party pooper though. Away3DLite is a very promising project and I feel that it's better than Away3D's full package entirely. I just need raw speed, and Papervision3D seems to still be the fastest for rendering.

## Explosion ripple with DisplacementMapFilter

Wonder what I did today? This:

![BOOM!](/assets/img/blog/explosion_ripple.png){: .align-center }
*BOOM!*

Cool huh? It cuts down the framerate on older machines, so it'll have to be something the user can toggle.
