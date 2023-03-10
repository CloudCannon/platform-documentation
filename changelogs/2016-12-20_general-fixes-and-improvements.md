---
title: General Fixes and Improvements
type: minor
---


This release fixes newly reported issues and includes a number of quality-of-life improvements.

**Features:**

* URLs can now be entered directly for image *Editable Regions* with the options set.
* Extensionless URLs are now supported when importing or entering a URL for image *Editable Regions*.
* Files with any file extension are now served.
* `/404/index.html` is now used for a fallback if `/404.html` does not exist when rendering a custom 404 page.
* Double-click confirm button for unauthenticating storage providers on account.

**Fixes:**

* Publishing a draft with empty date now correctly populates the field.
* Fixed sharing issue where non-developers could not be shared site after sign up.
* Editor pending changes prompt now correctly triggers when using the *Page Selector*.
* Characters now render correctly in recent activity under site *Status*.
* Switch to Source Editor button no longer disappears after a front matter parse error in the *Content and Visual Editors*.
* Blank line at the end of a CSV file no longer causes a parse error.