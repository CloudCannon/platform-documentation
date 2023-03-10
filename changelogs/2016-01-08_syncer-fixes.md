---
title: Syncer Fixes
type: minor
---

This release includes minor bug fixes, focused around storage provider syncing.

**Fixes:**

* Fixed some assets not loading in the editor due to inconsistently escaped unicode characters
* Prevent issues with folder names containing "."s
* Consistent loading symbol contrast on all backgrounds
* Fixed a race condition issue when syncing
* Renaming a collection item will now correctly identify the extension