#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Extract DataReferenceRow components from MDX files and convert to YAML format
 * Maps labels to configuration-types JSON paths for CloudCannon config documentation
 */

import { dump, load } from "npm:js-yaml@4.1.0";

// Configuration types documentation directory
const DOCS_DIR = '/Users/georgephillips/Work/cloudcannon/configuration-types/docs/documentation';

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
  source?: string;
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
      return mapInputsLabel(label);
    case 'configuration-file-reference':
      return mapConfigurationFileLabel(label);  

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

function mapConfigurationFileLabel(label: string): string {
  const configurationFileMappings: Record<string, string> = {
    'paths': 'type.paths',
    '_enabled_editors': 'type._enabled_editors',
    '_inputs': 'type._inputs',
    '_select_data': 'type._select_data',
    '_structures': 'type._structures',
    '_editables': 'type._editables',
    '_snippets_imports': 'type._snippets_imports',
    '_snippets': 'type._snippets',
    'timezone': 'type.timezone',
    'schemas_from_glob': 'collections_config.*.schemas_from_glob',
    '_inputs_from_glob': 'type._inputs_from_glob',
    '_structures_from_glob': 'type._structures_from_glob',
    'values_from_glob': 'type.structure.values_from_glob',
    '_editables_from_glob': 'type._editables_from_glob',
  }
  return configurationFileMappings[label] || label;
}

