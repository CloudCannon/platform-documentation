---
title: Explore Options and Improvements
type: major
---

This release overhauls the design for files and collections. A number of configuration options have been made available for how the *Explore* section looks and behaves. The pre-build process has been improved, and a couple of options have been added to support faster `bundle install` for future builds.

**Features:**

* Redesigned files and collection items
* Configuration options for personalising the *Explore* section
* Better UI for editors modifying collection metadata
* Recategorised the navigation groups for user, organisation and site settings
* Better build process and architecture
* Commonly used gems preinstalled to speed up builds
* Time taken displayed in Builds list
* Options to persist `bundle install` added to speed up future builds
* CloudCannon profile images, with sensible defaults

**Fixes:**

* Loading state when creating new files
* Rendering performance improved when opening collections or folders with a large number of files
* Loading states for various interfaces across the app fixed
* Workaround for Ruby version build issues
* Fixed an issue when using both `BUNDLE_GEMFILE` environment variable and github-pages gem