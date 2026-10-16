---
title: "Voxel Mobile Twinstick Shooter (VoxeFire)"
date: 2015-05-15
categories: [devblog, Projects]
tags: [3D, FireTV, Unity, Voxel]
description: "VoxeFire, a 2015 Unity voxel twin-stick shooter targeting Amazon Fire TV, experimented with destructible arenas, shared voxel artwork, and mobile performance."
image: "/assets/img/2015-05-15_02-29-22.png"
---

VoxeFire, or VoxaFire is a voxel powered twinstick shooter made specifically to run on Amazon's FireTV device. So far, the performance has been a roller coaster - while some things are surprisingly speedy, other things are laggy and stuttery.

The entire arena, or game map is destructable, and the artwork is sourced from Twitch viewers! It's an experiment and I'm not sure if it's too much for mobile right now. While the game runs extremely smooth, too much destruction happening at once can cause hiccups or hitching.

![VoxeFire Screenshot](/assets/img/2015-05-15_02-29-22.png)


<figure data-restored-image="voxel-twinstick-voxefire-1">
  <a href="{{ '/assets/img/blog/restored/2015-05-22_18-11-52.png' | relative_url }}"><img src="/assets/img/blog/restored/2015-05-22_18-11-52.png" alt="2015-05-22_18-11-52" width="1920" height="1080" loading="lazy"></a>
</figure>



<figure data-restored-image="voxel-twinstick-voxefire-2">
  <a href="{{ '/assets/img/blog/restored/2015-05-28_16-35-17.png' | relative_url }}"><img src="/assets/img/blog/restored/2015-05-28_16-35-17.png" alt="2015-05-28_16-35-17" width="1294" height="733" loading="lazy"></a>
</figure>



<figure data-restored-image="voxel-twinstick-voxefire-3">
  <a href="{{ '/assets/img/blog/restored/2015-05-30_07-35-05.png' | relative_url }}"><img src="/assets/img/blog/restored/2015-05-30_07-35-05.png" alt="2015-05-30_07-35-05" width="1634" height="916" loading="lazy"></a>
</figure>


## Archive notes (2026)

The screenshots expand on the post's central performance tradeoff. One view shows a blocky arena floor and structures with large openings and damaged-looking geometry. Another captures a character and colorful enemies inside a tiled environment, with an on-screen frame-time and FPS readout. These are development captures rather than a controlled benchmark.

The original account is particularly useful because it identifies the target hardware (Amazon Fire TV), notes that some art came from Twitch viewers, and distinguishes generally smooth play from the hitching caused by bursts of destruction. It's an early example of the recurring problem in voxel games: the world can be cheap to render until a lot of it changes at once.
