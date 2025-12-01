#!/usr/bin/env -S deno run --allow-read --allow-write

import { ensureDir, copy } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { join, basename } from "https://deno.land/std@0.208.0/path/mod.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "https://deno.land/std@0.208.0/yaml/mod.ts";

interface MigrationRow {
  oldLink: string;
  moveTo: string;
  newLink: string;
  updateNav: string;
  updateInternalLinks: string;
  updateOldReroutes: string;
  addNewReroute: string;
}

async function createLookupTable(): Promise<Map<string, string>> {
  console.log("📖 Reading migration-destinations.csv...");
  
  const csvContent = await Deno.readTextFile("migration-destinations.csv");
  const lines = csvContent.split('\n');
  
  const lookup = new Map<string, string>();
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, but handle quoted fields
    const fields = line.split(',');
    if (fields.length >= 2) {
      const oldLink = fields[0].trim();
      const moveTo = fields[1].trim();
      
      // Extract filename from old link path
      // e.g., "/documentation/articles/add-a-custom-domain-to-your-site" -> "add-a-custom-domain-to-your-site"
      const filename = oldLink.split('/').pop();
      if (filename) {
        lookup.set(filename, moveTo);
      }
    }
  }
  
  console.log(`✅ Created lookup table with ${lookup.size} entries`);
  return lookup;
}

