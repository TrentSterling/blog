---
title: "Switching to Static Sites Made in Markdown"
date: 2016-12-20
categories: [devblog]
tags: [nodejs, static-sites, markdown, wintersmith]
description: "A brief note on the Wintersmith + Surge setup for static blog hosting."
---

Wintersmith is some kind of NodeJS magic that turns markdown files into blog posts.

I host everything on Surge after I build the static content. It's pretty damn spiffy.

The workflow is simple:
1. Write posts in Markdown
2. Build with Wintersmith
3. Deploy to Surge CDN

No databases, no PHP, no Wordpress security patches. Just static files served fast from a CDN.
