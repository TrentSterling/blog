---
title: "FishNet-EOS-Native v1.0 Released!"
date: 2026-02-02
categories: [devblog]
tags: [EOS, FishNet, Multiplayer, Networking, Open Source, Unity]
description: "Released my EOS transport for FishNet - direct SDK integration, no middleware."
image: "/assets/img/blog/fishnet-eos-native.png"
---

![FishNet-EOS-Native](/assets/img/blog/fishnet-eos-native.png){: .align-center }

Just shipped **FishNet-EOS-Native v1.0**!

[GitHub Repo](https://github.com/TrentSterling/FishNet-EOS-Native) | [v1.0.0 Release](https://github.com/TrentSterling/FishNet-EOS-Native/releases/tag/v1.0.0) | [Full Docs](https://tront.xyz/FishNet-EOS-Native/)

## What Is It?

An EOS (Epic Online Services) transport for FishNet that bypasses the PlayEveryWare middleware entirely. Direct C# SDK integration.

## Why?

The existing EOS solutions for Unity multiplayer all go through PlayEveryWare's plugin, which adds complexity and potential points of failure. I wanted something leaner.

## Features

- Zero-config setup (one component auto-wires everything)
- P2P transport with relay fallback
- 4-digit lobby codes (easy to share)
- Packet fragmentation (handles EOS's 1170 byte limit)
- Voice chat with 3D spatial audio
- Host migration
- Cloud storage, leaderboards, achievements
- Debug panels (F1, F3, F4)

## The Hard Parts

Packet fragmentation was a nightmare. EOS has a hard limit on packet size that's smaller than what FishNet sometimes wants to send. Had to implement reliable fragmentation and reassembly.

Host migration in P2P is also tricky. The lobby layer survives migration but the game state needs careful handling.

## What's Next

- Mirror transport port
- PurrNet transport port
- More documentation

If you're doing Unity multiplayer with FishNet and want EOS integration, check it out. MIT licensed, free to use.
