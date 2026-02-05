---
title: "Nape Physics Engine"
date: 2011-03-28
categories: [devblog]
tags: [Box2D, Nape, Physics]
description: "Switching from Box2D to Nape for phenomenal physics performance in Flash."
image: "/assets/img/blog/napephysics.png"
---

## Goodbye Box2D, hello Nape!

Long story short, I switched from Box2D to [Nape](http://code.google.com/p/nape/) for my physics solution. The simulation quality is a bit less accurate than Box2D, but the performance is phenomenal!

![500 box test!](/assets/img/blog/napephysics.png){: .align-center }
*500 box test!*

I'm a bit worried about objects being able to penetrate other objects, and the lack of continuous collision detection, but in most cases this isn't an issue. I wrote my physics wrapper so that I could switch back and forth between Nape and Box2D. But unless I'm doing some fairly high-speed simulations, Nape will always be my tool-of-use.

I've looked at the latest build of Nape in the trunk; which is a large rewrite of the version I'm using now, and I like what I'm seeing so far! Maybe after some testing I'll move on to the bleeding edge version, and maybe I'll start using haxe?

## Multiplayer using P2P and Cirrus

Another thing I'm looking at is P2P multiplayer, using the Cirrus service from Adobe. The problem with this is that Cirrus is in beta, can may be changed or removed whenever Adobe feels like it. It would mean that the multiplayer portion of my game could be killed at any time, without warning or anything to fall back on. The idea that my engine could be made multiplayer does excite me though. I can remember playing some awesome physics based gamemodes in GMod.

![Ascension - Garry's Mod Gamemode](/assets/img/blog/gmod5.jpg){: .align-center }
*"Ascension" - Garry's Mod Gamemode*

![Mario Boxes - Garry's Mod Gamemode](/assets/img/blog/1408_1.jpg){: .align-center }
*"Mario Boxes" - Garry's Mod Gamemode*

Something like this could be easily done with my engine and multiplayer networking handled by Cirrus. I don't know if I'll continue looking into multiplayer, but maybe Adobe will make some sort of official statement about it. I feel like they'd keep the service up, but you never know.
