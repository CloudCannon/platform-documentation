export default function* ({ search }) {
  for (const letter of [...Array(26).keys()].map((n) => String.fromCharCode(97 + n))) {
    try {
      const info = Deno.statSync(`user/glossary/${letter}`);
      if (info.isDirectory) {
        yield {
          url: `/user-glossary/${letter}/`,
          layout: "layouts/glossary-list.njk"
        };
      } else {
        console.log("Path exists but is not a directory");
      }
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        console.log("Directory does not exist");
      } else {
        throw err;
      }
    }
  }
}
