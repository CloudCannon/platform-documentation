---
title: General Fixes
type: minor
---

This release fixes various UI and security issues.

**Features:**

* Password and SAML Authentication is copied when branching a new site
* Bitbucket merge flow improved

**Fixes:**

* Inbox section now loads correctly
* Handled potential 500 error from Bitbucket when comparing commits
* DNS record view updates correctly when migrating from legacy DNS
* Edge case Dropbox syncing issue resolved
* Webhook now added correctly to branched sites
* Preferred editor now selected correctly for pages with `published: false`
* No longer unnecessarily prompt for a title for collections with `title` and `_hide_content: true`
* Strip metadata from profile images on upload
* Remove a potential XSS vector
* Add `rel="noopener noreferrer"` to external links
* Unsubscribing from email no longer incorrectly unsubscribes from password reset emails
* Remove potential click jacking vector
* Remove potential CSRF vector
* Reduce information sent to analytics
