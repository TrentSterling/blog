---
title: "Unity PlayMaker Simple Waypoint PathFinding"
date: 2014-01-20
categories: [DevBlog]
tags: [Pathfinding, PlayMaker, Unity]
description: "The current set of PlayMaker pathfinding actions don’t work with the latest version of the A Pathfinding Project.  I’m making a simplfied version..."
image: "/assets/img/icon.jpg"
---

The current set of PlayMaker pathfinding actions don’t work with the latest version of the A* Pathfinding Project.

I’m making a simplfied version that only returns which nodes to move to. Actually moving your physics/transform/character controller is up to you!

This is a much better way to handle movement because you can swap targets on the fly, from the path- to an enemy if he’s in visible (via raycast or radar or distance?)

I’ll release the actions if there is any interest. They’re a bit game specific at the moment.
