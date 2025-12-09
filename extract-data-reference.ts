#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Extract DataReferenceRow components from MDX files and convert to YAML format
 * Maps labels to configuration-types JSON paths for CloudCannon config documentation
 */

import { dump } from "npm:js-yaml@4.1.0";

// Interfaces
interface DataReferenceRow {
  label: string;
  type_markdown?: string;
  content: string;
}

interface Example {
  description: string;
  language: string;
  code: string;
  annotations: Annotation[];
}

interface Annotation {
  number: number;
  content: string;
}

interface OutputEntry {
  name: string;
  json_path: string;
  description: string;
  examples: Example[];
}

// File paths
const REFERENCE_FILES = [
  'articles/snippets-reference.mdx',
  'articles/structures-reference.mdx', 
  'articles/schemas-reference.mdx',
  'articles/rich-text-editor-reference.mdx',
  'articles/inputs-reference.mdx',
  'articles/configuration-file-reference.mdx',
  'articles/collections-reference.mdx'
];

// Label to JSON path mapping functions
function mapLabelToJsonPath(label: string, filename: string): string {
  const file = filename.split('/').pop()?.replace('.mdx', '') || '';
  
  switch (file) {
    case 'inputs-reference':
    case 'configuration-file-reference':
      // These files already have full paths
      return label;

    case 'collections-reference':
      return mapCollectionsLabel(label);
      
    case 'snippets-reference':
      return mapSnippetLabel(label);
      
    case 'structures-reference':
      return mapStructureLabel(label);
      
    case 'schemas-reference':
      return mapSchemaLabel(label);
      
    case 'rich-text-editor-reference':
      return mapRichTextLabel(label);
      
    default:
      return label;
  }
}

function mapCollectionsLabel(label: string): string {
  const collectionsMappings: Record<string, string> = {
    'collections_config': 'collections_config',
    'path': 'collections_config.*.path',
    'glob': 'collections_config.*.glob',
    'url': 'collections_config.*.url',
    'disable_url': 'collections_config.*.disable_url',
    'include_developer_files': 'collections_config.*.include_developer_files',
    'name': 'collections_config.*.name',
    'description': 'collections_config.*.description',
    'icon': 'collections_config.*.icon',
    'documentation': 'collections_config.*.documentation',
    'documentation.url': 'collections_config.*.documentation.url',
    'documentation.text': 'collections_config.*.documentation.text',
    'documentation.icon': 'collections_config.*.documentation.icon',
    'preview': 'collections_config.*.preview',
    'sort': 'collections_config.*.sort',
    'sort.key': 'collections_config.*.sort.key',
    'sort.order': 'collections_config.*.sort.order',
    'sort_options': 'collections_config.*.sort_options',
    'sort_options.key': 'collections_config.*.sort_options.key',
    'sort_options.order': 'collections_config.*.sort_options.order',
    'sort_options.label': 'collections_config.*.sort_options.label',
    'singular_name': 'collections_config.*.singular_name',
    '_editables': 'collections_config.*._editables',
    '_enabled_editors': 'collections_config.*._enabled_editors',
    '_inputs': 'collections_config.*._inputs',
    '_select_data': 'collections_config.*._select_data',
    '_structures': 'collections_config.*._structures',
    'schemas': 'collections_config.*.schemas',
    'schema_key': 'collections_config.*.schema_key',
    'add_options': 'collections_config.*.add_options',
    'add_options.name': 'collections_config.*.add_options.name',
    'add_options.icon': 'collections_config.*.add_options.icon',
    'add_options.editor': 'collections_config.*.add_options.editor',
    'add_options.base_path': 'collections_config.*.add_options.base_path',
    'add_options.collection': 'collections_config.*.add_options.collection',
    'add_options.schema': 'collections_config.*.add_options.schema',
    'add_options.default_content_file': 'collections_config.*.add_options.default_content_file',
    'add_options.href': 'collections_config.*.add_options.href',
    'create': 'collections_config.*.create',
    'disable_add': 'collections_config.*.disable_add',
    'disable_add_folder': 'collections_config.*.disable_add_folder',
    'disable_file_actions': 'collections_config.*.disable_file_actions',
    'new_preview_url': 'collections_config.*.new_preview_url'
  };
  return collectionsMappings[label] || label;
}

