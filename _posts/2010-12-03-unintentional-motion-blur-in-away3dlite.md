---
title: "Unintentional motion-blur in Away3DLite"
date: 2010-12-03
categories: [devblog]
tags: [3D, Away3DLite, Effects, Lighting]
description: "A strange bug turns into a happy accident - motion blur effect in Away3DLite."
image: "/assets/img/blog/shading_planes.jpg"
---

![Shading planes. Faking depth since.... forever.](/assets/img/blog/shading_planes.jpg){: .align-center }
*Shading planes. Faking depth since.... forever.*

So I was working with some semi-transparent planes to add some darkness / depth to my game, and came across a strange bug.

![Oh, that's pretty!](/assets/img/blog/unintentional_blur.jpg){: .align-center }
*Oh, that's pretty!*

How pretty! A motion blur effect. This is caused by the renderer drawing the scene on top of itself over and over each frame. To give you an idea what it's like, here's an example.

![CHAOS!](/assets/img/blog/chaos.jpg){: .align-center }
*CHAOS!*

Now, with these shading planes added, it darkens the scene with each draw, and you end up with motion blur!

![ZE PLANES!](/assets/img/blog/ze_planes.jpg){: .align-center }
*ZE PLANES!*
