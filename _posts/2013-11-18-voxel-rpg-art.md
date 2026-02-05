---
title: "Voxel RPG Art"
date: 2013-11-18
categories: [DevBlog]
tags: [Unity]
description: "Me and my artist Yuuki (http://yuukirusdemon.deviantart.com/gallery/) have been hitting the artwork hard, trying to determine whether or not we want..."
image: "/assets/img/blog/wp/voxelitems.jpg"
---

Me and my artist Yuuki ([http://yuukirusdemon.deviantart.com/gallery/](http://yuukirusdemon.deviantart.com/gallery/)) have been hitting the artwork hard, trying to determine whether or not we want cartoony voxels, or a more realistic/detailed look.

Adding a bit of noise makes a lot of the models look more ‘lived in’ and realistic. But the world of cube voxels doesn’t really lend itself to realism. Frankly I’m thinking about dropping textures almost completely and going with a more flat cartoony look, with some highlights to make things pop.![Random voxel art!](/assets/img/blog/wp/voxelitems.jpg)

Random voxel art!

I’ll eventually ask around to get some opinions. There’s a few examples in the image above that show noisy variants. I’m still not sure how ‘dirty’ our world needs to be. Just because it’s medieval doesn’t mean it can’t be cute and cartoony!

The guys over at [Qubicle ](http://www.qubicle-constructor.com/vanilla/)have been helpful, and it’s cool to see voxels as a sub-genre of art/game development. A post over there lead me to an app called [Poly2Vox](http://advsys.net/ken/download.htm), which has helped with a few of the more organic shapes like rocks/boulders. Setting up a sphere with a noise modifier is much easier in any decent modeling program. Then I convert to voxels, and plop the model into Unity as a prefab.

I also had to get familiar with Unity’s [AssetPostprocessor](http://docs.unity3d.com/Documentation/ScriptReference/AssetPostprocessor.html). To put things simply, any script you hook into this can be run any time you import an asset into Unity. Search for the file extension, in our case, *.DAE, and you can apply a scale to all your imported models. Or perhaps, with all your textures, apply point filtering. In our case, we even generate multiple prefabs and rotations on import, to work with the tile system.

It’s a nice and quick solution for anything you’d want to mass modify after import.

I still don’t have a name for the game. We have a basic 3 page story, but the name hasn’t exploded into either of our minds yet. I figure it’ll show up as work progresses. Still, it sucks to name all the folders “Untitled Voxel RPG”.

As far as game engine stuff, there isn’t much new to show. I’m still working on a dialogue/choices/inventory/quests UI system. There’s a lot of shared functionality there, and early tests have been promising. Another thing we’ve banging our heads against is the depth that this game requires. Both me and Yuuki tend to lean towards grand scale stuff, but our only goal at the moment is for 3 scene demo. As soon as all the functionality is in place, we can expand beyond your home village. (Which still doesn’t have a name!)
