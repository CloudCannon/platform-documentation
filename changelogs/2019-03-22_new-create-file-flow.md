---
title: New Create File Flow
type: major
---

This release overhauls the experience when creating new post, collection items and files. You now open an empty file and add content, then save it along with any images in one commit.

**Features:**

* New create flow
* Greatly improved file browser performance
* Improved branded organisation sign up screen
* Better build defaults for new sites
* Improved site and project lists for editors
* Switching DNS preserves records rather than prompting to remove them
* Adding a new domain now scans and adds existing DNS records if found

**Fixes:**

* Case where images may not load in the *Content Editor*
* Some Firefox-specific styles
* `robots.txt` being incorrectly served on testing domain
* Pasting from Google Docs in Chrome no longer makes everything bold
* Collection metadata modal issues resolved
* Optimised URLs use `https://` instead of `//`
* Potential case for images to be incorrectly saved as base 64 inline resolved