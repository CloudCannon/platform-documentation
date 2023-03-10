---
title: 'Full support for Next.js '
type: minor
---
This release adds full support for static sites built with Next.js. Check out our starter guide for tips on [configuring your Next.js site for CloudCannon](/documentation/guides/nextjs-starter-guide/). We have also released a new [Sendit template for Astro](https://app.cloudcannon.com/editor#sites/connect/github/CloudCannon/sendit-astro-template/main).

The CloudCannon Beta is now open to everyone to preview upcoming CloudCannon features and improvements. You can switch in and out of the Beta by using the button in your user profile in the bottom left.

**Features:**

* Support for Next.js is now out of beta.
* Updated the Sendit template for Next.js.
* Added a Sendit template for Astro.
* The CloudCannon Beta is now available to everyone.
* MDX is now supported in the Content Editor.
* Added support for the hugo.toml configuration file.
* On-going incident reports are now visible from the login page.
* Automatically give new sites a sensible name based on the source, if not named deliberately.
* Increase the maximum size for uploaded .zip files to 500mb, and improved the error message when this limit is exceeded.
* When creating a backup of your site, there is now an option to exclude the .git folder for a smaller download size.
* Added Deno to the build image

**Fixes:**

* Fixed a bug preventing the index page of a multilingual Hugo site from being opened in the Visual Editor.
* Handle a potential edge-case bug on the fileserver.
* Fix trial text overflowing the sidebar.
* Fixed a bug preventing files from being compressed if they contained an invalid srcset attribute.
* Fixed a handful of issues that could occur when creating pages and posts on a Jekyll site with a custom source directory.
* Improved performance of editor for pages with unknown snippets.
* Fixed an issue where a misconfigured array could prevent the Data Editor from opening properly.
* Fixed an issue where Partners could never complete the organisation setup checklist.
* Builds are now marked as failed if they output no files.
* Fixed an issue where image previews failed to load when the image path contained certain Unicode characters.