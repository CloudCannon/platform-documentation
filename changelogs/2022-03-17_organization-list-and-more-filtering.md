---
title: Organization list and more filtering
type: minor
---
This release brings monitoring to the Organization list and improves the site and domain lists by adding dynamic filtering and sorting functionality. We’re actively working on this area; more features will come in future releases. We've also added some new options in collections configuration and fixed a variety of issues.

### Features

* New Organization list with more visibility
  * More details for each Organization, showing number of sites, Projects and domains
  * Displaying error status of sites
  * Pagination, sorting and filter options
  * New styling on left navigation
  * Link in the user dropdown menu to access Organization list
* More filter and sorting options on sites and domains
  * Filter by a wide range of options
  * Bookmark friendly URLs for quick access to filters
  * More sorting options on sites
* More `collections_config` options
  * Added `description`\: a Markdown field that is rendered below the name of the collection
  * Added `documentation`\: a link definition that allows you to add a docs link below the name of the collection
  * Expanded `filter` options that change what files are visible within the collection file list
* New option `image_size_attributes` on `_editables` which disables width and height attributes being added to images

### Fixes

* Fixed issue removing sites with recent form submissions
* CloudCannon Hugo integration can handle larger sites
* Cloudinary widget correctly responds with a single file
* DAM preview list now copies the live URL of the selected asset
* URL fields always shows `https` instead of occasionally `http`
* Editor overlay menus no longer go off screen when elements are on the left side of the screen
* Fixed a case where Hugo sites were missing a file from collections
* Multiple `staticDir` values in Hugo no longer cause a build error
