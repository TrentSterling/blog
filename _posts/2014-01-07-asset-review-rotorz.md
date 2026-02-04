---
title: "Asset Review: Rotorz Tile System"
date: 2014-01-07
categories: [devblog]
tags: [unity, 2.5d, 3d, cubes, playmaker, tiles]
description: "Review of Rotorz Tile System ($55) - the 'Photoshop of level editors' for Unity tile-mapped games."
---

I'm doing a short bit of writing about the assets I've purchased in the Unity Asset Store.

Today we're comparing tilemappers. I've only had YouTube videos and other reviews to go with, so I waited a while before finally purchasing...

## Rotorz Tile System - $55

- Asset Store: [https://www.assetstore.unity3d.com/#/content/3344](https://www.assetstore.unity3d.com/#/content/3344)
- Developer: [http://rotorz.com/](http://rotorz.com/)

Rotorz is surely the best choice when it comes to tile-mapped games. I've been watching this asset a bit on YouTube, and I've decided to pick it up after wasting too much time on my own system.

## Usability

I saw that in recent versions, corner tiles can be configured to rotate automatically. Before, you needed 4 separate prefabs with rotations applied. The setting is called Rotational Symmetry. This lets you add a single corner piece, and Rotorz will handle the 4 rotations required.

Rotorz has what my previous tile system attempts completely failed at. A great UI. Before I literally had a basic prefab array, but now I have amazing icons with preview images of the brushes that I want to use. There are even scripts included to use Rotorz as a live level editor. Assuming your game is grid based, you can now place objects and walls ingame with almost no code.

I also really like the keyboard shortcuts, like using `<` or `>` to rotate tiles, and `B` for brush. The editor feels like it is a part of the default Unity editor, and keys are easy to memorize and make 'sense'.

Rotorz supports sideways and top-down style tilesets. You can even use multiple layers! You can stack 3 tile systems on top of each other, and press PAGEUP and PAGEDOWN to cycle through them. It also has a photoshop-like layer view, where you can turn layer visibility on or off.

## Tools

There's a rectangle tool, a line tool, and a paint bucket, along with a few other tools, like randomization or cycling between presets. This lets you click an object to cycle through its variations, or pick one randomly. Perfect for trees. It's really great for quickly putting levels together, and even does great prop placement. You can set up manual offsets per object after setting up a level on the grid.

I feel like I'm going to overuse this saying, but it's the **"Photoshop of level editors"**.

## Optimization

Rotorz optimizes box colliders, merges static meshes (for lower draw call count!), and is really just too amazing to describe. The performance after optimization/stripping is unbeatable. You end up with optimized performance as if you merged all your meshes in a 3D modeling program.

Something that I must mention here is that I already atlas all my meshes/textures. This helps the chunk system in Rotorz merge things into 1-2 drawcalls. If you're using many different meshes, without atlasing, you might not get such a performance increase from the chunk system.

## PlayMaker Support

Rotorz has PlayMaker support. The repository on bitbucket contains the PlayMaker actions to integrate with Rotorz. This makes setting up a complete level editor easy. I was able to make a fully featured editor, with drag/drop, rotations, painting of tiles, and multiple grids, in a single day.

I'll be doing a review on PlayMaker soon too.

## Wish List

Really, the only thing I've seen from other tilemappers is a "plops" system, which gives you a ghost preview of what objects you're placing - like a brush does, but can place objects off grid. In a topdown RPG, you might want to "plop" down some pots or vases, using raycasts from the mouse against the map to determine placement.

However, with Rotorz, you're pretty much grid locked. Even with separate grids, you're shooting yourself in the foot.

Also, Undo doesn't seem to work. That sucks.

But seeing as you can't undo, wouldn't a plop system be easy to integrate? DO EEET.

**Conclusion: 5/5 stars. Amazing asset. Does everything it is supposed to. All I want is undo and plops.**
