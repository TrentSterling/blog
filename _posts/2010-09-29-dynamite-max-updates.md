---
title: "Dynamite Max Updates"
date: 2010-09-29
categories: [DevBlog]
tags: [Dynamite Max]
description: "Dynamite Max is a 3D Flash game developed using Papervision3D and Box2D, featuring physics-driven puzzles, explosive gameplay, and an XML-powered level editor."
image: "assets/img/dynamitemaxintro.jpg"
---


<iframe width="840" height="480" src="//www.youtube.com/embed/9jyXvl8VUQA" frameborder="0" allowfullscreen="allowfullscreen">&nbsp;</iframe>



> I've added additional summary here in 2025!
{: .prompt-tip }


## About Dynamite Max

Dynamite Max is a 3D Flash game developed by Trent Sterling during the early days of browser-based 3D gaming. Built using Papervision3D and Away3D before Stage3D became mainstream, the game showcased advanced rendering techniques for its time. It integrates Box2D physics to create interactive environments, enabling dynamic explosions, destructible terrain, and physics-driven puzzles.

## Features

- **3D Flash Gameplay:** Utilizes Papervision3D to render immersive levels within a web browser.
- **Physics-Based Puzzles:** Box2D integration allows for realistic object interactions and chain reactions.
- **Explosive Mechanics:** Players strategically use dynamite to clear paths and defeat obstacles.
- **XML-Powered Level Editor:** Fully custom level creation using an in-game editor that saves and loads levels via XML files.
- **Retro Charm:** A nostalgic throwback to early web-based 3D gaming.

## The XML-Powered Level Editor

One of the most unique aspects of Dynamite Max was its **fully in-game level editor**, which allowed players to create, save, and share their own custom levels. Instead of relying on a database or server-side storage, the entire system was **driven by XML files**, a classic old-school approach before JSON took over as the web standard.

### How It Worked
- **Building Levels:** The editor allowed placement of terrain, objects, enemies, and dynamite triggers directly within the game.
- **Saving to XML:** When a level was saved, all objects and their properties were serialized into an XML file. This included object positions, physics properties, and event triggers.
- **Loading from XML:** On startup, the game would parse XML files to reconstruct levels dynamically, ensuring flexible level design.
- **Sharing Levels:** Players could manually share their XML files, letting others load and play custom creations.

This system, while simple by modern standards, was a clever workaround for web games of the time—no databases, no cloud storage, just raw XML magic.

## Development Insights

Dynamite Max was built during a time when Flash was the dominant technology for web games. The project pushed the boundaries of what was possible in a browser, showcasing creative problem-solving in **3D rendering, physics simulation, and data persistence using XML**. It’s a perfect example of the kind of scrappy, innovative workarounds that defined indie game development in the pre-WebGL era.

Check out the gameplay video above for a look at how Dynamite Max plays in action! (from 2010 LOL)
