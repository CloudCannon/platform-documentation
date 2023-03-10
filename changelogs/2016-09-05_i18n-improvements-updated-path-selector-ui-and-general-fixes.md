---
title: 'I18n improvements, updated path selector UI and general fixes'
type: minor
---


This release includes a number of improvements to i18n, source configurations and an updated path selector interface.

**Features:**

* `_path` front matter now defaults to upload from computer and has select from browser as an option button
* Localised sites now inject the language code into the `lang` attribute on the `html` element
* i18n state added to the *Status* section of localised sites


**Fixes:**

* Full page activity feed for non-developers
* Collection tab broken when source is set to `.` or `./`
* i18n options are now only shown for pro sites with locales
* CSS compressor no longer makes unsafe optimisations
* Embedded data URLs no longer break after CSS compression
* Path correction in i18n produces the correct URL
* Assets within the editor are no longer cached unnecessarily