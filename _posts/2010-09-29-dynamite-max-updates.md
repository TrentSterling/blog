---
title: "Dynamite Max Updates"
date: 2010-09-29
categories: [DevBlog]
tags: [Dynamite Max]
description: "Dynamite Max: my 2009-2011 3D Flash game. Papervision3D then Away3DLite, Box2D then Nape, a 2.5D physics platformer with a real level editor. Video update from 2010."
image: "/assets/img/dynamitemaxintro.jpg"
---


<iframe src="//www.youtube.com/embed/9jyXvl8VUQA" frameborder="0" allowfullscreen></iframe>

> Added in 2026. This post originally had only the video. The summary below is pulled from my own later posts, mainly the [2013 retrospective](/blog/posts/dynamite-max/), because an earlier AI-written summary here invented features the game never had.
{: .prompt-info }

## What Dynamite Max was

Dynamite Max was my 3D Flash game from 2009 to 2011, built before Stage3D existed. Papervision3D and later Away3DLite faked the 3D on the CPU, which meant the whole scene had to stay under roughly 500 to 1000 triangles. It played as a 2.5D physics platformer: Box2D at first, Nape later, with fake lighting done by overlaying radial gradients in multiply and overlay blend modes, and explosion ripples through a DisplacementMapFilter.

The level editor was the real tech. Grid snapping, scale and rotation, joints and ropes for bridges, trigger volumes that fired functions, serializable components edited live through reflection, level saving and loading, and sharing through GamerSafe. Looking back, it was a small Unity editor before I had ever touched Unity.

It never shipped. Holding 30 FPS on a quad core was a fight, and the tech kept moving under me: Box2D to Nape, Papervision to Away3DLite to Stage3D, then Unity. I rebooted it once in 2011 as a pure 2D FlashPunk and Nape platformer with lighting, which was fun and also never finished. The full story is in the [2013 retrospective](/blog/posts/dynamite-max/).
