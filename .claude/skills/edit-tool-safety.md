# Edit Tool Safety

## The replace_all risk with paths and filenames

`replace_all: true` replaces every occurrence of `old_string` in the file. This is dangerous when the string you are replacing also appears as a substring inside file paths or other compound strings.

**Example of the failure:**

Renaming a directory from `rosey-on-cloudcannon` to `add-internationalization-with-rosey` in a plan file using `replace_all`, where the plan also contains filenames like `set-up-rosey-on-cloudcannon.mdx`:

- Target: `rosey-on-cloudcannon` → `add-internationalization-with-rosey`
- Unintended match inside filename: `set-up-**rosey-on-cloudcannon**.mdx` → `set-up-**add-internationalization-with-rosey**.mdx`

The filename gets corrupted because the substring matched inside a longer string.

## Rules

- **Never use `replace_all: true` for directory names, URL slugs, or any string that could appear as a substring of a filename or path.**
- For renames that affect many lines, make targeted replacements with enough surrounding context to be unique, or replace line by line.
- After any bulk edit, grep for the new string to verify no unintended matches were introduced.

## When replace_all is safe

`replace_all` is appropriate for:
- Renaming a variable or function that appears as a standalone token (not inside a longer identifier)
- Replacing a repeated phrase in prose where the exact phrase is unique to that meaning
- Find-and-replace within a single short file where you can verify all occurrences are equivalent
