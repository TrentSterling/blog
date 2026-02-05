---
title: "Voxel Project Updates"
date: 2013-12-15
categories: [DevBlog]
tags: [2.5D, 3D, Android, Art, Batching, Indie, Mobile, Qubicle, Unity, Voxel]
description: "I’ve been posting to G+, Facebook, and Twitter with some short snippets and screenshots. It’s probably good to mirror that content here, even if it’s..."
image: "/assets/img/blog/wp/isometriclook.png"
---

I’ve been posting to G+, Facebook, and Twitter with some short snippets and screenshots. It’s probably good to mirror that content here, even if it’s not a ‘legit’ post.

Things look kinda neat in isometric view!

![isometriclook](/assets/img/blog/wp/isometriclook.png)

After a bit of discussion about our Voxel RPG, we decided to finish something that’d come out a little faster.

![bomberscreeny](/assets/img/blog/wp/bomberscreeny.jpg)

I had previously done a bomberman game, and had tried to revive the project with multiplayer. This will be the 3rd time we revive this project, and this time we’re going to have all the art/level editing stuff out of the way.

![Unity-2013-09-24-14-33-56-69](/assets/img/blog/wp/Unity-2013-09-24-14-33-56-69.gif)

Using the same system/engine as the RPG, so things have been progressing quite well.

![E8l4JxY](/assets/img/blog/wp/E8l4JxY.gif)Working out some pathfinding. Grid based level editor helps. In-game level editor means it needs be perfect.

![batchingbeautiful](/assets/img/blog/wp/batchingbeautiful.gif)

Had to attack batching a bit today. Set up an awesome script that works with my in-game level editor. So far I can keep the scene under 3 draw calls (Under 10 with plenty of lighting)!

Batching sure does amazing things! But boy do I need to work on my atlases! D=

![fastpathing](/assets/img/blog/wp/fastpathing.gif)

Weird wiggling resolved. Pathing is instant. Staggering updates, maybe 1 per second, will make the AI behave a bit smoother.

Probably time to call it a night. That was a lot of progress for 1 day.

![whatthe](/assets/img/blog/wp/whatthe.jpg)

Sometimes I just have to sit back and say….wat.

![multnotdiv](/assets/img/blog/wp/multnotdiv.jpg)

I derped. Multiply! Don’t divide.

![uhh](/assets/img/blog/wp/uhh.jpg)

Guhh…. Thats cute.

![vertexlightingunshaded](/assets/img/blog/wp/vertexlightingunshaded.jpg)

I still need to factor in the dot product of the vertex normals – but infinite lights in the level editor is working! Processing each vertex takes a little time – so it’ll be a final step to saving a map.

This is my cheap way to get lighting on mobile without limiting the level editor. 0 extra draw calls here.

My basic idea is to get around some of the limitations of Unity on mobile. I plan to have the level editor in the hands of the players, so I need to be able to light user-generated content.<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[0].[1]" /><br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[0].[2]" />This would be fine if it wasn’t for Unity’s hard limits on lights/shaders. (Which are good to have really)<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[1]" /><br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[2]" />Unity doesn’t allow you to bake shadows at runtime – and that’d be too much for mobile anyway, so this is my compromise.<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[4]" /><br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[5]" />Baking lighting to the vertex colors whenever you save a level. Its not fast enough to be used in real time, so the lighting is still static, but it lets users set up lit scenes with no negative performance impacts from the number of lights.<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[7]" /><br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868502}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[8]" />In most cases I’d use something like a fancy deferred renderer, but we’re targeting mobile, so thats out of the question. And because the levels are user generated, this was the only way to bake lighting without driving the draw-calls through the roof.

Also, depending on performance tests, I’m seriously considering baking ambient occlusion data into the vertex colors too. <br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868520}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[0].[1]" /><br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868520}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[0].[2]" />Shoot about 30-100 random rays from each vertex, add up the hits, darken as we go. That way objects can self-shadow the environment a little. It surprises me how versatile vertex colors can be. For mobile- its pretty great.<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868520}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[1]" />
 ![1403736_10152102776272905_1970376136_o](/assets/img/blog/wp/1403736_10152102776272905_1970376136_o.jpg)

<br data-reactid=".r[4euwe].[1][3][1]{comment10152102664772905_11868520}.[0].{right}.[0].{left}.[0].[0].[0][3].[0].[3].[0].[2]" />EDIT: Here’s that same scene with normals taken into account. I’ll add AO tommorow, its been a long day.

![maybesaturate](/assets/img/blog/wp/maybesaturate.jpg)

I can’t really figure out what the difference between Unity’s vertex lit shader and my vertex color baking is.

Frankly, I think my version looks nicer, but I’d really like a 1:1 match of the Unity lighting system. Mine is on the left, and it appears a little brighter. However, the light settings are exact duplicates.

I’ve made sure everything was clamped where it should be (or saturate in the shader world).

What on earth could the difference be? I tried looking at some falloff things. I looked at various attenuation configurations, but I really can’t seem to drill down the exact look.

Perhaps it’s not important. This is why I don’t get things done.

![atlastest (1)](/assets/img/blog/wp/atlastest-1.jpg)

Texture2D.PackTextures();

Gives UV offsets for atlasing. It is now my hero. This built-in Unity function ensures I don’t have to purchase some fancy atlas stuff on the Asset Store.

Next step is to integrate the atlas system with my AssetPostProcessor. Then I can have models ready to batch and sharing materials directly on import!

I’m finding a lot of the custom editor scripts I’ve been working on might come in handy for other people’s projects – but they’re extremely specialized right now. As an example, a lot of my texture stuff is hard coded to use uncompressed textures using Point filtering (to keep that voxel look)

I might release a bit of my tools after they’ve been more generalized.

![mobileready (1)](/assets/img/blog/wp/mobileready-1.jpg)

I finally got all my atlased textures to work with everything. The rendering/lighting/batching/atlas stuff is finally done. It could use some refactoring because its a little sloppy, but it works, and it matches an unbaked/unbatched scene almost 1:1.

It actually looks better than a regular scene because I’ve added baked ambient occlusion (corner shadows).

The entire scene is just 1 draw call, which leaves plenty of room for players, powerups, and effects. I don’t plan to do much more optimization. Players and powerups probably won’t be batched, unless performance demands it.

I also had a fun time getting uncompressed textures to look right on android. My batching was originally based on bits of code from the free “Draw Call Minimizer” package from the asset store – but it ended up spitting out non-power-of-two textures, which breaks everything.

Ended up writing my own code that implements Unity’s methods, and it came out cleaner and simpler (but interestingly, not faster). Speed doesn’t matter for this though, because this optimization is done in the editor – not at runtime.

I’ll be sure to post something on my blog that goes into depth about it all. Getting a scene like this on mobile – with a runtime level editor? 1 draw-call for the entire scene, no matter how many lights?

I think it’s pretty sweet.

![lightingchunkbake](/assets/img/blog/wp/lightingchunkbake.gif)

Animated chunk lighting. Hoping I can optimize it for mobile a bit more. It’s not exactly fast right now.

![Screenshot_2013-12-15-04-07-42](/assets/img/blog/wp/Screenshot_2013-12-15-04-07-42.jpg)

Testing on android. Baking takes less than a minute – including ambient occlusion, but I really want to try and speed it up a bit more.  I’d love for something with beefier hardware, or possibly an OUYA to give me an FPS average. I’m using a low-end tablet right now for testing.

Frankly if I can keep the framerate above 30, I think it’ll be fine, but honestly 25 may end up my target for this device. I still don’t have any interactive objects in the scene yet.
