---
title: Option to add "nofollow" to links
type: minor
---
The link editor will now allow you to add `rel="nofollow"`, when you want to prevent search engine crawlers from following links.

We have also noticed an issue with builds failing for sites using Astro versions `2.0.7` and above. We have added a build suggestion to the app that should fix these sites. Affected sites should change their Astro version to `2.0.6` until a later Astro release that fixes this issue.

**Features:**

* A "nofollow" option is now available when editing links.
* The Sendit template is now available for Gatsby and Nuxt, in beta.
* CloudCannon can now auto-detect build settings for Astro sites.
* Added a suggested fix for a known build issue with Astro `v2.0.7` and above.

**Fixes:**

* DigiCert is now deprecated as a certificate authority for SSL. Affected users will be sent advice about how to proceed.
* Requests to sites with invalid routing rules will now result in informative error pages, instead of generic 500 errors.