---
title: More control over empty values
type: minor
---
This release contains a variety of features and fixes.

**Features:**

* Ruby 3.2.0 is now available for installation
* [New options for configuring how empty values are saved in data and front matter.](/documentation/articles/using-text-inputs-to-edit-your-data/#options)
* [Display multiple TXT records required for issuing wildcard SSL Certificates on the root domain](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/certificate-management/issue-and-validate/validate-certificates/txt/#wildcard-custom-hostnames).

**Fixes:**

* Letters will no longer be converted to HTML entities by the Editor interface.
* Prevent Markdown characters from being "escaped" unnecessarily.
* The flow for creating a new site is now more consistent across different parts of the app.
* Fixed issue with Client Sharing not able to select files from a DAM.
* The Developer demo has been removed, in favour of the other starter templates we offer.
* You can now edit your Single Sign On certificate without removing and re-adding your configuration.
* Fixed a bug preventing some XML files from being used to pre-fill SSO/SAML details.
* Removed some outdated information regarding SAML authentication.
* Fixed an edge-case error around clicking the Save button.
* Increased security measures around user data.
* Implemented stricter locking of user accounts after multiple failed login attempts.
* Security updates.
