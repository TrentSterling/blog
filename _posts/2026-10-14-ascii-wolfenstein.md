---
title: "ASCII Wolfenstein"
date: 2026-10-14 15:16:48 +0000
categories: [devblog, Projects]
tags: [Games]
description: "This is a little Wolfenstein-style raycaster, except the whole view is text. WASD moves you around and Q/E turns the camera."
image: "https://tront.xyz/games/media/ascii-wolfenstein-2025.webp?v=2b3e83b17b71"
---

This is a little Wolfenstein-style raycaster, except the whole view is text. WASD moves you around and Q/E turns the camera. Walls are drawn as columns of characters, with distance projected along the camera direction so they don't get that fisheye curve.

It's vanilla JavaScript writing a character grid into the page. This was the earlier ASCII experiment; VibeMaze takes the idea further with actual triangles and a depth buffer.

[Project page](https://tront.xyz/wolfenstein)

<video class="embed-video file" controls playsinline preload="none" poster="https://tront.xyz/games/media/ascii-wolfenstein-2025.webp?v=2b3e83b17b71" src="https://tront.xyz/games/media/ascii-wolfenstein-2025.mp4?v=8f19eb4c5130"></video>
