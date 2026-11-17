import { walk } from "@std/fs";

const sections = ["developer", "user", "partner"];
const allowedAnchors = ["/documentation/developer-reference/error-codes/#"];
const headingLink =
  /\]\((\/documentation\/[^)\s#]*#[^)\s]+)\)|href=["'](\/documentation\/[^"'#]*#[^"']+)["']/g;

const found: string[] = [];

for (const section of sections) {
  for await (const entry of walk(section, { exts: [".mdx"] })) {
    const lines = (await Deno.readTextFile(entry.path)).split("\n");
    lines.forEach((line, index) => {
      for (const match of line.matchAll(headingLink)) {
        const link = match[1] ?? match[2];
        if (allowedAnchors.some((prefix) => link.startsWith(prefix))) {
          continue;
        }
        found.push(`${entry.path}:${index + 1} -> ${link}`);
      }
    });
  }
}

console.log(`Detected ${found.length} links to a heading on another page.`);
found.forEach((link) => console.log(link));

if (found.length > 0) {
  console.log(
    'Link to the page instead. See "Linking to a Section" in STYLE_GUIDE.mdx.',
  );
  Deno.exit(1);
}
