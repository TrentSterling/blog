---
title: "Box2D VS Nape"
date: 2011-04-03
categories: [devblog]
tags: [Box2D, Nape, Physics]
description: "Comparing Box2D and Nape physics engines - speed vs accuracy trade-offs."
image: "/assets/img/blog/smooth.png"
---

This is my short comparison between Box2D and Nape. I've used Box2D AS3, and then Box2D Alchemy for a year or so. I've spent a lot of time hacking through it, so I feel that I'm qualified to make this comparison. The thing you need to ask yourself is this: "Do I want more speed/performance, or do I want accuracy in my physics simulations?"

**EDIT:** Deltaluca has been helping me with my game, and I have been testing his new version of Nape, which is faster, stronger, better. He plans to tackle CCD, and has introduced island sleeping. The old sleeping will be implemented at some point in the future. The problems I was having with strange sleeping and other odd behaviors in Nape came from my use of a physics scale, something often used with Box2D. I can now say with confidence that Nape is the best choice for physics in Flash.

**EDIT AGAIN:** Deltaluca has been making a lot of progress on newnape (name pending?), and has added constraints and a lot of other things you should check out! The review below isn't terribly outdated, but I'll probably review both newnape and box2d after some more updates/milestones are completed.

{% include youtube.html id="3DeKkPsh45Y" %}

If you want to stack a ton of physics bodies on top of each other with minimal slow-down, then Nape is your answer. Nape will allow you to have many physics bodies in your world/space with great performance. The sleeping system is a bit different than Box2D, and will allow objects to sleep individually, ignoring islands used in Box2D's system. Using UniformSpace, instead of UniformSleepSpace have shown that its probably just the minimum sleep velocity or the minimum time before activating the sleep state. I simply haven't dug deep enough into Nape yet to know exactly what parameter I need to change.

![Nape Physics](/assets/img/blog/smooth.png){: .align-center }
*Nape Physics*

If you don't need many physics bodies, or need fast moving bodies like bullets, Box2D is your answer. Nape doesn't support continuous collision detection (CCD), or tunneling prevention. Essentially a high velocity body can pass through another body if it is thin enough. Using the 'isBullet' parameter enables CCD, which will make sure objects can not pass through each other. Box2D wasn't made for AS3, and the performance suffers. Nape was made with Flash in mind (yes its made in haxe), and is much more efficient than Box2D. I've also taken a look at a lot of other physics engines for Flash, like Motor2, physaxe or glaze, but Nape seems to beat them all in simulation speed.

Some hacks in Nape may solve some of the issues with tunneling. You could use some simple raycasts to check ahead or behind your object to see if it has passed through anything. I asked deltaluca (author of Nape) about CCD in FlashGameLicense chat, and he said it was something he'd like to implement. No ETA's or anything, but it is an open source project. I'll be using raycasts for my bullets using Nape, so I'll get back to everybody when I see how well that works.

![Nape Logo](/assets/img/blog/logo.jpg){: .align-center }
*Did I mention how cute the Nape logo is? Its CUUUTE!*

Nape Forums (VERY HELPFUL!): [http://deltaluca.me.uk/forum/index.php](http://deltaluca.me.uk/forum/index.php)

Nape Project Page: [http://code.google.com/p/nape/](http://code.google.com/p/nape/)

Nape Documentation (ALSO VERY HELPFUL!): [http://www.deltaluca.me.uk/doc/](http://www.deltaluca.me.uk/doc/)

If I'm wrong about anything, or this needs updating, you can always leave me a comment! I encourage it.
