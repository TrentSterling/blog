---
title: "New Blog, New Technology"
date: 2016-12-15
categories: [devblog]
tags: [nodejs, static-sites, markdown, wintersmith]
description: "Migrating from Wordpress to static site generation with Wintersmith and Markdown."
image: "/assets/img/8266.jpg"
---

[![NodeMCU Chip](/assets/img/8266.jpg)](/assets/img/8266.jpg)

I've been dabbling in a lot of NodeJS lately. Everything from robots, wifi toasters, a twitch overlay, and a discord bot.

And now I'm porting my Wordpress into Markdown - in an effort to future-proof things a little.

## Why Static Sites?

Static website hosting is basically free these days. Got some HTML, CSS, and JS? The cloud has your back.

Static pages that are not generated on the fly seem to be all the rage these days. It makes sense! This article won't change unless I make the changes. Why do I need to load all of this data dynamically? Why use PHP/Wordpress and an SQL database to construct what will end up being the exact same content over and over? It's a waste of electricity!

## The Stack

- **Wintersmith** (NodeJS static site generator)
- **Surge CDN** for hosting
- **Markdown** for content

So here we are with a fancy new website that loads faster than anything ever. The CDN provided by Surge is an awesome bonus. Website goes down? Nope - another node hosts it too!
