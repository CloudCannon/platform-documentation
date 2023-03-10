---
title: Compiler fixes
type: minor
---

This release fixes a couple issues found in the latest compiler release.

**Fixes:**

* `JEKYLL_ENV` is now correctly exported
* Legacy builds are working again

Errored sites will need to be rebuilt by making a small change. It is highly recommended to move off the legacy image. Ensure that the checkbox "Enable Ruby versions and non-legacy building" is ticked in your site settings.