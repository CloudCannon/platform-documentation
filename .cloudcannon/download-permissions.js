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
        `Permissions tree provided by CloudCannon at ${treeUrl} has changed or errored.`,
      );
      console.error(
        `Expected documentation at *.children.site.children.site:details.docs.read to exist, found nothing.`,
      );
      Deno.exit(1);
    }

    Deno.writeTextFileSync(filepath, JSON.stringify(tree, null, 2));
  } catch (e) {
    console.error(
      `Failed to pull permissions tree from CloudCannon at ${treeUrl}`,
    );
    console.error(e);
    Deno.exit(1);
  }
};

pullPerms();
