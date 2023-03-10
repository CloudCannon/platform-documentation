---
title: Global configuration
type: major
---
This release brings support for separate global configuration files across all supported SSGs, see the [migration guide](/documentation/articles/migrating-to-global-configuration-files/) to separate your SSG configuration from your CloudCannon global configuration. A number of other general features and fixes are also included.

**Features:**

* CloudCannon-specific [global configuration](/documentation/articles/setting-global-configuration/) files across all SSGs
* Improved post processing and compression build steps
* New `sort` and `sort_options` [collection configuration](/documentation/articles/defining-your-collections/) keys for better control over sorting
* `form` elements with the `cms-no-rewrite` class no longer get encrypted or processed during a build

**Fixes:**

* Fix initial folder when selecting existing files in file inputs with custom paths
* Resolve potential failed re-authentication flow in editor
* Prevent unnecessary clones when source syncing changes
* Fix error when using certain editor link setups
* Fix Hugo `_index.html` files not being editable in some situations
* Fix SVG image previews in file inputs
* Configuring collections for Eleventy sites no longer unsets the automatically discovered collections
