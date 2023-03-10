---
title: General Fixes and Speed Improvements
type: minor
---


This release increases the speed of all file operations (saving, syncing and serving etc.) and resolves issues discovered via support.

**Features:**

* Improved speed on all file operations
* Storage provider icon replaces file browser icon when connected


**Fixes:**

* HTML code within tilde code blocks are no longer escaped
* Unauthorised GitHub accounts handled more gracefully
* Updating the title or date on a post within a category folder will no longer remove the post from the category folder
* i18n rewriting mailto and data URIs
* Additional DNS empty form fields
* Uploads are tagged with the correct author in GitHub
* Consistent capitalisation on context menus
* "Move to a new folder" replaces spaces with hyphens
* File browser ordering broken when a folder starts with a -
* File drag styles fixed
* YAML editor with array as base child has "Add &lt;singular&gt;" instead of "Add Detail"
* Hidden folders no longer appear after creating a new folder