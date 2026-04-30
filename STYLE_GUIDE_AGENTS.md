# CloudCannon Style Guide — Agent Reference

Machine-readable style rules for AI agents and automated linters. These rules are a companion to the human-readable guide at `STYLE_GUIDE.mdx`, which contains the full prose explanations, examples, and rationale behind every rule. When rules conflict or a case is ambiguous, `STYLE_GUIDE.mdx` is authoritative.

**Before writing or editing any documentation, read `STYLE_GUIDE.mdx` in full.**

**For agents making updates to this file:** Also update the corresponding section in `STYLE_GUIDE.mdx` with the prose explanation and examples. Update the revision history in both files: `last_updated` and `style_guide_version` in the YAML block below, and the `Last Updated` and `Version` fields and the revision history table (Section 4) in `STYLE_GUIDE.mdx`.

```yaml
style_guide_version: "2.8"
last_updated: "2026-05-01"

terminology:
  disambiguation:
    editor:
      rule: "Do not use the bare word editor for a tool or product; it is ambiguous"
      qualify_with:
        - "Visual Editor, Content Editor, Data Editor, Source Editor (UI names per italics rules)"
        - "code editor, IDE, or named product (e.g. VS Code) for where developers write code"
        - "rich text editor, WYSIWYG editor, or name the host UI"
        - "Explicit person/role phrasing when meaning a human"
      compounds_allowed_when_context_clear:
        - "Visual Editor API"
        - "inEditorMode"
        - "editor-only (preview vs live Site when sentence names the environment)"
  required_terms:
    product_name: "CloudCannon"
    git_providers:
      - "GitHub"
      - "GitLab"
      - "Bitbucket"
    static_site_generators:
      - "Jekyll"
      - "Hugo"
      - "Eleventy"
      - "Astro"
      - "Next.js"
      - "Gatsby"
      - "SvelteKit"
      - "Nuxt"
  
  capitalized_concepts:
    - "Site"
    - "Organization"
    - "Collection"
    - "Team Member"
    - "Permission Group"
    - "Schema"
    - "Structure"
    - "Configuration File"
    - "Visual Editor"
    - "Content Editor"
    - "Data Editor"
    - "Source Editor"
    - "Collection Browser"
    - "File Browser"
    - "Sites Browser"
    - "Organizations Browser"
    - "Site Navigation"
    - "Site Header"
    - "App Sidebar"
  
  preferred_terms:
    "Git repository": ["repo", "git repo"]
    "Git provider": ["source provider", "git host"]
    "Site files": ["source files"]
    "Configuration File": ["config file"]
    "front matter": ["frontmatter", "Front Matter"]
    "webpage": ["web page"]
    "website": ["web site"]
    "email": ["e-mail"]
    "sign in": ["login (as verb)"]
    "log in": ["login (as verb)"]
    "dropdown": ["drop-down", "drop down"]
    "checkbox": ["check box"]
    "filename": ["file name"]
    "insecure": ["unsecure"]

prohibited_phrases:
  - "click here"
  - "read more"
  - "simply"
  - "just"
  - "easy"
  - "obviously"
  - "clearly"

voice_and_tense:
  voice: "active"
  person: "second"
  tense:
    articles: "present"
    instruction_steps: "imperative"
    instruction_outcomes: "future"
    changelogs: "past"
  contractions: "allowed"
  first_person_plural_we_exception:
    article_path: "/documentation/developer-articles/what-is-the-visual-editor-api/"
    note: "Sole allowed 'we' in articles; company dogfoods public Visual Editor API (see prose §2.2.5)"

formatting_rules:
  oxford_comma: true
  sentence_case_headings: true
  ui_elements_italicized: true
  code_inline_backticks: true
  
  emoji_policy:
    general: "Do not use emojis in documentation"
    exceptions:
      - "Guide introduction pages (index.mdx): minimal emoji permitted in the welcome opening"
      - "Guide more-resources pages (more-resources.mdx): minimal emoji permitted in the congratulatory opening sentence"
    limits: "Maximum one emoji per page, only in the permitted locations above"
    never_in: ["body content", "instruction steps", "reference material", "changelogs", "glossary entries", "explanation articles"]

  ui_element_formatting:
    pattern: "*[Element Name]*"
    examples:
      - "*Save* button"
      - "*Site Navigation*"
      - "*+ Add* dropdown"
  
  concept_capitalization:
    rule: "Capitalize when referring to CloudCannon-specific concept"
    examples:
      correct:
        - "A Collection is a group of files."
        - "Each collection in your Site..."
      incorrect:
        - "A collection is a group of files."
        - "Each Collection in your Site..."

documentation_types:
  # CloudCannon uses a modified Diátaxis framework with the following types:
  # - Explanation (understanding-oriented)
  # - Instructions (task-oriented, like "how-to guides")
  # - Guides (learning-oriented, like "tutorials")
  # - Glossary (reference)
  # - Changelogs (informational, not part of traditional Diátaxis)
  
  changelog:
    diataxis_category: "informational"
    purpose: "Document product changes and updates over time"
    filename_pattern: "MM-DD_descriptive-title.mdx within changelogs/YYYY/"
    required_front_matter:
      - "_schema"
      - "title"
    required_sections:
      - "Features & Improvements"
      - "Fixes"
    tense: "past"
    preferred_verbs:
      - "Added"
      - "Changed"
      - "Improved"
      - "Removed"
      - "Fixed"
  
  explanation:
    diataxis_category: "understanding-oriented"
    purpose: "Help users understand concepts, features, context, and best practices"
    filename_patterns:
      concept_definition: "what-is-*.mdx"
      context_benefits: "why-*.mdx"
      best_practices: "best-practice-*.mdx | best-practices-*.mdx"
      section_introduction: "introduction-to-*.mdx"
    title_patterns:
      concept_definition: "What is|What are"
      context_benefits: "Why [action/feature]"
      best_practices: "Best practice for|Best practices for"
      section_introduction: "Introduction to"
    required_front_matter:
      - "_schema: default"
      - "_uuid: [auto-generated UUID]"
      - "_created_at: [auto-generated timestamp]"
      - "details.title"
      - "details.description"
      - "details.image"
      - "details.category: [Explanation]"
      - "details.related_articles: [optional array, max 3 items]"
      - "author_notes.docshots"
    docshots_values:
      "Added!": "All CloudCannon app screenshots use DocShot; no DocsImage remains except assets/external_screenshots/"
      "Needs docshots": "Article still has DocsImage components (other than external screenshots) to migrate"
      "Not applicable": "Article has no CloudCannon app screenshots"
    related_articles_structure:
      max_items: 3
      _type: ["developer_articles", "user_articles", "developer_guides", "user_guides"]
      item: "[UUID of related article]"
      guide_link_rule: "When linking to a guide, include only one page from that guide (normally the index). Do not list multiple pages from the same guide as separate items."
    structure_varies_by_type:
      concept_definition:
        - "Opening definition"
        - "Context and purpose"
        - "Features and functionality"
        - "Related information"
      context_benefits:
        - "Introduction"
        - "Benefits and use cases"
        - "How it works (optional)"
        - "Limitations (optional)"
        - "Related information"
      best_practices:
        - "Introduction"
        - "Best practices (multiple sections)"
        - "Related information"
      section_introduction:
        - "Opening paragraph (who the articles are for, why it matters)"
        - "Topic summary (bullet list; order must match navigation order)"
        - "Topic sections (## heading per group; link order must match navigation order; do not cross-reference articles from other sections)"
  
  guide:
    diataxis_category: "learning-oriented"
    purpose: "Provide hands-on learning experiences through complete workflows"
    filename_pattern: "[descriptive-name].mdx"
    required_files:
      - "index.mdx"
      - "_data.yml"
    required_front_matter:
      - "_schema: default"
      - "_uuid: [auto-generated UUID]"
      - "_created_at: [auto-generated timestamp]"
      - "details.title"
      - "details.order"
      - "details.image"
      - "details.description"
      - "details.start_nav_group: [null or section name string to group pages]"
      - "details.related_articles: [typically null]"
      - "author_notes.docshots: [Added! | Needs docshots | Not applicable]"
    index_title: "Introduction"
    note: "Guides use nested 'details' structure like articles"
    description_length:
      target_characters: 125
      note: "Aim for ~125 characters; fits on a single line in guide listing cards without truncation"
      no_colons: "Do not use colons (:) in description field values — they cause the Lume build to fail."
    related_articles: "Always null; guide pages are linked via the guide's own navigation, not the related articles widget"
    prose_over_numbered_steps:
      rule: "Guide pages use prose paragraphs for sequential content, not numbered lists"
      rationale: "Guides are learning-oriented; prose feels collaborative and readable. Numbered steps belong in instruction articles only."
      code_blocks: "Place code blocks between prose paragraphs at natural break points, not nested inside list items"
      correct: "Navigate to the relevant *Collection* and enable *Configuration Mode*... Click *Edit Advanced*... enter your template string..."
      incorrect: "1. Navigate to the *Collection*. 2. Enable *Configuration Mode*. 3. Click *Edit Advanced*."
    intra_guide_navigation:
      closing_cta_rule: "Do not end guide pages with standalone closing-CTA paragraphs (e.g. 'For more information, please read...') that link to another page in the same guide"
      preferred_pattern: "Inline forward references only: embed the link naturally in surrounding prose (e.g. 'We'll discuss this further [later in this guide](/documentation/...)')"
      also_avoid: "Standalone 'For more information, see...' sentences at the end of a page when the target is within the same guide"
    more_resources_page:
      purpose: "Closing page of every guide; congratulates the reader and points to next steps"
      emoji: "A single emoji is permitted in the congratulatory opening sentence (e.g. 🎉)"
      required_elements:
        - "Congratulatory opening sentence acknowledging guide completion"
        - "Support callout linking to /support/ and CloudCannon Community (external link with target=_blank rel=noopener)"
        - "Contextual section headings (## level) that describe what the reader can do next, not bare topic labels"
        - "One-sentence prose intro before each bullet list explaining why these resources are useful"
        - "Bullet list entries formatted as: [Link text](/path/) — One sentence description"
      heading_examples:
        correct: ["Go further with Rosey", "CloudCannon configuration"]
        incorrect: ["Rosey", "CloudCannon"]
  
  instructions:
    diataxis_category: "task-oriented"
    purpose: "Provide step-by-step guidance for specific tasks"
    filename_pattern: "[action-verb]-*.mdx"
    title_patterns:
      - "Add a [thing]"
      - "Configure [feature]"
      - "Create a [thing]"
      - "How to [action]"
    required_front_matter:
      - "_schema: default"
      - "_uuid: [auto-generated UUID]"
      - "_created_at: [auto-generated timestamp]"
      - "details.title"
      - "details.description"
      - "details.image"
      - "details.category: [Instructions]"
      - "details.related_articles: [optional array, max 3 items]"
      - "author_notes.docshots: [Added! | Needs docshots | Not applicable]"
    related_articles_structure:
      max_items: 3
      _type: ["developer_articles", "user_articles", "developer_guides", "user_guides"]
      item: "[UUID of related article]"
      guide_link_rule: "When linking to a guide, include only one page from that guide (normally the index). Do not list multiple pages from the same guide as separate items."
    step_format: "numbered_list"
    numbered_steps:
      content: "imperative_actions_only"
      explanations: "prose_before_list | prose_after_list | prose_between_two_complete_lists"
      avoid_in_step_text:
        - "Conceptual or background explanation that does not advance the task"
        - "Definitions, rationale, or API behavior unless phrased as the next action"
      code_blocks_after_list:
        note: "After the final n. step with no n+1 following the block counts as after_last_step, not code_blocks_interrupting_ordered_lists"
  
  glossary:
    diataxis_category: "reference"
    purpose: "Provide quick lookup of terminology and definitions"
    filename_pattern: "[first-letter]/[term-name].yml"
    location: "user/glossary/"
    required_fields:
      - "_schema: default"
      - "glossary_term_name"
      - "term_description"
      - "documentation_link"
    description_length:
      target_sentences: "2-3"
      target_percentage: "80%"
      acceptable_short: "1 sentence for patterns (inputs, SSGs, file formats)"
      acceptable_long: "4+ sentences for complex features"
      max_words: 100
    
    sentence_structure:
      sentence_1: "Core definition - What is it?"
      sentence_2: "Context and purpose - How is it used?"
      sentence_3_optional: "Additional context, cross-references, usage notes"
    
    italicization_rules:
      use_asterisks_for:
        ui_components:
          - "Visual Editor"
          - "Content Editor"
          - "Data Editor"
          - "Source Editor"
          - "App Sidebar"
          - "Site Header"
          - "Site Navigation"
          - "Collection Browser"
          - "File Browser"
          - "Sites Browser"
          - "Organizations Browser"
        core_concepts:
          - "Site"
          - "Organization"
          - "Project"
          - "Collection"
          - "Permission Group"
          - "Schema"
          - "Structure"
          - "Configuration File"
        features:
          - "Build"
          - "Git Repository"
          - "Publish Branch"
          - "Custom Domain"
          - "Testing Domain"
          - "Client Sharing"
          - "Site Sharing"
        all_input_types: true
      
      do_not_italicize:
        - "account, user, team member"
        - "file, files, assets, uploads"
        - "permission (standalone)"
        - "layout, routing, markup, link"
        - "building, editing, syncing (verbs)"
        - "DAM, SSG, API, CDN, DNS, HTTP, CORS, XSS, SSO, SAML"
        - "Git, GitHub, GitLab, Bitbucket"
        - "HTML, CSS, JavaScript, YAML, JSON"
        - "AWS, Azure, Make, Zapier, Okta"
      
      possessive_forms: "Include apostrophe-s inside italics (*Site's*)"
    
    cross_reference_rules:
      italicize_cloudcannon_terms: true
      includes: "UI elements, core concepts, and features"
      do_not_italicize: "generic terms, external services, file formats"
      examples:
        correct:
          - "Once you group your files into *Collections*, they appear in the *Site Navigation* for easy access."
          - "Team members are invited to your *Organization* to collaborate on *Sites*."
          - "Each team member has permissions assigned through *Permission Groups*."
        incorrect:
          - "Collections appear in the Site Navigation."  # Should italicize CloudCannon terms
          - "Each team member belongs to at least one Permission Group."  # Should italicize *Permission Group*
    
    link_format:
      pattern: "/documentation/[user|developer]-articles/[slug]/"
      include_documentation_prefix_for: "articles and guides only"
      other_internal_pages: "link directly without /documentation/ (e.g., /pricing/)"
      examples:
        correct:
          - "/documentation/user-articles/what-is-a-collection/"
          - "/documentation/developer-articles/configure-collections/"
          - "/documentation/developer-guides/okta-sso-saml/"
          - "/pricing/"  # Other internal pages
        incorrect:
          - "/user-articles/what-is-a-collection/"  # Missing /documentation/
          - "/user/articles/what-is-a-collection/"  # Wrong structure
          - "/documentation/pricing/"  # Don't add /documentation/ to other pages
          - "/changelogs/..."  # Don't link to changelogs
      
      acceptable_empty_for:
        - "File formats (HTML, CSS, JavaScript, YAML, JSON, TOML, CSV, etc.)"
        - "External services (GitHub, GitLab, AWS, Azure)"
        - "SSGs (Jekyll, Hugo, Eleventy, etc.)"
        - "DAM providers"
        - "Generic technical terms (API, HTTP, DNS, MIME, CORS, XSS)"
        - "Subscription plans"
        - "Self-explanatory UI elements"

link_formats:
  internal_articles:
    pattern: "/documentation/[user|developer]-articles/[slug]/"
    syntax: "[Link text](/documentation/...)"
    examples:
      - "/documentation/user-articles/what-is-a-collection/"
      - "/documentation/developer-articles/configure-your-collections/"
  
  internal_guides:
    user_pattern: "/documentation/user-guides/[guide-name]/[page-slug]/"
    developer_pattern: "/documentation/developer-guides/[guide-name]/[page-slug]/"
    syntax: "[Link text](/documentation/...)"
    examples:
      - "/documentation/user-guides/getting-started/create-a-site/"
      - "/documentation/developer-guides/okta-sso-saml/"
  
  external_links:
    syntax: '<a href="[url]" target="_blank" rel="noopener">[Link text]</a>'
    rule: "Always use HTML anchor tags for external links, never markdown syntax"
    reason: "Opens in a new tab so users don't lose their place; rel=noopener provides security benefits"
    correct: '<a href="https://gohugo.io/content-management/multilingual/" target="_blank" rel="noopener">built-in multilingual support</a>'
    incorrect: "[built-in multilingual support](https://gohugo.io/content-management/multilingual/)"

  ui_elements_in_links:
    rule: "Drop italics when a UI element term is used as link text"
    reason: "Link formatting (underline/color) already provides visual distinction; combining italics and links creates visual clutter"
    correct: "[Data Editor](/documentation/articles/what-is-the-data-editor/)"
    incorrect: "[*Data Editor*](/documentation/articles/what-is-the-data-editor/)"

components:
  notice:
    usage: "Tips, important information, permissions, and pricing notices"
    types:
      - "info"
      - "important"
      - "permissions"
      - "pricing"
    syntax: "<comp.Notice info_type=\"[type]\">...</comp.Notice>"
    placement:
      info: "Inline, close to relevant content. Must not be the first element in an article."
      important: "Can be first if the information affects the entire article; otherwise inline."
      permissions: "Must always be first in the article, immediately after front matter. Always start with bold 'Permissions required' heading."
      pricing: "Can be first if the entire feature is plan-specific; otherwise inline."
    general_rules:
      - "Only one notice at the start of an article (permissions, pricing, or important — never info)"
      - "Keep notice text concise"
  
  docshot:
    usage: "UI screenshots and snippets"
    required_attributes:
      - "docshot_key"
      - "alt"
      - "title"
      - "type"
    types:
      screenshot: "Full viewport screenshots showing the entire CloudCannon interface"
      ui-snippet: "Cropped screenshots of specific UI elements like inputs, buttons, dropdowns, or modals"
    naming: "Hyphenated names describing the page and state (e.g., Site-Settings-Syncing-Connected)"

  docsimage:
    usage: "Illustrations, diagrams, and conceptual graphics only — being phased out for CloudCannon app images"
    required_attributes:
      - "path"
      - "alt"
      - "title"
      - "type"
    use_for:
      - "Illustrations and diagrams"
      - "Images that are not screenshots of the CloudCannon interface"
      - "External screenshots (assets/external_screenshots/)"
    never_use_for:
      - "Screenshots of the CloudCannon app (use comp.DocShot instead)"
      - "UI snippets showing CloudCannon interface elements (use comp.DocShot instead)"
  
  multicodeblock:
    usage: "Configuration examples with YAML/JSON translation"
    required_attributes:
      - "language"
      - "translate_into"
      - "source"
    annotation_marker: "___NUMBER___"
    annotation_example: "_inputs___1___:"
    use_cases:
      - "CloudCannon configuration files"
      - "Input configuration examples"
      - "Any config users can write in YAML or JSON"
  
  codeblock:
    usage: "File content examples in a single format"
    required_attributes:
      - "language"
      - "source"
    annotation_marker: "/*NUMBER*/"
    annotation_example: "<h1 data-editable>Title</h1> /*1*/"
    use_cases:
      - "HTML files"
      - "Markdown files"
      - "JavaScript files"
      - "Any single-format file content"
  
  annotation:
    usage: "Numbered tie-ins from prose to specific lines in code examples"
    placement: "Immediately after closing code block tag"
    numbering: "Sequential starting from 1"
    length: "1-2 sentences (concise); reference the marker, not the whole tutorial"
    prose_before_code: "Body text before the block explains purpose, parameters, returns, and relationships; readers should not depend on annotations alone"
    syntax: "<comp.Annotation number=\"N\">Explanation</comp.Annotation>"
    note: "Used with both MultiCodeBlock and CodeBlock components"
  
  datareference:
    usage: "List API options, configuration keys, or properties with their types and descriptions"
    required_attributes:
      - "label (on each DataReferenceRow)"
      - "type_markdown (on each DataReferenceRow)"
    syntax: "<comp.DataReference>\n  <comp.DataReferenceRow label=\"option_name\" type_markdown=\"String\">\n    Description.\n  </comp.DataReferenceRow>\n</comp.DataReference>"
    rules:
      - "Use instead of markdown pipe tables for all reference content"
      - "type_markdown accepts String, Boolean, Object, Array, or other type names"
      - "Inner content of each row supports markdown"
    never_use_markdown_tables: true

  glossaryterm:
    usage: "Inline glossary tooltip for terms with a glossary entry"
    required_attributes:
      - "term"
    syntax: "<comp.GlossaryTerm term=\"/user/glossary/[letter]/[term].yml\">Display Text</comp.GlossaryTerm>"
    rules:
      - "Use on first mention of a term in an article only"
      - "Term must have a corresponding YML file in user/glossary/"
      - "Replaces markdown links on first use — do not combine with markdown links"
      - "Subsequent mentions use italics instead"
      - "Display text can differ from glossary_term_name (plurals, derived forms)"
      - "Never replace an existing markdown link with a glossary term — if text is already a link, leave it as a link"

validation_rules:
  check_for:
    - "markdown_tables_used_instead_of_datareference"
    - "passive_voice"
    - "missing_alt_text"
    - "broken_internal_links"
    - "markdown_syntax_used_for_external_links"
    - "inconsistent_terminology"
    - "missing_oxford_commas"
    - "incorrect_capitalization"
    - "non_italicized_ui_elements"
    - "glossary_links_wrong_format"
    - "changelog_fixes_present_tense"
    - "instructions_without_numbered_steps"
    - "explanation_without_opening_definition"
    - "plain_code_blocks_instead_of_components"
    - "trailing_prepositions"
    - "repeated_action_verbs_in_consecutive_steps"
    - "instructions_missing_final_outcome_sentence"
    - "docshot_missing_title_attribute"
    - "images_interrupting_ordered_lists"
    - "code_blocks_interrupting_ordered_lists"
    - "code_example_explanations_only_in_annotations"
    - "explanatory_prose_inside_numbered_instruction_steps"
    - "bare_editor_word_ambiguous_context"
    - "guide_page_closing_cta_to_sibling_page"
    - "guide_page_related_articles_not_null"
    - "ui_elements_in_links_no_italics"
    - "related_articles_multiple_pages_from_same_guide"
  
  ignore:
    - "Passive voice in: changelog features, technical descriptions"
    - "Missing periods in: list fragments, single-word items"
    - "code_blocks_interrupting_ordered_lists when the block follows the final step of a complete ordered list and no numbered item follows the block (after_last_step pattern; see §2.3.4)"

accessibility_requirements:
  alt_text: "required_for_all_images"
  heading_hierarchy: "no_skipped_levels"
  link_text: "descriptive_not_generic"
  color_dependence: "never_sole_indicator"
  language: "simple_and_clear"
  date_format: "YYYY-MM-DD or spelled out"
```