---
title: User experience improvements
type: minor
---

This release includes various user experience improvements and fixes.

**Features:**

* GST displayed on New Zealand invoices
* White-labelled email when creating adding users with user account authentication
* HTML formatted, white-labelled emails for password reset with user account authentication
* HTML formatted, white-labelled emails with the form submission feature
* Open collection items for editing when created
* Serve `ico` and `pdf` files from CDN

**Fixes:**

* Prevent plain single and quotes from being turned into entities in our editors
* Fixed a flickering issue when sharing site to team members
* Use user input for title of new collection items rather than formatted filename
* Hide image files in collections interface
* Remove problematic control characters from filenames on create or upload
* Fix issue running UglifyJS on very large files
