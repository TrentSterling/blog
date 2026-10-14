---
title: "Makeup Beach Sudoku"
date: 2026-10-14 15:16:48 +0000
categories: [devblog, Projects]
tags: [Games]
description: "I made a Sudoku game using makeup icons for the nine values. Pick an icon from the palette and fill in the board."
image: "https://tront.xyz/games/media/makeupbeachsudoku-2025.webp?v=71ec14750528"
---

I made a Sudoku game using makeup icons for the nine values. Pick an icon from the palette and fill in the board. The usual rules still apply: one of each in every row, column and box.

If your choice conflicts with one of the given icons, that icon jiggles to show you where the problem is. The layout is aimed at phones, and all the icons are drawn from shapes in code.

It's built in Phaser 3. To make a board, the generator fills the diagonal boxes first, recursively fills the rest, then removes 48 entries for you to solve.

[Project page](https://tront.xyz/sudoku)

<video class="embed-video file" controls playsinline preload="none" poster="https://tront.xyz/games/media/makeupbeachsudoku-2025.webp?v=71ec14750528" src="https://tront.xyz/games/media/makeupbeachsudoku-2025.mp4?v=908dd623901e"></video>