function mapInputsLabel(label: string): string {
  const inputsMappings: Record<string, string> = {
  '_inputs': 'type._inputs',
  // '_inputs.*.type': 'type._inputs.*.type',
  '_inputs.*.label': 'type._inputs.*.label',
  '_inputs.*.comment': 'type._inputs.*.comment',
  '_inputs.*.context': 'type._inputs.*.context',
  '_inputs.*.context.open': 'type._inputs.*.context.open',
  '_inputs.*.context.title': 'type._inputs.*.context.title',
  '_inputs.*.context.icon': 'type._inputs.*.context.icon',
  '_inputs.*.context.content': 'type._inputs.*.context.content',
  // '_inputs.*.options': 'type._inputs.*.options',
  '_inputs.*.hidden': 'type._inputs.*.hidden',
  '_inputs.*.disabled': 'type._inputs.*.disabled',
  '_inputs.*.instance_value': 'type._inputs.*.instance_value',
  '_inputs.*.cascade': 'type._inputs.*.cascade',
  '_inputs.*.options.required': 'type._inputs.*.options.required',
  '_inputs.*.options.required_message': 'type._inputs.*.options.required_message',
  '_inputs.*.options.max': 'type._inputs.*.options.max',
  '_inputs.*.options.max_message': 'type._inputs.*.options.max_message',
  '_inputs.*.options.min': 'type._inputs.*.options.min',
  '_inputs.*.options.min_message': 'type._inputs.*.options.min_message',
  '_inputs.*.options.max_file_size': 'type._inputs.*.options.max_file_size',
  '_inputs.*.options.max_file_size_message': 'type._inputs.*.options.max_file_size_message',
  '_inputs.*.options.max_items': 'type._inputs.*.options.max_items',
  '_inputs.*.options.max_items_message': 'type._inputs.*.options.max_items_message',
  '_inputs.*.options.min_items': 'type._inputs.*.options.min_items',
  '_inputs.*.options.min_items_message': 'type._inputs.*.options.min_items_message',
  '_inputs.*.options.max_length': 'type._inputs.*.options.max_length',
  '_inputs.*.options.max_length_message': 'type._inputs.*.options.max_length_message',
  '_inputs.*.options.min_length': 'type._inputs.*.options.min_length',
  '_inputs.*.options.min_length_message': 'type._inputs.*.options.min_length_message',
  '_inputs.*.options.pattern': 'type._inputs.*.options.pattern',
  '_inputs.*.options.pattern_message': 'type._inputs.*.options.pattern_message',
  '_inputs.*.options.start_from': 'type._inputs.*.(date-input).options.start_from',
  '_inputs.*.options.start_from_message': 'type._inputs.*.(date-input).options.start_from_message',
  '_inputs.*.options.end_before': 'type._inputs.*.(date-input).options.end_before',
  '_inputs.*.options.end_before_message': 'type._inputs.*.(date-input).options.end_before_message',
  '_inputs.*.options.unique_on': 'type._inputs.*.options.unique_on',
  '_inputs.*.options.unique_on_message': 'type._inputs.*.options.unique_on_message',
}
  return inputsMappings[label] || `type._inputs.*.${label}`;
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
    'documentation': 'type.documentation',
    'documentation.url': 'type.documentation.url',
    'documentation.text': 'type.documentation.text',
    'documentation.icon': 'type.documentation.icon',
    'preview': 'type.preview',
    'sort': 'collections_config.*.sort',
    'sort.key': 'collections_config.*.sort.key',
    'sort.order': 'collections_config.*.sort.order',
    'sort_options': 'collections_config.*.sort_options',
    'sort_options.key': 'collections_config.*.sort_options.[*].key',
    'sort_options.order': 'collections_config.*.sort_options.[*].order',
    'sort_options.label': 'collections_config.*.sort_options.[*].label',
    'singular_name': 'collections_config.*.singular_name',
    '_editables': 'type._editables',
    '_enabled_editors': 'type._enabled_editors',
    '_inputs': 'type._inputs',
    '_select_data': 'type._select_data',
    '_structures': 'type._structures',
    'schemas': 'collections_config.*.schemas',
    'schema_key': 'collections_config.*.schema_key',
    'add_options': 'collections_config.*.add_options',
    'add_options.name': 'collections_config.*.add_options.[*].(add-option).name',
    'add_options.icon': 'collections_config.*.add_options.[*].(add-option).icon',
    'add_options.editor': 'collections_config.*.add_options.[*].(add-option).editor',
    'add_options.base_path': 'collections_config.*.add_options.[*].(add-option).base_path',
    'add_options.collection': 'collections_config.*.add_options.[*].(add-option).collection',
    'add_options.schema': 'collections_config.*.add_options.[*].(add-option).schema',
    'add_options.default_content_file': 'collections_config.*.add_options.[*].(add-option).default_content_file',
    'add_options.href': 'collections_config.*.add_options.[*].(href-add-option).href',
    'create': 'type.create',
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
    // Parser config types
    'argument': 'type.snippet.params.*.(argument-parser-config)',
    'argument_list': 'type.snippet.params.*.(argument-list-parser-config)',
    'key_values': 'type.snippet.params.*.(key-value-list-parser-config)',
    'content': 'type.snippet.params.*.(content-parser-config)',
    'literal': 'type.snippet.params.*.(literal-parser-config)',
    'repeating_literal': 'type.snippet.params.*.(repeating-literal-parser-config)',
    'optional': 'type.snippet.params.*.(optional-parser-config)',
    'repeating': 'type.snippet.params.*.(repeating-parser-config)',
    
    // Model properties (type.snippet-model.*)
    'model': 'type.snippet-model',
    'model.editor_key': 'type.snippet-model.editor_key',
    'model.allowed_values': 'type.snippet-model.allowed_values',
    'model.default': 'type.snippet-model.default',
    'model.implied_boolean': 'type.snippet-model.implied_boolean',
    'model.optional': 'type.snippet-model.optional',
    'model.remove_empty': 'type.snippet-model.remove_empty',
    
    // Format properties (type.snippet-format.*)
    'format': 'type.snippet-format',
    'root_boundary': 'type.snippet-format.root_boundary',
    'remove_empty_root_boundary': 'type.snippet-format.remove_empty_root_boundary',
    'root_value_delimiter': 'type.snippet-format.root_value_delimiter',
    'root_pair_delimiter': 'type.snippet-format.root_pair_delimiter',
    'root_value_boundary': 'type.snippet-format.root_value_boundary',
    'root_value_boundary_optional': 'type.snippet-format.root_value_boundary_optional',
    'string_boundary': 'type.snippet-format.string_boundary',
    'string_escape_character': 'type.snippet-format.string_escape_character',
    'object_boundary': 'type.snippet-format.object_boundary',
    'object_value_delimiter': 'type.snippet-format.object_value_delimiter',
    'object_pair_delimiter': 'type.snippet-format.object_pair_delimiter',
    'array_boundary': 'type.snippet-format.array_boundary',
    'array_delimiter': 'type.snippet-format.array_delimiter',
    'forbidden_tokens': 'type.snippet-format.forbidden_tokens',
    'allow_booleans': 'type.snippet-format.allow_booleans',
    'allow_numbers': 'type.snippet-format.allow_numbers',
    'allow_implied_values': 'type.snippet-format.allow_implied_values',
    
    // Content parser options
    'editor_key': 'type.snippet.params.*.(content-parser-config).options.editor_key',
    'indented_by': 'type.snippet.params.*.(content-parser-config).options.indented_by',
    'allow_leading': 'type.snippet.params.*.(content-parser-config).options.allow_leading',
    'trim_text': 'type.snippet.params.*.(content-parser-config).options.trim_text',
    'allow_nested': 'type.snippet.params.*.(content-parser-config).options.allow_nested',
    'raw': 'type.snippet.params.*.(content-parser-config).options.raw',
    'parse_newline_character': 'type.snippet.params.*.(content-parser-config).options.parse_newline_character',
    
    // Repeating literal parser options
    'minimum': 'type.snippet.params.*.(repeating-literal-parser-config).options.minimum',
    
    // Repeating parser options
    'default_length': 'type.snippet.params.*.(repeating-parser-config).options.default_length',
    'output': 'type.snippet.params.*.(repeating-parser-config).options.output_delimiter',
    'between': 'type.snippet.params.*.(repeating-parser-config).options.output_delimiter',
    
    // Optional/wrapper parser options
    'remove_empty': 'type.snippet.params.*.(optional-parser-config).options.remove_empty',
    'snippet': 'type.snippet.params.*.(optional-parser-config).options.snippet',
    
    // Wrapper style options
    'style': 'type.snippet.params.*.(wrapper-parser-config).options.style',
    'inline.leading': 'type.snippet.params.*.(wrapper-parser-config).options.style.inline.leading',
    'inline.trailing': 'type.snippet.params.*.(wrapper-parser-config).options.style.inline.trailing',
    'block.leading': 'type.snippet.params.*.(wrapper-parser-config).options.style.block.leading',
    'block.trailing': 'type.snippet.params.*.(wrapper-parser-config).options.style.block.trailing',
    'block.indent': 'type.snippet.params.*.(wrapper-parser-config).options.style.block.indent',
    
    // Models (argument-list parser)
    'models': 'type.snippet.params.*.(argument-list-parser-config).options.models',
    'models[*].editor_key': 'type.snippet-model.editor_key',
    'models[*].source_key': 'type.snippet-model.source_key',
    'models[*].default': 'type.snippet-model.default',
    'models[*].optional': 'type.snippet-model.optional',
    'models[*].remove_empty': 'type.snippet-model.remove_empty',
    
    // Default for standalone options that might appear in multiple contexts
    'default': 'type.snippet.params.*.(content-parser-config).options.default',
  };
  
  return snippetMappings[label] || `type.snippet.params.*.${label}`;
}

