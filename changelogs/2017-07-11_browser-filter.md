---
title: Browser Filter
type: minor
---


This release introduces a text filter/search input wherever you or your clients select a file. The various interfaces for selecting a file or page has been consolidated and made consistent. A large number of fixes have also been made.

**Features:**

* Browser text filter
* Consolidated file browser views for *Explore*, *Page Selector*, *File Browser* and file/page pickers

**Fixes:**

* Team members with the Developer role can now correctly control site authentication
* Prevent edge case where file permissions are being changed on save
* Fixed some combinations of 301 redirects being ignored
* Corrected pricing for additional team members reported in some interfaces
* Renaming a newly created folder no longer causes a copy to remain
* Fixed issue preventing ability to delete site if GitHub syncing given bad credentials
* Fixed escaped slash characters not being preserved between editors
* Title from Jekyll defaults no longer applied to data files in the UI