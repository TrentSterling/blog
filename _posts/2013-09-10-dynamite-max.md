---
title: "Dynamite Max"
date: 2013-09-10
categories: [DevBlog]
tags: [Unity]
description: "newmax  This was a 3D Flash game before 3D was cool. Papervision and Away3D were the kings of 3D in flash, before Stage3D came around. This means we..."
image: "/assets/img/blog/wp/newmax.png"
---

![newmax](/assets/img/blog/wp/newmax.png)

This was a 3D Flash game before 3D was cool. Papervision and Away3D were the kings of 3D in flash, before Stage3D came around. This means we faked 3D effects using the CPU. This method is extremely limited, which means we could only draw about 1000 triangles. Generally it would be best to keep things under 500.

Games from 1999 used 5000 triangles on a single vehicle. As you can imagine, the graphics capabilitys of older flash were quite limited.
# Lighting

But I still wanted to make a game that looked good. I added fake lighting by simply overlaying 2d radial gradients with a multiply or overlay blendmode. This created the soft lighting needed.![500 box test!](/assets/img/blog/wp/napephysics.png)

500 box test!
# Physics

For physics, I used Box2D. Eventually I got wise and started using Nape for my physics, but by that time, Stage3D was rolling around – and Dynamite Max was circling the drain. It was hard to keep the framerate above 30FPS on a Quad-core computer. The explosion effects had a screen ripple using the DisplacementMapFilter in flash. Many of the effects were very CPU heavy.
# Editor

While it was playable – and the editor was actually quite advanced, it still felt like nothing more than a tech demo. I had textures, sound effects, level saving and loading, and had even integrated a system to share makes using GamerSafe. The editor had options for snapping to grid, scale, rotation, and all the physics was handled automatically. You could add joints and ropes in the editor to make bridges, and you could make trigger volumes to fire off functions. I had then moved on from inheritance to components. I made my components serializable. I used reflection to let my editor change objects in real time. Looking back on it – I was making a simplified Unity editor.

It was my baby for quite a long time. I’ve tried to reboot it a few times – once in flashpunk, skipping out on the 3d entirely, but I can never bring myself to finish it as the required quality of projects had really risen. When I first started the project – I was certain that I could find sponsorship, but as it stands – its far too unpolished to be anything. Just a dream.

![Pretend that this image is animated at 60FPS.](/assets/img/blog/wp/desktopmachine.jpg)
# Incomplete, Moving on

This project didn’t get completed because I had found better technologies. Things were evolving faster than I could develop. Box2D to Nape, Papervision to Away3DLite to Stage3d (Using Away3D, then Minko), then Unity.

I also ended up switching libraries for 2D stuff quite often. FlashPunk ND2D, Starling, and my own 2D framework with a Stage3D renderer.

Major changes had interrupted my work so hard that continuing the process was unbearable.
