---
title: "MonkePortals"
date: 2023-09-15
categories: [devblog]
tags: [Gorilla Tag, Multiplayer, Portals, Quest, Unity, VR]
description: "VR multiplayer game - Gorilla Tag movement meets Portal physics."
image: "/assets/img/blog/monke_slide.jpg"
---

![MonkePortals](/assets/img/blog/monke_slide.jpg){: .align-center }

**MONKE PORTALS** - Reject humanity. Master momentum.

[monke.tront.xyz](https://monke.tront.xyz/)

You're a hyper-intelligent primate test subject with portal-generating gloves. Swing through test chambers, shoot portals, preserve momentum, don't die.

## Core Features

- **Arm-based locomotion** - No joysticks, no teleport gimmicks. Pure arm-swinging movement like Gorilla Tag.
- **Physics-based portals** - Momentum is preserved. Fling yourself across the map.
- **Multiplayer modes** - Tag, infection, and more
- **Test chamber trials** - Laboratory setting with puzzles and challenges
- **Cosmetic customization** - Look fresh while you fling
- **High-skill ceiling** - Speedrunners welcome

## Tech

Ruthlessly optimized for Quest standalone. Targeting 120Hz with aggressive culling and efficient portal rendering. This was the hardest part - portals that render "through" to another location are expensive, especially on mobile VR hardware.

Using FishNet for multiplayer netcode. The same transport work from FishNet-EOS-Native applies here.

## Status

Active development. The core loop is solid - the "just one more run" feeling is there. Adding more content and polish.

Join the [Discord](https://discord.gg/0hyoWZyM6y7kkFCN) if you want to playtest.
