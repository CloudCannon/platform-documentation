---
title: Collection schemas
type: minor
---
This release introduces our new collection schema feature that provides: initial contents for new files, and a structured approach to managing content. A number of other features and fixes are also included.

**Features:**

* Collection-level option called [schemas](/documentation/articles/create-a-schema/) to define one or more types in a collection. Used for the [contents of new files](/documentation/articles/define-your-default-file-contents/), and [keeping existing files up to date](/documentation/articles/keeping-content-consistent-across-files-in-a-collection/).
* Schema-level configuration for changing the file preview in the collection file list.
* [Extended options](/documentation/articles/configure-the-add-button-in-collections/) for non-default `add_options`.
* Default `add_options` in the collection file list +Add menu generated from schemas if set.
* [Collection-level options](/documentation/articles/define-your-collections/) for disable file actions and add folder action in collection file list.

**Fixes:**

* Failed payment emails now correctly state downgraded plan.
* Error handling previewing files with an unauthorized DAM.
* Transfer requests list now correctly listing all pending requests.
