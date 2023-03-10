---
title: DNS Record Upgrade
type: major
---

This release introduces a number of new DNS record types to add, as well as improving the interface to add and manage them. A number of other features and fixes are also included.

**Features:**

* Increased DNS record types available
* Improved DNS interface
* Non alphanumeric characters are now supported in site names

**Fixes:**

* Fixed `yarn.lock` file browser icon showing as Ruby
* Fixed small potential for a build to not be retried when failed expectedly
* Fixed issue loading editor with empty collection metadata
* Fixed some cases where the rebuild your site prompt would occur in a loop
* Fixed issue not preserving filename-based date when editing old posts
