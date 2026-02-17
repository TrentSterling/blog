---
title: "CraftMine: A 6,820-line vibe-coded Minecraft clone in one HTML file"
date: 2026-02-09
categories: [Projects, devblog]
tags: [Three.js, JavaScript, voxel, vibe-coding, gamedev, WebGL, open-source, procedural-generation]
description: "My nephews wanted Minecraft with guns. I pointed Claude at a blank HTML file and we vibe-coded a 6,820-line Minecraft clone with 46 blocks, 36 mobs, 19 weapons, multiplayer, and a BFG 9000."
image:
  path: /assets/img/blog/craftmine.png
  alt: "CraftMine — a vibe-coded Minecraft clone running in the browser"
---

![CraftMine — snowy biome with trees](/assets/img/blog/craftmine.png){: .shadow }

My two nephews were visiting and they wanted to play Minecraft. I don't have Minecraft. What I do have is Claude and a stupid idea. They said "Minecraft but with guns" and I said "alright, let's build it." I opened a blank HTML file, started prompting, and by the end of the day we had a playable voxel game running in the browser. No installs, no accounts, just click and play.

That was supposed to be the end of it. It wasn't.

[**Play it now →**](https://tront.xyz/craftmine/)

## How it started

The first version was maybe 800 lines. Flat terrain, a couple block types, you could place and break blocks. The nephews thought it was cool for about ten minutes, then started requesting features. "Add creepers." "Add a shotgun." "Add lava." "Make it nighttime so zombies spawn." Each request was another Claude prompt, another few hundred lines.

By the time they went home it had caves, biomes, a dozen mobs, and a minigun. I kept going after they left because at that point the project had momentum. Now it's v0.8.0 with multiplayer support and a procedural lo-fi soundtrack.

## The numbers

- **46 block types** — grass, stone, diamond ore, TNT, plus 21 DOOM-themed hell blocks (flesh, bone, skull walls, pentagrams)
- **36 mob types** — from chickens and rabbits to a 300 HP Titan boss that causes earthquakes
- **19 weapons** — diamond sword, shotgun, railgun, BFG 9000, black hole gun, nuke launcher
- **5 biomes** — plains, desert, snow, forest, ocean
- **16x16x128 chunks** with web worker mesh generation
- **P2P multiplayer** with NPC bots and PvP combat
- **1 file**, 0 build steps, ~350KB

![CraftMine — mountain landscape with snowy peaks](/assets/img/blog/craftmine-mountains.png){: .shadow }

## World generation

Six independent simplex noise generators create the terrain. Two handle elevation (mountains at 0.005 frequency, hills at 0.02), one carves 3D caves, one distributes ores, and two more control biome moisture and temperature.

Each biome has its own height profile. Snow biomes get dramatic 40-unit mountain ranges. Oceans flatten to a 5-unit scale around sea level (Y=35). Deserts sit slightly higher with moderate hills. Caves use dual simplex noise blended and thresholded at 0.6 — below Y=10, empty cave space fills with lava instead of air. Ore placement layers by depth: diamond only below Y=16, gold below 32, iron below 64, coal everywhere.

## Chunked rendering with web workers

The world is split into 16x16x128 chunks, each stored as a flat `Uint8Array` (32KB). A thread pool of web workers (sized to `navigator.hardwareConcurrency`) builds chunk meshes asynchronously. Each worker receives the chunk's block data plus its four neighbor chunks' data so it can correctly cull faces at chunk boundaries.

Render distance is 6 chunks — a 13x13 grid of up to 169 active chunks. Three.js frustum culling skips off-screen chunks.

## The mob zoo

The 36 mobs fall into four tiers:

**Passive** (12): Pig, cow, chicken, sheep, rabbit, duck, horse, frog, turtle, penguin, bat, fish. Each has unique traits — sheep are fluffy, rabbits are jumpy, penguins waddle.

**Hostile** (13): Zombies, skeletons, creepers, spiders, slimes, wolves (pack hunters), blazes (flying + ranged), ghosts (transparent + flying), endermen (teleporting, 40 HP). Wolves spawn in packs of 2-4. Bees swarm in groups of 4-8.

**Mini-bosses** (4): King Slime (100 HP, wears a crown), Mega Zombie (80 HP, 2.5x scale), Golem (150 HP, armored).

**Bosses**: Hydra (120 HP, triple fireballs), Dragon (200 HP, flying), and the Titan — 300 HP, 5x scale, causes screen-shaking earthquakes. The nephews specifically requested "a really big guy" and the Titan is what happened.

Hostile mobs spawn at night. During the day you mostly get passive animals with the occasional spider.

![CraftMine — flying over snowy mountains](/assets/img/blog/craftmine-landscape.png){: .shadow }

## The arsenal

The weapon system is where the nephews' influence is most obvious. They wanted guns. They got guns.

**Hitscan**: Laser rifle (instant hit), railgun (penetrates 10 blocks + 6-block explosion), lightning staff (chains to 3 targets), freeze ray.

**Projectile**: Everything has proper ballistics with gravity. The shotgun fires 8 pellets with 0.15 spread. The cluster bomb spawns 6 sub-explosions. The black hole gun creates a 3-second gravitational pull. The BFG 9000 does 100 damage with a 10-block explosion radius. The nuke launcher — 15-block explosion, mushroom cloud, secondary chain reactions.

**Melee**: Diamond sword and chainsaw. The chainsaw fires every 0.1 seconds at 5 damage — it's a blender.

The nephews' favorite combo: nuke launcher a mountain, then freeze ray the crater. Mine: black hole gun into a herd of cows.

## The DOOM layer

Half the block palette (21 blocks) is DOOM-themed: metal floors, rusty grates, flesh walls, blood, bone, skull walls, hell brick, computer terminals, nuke barrels, pentagrams, corruption, ash. Several are emissive (they glow). The nuke barrel is explosive.

This started as "Minecraft with guns" and somewhere around block #25 it became a Minecraft-DOOM crossover. The nephews approved.

## Procedural lo-fi soundtrack

CraftMine now has a built-in music system powered by [lofigen](https://tront.xyz/lofigen/) — a procedural lo-fi hip-hop generator I built separately. The game passes its world seed to the music generator, so each world has a unique consistent soundtrack. Pure Web Audio synthesis, no audio files loaded. The nephews wanted "chill music like those YouTube streams" while they play, and seeded generation means two people in the same world hear the same track.

## Multiplayer

The latest version (v0.8.0-mp) adds P2P multiplayer. Players can join lobbies, see each other, fight mobs together or PvP. Weapon effects and explosions sync between players. There's even NPC bot support for when you want to populate a world without friends online. Entity positions sync with deterministic shirt colors so each player looks different.

## What makes this interesting

It's not the most polished voxel engine. But it's **one file** that you can open in any browser and immediately play a game with procedural terrain, caves, biomes, 36 mobs with AI, 19 weapons with physics, day/night, weather, multiplayer, and boss fights.

No `npm install`. No webpack. No React. Just a `<script type="module">` tag, Three.js from a CDN, and 6,820 lines of vibes. I prompted, Claude wrote, and my nephews stress-tested. That's the pipeline.

## Play it

**[tront.xyz/craftmine](https://tront.xyz/craftmine/)** — click to start, WASD to move, mouse to look, scroll to switch weapons, C for creative mode, ESC to pause.