function mapSnippetLabel(label: string): string {
  // Map snippet labels to configuration-types paths
  const snippetMappings: Record<string, string> = {
    'argument': 'type.snippet.params.*.(argument-parser-config)',
    'argument_list': 'type.snippet.params.*.(argument-list-parser-config)',
    'key_values': 'type.snippet.params.*.(key-value-list-parser-config)',
    'content': 'type.snippet.params.*.(content-parser-config)',
    'literal': 'type.snippet.params.*.(literal-parser-config)',
    'repeating_literal': 'type.snippet.params.*.(repeating-literal-parser-config)',
    'optional': 'type.snippet.params.*.(optional-parser-config)',
    'repeating': 'type.snippet.params.*.(repeating-parser-config)',
    'model': 'type.snippet.params.*.(argument-parser-config).options.model',
    'format': 'type.snippet.params.*.(argument-parser-config).options.format',
    'models': 'type.snippet.params.*.(argument-list-parser-config).options.models',
    'style': 'type.snippet.params.*.(wrapper-parser-config).options.style',
    'snippet': 'type.snippet.params.*.(wrapper-parser-config).options.snippet'
  };
  
  // Handle nested properties
  if (label.includes('.')) {
    const parts = label.split('.');
    const base = parts[0];
    const rest = parts.slice(1).join('.');
    
    if (base === 'model') {
      return `type.snippet.params.*.(argument-parser-config).options.model.${rest}`;
    } else if (base === 'format') {
      return `type.snippet.params.*.(argument-parser-config).options.format.${rest}`;
    } else if (base === 'models[*]') {
      return `type.snippet.params.*.(argument-list-parser-config).options.models.[*].${rest}`;
    } else if (base === 'style') {
      return `type.snippet.params.*.(wrapper-parser-config).options.style.${rest}`;
    } else if (base.startsWith('inline.') || base.startsWith('block.')) {
      return `type.snippet.params.*.(wrapper-parser-config).options.style.${label}`;
    }
  }
  
  return snippetMappings[label] || `type.snippet.params.*.${label}`;
}

function mapStructureLabel(label: string): string {
  if (label === '_structures') return '_structures';
  if (label === 'values') return '_structures.*.values';
  if (label === '_inputs') return '_structures.*.values.[*]._inputs';
  if (['id', 'default', 'tabbed', 'tags', 'value', 'groups', 'label', 'picker_preview', 'preview'].includes(label)) {
    return `_structures.*.values.[*].${label}`;
  }
  return `_structures.*.${label}`;
}

function mapSchemaLabel(label: string): string {
  return `collections_config.*.schemas.*.${label}`;
}

function mapRichTextLabel(label: string): string {
  return `type._editables.*.${label}`;
}

// Main extraction logic
async function extractDataReferenceRows(content: string, filename: string): Promise<OutputEntry[]> {
  const entries: OutputEntry[] = [];
  
  // Regex to match DataReferenceRow components
  const dataReferenceRowRegex = /<comp\.DataReferenceRow\s+label="([^"]+)"[^>]*>([\s\S]*?)<\/comp\.DataReferenceRow>/g;
  
  let match;
  while ((match = dataReferenceRowRegex.exec(content)) !== null) {
    const label = match[1];
    const rowContent = match[2];
    
    const entry = await parseDataReferenceRow(label, rowContent, filename);
    entries.push(entry);
  }
  
  return entries;
}

async function parseDataReferenceRow(label: string, content: string, filename: string): Promise<OutputEntry> {
  const jsonPath = mapLabelToJsonPath(label, filename);
  
  // Extract examples
  const examples = extractExamples(content);
  
  // Extract description (content before first example + dangling descriptions)
  const description = extractDescription(content);
  
  return {
    name: label,
    json_path: jsonPath,
    description: description.trim(),
    examples
  };
}