function mapStructureLabel(label: string): string {
  const structureMappings: Record<string, string> = {
    '_structures': 'type._structures',
    'values': 'type.structure.values',
    '_inputs': 'type._inputs',
    'id': 'type.structure.values.[*].id',
    'default': 'type.structure.values.[*].default',
    'tabbed': 'type.structure.values.[*].tabbed',
    'tags': 'type.structure.values.[*].tags',
    'value': 'type.structure.values.[*].value',
    'groups': 'type.structure.values.[*].groups',
    'label': 'type.structure.values.[*].label',
    'picker_preview': 'type.preview',
    'preview': 'type.preview',
  }
  return structureMappings[label] || `type.structure.${label}`;
}

function mapSchemaLabel(label: string): string {
  const schemaMappings: Record<string, string> = {
    'create': 'type.create',
    'hide_extra_inputs': 'collections_config.*.schemas.*.hide_extra_inputs',
    'icon': 'collections_config.*.schemas.*.icon',
    'name': 'collections_config.*.schemas.*.name',
    'new_preview_url': 'collections_config.*.schemas.*.new_preview_url',
    'path': 'collections_config.*.schemas.*.path',
    'preview': 'type.preview',
  }
  return schemaMappings[label] || `collections_config.*.schemas.*.${label}`;
}

