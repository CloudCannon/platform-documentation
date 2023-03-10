---
title: Better uploads paths
type: minor
---
This release improves on our existing custom uploads paths feature. You can now choose where to upload files within a DAM. Setting the uploads path is now more flexible with a new, [backward-compatible placeholder pattern](/documentation/articles/adjusting-the-uploads-path/) that can use more of your data within the paths.

**Features:**

* Improved `paths.uploads` option to set where new site files upload to. Available globally and per input.
* New `paths.dam_uploads` to set where new DAM files upload to. Available globally and per input.
* New `paths.dam_static` to set a mount path where new DAM files upload to, but is excluded from the path saved. Available globally and per input.
* New placeholder style for the paths above.
* New option in *Site Settings / Details* to disable browsing for site files when selecting **Use Existing File** from the editor. This allows you to have a DAM as a single source of files/images/assets for team members.

**Fixes:**

* Fixed some instances of input configuration not applying to Editable Regions.
* Fixed error handling and instructions when GitHub App is uninstalled from GitHub