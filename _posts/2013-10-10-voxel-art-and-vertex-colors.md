---
title: "Voxel Art and Vertex Colors"
date: 2013-10-10
categories: [DevBlog]
tags: [3D, Art, Indie, Qubicle, Unity, Voxel]
description: "I’ve been working on a few different game projects- and seeing as cubes are often a recurring theme for me, I figured it was about time to take it to..."
image: "/assets/img/blog/wp/voxelball.jpg"
---

I’ve been working on a few different game projects- and seeing as cubes are often a recurring theme for me, I figured it was about time to take it to the next level.

I’ve been testing a simple voxel renderer in Unity.

![voxelball](/assets/img/blog/wp/voxelball.jpg)

It does all the basic things you’d expect like killing culled faces. I was tempted to make an all out voxel editor – and integrate it into Unity. However- getting things like copy and paste – and all the tools I really want – would take ages to complete. I ventured out and found a free little tool called Sproxel. It was in development for 2 years but seems to have been abandoned in 2012.

![sproxelcompanioncube](/assets/img/blog/wp/sproxelcompanioncube.jpg)

[Sproxel ](http://sproxel.blogspot.com/)had some very basic tools. No copy/paste however. Using Sproxel was painfully slow. After trying to create a companion cube – where 6 sides could easily be copy/paste, I was feeling some serious grind.

[Qubicle Constructor](http://www.minddesk.com/) seemed to be the go-to voxel editor. It even had an exporter just for Unity! But with the $80 price tag – along with $25 for the Unity exporter, I had to keep looking.

Then I came across [Paint3D](http://www.paint3d.net/). The videos I saw of it were extremely low res – and the UI seemed dated. But after watching how slices and extrusions were handled, along with copy/paste, I was really excited.

I started up the trial version – which has no export/saving options.  I can understand this limitation – but I have a hard time buying software that I can’t ensure will end up working with my tools. OBJ export seems to be the only format – which is fine if I can ensure the material files and everything works right.

Anyway- after playing around with it for a bit – I can see that it’ll be worth the $20 price tag. I was able to import my models from Sproxel – and was seriously impressed with the automatic lighting and all of the other fancy features.

![paint3d](/assets/img/blog/wp/paint3d.jpg)

I’ll make an update to this post after purchase. I’m not exactly the best artist – but I’m hoping this will help me get away from basic cubes.

Anyway- I’ve set up a system to handle OBJ to Unity. The process also bakes some global illumination and self shadowing to the vertex colors.

![unityvertexcolors](/assets/img/blog/wp/unityvertexcolors.jpg)

There is no texture here, just a [shader ](http://pastebin.com/aUs4wGaD)that multiplies vertex colors to a diffuse. The model displayed here is fairly high poly – but nothing too over the top.

I could write a system that pulls vertex colors to a bitmap and then do some basic optimization on the quad geometry – but I figure my time would be better spent on other things.

I’ve been making a lot of compromises lately. Generally I like to write my own tools – and focus hard on optimization, specifically when it comes to rendering. But all of my current projects are targeting PC gamers – and I’m having a hard time making my games run under 200FPS anyway. I think it’s a good time to move on – and use the tools that are already out there.

I’m already using Unity to do most of the work for me. Why not keep moving forward that idea?
