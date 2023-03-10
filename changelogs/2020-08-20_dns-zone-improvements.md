---
title: DNS Zone improvements
type: minor
---

This release fixes some issues to do with DNS zones, and adds the ability for a user to recreate missing DNS zones. Also included are numerous other bug fixes.

**Features:**

* Added a button in DNS settings to recreate missing DNS zones.

**Fixes:**

* Improved first-build times for new sites
* Fixed an issue where JEKYLL\_ENV was not being set
* Fixed an issue with SAML authentication
* Fixed site icon sometimes not updating
* Scheduled builds should now be working correctly
* Fixed some issues with Dropbox syncing
* Fixed an issue when migrating from Route53 to Cloudflare