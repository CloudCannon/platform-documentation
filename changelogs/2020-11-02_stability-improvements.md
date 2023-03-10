---
title: Stability improvements
type: major
---

This release contains a major rewrite of our code to bring more modern development workflows, increased stability and more error handling. We have officially dropped support for IE11 and any browser that does not support modern JavaScript. Unsupported browsers will be prompted on load to upgrade. This is part of a major push to increase stability and reliability of our more complex interactions.

**Features:**

* Error handling on load if dependencies didn't load
* Error handling on load for old browsers
* Error handling on load for no JavaScript
* More firewall rules for hosting security

**Fixes:**

* Fully linted code following company wide eslint rules
* More testing
* Can't open array structure object after editing with an editor link
* Error when trying to add a DNS record
* Can't set a custom TTL to DNS records
* Higher limit on recursive array structures