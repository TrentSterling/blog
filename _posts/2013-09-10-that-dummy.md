---
title: "That Dummy - A FlashPunk Collaboration"
date: 2013-09-10
categories: [DevBlog, Projects]
tags: [FlashPunk, GameDev, Indie, Physics, Platformer, Puzzle]
description: "A puzzle platformer collaboration using FlashPunk and Nape, featuring physics-based gameplay, dynamic lighting, and ingame scripting."
image: "/assets/img/lightrays.png"
---



<iframe src="//www.youtube.com/embed/vVkjyptJG_0" frameborder="0" allowfullscreen></iframe>



[![oldlevel1](/assets/img/oldlevel1.png)](/assets/img/oldlevel1.png)

This game never got a proper name, so we had always just called it “That Dummy Game”. This was a collaboration work between me and Andrew Sandifer. He had come to me with a prototype that was pretty well off. It was a FlashPunk game, and he had done a lot of art for it already. It was a simple puzzle platformer where the goal was to get to the door.

It had everything from portals to boxes to doors. Switches, levers, lights. It really had a lot of content. It wasn’t finished, but it already had a good feel.

[![For now it's being referred to as 'That Game'](/assets/img/badguys.png)](/assets/img/badguys.png)

## Adding More
However, Andrew wanted more tech for the game. He was working on pushable boxes, and the math just wasn’t playing nicely. So he told me to add Nape for a physics engine. After a ton of tweaking, the character movement felt right, and boxes were easy to push around. We could now change gravity, and do all sorts of fun stuff. Then I added some lighting effects. Simple radial gradient lights. It gave the game a much better atmosphere, and even changed the way the game was played. On some levels, you had to activate lights to see the path. We had a simple circuitry system that allowed buttons and switches to control multiple things from lights to doors.

[![lightrays](/assets/img/lightrays.png)](/assets/img/lightrays.png)

However, after adding lighting, I ran into some issues. Andrew had set up the project to use OGMO for its level editor, but that made it really hard to position and size lights. I told him that I wanted to add a level editor, and he told me that the game needed to remain simple, and didn’t need an editor. I went ahead and got started on it anyway.

[![neededitor](/assets/img/neededitor.jpg)](/assets/img/neededitor.jpg)

The good thing about having everything running through Nape is that it was really easy to introduce new entities into the system. And once the editor was underway - the game was becoming what I wanted it to be. The problem is - Andrew wanted something else, and we slowly lost contact as development moved on. I kept focusing on the tech. Performance and effects.

[![manyobjects](/assets/img/manyobjects.jpg)](/assets/img/manyobjects.jpg)

I moved from simple light gradients to shadow casting ray traced baked shadows, I added a fog layer, a foreground and background parallax layer, I added (Asynchronous) A\* pathfinding, I added blood effects and bullets. I added fake threading. I added a slow motion effect, real-time fullscreen post-processing. You can adjust saturation, brightness, and hue. I added ripple effects and an underwater mode. I also added a sound system that allowed me to slow down or speed up any sound effect in the game.

[![effects](/assets/img/effects.jpg)](/assets/img/effects.jpg)

Get this! I even added ingame scripting. You could write and compile AS3 IN THE GAME!

[![ingamescripting](/assets/img/ingamescripting.jpg)](/assets/img/ingamescripting.jpg)

This game just needed some dialogue and some enemies.

[![sepiacolortest](/assets/img/sepiacolortest.png)](/assets/img/sepiacolortest.png)

## Artwork
I decided it was a good time to add turrets as an enemy. I asked Andrew for a turret sprite - but he never got back to me. I opened Photoshop and drew a poor-quality sprite myself. I asked Andrew for a Rocket sprite, and never got a response. It was obvious to me that after taking over the project - Andrew no longer wanted to work on it. I added a 2nd tilesheet- some more of my own artwork, and was feeling pretty good about releasing this game on my own.

[![turret](/assets/img/turret.jpg)](/assets/img/turret.jpg)

## Bugs
During gameplay - physics-driven characters aren’t always bug-free. I had gotten my character to what I considered perfect, but there was an occasional bug where if you walked against a wall and jumped, you didn’t jump as high as you should. I made sure the character had no friction. I frantically tried many different hacks, and then I talked to Deltaluca, the author of the Nape physics engine. He told me that it was a bug that couldn’t really be avoided without using Bruteforce collision detection. I tried bruteforce- and it worked! The bug was gone.

The problem with bruteforce collision, is that it is VERY slow. My performance was cut 90%. A perfectly smooth game was now jittery with too many active objects - and there was no simple way to make the objects sleep. Bruteforce kills the sleeping ability of rigidbodies.

Now I asked Deltaluca what I could do, and he told me to switch to NewNape - a full rewrite of his physics engine. I had known about the newer version, but it was so radically different that I didn’t want to make the switch. Everything was different. Collision response, callbacks, masks, the new API was totally different. What could I do?

So I imported NewNape- and saw a few hundred errors. All my old code was going to need to be rewritten for this new physics engine. The game was highly coupled with OldNape.

I tried for a few days to fix things up and get the game working, but with no support, everything broken, I gave up.

## 64 Days Later
Each build I sent to Andrew was dated. I was on day 64. He wanted the game done by Day 20. Day 64 is reflected in the video above.

This game wasn’t completed because of some bugs in player movement that couldn’t be fixed without a massive rewrite. Halfway through the rewrite- things felt impossible. If I pick up Flash again, this game might get completed, and it’s possible that this game will be revived in Unity. Only time will tell.





### Game Overview

This game was close to completion but ultimately left unfinished. Here’s a breakdown of its features from my perspective:

- **Engine & Physics**: I used a custom physics engine, where objects weren’t locked to a grid and supported multiple layers (foreground, background, fog). This allowed for more dynamic interactions between game elements.

- **Lighting & Effects**: The lighting was pre-baked into the map data. I added options to adjust hue, saturation, brightness, and contrast, which allowed for dreamlike color filter effects. There were also blood effects, where static objects would stain with blood particles, though dynamic objects were unaffected by them.

- **Physics Interactions**: I implemented a variety of physics objects and interactions, like objects being moved by fans or knocked around. The physics also impacted things like elevators and projectiles. Collisions with objects triggered various effects, including blood or death.

- **Editor Features**: I developed a live editor where players could modify the game while playing. There was also an object editor for adjusting physics properties like mass and material, influencing how objects interacted and how sounds were triggered.

- **Gameplay**: The core gameplay loop was never fully realized. While there were basic player movements (running, jumping, taking damage), many key gameplay features were incomplete. Hazards like spikes, turrets, and missiles were present but not fully functional.

- **Limitations**: The game showed potential as a tech demo but was missing a story, characters, and a solid gameplay loop. Several systems, like the turret pathfinding, were unfinished and caused bugs. The overall experience felt incomplete.

- **Development Tool**: I originally built the game in Flash and considered porting it to Unity, but I found Unity’s 2D capabilities couldn’t replicate the custom, optimized experience that Flash offered.

- **Final Thoughts**: Despite being technically strong, the game wasn’t finished. I’ve thought about revisiting it, but I’m hesitant about going back to Flash or moving to Unity due to time constraints and the limitations of Unity’s 2D tools.

### Sentiment

The comments I received were positive and supportive. Many were curious about the potential revival of the game, with some offering help and others asking to test it. Everyoned seemed to have an interest in seeing the game either completed or rebooted, possibly in Unity. If I ever do go back to it, I'll have to find another artist.
