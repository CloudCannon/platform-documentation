---
_schema: default
title: General fixes
type: minor
---

This release adds handling for ad blockers hiding our support chat widget, as well as some other fixes and improvements.

**Fixes:**

* The support button now redirects to a contact form, in the case where our chat widget is hidden by an ad blocker. 
* Fixed a bug where the Publish page could fail to load if the diff was too large
* Fixed an error preventing builds on Jekyll v3.6
* Changed the placeholder text in some fields to look less like an explicit setting