---
title: Editor Link Modals
type: minor
---

This release improves the *Editor Link* feature with an option to edit fields in a modal. A number of other options have been added and bugs fixed.

**Features:**

* Editor Link modal style
* Option to hide fields in front matter (alternative to prefixing the key with an underscore)
* Options for customising the *Source Editor* per site (syntax highlighting, tab size and line numbers)
* Option to disable main heading in *Content Editor*
* Better input handling when adding domains
* Updated preinstalled gems to increase site build times

**Fixes:**

* Issue preventing site delete due to existing webhook
* Styling issue for file upload progress
* Issue preventing connecting publish branch if only two branches exist
* Issue preventing custom classes for blockquotes in Markdown content
* Comments in custom editor CSS now ignored
* After authenticating Dropbox now automatically connects to your site on return
* Fixed social avatar URLs for front matter fields
* Duplicate class names with different elements in custom editor CSS fixed