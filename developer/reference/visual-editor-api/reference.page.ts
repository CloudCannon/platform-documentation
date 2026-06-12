import { createReferencePageGenerator } from "../_shared/referencePageGenerator.ts";

// Generates a page per object type (entries with a url). Methods have no url —
// they are listed in the overview's methods table instead.
export default createReferencePageGenerator("type.VisualEditorAPI");
