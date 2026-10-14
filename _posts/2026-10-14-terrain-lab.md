---
title: "Terrain Lab"
date: 2026-09-17 15:16:48 +0000
last_modified_at: 2026-10-14 15:16:48 +0000
categories: [devblog, Projects]
tags: [Games]
description: "Terrain Lab lets you dig into the landscape, pile more ground on top, smooth it out or flatten an area."
image: "https://tront.xyz/games/media/terrain-lab-2026.webp?v=5b059cefd15e"
---

Terrain Lab lets you dig into the landscape, pile more ground on top, smooth it out or flatten an area. You can plant a forest, or wake up a volcano and see what happens to the place.

I used Surface Nets to turn a density field into the terrain you see. The brush changes that density directly, then rebuilds the affected cells in the same frame. So when you're sculpting, the ground changes right under the brush.

Generating more of the world happens separately in a pool of Web Workers. Buffers get passed between them, and predictive streaming gets terrain ready as you move around. The chunks share world-space samples and samples just beyond their edges, with consistent rules for which chunk owns an edge. That keeps the neighboring pieces lined up.

You can save a world as JSON, export the loaded terrain as an OBJ, or save a playable HTML snapshot. Three.js is embedded in the single-file build.

[Project page](https://tront.xyz/terrainlab/)

<video class="embed-video file" controls playsinline preload="none" poster="https://tront.xyz/games/media/terrain-lab-2026.webp?v=5b059cefd15e" src="https://tront.xyz/games/media/terrain-lab-2026.mp4?v=324c8f602170"></video>