function mapRichTextLabel(label: string): string {
  const richTextMappings: Record<string, string> = {
    'blockquote': 'type._editables.*.blockquote',
    'bold': 'type._editables.*.bold',
    'format': 'type._editables.*.format',
    'italic': 'type._editables.*.italic',
    'link': 'type._editables.*.link',
    'strike': 'type._editables.*.strike',
    'subscript': 'type._editables.*.subscript',
    'superscript': 'type._editables.*.superscript',
    'underline': 'type._editables.*.underline',
    'styles': 'type._editables.*.styles',
    'left': 'type._editables.*.left',
    'center': 'type._editables.*.center',
    'right': 'type._editables.*.right',
    'justify': 'type._editables.*.justify',
    'bulletedlist': 'type._editables.*.bulletedlist',
    'numberedlist': 'type._editables.*.numberedlist',
    'indent': 'type._editables.*.indent',
    'outdent': 'type._editables.*.outdent',
    'join_above': 'type._editables.*.join_above',
    'join_below': 'type._editables.*.join_below',
  'image_size_attributes': 'type._inputs.*.options.image_size_attributes',
    'width': 'type._inputs.*.options.width',
    'height': 'type._inputs.*.options.height',
    'resize_style': 'type._inputs.*.options.resize_style',
    'mime_type': 'type._inputs.*.options.mime_type',
    'expandable': 'type._inputs.*.options.expandable',
    'allowed_sources': 'type._inputs.*.options.allowed_sources',
    'code': 'type._editables.*.code',
    'embed': 'type._editables.*.embed',
    'horizontalrule': 'type._editables.*.horizontalrule',
    'image': 'type._editables.*.image',
    'table': 'type._editables.*.table',
    'snippet': 'type._editables.*.snippet',
    'undo': 'type._editables.*.undo',
    'redo': 'type._editables.*.redo',
    'removeformat': 'type._editables.*.removeformat',
    'copyformatting': 'type._editables.*.copyformatting',
    'paths': 'type.paths',
    'paths.dam_static': 'type.paths.dam_static',
    'paths.dam_uploads': 'type.paths.dam_uploads',
    'paths.dam_uploads_filename': 'type.paths.dam_uploads_filename',
    'paths.static': 'type.paths.static',
    'paths.uploads': 'type.paths.uploads',
    'paths.uploads_filename': 'type.paths.uploads_filename',
    'allow_custom_markup': 'type._editables.*.allow_custom_markup',
    'remove_custom_markup': 'type._editables.*.remove_custom_markup',
  }

  return richTextMappings[label] || `type._editables.*.${label}`;
}

// Main extraction logic
function extractDataReferenceRows(content: string, filename: string): OutputEntry[] {
  const entries: OutputEntry[] = [];
  
  // Regex to match DataReferenceRow components
  const dataReferenceRowRegex = /<comp\.DataReferenceRow\s+label="([^"]+)"[^>]*>([\s\S]*?)<\/comp\.DataReferenceRow>/g;
  
  let match;
  while ((match = dataReferenceRowRegex.exec(content)) !== null) {
    const label = match[1];
    const rowContent = match[2];
    
    const entry = parseDataReferenceRow(label, rowContent, filename);
    entries.push(entry);
  }
  
  return entries;
}

function parseDataReferenceRow(label: string, content: string, filename: string): OutputEntry {
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
  
  // Track which code blocks are inside Example wrappers
  const codeBlocksInExamples = new Set<string>();
  
  // Find all Example blocks
  const exampleRegex = /<comp\.Example>([\s\S]*?)<\/comp\.Example>/g;
  
  let match;
  while ((match = exampleRegex.exec(content)) !== null) {
    const exampleContent = match[1];
    
    // Extract code blocks from this example (with positions)
    const codeBlocks = extractCodeBlocksWithPositions(exampleContent);
    
    // Sort by position to process in order
    codeBlocks.sort((a, b) => a.startIndex - b.startIndex);
    
    let lastEndIndex = 0;
    
    for (const codeBlock of codeBlocks) {
      // Mark this code block as being inside an Example
      codeBlocksInExamples.add(codeBlock.code);
      
      // Get description (text between last code block and this one)
      const descriptionText = exampleContent.substring(lastEndIndex, codeBlock.startIndex);
      const description = cleanMarkdown(descriptionText).trim();
      
      const example: Example = {
        description,
        language: codeBlock.language.toLowerCase(),
        code: codeBlock.code,
        annotations: extractAnnotations(codeBlock.blockContent)
      };
      if (codeBlock.source) {
        example.source = codeBlock.source;
      }
      examples.push(example);
      
      // Update lastEndIndex to after this code block
      lastEndIndex = codeBlock.startIndex + codeBlock.fullMatch.length;
    }
  }
  
  // Also check for code blocks outside of Example wrappers
  const directCodeBlocks = extractCodeBlocks(content);
  for (const codeBlock of directCodeBlocks) {
    // Skip if this code block was already captured from inside an Example
    if (codeBlocksInExamples.has(codeBlock.code)) continue;
    
    const example: Example = {
      description: "",
      language: codeBlock.language.toLowerCase(),
      code: codeBlock.code,
      annotations: extractAnnotations(codeBlock.blockContent)
    };
    if (codeBlock.source) {
      example.source = codeBlock.source;
    }
    examples.push(example);
  }
  
  return examples;
}

