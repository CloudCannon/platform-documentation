---
title: Contact form improvements
type: minor
---

This release extends our feature set for contact forms, you can now delete data manually or on a recurring schedule. A number of other smaller features and bug fixes are also included.

**Features:**

* Contact form data delete button
* Contact form data can now be automatically removed after a preset number of days per site
* Pinterest YAML and front matter input
* Removed Google+ inputs

**Fixes:**

* Save button no longer incorrectly enabled on initial open in certain configurations
* Ensure save button is enabled when changing externally linked image to a new uploaded image with no other changes
* Prevent a cross domain referrer leak
* Prevent a potential OAuth issue
* Prevent potential password reset issue in combination with changing email address
* Prevent potential XSS injection