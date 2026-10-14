---
title: "ASCIICITY"
date: 2026-08-16 15:16:48 +0000
last_modified_at: 2026-10-14 15:16:48 +0000
categories: [devblog, Projects]
tags: [Games]
description: "I've been making a sunny, Miami-inspired city you can walk around in, climb onto car roofs, or drive through in one of the traffic cars."
image: "https://tront.xyz/games/media/asciicity.webp?v=34b4446efd20"
---

I've been making a sunny, Miami-inspired city you can walk around in, climb onto car roofs, or drive through in one of the traffic cars. Then you can switch the whole view over to ASCII.

The characters follow more than just the brightness of the picture. I use the kind of object, its depth and the direction its surface is facing, along with edge voting and temporal stability. That gives the text some structure to follow while the camera moves around. You can switch back to the ordinary view, or look at depth, normals and edges separately.

The city loads in chunks, but the traffic cars keep their identities as those chunks recycle. It's built with vanilla Three.js modules. Missions, combat and the police are still being worked on.

[Project page](https://tront.xyz/asciicity/)

<video class="embed-video file" controls playsinline preload="none" poster="https://tront.xyz/games/media/asciicity.webp?v=34b4446efd20" src="https://tront.xyz/games/media/asciicity.mp4?v=abf84d294b2c"></video>
