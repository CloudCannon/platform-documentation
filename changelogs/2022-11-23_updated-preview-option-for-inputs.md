---
title: Updated preview option for inputs
type: minor
---
This release brings our new preview options used in Snippets (Hugo shortcodes) and Structure configuration to a number of inputs. We'll be bringing these across to collections next so that configuration is consistent everywhere. We've also included a number of other features and fixes in this release.

**Features:**

* Move `text_key`, `subtext_key`, `image_key` and `icon` to new `preview` option for Select, Multiselect, Choice, Multichoice, Object and Array inputs.
* Creating configuration from the site setup task list now pre-populates the configuration file with automatically discovered settings and helpful comments.
* Improved design for unsubscribe link on various emails.
* The configuration cascade now includes schemas, allowing you to configure `_inputs` differently per schema.

**Fixes:**

* Change placeholders in Captcha form to look more like placeholders.
* Fixed some icons displaying incorrectly in Safari.
* Show user menu on organization list.
* No longer incorrectly highlighting https protocol as insecure in some places of the interface.
* Fixed default structure previews not displaying correct text and subtext.
* Re-ordered site authentication select input to show options in order of complexity.
* Fixed links shown in some brand colors being unreadable.
* Now correctly using icon from schema for `add_options` derived from schemas.
* Fixed an edge case missing billing changes when transferring sites in some cases.
* Security updates for services.