async function cleanAndCreateDirectories(): Promise<void> {
  console.log("🧹 Cleaning and creating directories...");
  
  const regularDirectories = [
    "developer/articles",
    "developer/guides", 
    "user/articles",
    "unused"
  ];
  
  // Clean regular directories completely
  for (const dir of regularDirectories) {
    try {
      // Remove existing directory if it exists
      await Deno.remove(dir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️  Warning removing ${dir}:`, (error as Error).message);
      }
    }
    
    // Create fresh directory
    await ensureDir(dir);
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // Handle new_changelogs specially to preserve _data.js
  await cleanChangelogsDirectory();
}

async function cleanChangelogsDirectory(): Promise<void> {
  const changelogsDir = "new_changelogs";
  const dataFile = join(changelogsDir, "_data.js");
  const yearPageFile = join(changelogsDir, "year.page.js");
  
  // Check if files exist and back them up temporarily
  let dataFileContent: string | null = null;
  let yearPageFileContent: string | null = null;
  
  try {
    dataFileContent = await Deno.readTextFile(dataFile);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.warn(`⚠️  Warning reading ${dataFile}:`, (error as Error).message);
    }
  }
  
  try {
    yearPageFileContent = await Deno.readTextFile(yearPageFile);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.warn(`⚠️  Warning reading ${yearPageFile}:`, (error as Error).message);
    }
  }
  
  // Remove the entire directory
  try {
    await Deno.remove(changelogsDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.warn(`⚠️  Warning removing ${changelogsDir}:`, (error as Error).message);
    }
  }
  
  // Create fresh directory
  await ensureDir(changelogsDir);
  console.log(`📁 Created directory: ${changelogsDir}`);
  
  // Restore files if they existed
  if (dataFileContent !== null) {
    await Deno.writeTextFile(dataFile, dataFileContent);
    console.log(`💾 Preserved: ${dataFile}`);
  }
  
  if (yearPageFileContent !== null) {
    await Deno.writeTextFile(yearPageFile, yearPageFileContent);
    console.log(`💾 Preserved: ${yearPageFile}`);
  }
}

async function getArticleFiles(): Promise<string[]> {
  console.log("📄 Finding article files...");
  
  const articles: string[] = [];
  
  try {
    for await (const entry of Deno.readDir("articles")) {
      if (entry.isFile && entry.name.endsWith(".mdx")) {
        articles.push(entry.name);
      }
    }
  } catch (error) {
    console.error("❌ Error reading articles directory:", error);
    throw error;
  }
  
  console.log(`✅ Found ${articles.length} article files`);
  return articles;
}

async function copyFile(source: string, destination: string): Promise<void> {
  try {
    await Deno.copyFile(source, destination);
  } catch (error) {
    console.error(`❌ Error copying ${source} to ${destination}:`, error);
    throw error;
  }
}

async function migrateArticles(): Promise<{ developerCount: number, userCount: number, unusedCount: number, totalCount: number }> {
  console.log("🚀 Starting article migration...");
  
  const lookup = await createLookupTable();
  await cleanAndCreateDirectories();
  const articles = await getArticleFiles();
  
  let developerCount = 0;
  let userCount = 0;
  let unusedCount = 0;
  
  for (const articleFile of articles) {
    const filename = basename(articleFile, ".mdx");
    const sourcePath = join("articles", articleFile);
    
    let targetPath: string;
    let destination: string;
    
    // Special handling for articles/index.mdx - always goes to developer/articles/
    if (articleFile === "index.mdx") {
      targetPath = join("developer/articles", articleFile);
      destination = "Developer Articles";
      developerCount++;
    } else {
      destination = lookup.get(filename) || "Unknown";
      
      switch (destination) {
        case "Developer Articles":
          targetPath = join("developer/articles", articleFile);
          developerCount++;
          break;
          
        case "User Articles":
          targetPath = join("user/articles", articleFile);
          userCount++;
          break;
          
        default:
          targetPath = join("unused", articleFile);
          unusedCount++;
          break;
      }
    }
    
    await copyFile(sourcePath, targetPath);
    console.log(`📋 ${articleFile} -> ${targetPath}`);
    
    // Transform front matter for articles (not unused files)
    if (destination === "Developer Articles" || destination === "User Articles") {
      console.log(`🔄 Transforming: ${articleFile}`);
      await transformArticleFrontMatter(targetPath);
    }
  }
  
  console.log("✅ Article migration completed successfully!");
  
  return {
    developerCount,
    userCount,
    unusedCount,
    totalCount: developerCount + userCount + unusedCount
  };
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function extractFrontMatter(content: string): { frontMatter: Record<string, unknown>, body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, body: content };
  }
  
  const frontMatterYaml = match[1];
  const body = match[2];
  
  try {
    const frontMatter = parseYaml(frontMatterYaml) as Record<string, unknown>;
    return { frontMatter, body };
  } catch (error) {
    console.warn("⚠️  Failed to parse front matter:", error);
    return { frontMatter: {}, body: content };
  }
}

function createFrontMatter(frontMatter: Record<string, unknown>, body: string): string {
  const yamlString = stringifyYaml(frontMatter, { indent: 2 });
  return `---\n${yamlString}---\n${body}`;
}

async function transformArticleFrontMatter(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const { frontMatter, body } = extractFrontMatter(content);
  
  // Create new front matter structure
  const newFrontMatter: Record<string, unknown> = {
    _schema: frontMatter._schema || "default",
    _uuid: frontMatter._uuid || generateUUID(),
  };
  
  // Add _created_at if it exists
  if (frontMatter._created_at) {
    newFrontMatter._created_at = frontMatter._created_at;
  }
  
  // Move specified fields to details object
  const details: Record<string, unknown> = {};
  
  if (frontMatter.title) details.title = frontMatter.title;
  if (frontMatter.description) details.description = frontMatter.description;
  if (frontMatter.image) details.image = frontMatter.image;
  if (frontMatter.article_category) details.category = frontMatter.article_category;
  if (frontMatter.related_articles) details.related_articles = frontMatter.related_articles;
  
  if (Object.keys(details).length > 0) {
    newFrontMatter.details = details;
  }
  
  // Handle docshots transformation from author_notes
  if (frontMatter.author_notes && typeof frontMatter.author_notes === 'object') {
    const authorNotes = frontMatter.author_notes as Record<string, unknown>;
    const docshots: Record<string, unknown> = {};
    
    if (authorNotes.docshots_status) {
      docshots.docshots_status = authorNotes.docshots_status;
    }
    if (authorNotes.doc_shots) {
      docshots.doc_shots = authorNotes.doc_shots;
    }
    
    if (Object.keys(docshots).length > 0) {
      newFrontMatter.docshots = docshots;
    }
    
    // Keep other author_notes fields that aren't docshots-related
    const remainingAuthorNotes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(authorNotes)) {
      if (!['docshots_status', 'doc_shots'].includes(key)) {
        remainingAuthorNotes[key] = value;
      }
    }
    
    if (Object.keys(remainingAuthorNotes).length > 0) {
      newFrontMatter.author_notes = remainingAuthorNotes;
    }
  }
  
  // Copy any other fields that aren't nav_title, published, or the ones we moved to details
  const excludedFields = [
    'nav_title', 'published', 'title', 'description', 'image', 'article_category', 
    'related_articles', '_schema', '_uuid', '_created_at', 'author_notes'
  ];
  
  for (const [key, value] of Object.entries(frontMatter)) {
    if (!excludedFields.includes(key)) {
      newFrontMatter[key] = value;
    }
  }
  
  const newContent = createFrontMatter(newFrontMatter, body);
  await Deno.writeTextFile(filePath, newContent);
}

async function transformGuideFrontMatter(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const { frontMatter, body } = extractFrontMatter(content);
  
  // Create new front matter structure
  const newFrontMatter: Record<string, unknown> = {
    _schema: frontMatter._schema || "default",
    _uuid: frontMatter._uuid || generateUUID(),
  };
  
  // Add _created_at if it exists
  if (frontMatter._created_at) {
    newFrontMatter._created_at = frontMatter._created_at;
  }
  
  // Move specified fields to details object
  const details: Record<string, unknown> = {};
  
  if (frontMatter.title) details.title = frontMatter.title;
  if (frontMatter.order) details.order = frontMatter.order;
  if (frontMatter.image) details.image = frontMatter.image;
  if (frontMatter.description) details.description = frontMatter.description;
  if (frontMatter.tags) details.tags = frontMatter.tags;
  if (frontMatter.related_links) details.related_links = frontMatter.related_links;
  
  if (Object.keys(details).length > 0) {
    newFrontMatter.details = details;
  }
  
  // Copy any other fields that aren't nav_title or published
  for (const [key, value] of Object.entries(frontMatter)) {
    if (!['nav_title', 'published', 'title', 'order', 'image', 'description', 'tags', 'related_links', '_schema', '_uuid', '_created_at'].includes(key)) {
      newFrontMatter[key] = value;
    }
  }
  
  const newContent = createFrontMatter(newFrontMatter, body);
  await Deno.writeTextFile(filePath, newContent);
}

async function transformGuideDataFile(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const data = parseYaml(content) as Record<string, unknown>;
  
  // Transform the data
  const newData: Record<string, unknown> = { ...data };
  
  // Move guide_image to guide_icon if guide_image exists and guide_icon doesn't
  if (data.guide_image && !data.guide_icon) {
    newData.guide_icon = data.guide_image;
  }
  
  // Remove guide_image
  delete newData.guide_image;
  
  // Add _uuid if it doesn't exist
  if (!newData._uuid) {
    newData._uuid = generateUUID();
  }
  
  // Remove show_guide_image_on_page
  delete newData.show_guide_image_on_page;
  
  const newContent = stringifyYaml(newData, { indent: 2 });
  await Deno.writeTextFile(filePath, newContent);
}

async function migrateGuides(): Promise<{ guideCount: number }> {
  console.log("\n🚀 Starting guide migration...");
  
  const targetDir = "developer/guides";
  let guideCount = 0;
  
  // Copy all guides from guides/ to developer/guides/
  try {
    for await (const entry of Deno.readDir("guides")) {
      if (entry.isDirectory) {
        const sourceDir = join("guides", entry.name);
        const targetGuideDir = join(targetDir, entry.name);
        
        console.log(`📋 Copying guide: ${entry.name}`);
        await copy(sourceDir, targetGuideDir, { overwrite: true });
        guideCount++;
        
        // Transform all .mdx files in the guide
        for await (const file of Deno.readDir(targetGuideDir)) {
          if (file.isFile && file.name.endsWith(".mdx")) {
            const filePath = join(targetGuideDir, file.name);
            console.log(`🔄 Transforming: ${file.name}`);
            await transformGuideFrontMatter(filePath);
          }
        }
        
        // Transform _data.yml file if it exists
        const dataFilePath = join(targetGuideDir, "_data.yml");
        try {
          await Deno.stat(dataFilePath);
          console.log(`🔄 Transforming: _data.yml`);
          await transformGuideDataFile(dataFilePath);
        } catch (error) {
          if (!(error instanceof Deno.errors.NotFound)) {
            console.warn(`⚠️  Warning processing _data.yml:`, (error as Error).message);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error migrating guides:", error);
    throw error;
  }
  
  console.log("✅ Guide migration completed successfully!");
  
  return { guideCount };
}

function parseChangelogFilename(filename: string): { year: string, month: string, day: string, title: string } | null {
  // Match pattern: YYYY-MM-DD_title.mdx
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})_(.+)\.mdx$/);
  if (!match) {
    return null;
  }
  
  const [, year, month, day, title] = match;
  return { year, month, day, title };
}

function createNewChangelogFilename(month: string, day: string, title: string): string {
  return `${month}-${day}_${title}.mdx`;
}

async function transformChangelogFrontMatter(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const { frontMatter, body } = extractFrontMatter(content);
  
  // Create new front matter structure without the type field
  const newFrontMatter: Record<string, unknown> = {};
  
  // Copy all fields except 'type'
  for (const [key, value] of Object.entries(frontMatter)) {
    if (key !== 'type') {
      newFrontMatter[key] = value;
    }
  }
  
  const newContent = createFrontMatter(newFrontMatter, body);
  await Deno.writeTextFile(filePath, newContent);
}

async function migrateChangelogs(): Promise<{ migratedCount: number, skippedCount: number }> {
  console.log("\n🚀 Starting changelog migration...");
  
  const sourceDir = "changelogs";
  const targetDir = "new_changelogs";
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  try {
    for await (const entry of Deno.readDir(sourceDir)) {
      if (entry.isFile && entry.name.endsWith(".mdx")) {
        const parsedFilename = parseChangelogFilename(entry.name);
        
        if (!parsedFilename) {
          console.warn(`⚠️  Skipping file with unexpected format: ${entry.name}`);
          skippedCount++;
          continue;
        }
        
        const { year, month, day, title } = parsedFilename;
        const yearDir = join(targetDir, year);
        
        // Ensure year directory exists
        await ensureDir(yearDir);
        
        // Create new filename without year prefix
        const newFilename = createNewChangelogFilename(month, day, title);
        const sourcePath = join(sourceDir, entry.name);
        const targetPath = join(yearDir, newFilename);
        
        // Copy the file
        await copyFile(sourcePath, targetPath);
        
        // Transform front matter to remove type field
        console.log(`🔄 Transforming: ${newFilename}`);
        await transformChangelogFrontMatter(targetPath);
        
        console.log(`📋 ${entry.name} -> ${year}/${newFilename}`);
        migratedCount++;
      }
    }
  } catch (error) {
    console.error("❌ Error migrating changelogs:", error);
    throw error;
  }
  
  console.log("✅ Changelog migration completed successfully!");
  
  return { migratedCount, skippedCount };
}

interface RouteRule {
  from: string;
  to: string;
  status: number;
}

interface RoutingConfig {
  routes?: RouteRule[];
  headers?: unknown[];
}

async function generateRoutingFile(lookup: Map<string, string>): Promise<{ redirectCount: number }> {
  console.log("\n🚀 Starting routing.json generation...");
  
  const originalRoutingPath = ".cloudcannon/routing.json";
  const newRoutingPath = ".cloudcannon/new-routing.json";
  
  // Ensure .cloudcannon directory exists
  await ensureDir(".cloudcannon");
  
  // Read existing routing file if it exists
  let existingRouting: RoutingConfig = {};
  try {
    const existingContent = await Deno.readTextFile(originalRoutingPath);
    existingRouting = JSON.parse(existingContent);
    console.log(`📖 Read existing routing.json with ${existingRouting.routes?.length || 0} existing routes`);
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.warn(`⚠️  Warning reading existing routing.json:`, (error as Error).message);
    }
  }
  
  // Generate redirect rules for migrated articles
  const newRoutes: RouteRule[] = [];
  
  // Add special redirect for articles/index.mdx
  newRoutes.push({
    from: "/documentation/articles/",
    to: "/documentation/developer-articles/",
    status: 301
  });
  console.log(`🔗 /documentation/articles/ -> /documentation/developer-articles/`);
  
  for (const [filename, destination] of lookup.entries()) {
    if (destination === "Developer Articles" || destination === "User Articles") {
      const oldPath = `/documentation/articles/${filename}/`;
      let newPath: string;
      
      if (destination === "Developer Articles") {
        newPath = `/documentation/developer-articles/${filename}/`;
      } else {
        newPath = `/documentation/user-articles/${filename}/`;
      }
      
      newRoutes.push({
        from: oldPath,
        to: newPath,
        status: 301
      });
      
      console.log(`🔗 ${oldPath} -> ${newPath}`);
    }
  }
  
  // Create new routing configuration preserving original structure and order
  const newRouting: RoutingConfig = {};
  // Add other properties in their original order
  if (existingRouting.headers) {
    newRouting.headers = existingRouting.headers;
  }
  
  // Preserve original key order and add existing routes first
  if (existingRouting.routes && existingRouting.routes.length > 0) {
    newRouting.routes = [...existingRouting.routes];
  } else {
    newRouting.routes = [];
  }
  
  // Add new routes at the end
  newRouting.routes.push(...newRoutes);
  
  
  // Write the new routing file (preserve original routing.json unchanged)
  const routingContent = JSON.stringify(newRouting, null, 2);
  await Deno.writeTextFile(newRoutingPath, routingContent);
  
  console.log(`📄 Generated new-routing.json with ${newRoutes.length} new redirects appended to ${existingRouting.routes?.length || 0} existing routes`);
  console.log(`💾 Original routing.json preserved unchanged`);
  console.log(`✅ Routing generation completed successfully!`);
  
  return { redirectCount: newRoutes.length };
}


// Run the migration
if (import.meta.main) {
  try {
    const articleStats = await migrateArticles();
    const guideStats = await migrateGuides();
    const changelogStats = await migrateChangelogs();
    
    // Generate routing.json with redirects (reuse the lookup table)
    const lookup = await createLookupTable();
    const routingStats = await generateRoutingFile(lookup);
    
    // Display consolidated migration summary
    console.log("\n🎉 ===== MIGRATION COMPLETE =====");
    console.log("\n📊 Final Migration Summary:");
    console.log("\n📄 Articles:");
    console.log(`   Developer Articles: ${articleStats.developerCount} files`);
    console.log(`   User Articles: ${articleStats.userCount} files`);
    console.log(`   Unused: ${articleStats.unusedCount} files`);
    console.log(`   Total Articles: ${articleStats.totalCount} files`);
    
    console.log("\n📚 Guides:");
    console.log(`   Migrated Guides: ${guideStats.guideCount} directories`);
    
    console.log("\n📰 Changelogs:");
    console.log(`   Migrated: ${changelogStats.migratedCount} files`);
    console.log(`   Skipped: ${changelogStats.skippedCount} files`);
    
    console.log("\n🔗 Routing:");
    console.log(`   Generated Redirects: ${routingStats.redirectCount} rules`);
    
    const grandTotal = articleStats.totalCount + guideStats.guideCount + changelogStats.migratedCount;
    console.log(`\n🏆 Grand Total: ${grandTotal} items migrated successfully!`);
    console.log(`📄 Routing: ${routingStats.redirectCount} redirect rules generated`);
    console.log("\n✅ All migrations completed successfully! 🎊");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    Deno.exit(1);
  }
}
