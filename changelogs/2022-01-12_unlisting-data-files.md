---
title: >-
  Unfreezing the code for 2022 with Unlisting data files, mailer improvements
  and more.
type: minor
---
This release brings the option to unlist specified data files from the site navigation. Also included are a number of minor features and bug fixes.

**Features:**

* Added [option to unlist data files](/documentation/articles/unlisting-files-in-a-collection) from the site navigation
* Tidied up mailers to align with the 2021 UI Improvements
* Added support for Hugo `publishDir` config

**Fixes:**

* Fixed layout of the Inbox navigation menu
* Fixed issue exporting Inbox to CSV
* Fixed default value for [select type](/documentation/articles/using-select-inputs-to-edit-your-data/#select) inputs when using allow\_empty
* Fixed issue uploading files on [image inputs](/documentation/articles/using-upload-inputs-to-edit-your-data/#image) when using a custom upload directory
* Default to use an existing branch when syncing a new site to a repository
* Fixed issue refreshing the syncing logs when creating a new site using local files
* Fixed wording around payment credits
* Added full billing address to invoices
* Fixed potential XSS vector
