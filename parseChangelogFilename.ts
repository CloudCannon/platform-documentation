export function parseChangelogFilename(
  collectionPath: string,
): Date | undefined {
  const [year, filename] = collectionPath.replace("/new_changelogs/", "").split(
    "/",
  );
  if (!year) {
    return;
  }

  const [datePart] = filename.split("_");
  if (!datePart) {
    return;
  }

  const [month, day] = datePart.split("-");
  if (!month || !day) {
    return;
  }
  return new Date(`${year}-${month}-${day}`);
}
