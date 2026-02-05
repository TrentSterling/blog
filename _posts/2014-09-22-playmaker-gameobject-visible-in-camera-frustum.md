---
title: "PlayMaker: GameObject Visible In Camera Frustum"
date: 2014-09-22
categories: [DevBlog]
tags: [Unity]
description: "(/assets/img/blog/wp/zUFyofz.gif)  GameObject.renderer.isVisible doesn’t work when an object casts dynamic shadows. This makes the..."
image: "/assets/img/icon.jpg"
---

![](/assets/img/blog/wp/zUFyofz.gif)

GameObject.renderer.isVisible doesn’t work when an object casts dynamic shadows. This makes the GameObjectIsVisible action useless in any application with shadows enabled.

Here’s a replacement action that test’s if the object’s renderer bounds are within the Main camera’s frustum planes.

![](/assets/img/blog/wp/dSj1d8d.png)

Based off a code snippet from here:
 [http://forum.unity3d.com/threads/is-target-in-view-frustum.86136/#post-626470](http://forum.unity3d.com/threads/is-target-in-view-frustum.86136/#post-626470)

Download from PlayMaker forums:

[http://hutonggames.com/playmakerforum/index.php?topic=8417.0](http://hutonggames.com/playmakerforum/index.php?topic=8417.0)
