---
title: Syncing improvements
type: major
---
This release drastically improves source syncing. CloudCannon can now recover from errors hit when pushing/pulling with external Git repositories.

**Features:**

* New option to swap connected branches without disconnecting and reconnecting repositories
* External Git errors are recovered from and retried in subsequent syncs
* Resolution options added to source syncing settings
  * Create new branch from commits on CloudCannon
  * Reset to origin
  * Reset to a different external branch
* Backups include the `.git` folder allowing for faster recovery
* New branch connection UI
* Better source syncing and build deploy output logs

**Fixes:**

* Fixed button position for external repository site creation
* Sync history updates on failed syncs