function extractCodeBlocksWithPositions(content: string): Array<{fullMatch: string, blockContent: string, language: string, code: string, source?: string, startIndex: number}> {
  const codeBlocks: Array<{fullMatch: string, blockContent: string, language: string, code: string, source?: string, startIndex: number}> = [];
  
  // Match MultiCodeBlock - capture the full opening tag to extract attributes
  const multiCodeBlockRegex = /<comp\.MultiCodeBlock\s+([^>]*)>([\s\S]*?)<\/comp\.MultiCodeBlock>/g;
  let match;
  while ((match = multiCodeBlockRegex.exec(content)) !== null) {
    const attributes = match[1];
    const blockContent = match[2];
    
    // Extract language
    const languageMatch = attributes.match(/language="([^"]+)"/);
    const language = languageMatch ? languageMatch[1] : 'yaml';
    
    // Extract source if present
    const sourceMatch = attributes.match(/source="([^"]+)"/);
    const source = sourceMatch ? sourceMatch[1] : undefined;
    
    // Extract code from backticks - preserve internal whitespace structure
    const codeMatch = blockContent.match(/```+\n?([\s\S]*?)\n?\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        blockContent,
        language,
        code: normalizeCodeIndentation(codeMatch[1], language),
        source,
        startIndex: match.index
      });
    }
  }
  
  // Match CodeBlock
  const codeBlockRegex = /<comp\.CodeBlock\s+([^>]*)>([\s\S]*?)<\/comp\.CodeBlock>/g;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const attributes = match[1];
    const blockContent = match[2];
    
    // Extract language
    const languageMatch = attributes.match(/language="([^"]+)"/);
    const language = languageMatch ? languageMatch[1] : 'yaml';
    
    // Extract source if present
    const sourceMatch = attributes.match(/source="([^"]+)"/);
    const source = sourceMatch ? sourceMatch[1] : undefined;
    
    // Extract code from backticks - preserve internal whitespace structure
    const codeMatch = blockContent.match(/```+\n?([\s\S]*?)\n?\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        blockContent,
        language,
        code: normalizeCodeIndentation(codeMatch[1], language),
        source,
        startIndex: match.index
      });
    }
  }
  
  return codeBlocks;
}

