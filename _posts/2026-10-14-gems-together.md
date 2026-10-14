---
title: "Gems Together"
date: 2026-10-02 15:16:48 +0000
last_modified_at: 2026-10-14 15:16:48 +0000
categories: [devblog, Projects]
tags: [Games]
description: "I made a multiplayer match-three game for Jennifer. It’s called Gems Together, and everyone who opens the page ends up playing on the same board."
image: "https://tront.xyz/games/media/gems-together-2026.webp"
---

I made a multiplayer match-three game for Jennifer. It’s called Gems Together, and everyone who opens the page ends up playing on the same board. You can see the other cursors moving around and grabbing gems while you’re making your own matches. There’s also a private room code if you just want to play together without the rest of the internet joining in.

Then you get a few cascades going and the board starts blowing itself up. Bigger matches make blast gems and prisms, the combo counter climbs, and the scenery changes around the cabinet while you keep playing. Even the gem sounds follow the music’s key. The cabinet, jewels and menus are all drawn on the GPU, packed into one HTML file. Here’s a bit of it running.

<figure><video class="embed-video file" controls playsinline poster="https://tront.xyz/games/media/gems-together-2026.webp" preload="none" src="https://tront.xyz/games/media/gems-together-2026.mp4"></video><figcaption>Gems Together.</figcaption></figure>

## The board keeps going

The scenery changes on the soundtrack's downbeat, without stopping the game to load the next stage. Each world has its own key and chord progression. The gems and celebrations follow along with that, and Resonance pulls the music into a softer filter before opening it back up for the payout.

There's an announcer now too, with separate voice choices and volume. You can turn him off and keep the music and gem sounds. The big combo flashes have their own setting as well.

![Gems Together in Dawn Shallows, with the shared board, score panel and cabinet controls.](https://tront.xyz/games/media/gems-together-2026.webp)

You can keep matching in Endless, or switch to timed games, a 30-move challenge, puzzles and daily challenges. Journey remembers the stages you've visited. There's a best-run ghost, photo mode and high fives for the other people on the board. Showcase lets it play itself if you just want to watch the cascades.

Co-op is peer-to-peer over WebRTC through Trystero. Scores and settings stay on your device. The renderer uses WebGPU, with a WebGL2 fallback, and all that cabinet furniture and interface lettering gets drawn with the jewels. It's quite a lot of stuff around a board full of gems.

[Play Gems Together](https://tront.xyz/gemstogether/) · [Source](https://github.com/TrentSterling/gemstogether)
