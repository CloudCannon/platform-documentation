---
title: Full support for Eleventy
type: major
---
This release adds full support for Eleventy in CloudCannon. Try Eleventy with your own custom site or with [one of our templates](https://app.cloudcannon.com/editor#sites/templates/eleventy). Read our documentation for details on how to [configure your Eleventy site for CloudCannon](/documentation/articles/integrating-your-site/).

We've made some updates to the flow for creating a new site. Helpful suggestions are displayed prominently if the first build fails. Terminal output has been replaced with configuration tips for non-technical editors. Build options are sorted more neatly into accordions.

This release also introduces a [new configuration file](/documentation/articles/pre-configure-your-site-before-creation-on-cloudcannon) for CloudCannon, which can be used to streamline the site creation process by defining build configuration in advance.

**Features:**

* Full support and new starter templates for 11ty
* Updated site creation pages and loading states
* Updated build failed state with more prominent fix suggestions
* New product tips for non-developer template build screens
* Support for a new build configuration file for CloudCannon
* CloudCannon branding has been removed from emails to site users who need to set up an account
* Terminal output can be enlarged during the site creation flow
* `noTimes` is now enabled by default for Hugo sites
* `npm install` is now run automatically for Hugo sites with a package.json file

**Fixes:**

* Fixed an issue which could slow down build times
* Fixed an issue where build suggestions could sometimes get stuck loading