function extractExamples(content: string): Example[] {
  const examples: Example[] = [];
  
  // Find all Example blocks
  const exampleRegex = /<comp\.Example>([\s\S]*?)<\/comp\.Example>/g;
  
  let match;
  while ((match = exampleRegex.exec(content)) !== null) {
    const exampleContent = match[1];
    
    // Extract code blocks from this example
    const codeBlocks = extractCodeBlocks(exampleContent);
    
    for (const codeBlock of codeBlocks) {
      // Get description (text before this code block within the example)
      const descriptionMatch = exampleContent.substring(0, exampleContent.indexOf(codeBlock.fullMatch));
      const description = cleanMarkdown(descriptionMatch).trim();
      
      examples.push({
        description,
        language: codeBlock.language.toLowerCase(),
        code: codeBlock.code,
        annotations: extractAnnotations(codeBlock.code)
      });
    }
  }
  
  // Also check for code blocks outside of Example wrappers
  const directCodeBlocks = extractCodeBlocks(content);
  for (const codeBlock of directCodeBlocks) {
    // Skip if this code block is already inside an Example
    if (content.includes(`<comp.Example>${codeBlock.fullMatch}</comp.Example>`)) continue;
    
    examples.push({
      description: "",
      language: codeBlock.language.toLowerCase(),
      code: codeBlock.code,
      annotations: extractAnnotations(codeBlock.code)
    });
  }
  
  return examples;
}

function extractCodeBlocks(content: string): Array<{fullMatch: string, language: string, code: string}> {
  const codeBlocks: Array<{fullMatch: string, language: string, code: string}> = [];
  
  // Match MultiCodeBlock
  const multiCodeBlockRegex = /<comp\.MultiCodeBlock\s+language="([^"]+)"[^>]*>([\s\S]*?)<\/comp\.MultiCodeBlock>/g;
  let match;
  while ((match = multiCodeBlockRegex.exec(content)) !== null) {
    const language = match[1];
    const blockContent = match[2];
    
    // Extract code from backticks
    const codeMatch = blockContent.match(/```+\s*([\s\S]*?)\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        language,
        code: normalizeCodeIndentation(codeMatch[1])
      });
    }
  }
  
  // Match CodeBlock
  const codeBlockRegex = /<comp\.CodeBlock\s+language="([^"]+)"[^>]*>([\s\S]*?)<\/comp\.CodeBlock>/g;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1];
    const blockContent = match[2];
    
    // Extract code from backticks
    const codeMatch = blockContent.match(/```+\s*([\s\S]*?)\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        language,
        code: normalizeCodeIndentation(codeMatch[1])
      });
    }
  }
  
  return codeBlocks;
}

function normalizeCodeIndentation(code: string): string {
  const lines = code.split('\n');
  
  // Remove empty lines from start and end
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  if (lines.length === 0) return '';

  // Determine if this looks like YAML (basic heuristic)
  const isYaml = lines.some(line => line.includes(':') || line.trim().startsWith('-'));

  if (isYaml) {
    // YAML-specific normalization
    return normalizeYamlIndentation(lines);
  } else {
    // Standard strip-min-indent for other languages
    let minIndent = Infinity;
    for (const line of lines) {
      if (line.trim() !== '') {
        const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
        minIndent = Math.min(minIndent, indent);
      }
    }
    
    if (minIndent > 0 && minIndent !== Infinity) {
      return lines.map(line => 
        line.trim() === '' ? '' : line.substring(minIndent)
      ).join('\n');
    }
    return lines.join('\n');
  }
}