function extractCodeBlocks(content: string): Array<{fullMatch: string, blockContent: string, language: string, code: string, source?: string}> {
  const codeBlocks: Array<{fullMatch: string, blockContent: string, language: string, code: string, source?: string}> = [];
  
  // Match MultiCodeBlock
  const multiCodeBlockRegex = /<comp\.MultiCodeBlock\s+([^>]*)>([\s\S]*?)<\/comp\.MultiCodeBlock>/g;
  let match;
  while ((match = multiCodeBlockRegex.exec(content)) !== null) {
    const attributes = match[1];
    const blockContent = match[2];
    
    // Extract language
    const languageMatch = attributes.match(/language="([^"]+)"/);
    const language = languageMatch ? languageMatch[1] : 'yaml';
    
    // Extract source if present
    const sourceMatch = attributes.match(/source="([^"]+)"/);
    const source = sourceMatch ? sourceMatch[1] : undefined;
    
    // Extract code from backticks - preserve internal whitespace structure
    const codeMatch = blockContent.match(/```+\n?([\s\S]*?)\n?\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        blockContent,
        language,
        code: normalizeCodeIndentation(codeMatch[1], language),
        source
      });
    }
  }
  
  // Match CodeBlock
  const codeBlockRegex = /<comp\.CodeBlock\s+([^>]*)>([\s\S]*?)<\/comp\.CodeBlock>/g;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const attributes = match[1];
    const blockContent = match[2];
    
    // Extract language
    const languageMatch = attributes.match(/language="([^"]+)"/);
    const language = languageMatch ? languageMatch[1] : 'yaml';
    
    // Extract source if present
    const sourceMatch = attributes.match(/source="([^"]+)"/);
    const source = sourceMatch ? sourceMatch[1] : undefined;
    
    // Extract code from backticks - preserve internal whitespace structure
    const codeMatch = blockContent.match(/```+\n?([\s\S]*?)\n?\s*```+/);
    if (codeMatch) {
      codeBlocks.push({
        fullMatch: match[0],
        blockContent,
        language,
        code: normalizeCodeIndentation(codeMatch[1], language),
        source
      });
    }
  }
  
  return codeBlocks;
}

function normalizeCodeIndentation(code: string, language: string): string {
  const lines = code.split('\n');
  
  // Remove empty lines from start and end
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  if (lines.length === 0) return '';

  // Use YAML normalization only for YAML/JSON files
  const isYaml = language.toLowerCase() === 'yaml' || language.toLowerCase() === 'yml' || language.toLowerCase() === 'json';

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
  
  // Convert Notice components to markdown blockquotes
  description = description.replace(
    /<comp\.Notice\s+info_type="[^"]*">\s*([\s\S]*?)\s*<\/comp\.Notice>/g,
    (_match, content) => {
      // Convert content to blockquote by prefixing each line with >
      const lines = content.trim().split('\n');
      return lines.map((line: string) => `> ${line}`).join('\n');
    }
  );
  
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
    quotingType: "'"
  });
}

// File matching functions
interface FileMatchResult {
  jsonPath: string;
  matchedFile: string | null;
  allMatches: string[];
}

async function getAllDocumentationFiles(): Promise<Set<string>> {
  const files = new Set<string>();
  
  for await (const entry of Deno.readDir(DOCS_DIR)) {
    if (entry.isFile && entry.name.endsWith('.yml')) {
      // Store the filename without .yml extension as the path identifier
      files.add(entry.name.replace('.yml', ''));
    }
  }
  
  return files;
}

function findMatchingFile(jsonPath: string, availableFiles: Set<string>): FileMatchResult {
  const allMatches: string[] = [];
  
  // Strategy: We want the EXACT match only
  // The documentation files in configuration-types are named exactly after their json path
  // e.g., "collections_config.*.path" -> "collections_config.*.path.yml"
  
  // Direct exact match
  if (availableFiles.has(jsonPath)) {
    allMatches.push(jsonPath);
  }
  
  return {
    jsonPath,
    matchedFile: allMatches.length === 1 ? allMatches[0] : null,
    allMatches
  };
}

interface ExtractedEntry {
  name: string;
  json_path: string;
  description: string;
  examples: Example[];
}

async function matchExtractedToDocumentation(dryRun: boolean = false): Promise<void> {
  console.log('\n📂 Loading documentation files from configuration-types...');
  
  const availableFiles = await getAllDocumentationFiles();
  console.log(`   Found ${availableFiles.size} documentation files`);
  
  // Track statistics
  const stats = {
    found: [] as { entry: ExtractedEntry, file: string, source: string }[],
    toCreate: [] as { entry: ExtractedEntry, source: string }[],
    notFound: [] as { entry: ExtractedEntry, source: string }[],
    multipleMatches: [] as { entry: ExtractedEntry, matches: string[], source: string }[]
  };
  
  // Track which documentation files are used by which entries (for global clash detection)
  const fileUsage = new Map<string, Array<{ entry: ExtractedEntry, source: string }>>();
  
  // Process each extracted file
  const extractedDir = 'extracted';
  for await (const dirEntry of Deno.readDir(extractedDir)) {
    if (!dirEntry.isFile || !dirEntry.name.endsWith('.yml')) continue;
    
    const filePath = `${extractedDir}/${dirEntry.name}`;
    console.log(`\n📖 Processing ${filePath}...`);
    
    const content = await Deno.readTextFile(filePath);
    const entries = load(content) as ExtractedEntry[];
    
    if (!Array.isArray(entries)) {
      console.log(`   ⚠️ Skipping - not an array`);
      continue;
    }
    
    for (const entry of entries) {
      const result = findMatchingFile(entry.json_path, availableFiles);
      
      if (result.allMatches.length === 0) {
        stats.toCreate.push({ entry, source: dirEntry.name });
      } else if (result.allMatches.length === 1) {
        stats.found.push({ entry, file: result.allMatches[0], source: dirEntry.name });
        
        // Track file usage for global clash detection
        const file = result.allMatches[0];
        if (!fileUsage.has(file)) {
          fileUsage.set(file, []);
        }
        fileUsage.get(file)!.push({ entry, source: dirEntry.name });
      } else {
        stats.multipleMatches.push({ 
          entry, 
          matches: result.allMatches,
          source: dirEntry.name 
        });
      }
    }
  }
  
  // Find global clashes (same documentation file used by multiple entries)
  // Resolve by choosing the entry with most examples (then longest description as tiebreaker)
  const clashResolutions = new Map<string, { winner: { entry: ExtractedEntry, file: string, source: string }, losers: Array<{ entry: ExtractedEntry, source: string }> }>();
  const globalClashes: Array<{ file: string, usedBy: Array<{ entry: ExtractedEntry, source: string }>, winner: { entry: ExtractedEntry, source: string } }> = [];
  
  for (const [file, usages] of fileUsage.entries()) {
    if (usages.length > 1) {
      // Sort by: 1) number of examples (desc), 2) description length (desc)
      const sorted = [...usages].sort((a, b) => {
        const examplesDiff = b.entry.examples.length - a.entry.examples.length;
        if (examplesDiff !== 0) return examplesDiff;
        return b.entry.description.length - a.entry.description.length;
      });
      
      const winner = sorted[0];
      const losers = sorted.slice(1);
      
      globalClashes.push({ file, usedBy: usages, winner });
      clashResolutions.set(file, { 
        winner: { entry: winner.entry, file, source: winner.source },
        losers 
      });
    }
  }
  
  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('📊 MATCHING RESULTS');
  console.log('='.repeat(80));
  
  console.log(`\n✅ FOUND (${stats.found.length} entries):`);
  for (const item of stats.found) {
    const resolution = clashResolutions.get(item.file);
    if (resolution) {
      const isWinner = resolution.winner.entry === item.entry;
      if (isWinner) {
        console.log(`   🏆 ${item.entry.name} → ${item.file}.yml (CLASH WINNER - ${item.entry.examples.length} examples)`);
      } else {
        console.log(`   ❌ ${item.entry.name} → ${item.file}.yml (clash loser - skipped)`);
      }
    } else {
      console.log(`   ✅ ${item.entry.name} → ${item.file}.yml`);
    }
  }
  
  console.log(`\n⚠️  MULTIPLE FILE MATCHES (${stats.multipleMatches.length} entries - single path matches multiple files):`);
  for (const item of stats.multipleMatches) {
    console.log(`   ${item.entry.json_path}`);
    console.log(`      (from ${item.source})`);
    for (const match of item.matches) {
      console.log(`      - ${match}.yml`);
    }
  }
  
  console.log(`\n🔄 GLOBAL CLASHES RESOLVED (${globalClashes.length} files had multiple entries - best chosen):`);
  for (const clash of globalClashes) {
    console.log(`   ${clash.file}.yml:`);
    for (const usage of clash.usedBy) {
      const isWinner = usage.entry === clash.winner.entry;
      const exCount = usage.entry.examples.length;
      const descLen = usage.entry.description.length;
      console.log(`      ${isWinner ? '🏆' : '  '} "${usage.entry.name}" (${exCount} examples, ${descLen} chars) from ${usage.source}${isWinner ? ' ← WINNER' : ''}`);
    }
  }
  
  console.log(`\n🆕 TO CREATE (${stats.toCreate.length} entries - will create new files):`);
  for (const item of stats.toCreate) {
    console.log(`   ${item.entry.name}`);
    console.log(`      json_path: ${item.entry.json_path}`);
    console.log(`      (from ${item.source})`);
  }
  
  console.log(`\n❌ NOT FOUND (${stats.notFound.length} entries):`);
  for (const item of stats.notFound) {
    console.log(`   ${item.entry.name}`);
    console.log(`      json_path: ${item.entry.json_path}`);
    console.log(`      (from ${item.source})`);
  }
  
  // Count how many will actually be updated (excluding clash losers)
  const toUpdate = stats.found.filter(item => {
    const resolution = clashResolutions.get(item.file);
    if (!resolution) return true; // No clash, include it
    return resolution.winner.entry === item.entry; // Only include clash winners
  });
  
  const clashWinners = globalClashes.length;
  const clashLosers = stats.found.length - toUpdate.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`📈 Summary: ${stats.found.length} found, ${stats.toCreate.length} to create, ${stats.multipleMatches.length} multiple file matches, ${globalClashes.length} clashes resolved, ${stats.notFound.length} not found`);
  console.log(`📝 Will update: ${toUpdate.length} files (${clashWinners} clash winners), create: ${stats.toCreate.length} files, skip: ${clashLosers} clash losers`);
  console.log('='.repeat(80));
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN - No files will be modified');
    console.log('   Run without --dry-run to actually update files');
    return;
  }
  
  // Now perform the actual updates
  console.log('\n📝 Updating documentation files...');
  
  let updated = 0;
  let created = 0;
  let errors = 0;
  
  for (const item of toUpdate) {
    const docFilePath = `${DOCS_DIR}/${item.file}.yml`;
    
    try {
      // Read existing documentation file
      const existingContent = await Deno.readTextFile(docFilePath);
      const existingDoc = load(existingContent) as Record<string, unknown>;
      
      // Update only description and examples
      existingDoc.description = item.entry.description;
      existingDoc.examples = item.entry.examples;
      
      // Write back
      const newContent = dump(existingDoc, {
        lineWidth: -1,
        noRefs: true,
        quotingType: "'",
        forceQuotes: false
      });
      
      await Deno.writeTextFile(docFilePath, newContent);
      console.log(`   ✅ Updated ${item.file}.yml`);
      updated++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error updating ${item.file}.yml: ${message}`);
      errors++;
    }
  }
  
  // Create new files
  console.log('\n📝 Creating new documentation files...');
  
  for (const item of stats.toCreate) {
    const jsonPath = item.entry.json_path;
    const docFilePath = `${DOCS_DIR}/${jsonPath}.yml`;
    
    try {
      // Generate URL from json_path
      const url = '/' + jsonPath
        .replace(/\./g, '/')
        .replace(/\*/g, '*')
        .replace(/\(([^)]+)\)/g, '($1)') + '/';
      
      // Create new documentation file
      const newDoc = {
        gid: jsonPath,
        url,
        title: '',
        description: item.entry.description,
        examples: item.entry.examples,
        show_in_navigation: false
      };
      
      const newContent = dump(newDoc, {
        lineWidth: -1,
        noRefs: true,
        quotingType: "'",
        forceQuotes: false
      });
      
      await Deno.writeTextFile(docFilePath, newContent);
      console.log(`   🆕 Created ${jsonPath}.yml`);
      created++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error creating ${jsonPath}.yml: ${message}`);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`🎉 Complete: ${updated} files updated, ${created} files created, ${errors} errors`);
  console.log('='.repeat(80));
}

// Main execution
async function main() {
  const args = Deno.args;
  const matchOnly = args.includes('--match-only');
  const dryRun = args.includes('--dry-run');
  
  console.log('Usage: deno run --allow-read --allow-write extract-data-reference.ts [--match-only] [--dry-run]');
  console.log('  --match-only  Skip extraction, only run matching');
  console.log('  --dry-run     Show what would be updated without writing files\n');
  
  if (!matchOnly) {
    console.log('🚀 Starting DataReference extraction...');
    
    for (const filePath of REFERENCE_FILES) {
      console.log(`📖 Processing ${filePath}...`);
      
      try {
        const content = await Deno.readTextFile(filePath);
        const entries = extractDataReferenceRows(content, filePath);
        
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
        const message = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Error processing ${filePath}:`, message);
      }
    }
    
    console.log('🎉 Extraction complete!');
  }
  
  // Always run matching after extraction (or alone with --match-only)
  await matchExtractedToDocumentation(dryRun);
}

if (import.meta.main) {
  await main();
}
