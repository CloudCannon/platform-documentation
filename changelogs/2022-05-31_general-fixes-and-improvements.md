---
title: General fixes and improvements
type: minor
---
This release includes a number of general fixes and improvements.

**Features:**

* New [Dante template](https://cloudcannon.com/community/themes/dante/)
* Support for internationalized domain names
* Versions for various command line tools output in build log
* Password strength indicator for signup page
* Updated Ubuntu version on build machines
* Build option to use beta version of Hugo integration
* Custom CA cert support for self-hosted GitLab

**Fixes:**

* Better support for collection mapping on Eleventy sites (could sometimes cause files not to show)
* Prevented common case of spam bypassing detection with forms enabled
* Build fix suggestions now display immediately on failed build
* Untouched date inputs in Data Editor now correctly retain the saved timezone offset
* Prevented a long running process when building a site with a large number of files
