---
title: "LD34: Executing JS during runtime in Unity!"
date: 2015-12-18
categories: [devblog, Projects]
tags: [3D, CSharp, Programming, Scripting, Unity]
description: "Ludum Dare 34 entry where I added multiplayer AND modding support to a game jam project. Scope creep at its finest."
image: "/assets/img/ingamescripting.jpg"
---

<figure data-restored-image="ld34-js-runtime-unity-0">
  <a href="{{ '/assets/img/blog/restored/2015-12-13_02-53-57.png' | relative_url }}"><img src="{{ '/assets/img/blog/restored/2015-12-13_02-53-57.png' | relative_url }}" alt="2015-12-13_02-53-57" width="1920" height="1080" loading="lazy"></a>
</figure>

Started this project during Ludum Dare 34. Was supposed to be a fairly simple game. Streamed the development from start to finish on Twitch.

During Twitch streams, I typically take advice from the chat. This can sometimes be really distracting, and is probably a bad idea in general. Everyone who watches the stream wants to see you create the most amazing thing in the world, and feature/scope creep becomes a serious issue quickly.

## Scope Creep

Ludum Dare is a 48/72 hour game jam, so adding **Multiplayer** is a really stupid idea. Did it anyway.

Adding some kind of **modding support** so that the players can break the game and do all sorts of stuff is also a pretty silly idea. Did that too.

## Current State

The game is turning into a sandbox of some kind. Something like Garry's Mod, with voxelated blocky models that look like something out of Minecraft.

## Technical Learnings

Through all this, I learned a lot about reflection and how Unity's version of JS is sorta weird. Hoping to turn this in-game console into an asset. Just needs cleanup and to be generic enough for others to use.

<figure data-restored-image="ld34-js-runtime-unity-1">
  <a href="{{ '/assets/img/blog/restored/consoleworks.jpg' | relative_url }}"><img src="{{ '/assets/img/blog/restored/consoleworks.jpg' | relative_url }}" alt="consoleworks" width="1024" height="576" loading="lazy"></a>
</figure>

It even runs on Android!
