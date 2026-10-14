# Move or Delete Pages

Follow this checklist whenever you rename a directory, move a file, or delete a page.

## 1. Make the file system change

Rename or delete the file or directory using the Bash tool.

## 2. Find all internal references

Before updating anything, grep for the old path to find every file that links to it:

```
grep -r "old-path-slug" /path/to/platform-documentation
```

Update every internal link found. Do not rely on memory — always grep first.

## 3. Update routing.json

`routing.json` is too large to read in full (44k+ tokens). Always grep for existing entries before adding new ones to avoid duplicates.

For every URL that no longer exists, add a redirect:

```json
{
  "from": "/documentation/developer-guides/old-slug/",
  "to": "/documentation/developer-guides/new-slug/",
  "status": 301
}
```

**Rules:**
- Redirect every deleted or moved URL — both the index and any child pages
- When renaming a directory, add redirects for all pages within it, not just the index
- Update any existing redirects whose `to` value points to the moved URL
- Check for stale `to` values: an existing redirect may already point to the old path

## 4. Check navigation registrations

- If the page was registered in `_data/navigation/developer-articles.yml` (by UUID), no change needed — UUIDs are stable
- If a guide was registered in `developer/guides/index.mdx` (by UUID), no change needed
- If the guide directory was renamed, verify the URL the guide landing page would generate matches the new directory name

## 5. Do not create stub articles as redirects

Never create a stub MDX file that exists only to link to another article. Use `routing.json` redirects instead.
