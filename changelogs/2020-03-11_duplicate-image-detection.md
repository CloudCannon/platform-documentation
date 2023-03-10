---
title: Duplicate Image Detection
type: minor
---

This release introduces a prompt when attempting to upload an image already present somewhere else in the site. A number of general fixes are also included.

**Features:**

* Duplicate image detection prompt
* Support for tab separated files (`.tsv`) files
* Support for SVGs in front matter image inputs
* Filtering for accepted mime types in front matter path inputs

**Fixes:**

* Pending share emails now case insensitive
* Editor Links now correctly trigger edited state class after first edit
* Sites list logo now correctly propagates
* Resolved some unwanted behaviour when dragging and dropping images
* Fixed intermittent visual editor authentication errors in Chrome and Safari
* Fixed array structure format regression
* Resolved issues caused by latest add options feature