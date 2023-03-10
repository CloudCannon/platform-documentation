---
title: 'Editor links, Markdown attributes and general improvements'
type: minor
---

**Features:**

* [Editor links](/documentation/edit/editing/html/#editor-links) have been added to the visual editor to allow customisation of your interfaces.
* Commit hashes are available on each site activity from GitHub and Bitbucket.


**Fixes:**

* `srcset` and `sizes` attributes are now valid attributes within the Markdown editor. These were previously filtered out on save.
* Renaming folders to the same name with different cases was causing odd behaviour.
* Prevented multiple error messages on upload failure.
* Removing i18n from a site would cause the site to get stuck with the previous i18n.
* Bitbucket initial syncing got stuck in a particular state.