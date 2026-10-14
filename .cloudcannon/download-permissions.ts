import { blue, bold, red } from "@std/fmt/colors";

const LOG_PREFIX = blue("[download-permissions]");
const ERROR_PREFIX = red("[download-permissions]");

const filepath = "_data/permissions.json";
const treeUrl = "https://app.cloudcannon.com/permissions-tree";

const pullPerms = async () => {
  try {
    const req = await fetch(treeUrl);
    const tree = await req.json();

    // Check for a known permission to ensure healthy file:
    const site_details_read_docs = tree?.["*"]?.children?.site?.children
      ?.["site:details"]?.docs?.read;
    if (!site_details_read_docs?.length) {
      console.error(
        `${ERROR_PREFIX} permissions tree at ${bold(treeUrl)} has changed or errored`,
      );
      console.error(
        `${ERROR_PREFIX} expected documentation at ${bold("*.children.site.children.site:details.docs.read")}, found nothing`,
      );
      Deno.exit(1);
    }

    Deno.writeTextFileSync(filepath, JSON.stringify(tree, null, 2));
    console.log(
      `${LOG_PREFIX} downloaded permissions tree from ${bold(treeUrl)} to ${bold(filepath)}`,
    );
  } catch (e) {
    console.error(
      `${ERROR_PREFIX} failed to download permissions tree from ${bold(treeUrl)}:`,
      e,
    );
    Deno.exit(1);
  }
};

pullPerms();