function normalizeYamlIndentation(lines: string[]): string {
  // 1. Identify indentation levels
  const levels: number[] = [];
  const uniqueIndents = new Set<number>();
  
  for (const line of lines) {
    if (line.trim() === '') {
      levels.push(-1); // Marker for empty line
      continue;
    }
    const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
    levels.push(indent);
    uniqueIndents.add(indent);
  }

  // 2. Sort unique indent levels to map them to 0, 1, 2...
  const sortedIndents = Array.from(uniqueIndents).sort((a, b) => a - b);
  const indentMap = new Map<number, number>();
  sortedIndents.forEach((indent, index) => {
    indentMap.set(indent, index);
  });

  // 3. Reconstruct lines with 2-space indentation per level
  return lines.map((line, index) => {
    if (levels[index] === -1) return '';
    const originalIndent = levels[index];
    const newLevel = indentMap.get(originalIndent) || 0;
    return '  '.repeat(newLevel) + line.trim();
  }).join('\n');
}

function extractAnnotations(code: string): Annotation[] {
  const annotations: Annotation[] = [];
  const annotationRegex = /<comp\.Annotation\s+number="(\d+)"[^>]*>([\s\S]*?)<\/comp\.Annotation>/g;
  
  let match;
  while ((match = annotationRegex.exec(code)) !== null) {
    annotations.push({
      number: parseInt(match[1]),
      content: cleanMarkdown(match[2]).trim()
    });
  }
  
  return annotations;
}

function extractDescription(content: string): string {
  let description = content;
  
  // Handle dangling descriptions first (text that appears after examples)
  let danglingDescription = '';
  const exampleBlocks = content.match(/<comp\.Example>[\s\S]*?<\/comp\.Example>/g) || [];
  if (exampleBlocks.length > 0) {
    const lastExampleEnd = content.lastIndexOf('</comp.Example>');
    if (lastExampleEnd !== -1) {
      const danglingText = content.substring(lastExampleEnd + '</comp.Example>'.length);
      danglingDescription = cleanMarkdown(danglingText).trim();
    }
  }
  
  // Remove all Example blocks
  description = description.replace(/<comp\.Example>[\s\S]*?<\/comp\.Example>/g, '');
  
  // Remove any remaining code blocks
  description = description.replace(/<comp\.(Multi)?CodeBlock[^>]*>[\s\S]*?<\/comp\.(Multi)?CodeBlock>/g, '');
  
  // Clean up markdown and normalize whitespace
  description = cleanMarkdown(description).trim();
  
  // Append dangling description if it exists and isn't already included
  if (danglingDescription && !description.includes(danglingDescription)) {
    description += '\n\n' + danglingDescription;
  }
  
  return description.trim();
}

function cleanMarkdown(text: string): string {
  const lines = text.split('\n');
  
  // Remove empty lines from start and end
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  if (lines.length === 0) return '';

  // Determine min indent
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() !== '') {
      const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
      minIndent = Math.min(minIndent, indent);
    }
  }
  
  if (minIndent === Infinity) minIndent = 0;

  // Strip indent and trailing whitespace
  return lines.map(line => {
    if (line.trim() === '') return '';
    return line.substring(Math.min(minIndent, line.length)).replace(/\s+$/, '');
  }).join('\n');
}

// YAML serialization
function serializeToYaml(entries: OutputEntry[]): string {
  return dump(entries, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"'
  });
}

// Main execution
async function main() {
  console.log('🚀 Starting DataReference extraction...');
  
  for (const filePath of REFERENCE_FILES) {
    console.log(`📖 Processing ${filePath}...`);
    
    try {
      const content = await Deno.readTextFile(filePath);
      const entries = await extractDataReferenceRows(content, filePath);
      
      console.log(`   Found ${entries.length} DataReferenceRow components`);
      
      if (entries.length > 0) {
        const yaml = serializeToYaml(entries);
        const outputPath = filePath.replace('.mdx', '.yml').replace('articles/', 'extracted/');
        
        // Ensure output directory exists
        await Deno.mkdir('extracted', { recursive: true });
        
        await Deno.writeTextFile(outputPath, yaml);
        console.log(`   ✅ Saved to ${outputPath}`);
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  console.log('🎉 Extraction complete!');
}

if (import.meta.main) {
  await main();
}
