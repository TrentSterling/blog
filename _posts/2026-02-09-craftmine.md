---
title: "CraftMine: A 6,820-line vibe-coded Minecraft clone in one HTML file"
date: 2026-02-09
categories: [Projects, devblog]
tags: [Three.js, JavaScript, voxel, vibe-coding, gamedev, WebGL, open-source, procedural-generation]
description: "I vibe-coded a complete Minecraft clone in a single HTML file — 46 blocks, 36 mobs, 19 weapons, 5 biomes, caves, day/night cycle, and a BFG 9000. Here's how it works."
image:
  path: /assets/img/blog/craftmine.png
  alt: "CraftMine — a vibe-coded Minecraft clone running in the browser"
---

![CraftMine — a vibe-coded Minecraft clone running in the browser](/assets/img/blog/craftmine.png){: .shadow }

I wanted to see how far vibe coding could push a single HTML file. The answer: pretty far. CraftMine is a complete Minecraft-style voxel game — procedural terrain, caves, biomes, mobs, weapons, day/night cycle, weather — all in 6,820 lines of JavaScript with zero build tools. The only external dependency is Three.js from a CDN.

[**Play it now →**](https://tront.xyz/craftmine/)

## The numbers

- **46 block types** — grass, stone, diamond ore, TNT, plus 21 DOOM-themed hell blocks (flesh, bone, skull walls, pentagrams)
- **36 mob types** — from chickens and rabbits to a 300 HP Titan boss that causes earthquakes
- **19 weapons** — diamond sword, shotgun, railgun, BFG 9000, black hole gun, nuke launcher
- **5 biomes** — plains, desert, snow, forest, ocean
- **16×16×128 chunks** with web worker mesh generation
- **1 file**, 0 build steps, ~350KB

## World generation

Six independent simplex noise generators create the terrain. Two handle elevation (mountains at 0.005 frequency, hills at 0.02), one carves 3D caves, one distributes ores, and two more control biome moisture and temperature.

Each biome has its own height profile. Snow biomes get dramatic 40-unit mountain ranges. Oceans flatten to a 5-unit scale around sea level (Y=35). Deserts sit slightly higher with moderate hills. Forests match plains geometry but spawn trees at 2× density.

Caves use dual simplex noise at different frequencies (0.05 and 0.03), blended and thresholded at 0.6. Below Y=10, empty cave space fills with lava instead of air. Ore placement layers by depth: diamond only below Y=16, gold below 32, iron below 64, coal everywhere.

Trees are 5-7 blocks tall with radius-2 canopies. In snowy biomes, leaf blocks get snow caps. Deserts spawn cacti (2-5 blocks tall) instead of trees.

## Chunked rendering with web workers

The world is split into 16×16×128 chunks, each stored as a flat `Uint8Array` (32KB). A thread pool of web workers (sized to `navigator.hardwareConcurrency`) builds chunk meshes asynchronously. Each worker receives the chunk's block data plus its four neighbor chunks' data so it can correctly cull faces at chunk boundaries.

Render distance is 6 chunks — a 13×13 grid of up to 169 active chunks. Three.js frustum culling skips off-screen chunks. The chunk loading loop runs every frame, prioritizing chunks closest to the player.

## The mob zoo

The 36 mobs fall into four tiers:

**Passive** (12): Pig, cow, chicken, sheep, rabbit, duck, horse, frog, turtle, penguin, bat, fish. Each has unique traits — sheep are fluffy, rabbits are jumpy, penguins waddle, fish swim.

**Hostile** (13): Zombies, skeletons, creepers, spiders, slimes, wolves (pack hunters), blazes (flying + ranged), ghosts (transparent + flying), endermen (teleporting, 40 HP, fast). Wolves spawn in packs of 2-4. Bees swarm in groups of 4-8.

**Mini-bosses** (4): Giant Slime, King Slime (100 HP, wears a crown), Mega Zombie (80 HP, 2.5× scale), Golem (150 HP, armored).

**Bosses** (4+): Hydra (120 HP, multi-headed, ranged), Dragon (200 HP, flying, ranged), and the Titan — 300 HP, 5× scale, 15 damage per hit, causes earthquakes. Good luck.

Hostile mobs spawn at night (the 0.75–0.25 time window). During the day you mostly get passive animals with the occasional spider or slime.

## The arsenal

The weapon system is where things get unhinged. There are three categories:

**Hitscan**: Laser rifle (0.08s fire rate, instant hit), railgun (penetrates 10 blocks + 6-block explosion), lightning staff (chains to 3 targets), freeze ray.

**Projectile**: Everything has proper ballistics with gravity. The shotgun fires 8 pellets with 0.15 spread. The cluster bomb spawns 6 sub-explosions. The black hole gun creates a 3-second gravitational pull. The BFG 9000 does 100 damage with a 10-block explosion radius. The nuke launcher — 15-block explosion, 5-second cooldown.

**Melee**: Diamond sword and chainsaw. The chainsaw fires every 0.1 seconds at 5 damage — it's a blender.

Each weapon type gets a unique crosshair (circle for guns, diamond for laser, pulsing ring for railgun).

## Day/night and weather

The day/night cycle runs on a 600-tick loop. Sky color interpolates through four phases: dark blue midnight → orange sunrise → bright blue noon → orange sunset → back to midnight. Ambient light swings between 0.2 and 0.6 intensity. A directional sun orbits east to west.

Weather is a togglable rain system using CSS animation — a repeating linear gradient that scrolls downward. Random weather changes can also trigger during gameplay.

## The DOOM layer

Half the block palette (21 blocks) is DOOM-themed: metal floors, rusty grates, flesh walls, blood, bone, skull walls, hell brick, computer terminals, nuke barrels, pentagrams, corruption, ash. Several are emissive (they glow). The nuke barrel is explosive.

This started as a Minecraft clone and somewhere around block #25 it became a Minecraft-DOOM crossover. I'm not sorry.

## What makes this interesting

It's not the most polished voxel engine. It's not the fastest. But it's **one file** that you can open in any browser and immediately play a game with procedural terrain, caves, biomes, 36 mobs with AI, 19 weapons with physics, day/night, weather, and a boss fight.

No `npm install`. No webpack. No React. Just a `<script type="module">` tag, Three.js from a CDN, and 6,820 lines of vibes.

This is what vibe coding looks like when you let it run. Not every line is elegant. But every line ships.

## Play it

**[tront.xyz/craftmine](https://tront.xyz/craftmine/)** — click to start, WASD to move, mouse to look, scroll to switch weapons, ESC to pause.

**Source:** [GitHub](https://github.com/TrentSterling/CraftMine)
