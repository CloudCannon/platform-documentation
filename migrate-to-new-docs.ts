#!/usr/bin/env -S deno run --allow-read --allow-write

import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
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
  console.log("🧹 Ensuring directories exist (preserving existing files)...");
  
  const regularDirectories = [
    "developer/articles",
    "developer/guides", 
    "user/articles",
    "unused"
  ];
  
  // Ensure directories exist without removing existing files
  for (const dir of regularDirectories) {
    await ensureDir(dir);
    console.log(`📁 Ensured directory exists: ${dir}`);
  }
  
  // Handle new_changelogs specially to preserve _data.js and year.page.js
  await ensureChangelogsDirectory();
}

async function ensureChangelogsDirectory(): Promise<void> {
  const changelogsDir = "new_changelogs";
  
  // Ensure directory exists without removing existing files
  await ensureDir(changelogsDir);
  console.log(`📁 Ensured directory exists: ${changelogsDir}`);
  
  // Check if important files exist and report their status
  const dataFile = join(changelogsDir, "_data.js");
  const yearPageFile = join(changelogsDir, "year.page.js");
  
  try {
    await Deno.stat(dataFile);
    console.log(`💾 Preserved existing: ${dataFile}`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log(`📄 File not found (will be created if needed): ${dataFile}`);
    }
  }
  
  try {
    await Deno.stat(yearPageFile);
    console.log(`💾 Preserved existing: ${yearPageFile}`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log(`📄 File not found (will be created if needed): ${yearPageFile}`);
    }
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

async function readExistingUuid(filePath: string): Promise<string | undefined> {
  try {
    const content = await Deno.readTextFile(filePath);
    if (filePath.endsWith('.yml')) {
      const data = parseYaml(content) as Record<string, unknown>;
      return data._uuid as string;
    } else {
      const { frontMatter } = extractFrontMatter(content);
      return frontMatter._uuid as string;
    }
  } catch {
    return undefined;
  }
}

async function copyFile(source: string, destination: string): Promise<boolean> {
  try {
    // Get source file stats
    const sourceStats = await Deno.stat(source);
    
    try {
      // Check if destination exists and compare modification times
      const destStats = await Deno.stat(destination);
      
      // If source is newer than destination, copy it
      if (sourceStats.mtime && destStats.mtime && sourceStats.mtime > destStats.mtime) {
        await Deno.copyFile(source, destination);
        console.log(`🔄 Updated (source newer): ${destination}`);
        return true; // File was updated
      } else {
        console.log(`⏭️  Skipped (up to date): ${destination}`);
        return false; // File was skipped
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        // Destination doesn't exist, proceed with copy
        await Deno.copyFile(source, destination);
        console.log(`📄 Copied: ${destination}`);
        return true; // File was copied
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${source} -> ${destination}:`, error);
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
    
    const wasCopied = await copyFile(sourcePath, targetPath);
    if (wasCopied) {
      console.log(`📋 ${articleFile} -> ${targetPath}`);
      
      // Transform front matter for articles (not unused files)
      if (destination === "Developer Articles" || destination === "User Articles") {
        console.log(`🔄 Transforming: ${articleFile}`);
        await transformArticleFrontMatter(targetPath);
      }
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

async function transformArticleFrontMatter(filePath: string, existingUuid?: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const { frontMatter, body } = extractFrontMatter(content);
  
  // Create new front matter structure
  const newFrontMatter: Record<string, unknown> = {
    _schema: frontMatter._schema || "default",
    _uuid: existingUuid || frontMatter._uuid || generateUUID(),
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
    
    // Add docshots to author_notes if it doesn't exist
    if (!remainingAuthorNotes.docshots) {
      remainingAuthorNotes.docshots = Object.keys(docshots).length > 0 ? docshots : {};
    }
    
    if (Object.keys(remainingAuthorNotes).length > 0) {
      newFrontMatter.author_notes = remainingAuthorNotes;
    }
  } else {
    // If author_notes doesn't exist, create it with an empty docshots field
    newFrontMatter.author_notes = {
      docshots: {}
    };
  }
  
  // Copy any other fields that aren't nav_title, published, or the ones we moved to details
  const excludedFields = [
    'nav_title', 'published', 'title', 'description', 'image', 'article_category', 
    'related_articles', 'article_topic', 'tags', '_schema', '_uuid', '_created_at', 'author_notes'
  ];
  
  for (const [key, value] of Object.entries(frontMatter)) {
    if (!excludedFields.includes(key)) {
      newFrontMatter[key] = value;
    }
  }
  
  const newContent = createFrontMatter(newFrontMatter, body);
  await Deno.writeTextFile(filePath, newContent);
}

async function transformGuideFrontMatter(filePath: string, existingUuid?: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const { frontMatter, body } = extractFrontMatter(content);
  
  // Create new front matter structure
  const newFrontMatter: Record<string, unknown> = {
    _schema: frontMatter._schema || "default",
    _uuid: existingUuid || frontMatter._uuid || generateUUID(),
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

async function transformGuideDataFile(filePath: string, existingUuid?: string): Promise<void> {
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
  
  // Preserve existing UUID or add one if it doesn't exist
  newData._uuid = existingUuid || data._uuid || generateUUID();
  
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
        
        // Ensure target guide directory exists
        await Deno.mkdir(targetGuideDir, { recursive: true });
        
        console.log(`📋 Processing guide: ${entry.name}`);
        let filesCopied = 0;
        
        // Copy individual files from source to target, preserving existing UUIDs
        for await (const file of Deno.readDir(sourceDir)) {
          const sourcePath = join(sourceDir, file.name);
          const targetPath = join(targetGuideDir, file.name);
          
          // Read existing UUID before copying
          const existingUuid = await readExistingUuid(targetPath);
          
          if (await copyFile(sourcePath, targetPath)) {
            filesCopied++;
            
            // Transform the copied file with preserved UUID
            if (file.name.endsWith(".mdx")) {
              console.log(`🔄 Transforming: ${file.name}`);
              await transformGuideFrontMatter(targetPath, existingUuid);
            } else if (file.name === "_data.yml") {
              console.log(`🔄 Transforming: _data.yml`);
              await transformGuideDataFile(targetPath, existingUuid);
            }
          }
        }
        
        if (filesCopied > 0) {
          guideCount++;
          console.log(`✅ Copied ${filesCopied} files for guide: ${entry.name}`);
        } else {
          console.log(`⏭️  No new files copied for guide: ${entry.name}`);
        }
        
        // Transform any remaining files in the target guide directory that weren't just copied
        for await (const file of Deno.readDir(targetGuideDir)) {
          if (file.isFile) {
            const filePath = join(targetGuideDir, file.name);
            const sourcePath = join(sourceDir, file.name);
            
            // Only transform if this file wasn't just copied (to avoid double transformation)
            try {
              const sourceStats = await Deno.stat(sourcePath);
              const destStats = await Deno.stat(filePath);
              
              // If destination is newer or same age, it wasn't just copied, so transform it
              if (!sourceStats.mtime || !destStats.mtime || destStats.mtime >= sourceStats.mtime) {
                if (file.name.endsWith(".mdx")) {
                  console.log(`🔄 Transforming existing: ${file.name}`);
                  await transformGuideFrontMatter(filePath);
                } else if (file.name === "_data.yml") {
                  console.log(`🔄 Transforming existing: _data.yml`);
                  await transformGuideDataFile(filePath);
                }
              }
            } catch {
              // If source doesn't exist, this is a destination-only file, transform it
              if (file.name.endsWith(".mdx")) {
                console.log(`🔄 Transforming existing: ${file.name}`);
                await transformGuideFrontMatter(filePath);
              } else if (file.name === "_data.yml") {
                console.log(`🔄 Transforming existing: _data.yml`);
                await transformGuideDataFile(filePath);
              }
            }
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

async function transformChangelogFrontMatter(filePath: string, existingUuid?: string): Promise<void> {
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
  
  // Preserve existing UUID if it exists
  if (existingUuid) {
    newFrontMatter._uuid = existingUuid;
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
        const wasCopied = await copyFile(sourcePath, targetPath);
        
        if (wasCopied) {
          // Transform front matter to remove type field
          console.log(`🔄 Transforming: ${newFilename}`);
          await transformChangelogFrontMatter(targetPath);
          
          console.log(`📋 ${entry.name} -> ${year}/${newFilename}`);
          migratedCount++;
        } else {
          skippedCount++;
        }
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
  
  // Add redirects for guides (all guides go to developer-guides)
  newRoutes.push({
    from: "/documentation/changelog/(.*).html",
    to: "/documentation/changelog/$1/",
    status: 301
  });
  console.log(`🔗 /documentation/changelog/ -> /documentation/changelog/ (without html extension)`);

  // Add redirects for changelogs (all changelogs go to new_changelogs)
  newRoutes.push({
    from: "/documentation/guides/(.*)",
    to: "/documentation/developer-guides/$1",
    status: 301
  });
  console.log(`🔗 /documentation/guides/ -> /documentation/developer-guides/`);

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

async function updateInternalLinks(lookup: Map<string, string>): Promise<{ updatedFiles: number, totalUpdates: number }> {
  console.log("\n🚀 Starting internal link updates...");
  
  let updatedFiles = 0;
  let totalUpdates = 0;
  
  const directories = ["developer/articles", "user/articles", "developer/guides"];
  
  for (const dir of directories) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isFile && entry.name.endsWith(".mdx")) {
          const filePath = join(dir, entry.name);
          const updated = await updateLinksInFile(filePath, lookup);
          if (updated > 0) {
            updatedFiles++;
            totalUpdates += updated;
            console.log(`🔗 Updated ${updated} links in: ${filePath}`);
          }
        } else if (entry.isDirectory) {
          // Handle guide subdirectories
          const subDir = join(dir, entry.name);
          try {
            for await (const subEntry of Deno.readDir(subDir)) {
              if (subEntry.isFile && subEntry.name.endsWith(".mdx")) {
                const filePath = join(subDir, subEntry.name);
                const updated = await updateLinksInFile(filePath, lookup);
                if (updated > 0) {
                  updatedFiles++;
                  totalUpdates += updated;
                  console.log(`🔗 Updated ${updated} links in: ${filePath}`);
                }
              }
            }
          } catch (_error) {
            // Skip if not a directory or can't read
          }
        }
      }
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️  Warning reading directory ${dir}:`, (error as Error).message);
      }
    }
  }
  
  console.log(`✅ Internal link updates completed: ${totalUpdates} links updated in ${updatedFiles} files`);
  return { updatedFiles, totalUpdates };
}

async function updateLinksInFile(filePath: string, lookup: Map<string, string>): Promise<number> {
  try {
    let content = await Deno.readTextFile(filePath);
    let updateCount = 0;
    
    // Regex to match internal documentation article links
    // Matches: /documentation/articles/filename/ (with optional hash and query params)
    const articleLinkRegex = /\/documentation\/articles\/([^\/\s\)]+)\/((?:#[^?\s\)]*)?(?:\?[^\s\)]*)?)/g;
    
    content = content.replace(articleLinkRegex, (match, filename, suffix) => {
      const destination = lookup.get(filename);
      
      if (destination === "Developer Articles") {
        updateCount++;
        return `/documentation/developer-articles/${filename}/${suffix}`;
      } else if (destination === "User Articles") {
        updateCount++;
        return `/documentation/user-articles/${filename}/${suffix}`;
      }
      
      // If not in lookup or going to unused, leave unchanged
      return match;
    });
    
    // Special case for articles index page
    const articleIndexRegex = /\/documentation\/articles\/((?:#[^?\s\)]*)?(?:\?[^\s\)]*)?)/g;
    content = content.replace(articleIndexRegex, (_match, suffix) => {
      updateCount++;
      return `/documentation/developer-articles/${suffix}`;
    });
    
    // Regex to match internal documentation guide links
    // Matches: /documentation/guides/guide-name/ (with optional hash and query params)
    const guideLinkRegex = /\/documentation\/guides\/([^\/\s\)]+)\/((?:#[^?\s\)]*)?(?:\?[^\s\)]*)?)/g;
    
    content = content.replace(guideLinkRegex, (_match, guideName, suffix) => {
      updateCount++;
      return `/documentation/developer-guides/${guideName}/${suffix}`;
    });
    
    // Special case for guides index page
    const guideIndexRegex = /\/documentation\/guides\/((?:#[^?\s\)]*)?(?:\?[^\s\)]*)?)/g;
    content = content.replace(guideIndexRegex, (_match, suffix) => {
      updateCount++;
      return `/documentation/developer-guides/${suffix}`;
    });
    
    // Write back if any updates were made
    if (updateCount > 0) {
      await Deno.writeTextFile(filePath, content);
    }
    
    return updateCount;
  } catch (error) {
    console.warn(`⚠️  Warning updating links in ${filePath}:`, (error as Error).message);
    return 0;
  }
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
    
    // Update internal links in migrated files
    const linkStats = await updateInternalLinks(lookup);
    
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
    
    console.log("\n🔗 Internal Links:");
    console.log(`   Updated Files: ${linkStats.updatedFiles} files`);
    console.log(`   Total Link Updates: ${linkStats.totalUpdates} links`);
    
    const grandTotal = articleStats.totalCount + guideStats.guideCount + changelogStats.migratedCount;
    console.log(`\n🏆 Grand Total: ${grandTotal} items migrated successfully!`);
    console.log(`📄 Routing: ${routingStats.redirectCount} redirect rules generated`);
    console.log(`🔗 Links: ${linkStats.totalUpdates} internal links updated`);
    console.log("\n✅ All migrations completed successfully! 🎊");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    Deno.exit(1);
  }
}

