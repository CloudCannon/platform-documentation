# CloudCannon Style Guide — Agent Reference

Machine-readable style rules for AI agents and automated linters. These rules are a companion to the human-readable guide at `STYLE_GUIDE.mdx`, which contains the full prose explanations, examples, and rationale behind every rule. When rules conflict or a case is ambiguous, `STYLE_GUIDE.mdx` is authoritative.

**Before writing or editing any documentation, read `STYLE_GUIDE.mdx` in full.**

**For agents making updates to this file:** Also update the corresponding section in `STYLE_GUIDE.mdx` with the prose explanation and examples. Update the revision history in both files: `last_updated` and `style_guide_version` in the YAML block below, and the `Last Updated` and `Version` fields and the revision history table (Section 4) in `STYLE_GUIDE.mdx`.

```yaml
style_guide_version: "2.38"
last_updated: "2026-07-22"

documentation_architecture:
  single_source_of_truth:
    prefer: "Specific, single-purpose pages. Split by discrete topic or distinct reading context (e.g. opt-in/configurable behavior vs default behavior). Splitting for specificity is good."
    one_home: "Each behavior, feature, or screen has one home page. A general page may summarize a topic in a short paragraph and link to the specific page that covers it thoroughly — intended pattern, not duplication."
    similarity_ok: "Similar content across pages covering DIFFERENT topics is accurate, not duplication (e.g. Snippets pages, where each snippet type behaves similarly but has its own home)."
    avoid: "The SAME behavior or appearance documented in full on two pages, even when both are accurate — dilutes search and will drift. Consolidate to one authoritative page; others defer with a short summary and a link."
    always_cross_link: true
    tie_breaker: "When pages disagree, accuracy wins, not recency. App behavior and STYLE_GUIDE.mdx are the ultimate tie-breakers; fix toward them."

terminology:
  disambiguation:
    editor:
      rule: "Use 'editor' only for an editing interface, and only when immediately preceded by the name of that interface. Never use 'editor' to mean a person."
      for_interfaces:
        - "Visual Editor, Content Editor, Data Editor, Source Editor (UI names per italics rules)"
        - "code editor, IDE, or named product (e.g. VS Code) for where developers write code"
        - "rich text editor, WYSIWYG editor, or name the host UI"
      for_people: "Use a specific role term: team member, translator, content author. Never 'editor' or 'editors'."
      compounds_allowed_when_context_clear:
        - "Visual Editor API"
        - "inEditorMode"
        - "editor-only (preview vs live Site when sentence names the environment)"
  settings_navigation_hierarchy:
    rule: "Name a settings destination by its location, not its label — the same label can be a page in one area and a section in another. Verify location before choosing the noun."
    org_settings: "Org Settings contains PAGES (Details, Branding, Team, Subscription, etc.). Refer to each as a 'page': 'the Details page under Org Settings'. Never call an Org Settings destination a 'section'."
    team_page: "The Team page (a page under Org Settings) contains TABS: Members and Groups. Refer to these as 'tabs': 'the Members tab'. Members and Groups are not pages."
    project_settings: "The Project Settings tab (in the Project view) contains SECTIONS (Details, Repository, Branch Defaults, Deploy Previews, etc.). Refer to each as a 'section': 'the Repository section'."
    collision_note: "Details exists in both Org Settings (a page) and Project Settings (a section) — the correct noun depends on which area the doc is describing."
    correct:
      - "Navigate to the *Details* page under *Org Settings*."
      - "Open the *Members* tab on the *Team* page."
      - "In the *Project Settings* tab, open the *Repository* section."
    incorrect:
      - "Navigate to the *Details* section in *Org Settings*."  # it is a page, not a section
      - "Open the *Members* page."  # Members is a tab on the Team page

  plan_capitalization:
    rule: "Capitalize 'Plan' when it names a specific tier or refers to the CloudCannon subscription plan as a product noun. Keep lowercase in generic state-descriptor phrases. Plan names are not italicized and take no glossary link."
    capitalize:
      - "Named tiers: Standard Plan, Team Plan, Enterprise Plan, Free Plan"
      - "Plan as the head noun naming the product: your Plan, the Plan, each Plan, subscription Plan, billing Plan, change Plans, a range of Plans"
    lowercase:
      - "State-descriptor phrases where an adjective describes a plan's status rather than naming it: paid plan, current plan, new plan, legacy plan."
      - "Attributive uses where 'plan' modifies another noun: plan pricing, plan limits, plan options, plan changes, plan details, plan resources."
    ui_labels_exempt:
      rule: "UI labels match the app verbatim, regardless of this rule. The app is internally inconsistent about plan-label casing."
      lowercase_in_app: ["Review your billing plan (button)", "Update your plan (page)"]
      capitalized_in_app: ["Your Subscription Plan (page)", "Plan resources (label)"]
    correct:
      - "Your trial starts on the Standard Plan."
      - "You can upgrade your Plan at any time."
      - "If your usage is above the new plan's limits, resolve the flagged resources."
    incorrect:
      - "Your trial starts on the Standard plan."
      - "You can upgrade your subscription plan at any time."

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
    - "Permission"
    - "Scope"
    - "Exception"
    - "Resource"
    - "Base Domain"
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
    "modal": ["dialog", "popup", "popover"]
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
  user_focused_language:
    rule: "Frame actions and solutions from the user's perspective, not the system's"
    correct:
      - "You can fix this by updating your Collection URLs."
      - "You can address this by configuring the postbuild script."
    incorrect:
      - "Updating your Collection URLs fixes this."
      - "This step covers both."
    also_avoid: "Vague shorthand references like 'both', 'this', or 'these' without spelling out what they refer to. Always write out the full referent."
  experiential_feature_description:
    scope: "Explanation articles and 'What is...' pages within guides only"
    rule: "Describe features from the user's perspective — what they see and can do — rather than the system's internal mechanics"
    correct:
      - "Elements whose source text has changed are highlighted with amber borders."
      - "A floating locale-switching tool appears in the bottom right of the *Visual Editor*."
      - "You can change which version of a page you are seeing."
    incorrect:
      - "The Connector detects all data-rosey-tagged elements and injects the locale switcher interface."
      - "It then connects each tagged element to its corresponding entry in the locale JSON."
    note: "Reserve internal process descriptions ('the system detects… injects… connects…') for 'How it works' subsections or reference documentation."
  first_person_plural_we_exceptions:
    - article_path: "/documentation/developer-articles/what-is-the-visual-editor-api/"
      note: "Company dogfoods public Visual Editor API (see prose §2.2.5 Exception 1)"
    - filename_pattern: "introduction-to-*.mdx"
      note: "Section-introduction articles may use editorial scaffolding such as 'we cover:' or 'Let's briefly introduce these topics.' Keep to one or two sentences per intro; body must still use 'you' for reader actions (see prose §2.2.5 Exception 2)"
    guide_transition_sentences: "'we'll' is permitted in the closing transition sentence of guide pages (e.g. 'In the next step of this guide, we'll...')"

formatting_rules:
  oxford_comma: true
  sentence_case_headings: true
  ui_elements_italicized: true
  code_inline_backticks: true

  bold_usage:
    rule: "Use bold only for headings/labels inside Notice components and for term names in bulleted definition lists (**Term** — definition). Never use bold for emphasis, UI elements, button or menu names, or inline term definitions. Use italics for UI elements and terms, and Notice components for emphasis. Mirrors STYLE_GUIDE.mdx §1.4.2."
    use_for:
      - "Headings, labels, or callouts inside Notice components"
      - "Term names in bulleted definition lists, followed by an em dash and the definition (e.g. * **User** — The team member who wants to access CloudCannon.)"
    do_not_use_for:
      - "Emphasis (use a Notice component instead)"
      - "UI elements, button names, or menu options (use *italics*)"
      - "Inline term definitions within sentences or paragraphs"

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
      - "date (ISO 8601, +12:00 NZ timezone; publish time; drives ordering)"
    title_fallback: "general-fixes (when a release has no notable features)"
    scope: "Document only features shipped to all users. Exclude beta/unreleased features and their supporting plumbing (error handling, migrations, API wiring), even if merged during the period covered."
    required_sections:
      - "Features & Improvements"
      - "Fixes"
    dependency_rollup: "Roll up Dependabot/npm_and_yarn/bundler/patch-only bumps into a single closing Fixes line: 'Updated dependencies to patch security vulnerabilities.'"
    tense: "past"
    entry_shape: "Lead with a past-tense verb, then an 'allowing you to…' capability clause, then locate the controls descriptively. Convey what the reader can now do via 'allowing you to…', never 'You can now…'. Pattern: Added *[Name]*, allowing you to *[capability]*. [Where the controls live, stated descriptively.]"
    nested_detail: "Sub-bullets explaining how a feature works keep a past-tense lead and describe behaviour in the descriptive present; never instructional ('You can now…', 'Click Save')."
    avoid:
      - "You can now… (present-tense instruction)"
      - "Go to X to… (instructional rather than descriptive)"
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
      "Added!": "Every CloudCannon app screenshot the article needs is present as a DocShot."
      "Needs docshots": "The article needs one or more CloudCannon app screenshots that do not exist yet."
      "Not applicable": "The article does not need any CloudCannon app screenshots (e.g. it only has diagrams, code examples, or no images). Do not use this when a screenshot is warranted but missing — that is 'Needs docshots'."
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
      transition_sentence:
        rule: "End every guide page (except the index and more-resources pages) with a brief unlinked transition sentence previewing the next step"
        pattern: "In the next step of this guide, we'll [describe what the next page covers]."
        note: "This is distinct from a closing CTA — it does not link to the next page, it simply signals what's coming. 'we'll' is permitted in this sentence as part of the collaborative guide voice."
        examples:
          - "In the next step of this guide, we'll install Rosey and set it up on your Site from scratch."
          - "In the next step of this guide, we'll configure your Collection URLs so the Visual Editor can find your pages."
    more_resources_page:
      purpose: "Closing page of every guide; congratulates the reader and points to next steps"
      emoji: "A single emoji is permitted in the congratulatory opening sentence (e.g. 🎉)"
      required_elements:
        - "Congratulatory opening sentence acknowledging guide completion"
        - "Support callout linking to https://cloudcannon.com/support/ (HTML anchor) and CloudCannon Community (external link with target=_blank rel=noopener)"
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
    lead_in_sentence:
      rule: "Introduce every numbered list with a stem sentence naming the task and ending in a colon (e.g. 'To switch Organizations:'). Never jump from a heading straight into step 1."
      rationale: "The reader must know what the steps accomplish before following them."
    prerequisites:
      rule: "When a task depends on prior setup or a separate action, state it as a prerequisite BEFORE the ordered list — in the intro prose, a 'Before you...' section, or the pattern 'Before we begin, this article assumes...'. Never encode a prerequisite as a numbered step; steps are actions within THIS task. Link to the prerequisite instructions."
      example: "Before we begin, this article assumes you have already configured your Collections."
      mirrors: "STYLE_GUIDE.mdx §2.3.4 item 2 (Prerequisites)"
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
    when_to_create:
      rule: "Create a glossary entry for terms readers need to understand CloudCannon. Not limited to CloudCannon-coined terms — also create one for an important general/industry concept when CloudCannon's use of it is more specific than, or slightly different from, the general meaning."
      qualifies_when_any:
        - "CloudCannon-specific concept, feature, or UI element (Collection, Visual Editor, Publishing Workflow)"
        - "General/industry term the reader needs to use CloudCannon, where CloudCannon's use is specific or slightly different (e.g. hosting bandwidth, build time, add-on, overage — CloudCannon defines what counts, how it's measured, and what happens at a limit)"
        - "Term readers repeatedly encounter in the app or docs and benefit from an inline first-mention definition"
      does_not_imply_italics: "A glossary entry alone does NOT make a term an italicised CloudCannon term. Italicisation on subsequent mentions is governed by the italicization_rules list; generic concepts with a glossary entry stay plain text after first mention."
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
          - "Permission"
          - "Scope"
          - "Exception"
          - "Resource"
          - "Base Domain"
          - "Team Member"
          - "Schema"
          - "Structure"
          - "Configuration File"
          - "Pull Request"
          - "Git Provider"
        features:
          - "Build"
          - "Git Repository"
          - "Publish Branch"
          - "Custom Domain"
          - "Testing Domain"
          - "Client Sharing"
          - "Site Sharing"
          - "Publishing Method"
          - "Publishing Workflow"
          - "Hosting Bandwidth"
          - "Build Time"
          - "Add-On"
          - "Overage"
        all_input_types: true
      
      do_not_italicize:
        - "account, user"
        - "file, files, assets, uploads"
        - "permission, scope, exception — ONLY in the generic English or verb/action sense; the CloudCannon concepts *Permission*, *Scope*, *Exception* are italicised (see concept_vs_action)"
        - "layout, routing, markup, link"
        - "building, editing, syncing (verbs)"
        - "DAM, SSG, API, CDN, DNS, HTTP, CORS, XSS, SSO, SAML"
        - "Git, GitHub, GitLab, Bitbucket"
        - "HTML, CSS, JavaScript, YAML, JSON"
        - "AWS, Azure, Make, Zapier, Okta"
      
      possessive_forms: "Include apostrophe-s inside italics (*Site's*)"

      concept_vs_action:
        rule: "Permission, Scope, and Exception are CloudCannon concepts that share a word with ordinary English. Italicise the NOUN (the object/field/value you configure, or the set someone holds); keep plain only the being-allowed or generic sense. Mirrors STYLE_GUIDE.mdx §1.4.1 Concept vs. Action."
        italic_when_concept:
          - "*Permission* — the noun: a configured object, or the set someone holds (add a *Permission*; the *Permission* `site:file:write`; *Permissions* control what actions you can perform; a *Group's* *Permissions*)"
          - "*Scope* — the field on a permission (labeled *Scope* in the *Add Permission* modal); italicise it whenever it names the field, including in '[value] scope' phrases (a Global *Scope*; a *Site* *Scope*; each permission has a *Scope*; change the *Scope* to *Site*). Its concept values *Project*, *Site*, *Group*, *Base Domain* are italicised; Global stays plain — it is a value, not a separate concept"
          - "*Exception* — a subtractive rule in a *Custom Permission Group* (add an *Exception*; *Exceptions* let you exclude files)"
        plain_when_generic:
          - "permission — ONLY the being-allowed sense, 'permission to [do something]' (you have permission to publish; give someone permission to edit)"
          - "scope — generic sense only (out of scope; the scope of the project)"
          - "exception — generic sense only (the exception is `site-branch`; with the exception of)"

      compound_nouns_with_concepts:
        rule: "When a CloudCannon concept is followed by a generic descriptor (page, tab, section, view, link, button), italicise only the concept, not the descriptor"
        examples:
          correct:
            - "at the top of your *Project* page"
            - "click the *Publishing* link in the *Site Navigation*"
            - "the *Pull Requests* tab groups *Pull Requests*"
          incorrect:
            - "at the top of your *Project page*"
            - "click the *Publishing link* in the *Site Navigation*"
        exception: "Italicise the whole literal UI element name when the descriptor is part of the label (e.g. *Project Settings* is the actual tab label)"

      named_resource_vs_quantity:
        rule: "Applies to the MEASURED resources (Hosting Bandwidth, Build Time): CloudCannon terms when you name the resource, but ordinary nouns when you state an amount. Italicise the named resource/feature/graph; leave the measured quantity in plain lowercase. A resource's billable-concept name and its UI-element label can differ (billed as 'Extra hosting bandwidth' -> term *Hosting Bandwidth*; the graph/tab that displays it -> label *Bandwidth*); italicise each as it appears and match the app for UI labels."
        measured_resources: ["Hosting Bandwidth", "Build Time"]
        examples:
          correct:
            - "your plan includes 100 GB of *Hosting Bandwidth*"  # named resource
            - "a set amount of bandwidth / purchase additional bandwidth"  # quantity
            - "the *Build Time* graph on the *Usage* tab"  # named graph
            - "you have used three hours of build time"  # quantity
          incorrect:
            - "a set amount of *Hosting Bandwidth*"  # quantity, not the named resource
        add_on_and_overage_always_capitalised: "Add-On and Overage are named mechanisms, not measured quantities — always capitalised + italicised (*Add-Ons*, *Overages*, *Add-On* charges, an *Add-On*'s cost). No lowercase quantity form. Note the capital O in Add-On."

      group_names_in_permissions_notices:
        rule: "Inside permissions notices, italicise individual Permission Group names (Owners, Developers, Editors, Technical Editors, Billing) as well as the broader *Default Permission Groups* / *Custom Permission Groups* link text"
        examples:
          correct:
            - "Members of the *Owners* and *Developers* [Default Permission Groups]"
            - "Members of the *Editors* and *Technical Editors* [Default Permission Groups]"
          incorrect:
            - "Members of the Owners and Developers [Default Permission Groups]"
        note: "Applies inside permissions notices. Body prose discussing groups as a category can stay plain."

    cross_reference_rules:
      italicize_cloudcannon_terms: true
      includes: "UI elements, core concepts, and features"
      do_not_italicize: "generic terms, external services, file formats"
      examples:
        correct:
          - "Once you group your files into *Collections*, they appear in the *Site Navigation* for easy access."
          - "*Team Members* are invited to your *Organization* to collaborate on *Sites*."
          - "Each *Team Member* has permissions assigned through *Permission Groups*."
        incorrect:
          - "Collections appear in the Site Navigation."  # Should italicize CloudCannon terms
          - "Each team member belongs to at least one Permission Group."  # Should italicize *Team Member* and *Permission Group*
    
    link_format:
      pattern: "/documentation/[user|developer]-articles/[slug]/"
      include_documentation_prefix_for: "articles and guides only"
      non_documentation_pages: "use a full absolute URL (e.g., https://cloudcannon.com/pricing/); never root-relative — basePath prepends /documentation/ and breaks it"
      never_protocol_relative: "a leading // is read as a hostname; use a single leading / for documentation paths"
      examples:
        correct:
          - "/documentation/user-articles/what-is-a-collection/"
          - "/documentation/developer-articles/configure-collections/"
          - "/documentation/developer-guides/okta-sso-saml/"
          - "https://cloudcannon.com/pricing/"  # Non-documentation pages: absolute URL
        incorrect:
          - "/user-articles/what-is-a-collection/"  # Missing /documentation/
          - "/user/articles/what-is-a-collection/"  # Wrong structure
          - "/pricing/"  # Root-relative non-doc link — basePath breaks it to /documentation/pricing/
          - "//documentation/developer-articles/..."  # Protocol-relative — resolves to https://documentation/...
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
  
  non_documentation_pages:
    description: "Pages on cloudcannon.com outside /documentation/ (e.g. the marketing pricing page)"
    syntax: '<a href="https://cloudcannon.com/[path]/">[Link text]</a>'
    rule: "Use a full absolute URL in an HTML anchor; never a root-relative path. basePath prepends /documentation/ to any root-relative link, so /pricing/ breaks as /documentation/pricing/"
    no_new_tab: "Same domain, so omit target=_blank — keep the reader in the same tab"
    examples:
      - '<a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>'

  protocol_relative_links:
    rule: "Never use a leading // — the browser reads the first segment as a hostname (//documentation/... resolves to https://documentation/...). Use a single leading / for documentation paths"

  external_links:
    rule: "Always use HTML anchor tags for external links, never markdown syntax. Always target=_blank. The rel value depends on destination ownership."
    rel_by_destination:
      third_party: "rel='noopener noreferrer' — any destination NOT on a cloudcannon.com domain (github.com, gohugo.io, developer.mozilla.org, docs.imgix.com, forms.gle, etc.). noopener prevents tabnabbing; noreferrer stops the reader's doc URL leaking to the outside site."
      cloudcannon_owned: "rel='noopener' — cloudcannon.com and its subdomains (e.g. community.cloudcannon.com). Keep the referrer so CloudCannon analytics attribute the traffic. NOTE: most cloudcannon.com links stay same-tab (see link_formats.non_documentation_pages); only add target=_blank + rel=noopener when a CloudCannon-owned link must open in a new tab."
    syntax_third_party: '<a href="[url]" target="_blank" rel="noopener noreferrer">[Link text]</a>'
    syntax_cloudcannon_owned: '<a href="https://community.cloudcannon.com/" target="_blank" rel="noopener">[Link text]</a>'
    reason: "Opens in a new tab so users don't lose their place; noopener provides security benefits; noreferrer keeps the reader's doc URL from leaking to third parties"
    correct: '<a href="https://gohugo.io/content-management/multilingual/" target="_blank" rel="noopener noreferrer">built-in multilingual support</a>'
    incorrect:
      - "[built-in multilingual support](https://gohugo.io/content-management/multilingual/)"  # markdown syntax for external link
      - '<a href="https://gohugo.io/content-management/multilingual/" target="_blank" rel="noopener">built-in multilingual support</a>'  # third-party link missing noreferrer

  ui_elements_in_links:
    rule: "Drop italics when a UI element or Core Concept term (e.g. *Team Member*, *Site*) is used as link text"
    reason: "Link formatting (underline/color) already provides visual distinction; combining italics and links creates visual clutter"
    correct: "[Data Editor](/documentation/articles/what-is-the-data-editor/)"
    incorrect: "[*Data Editor*](/documentation/articles/what-is-the-data-editor/)"

  cross_link_pointer:
    rule: "When pointing readers to another article inline, use the sentence frame 'please read our documentation on [descriptive phrase]'. The link text is a lowercase descriptive rephrase of the target article's title — NEVER the verbatim title-cased article name, which duplicates the Pagefind result title."
    rephrase_form_by_title_shape: "Choose the rephrase form from the title's grammatical shape, NOT its Diátaxis category. An action-verb (imperative) title takes the gerund rephrase even when the article is categorized Explanation."
    rephrase_by_title_type:
      action_verb_title: "Rephrase the action-verb (imperative) title as a lowercase gerund phrase, whether the article is categorized Instructions or Explanation. 'Rename your Organization' -> [renaming your Organization]; 'Review and merge a Pull Request' -> [reviewing and merging a Pull Request]; the Explanation article 'Share a Site with Site Sharing' -> [sharing a Site with Site Sharing]"
      explanation_what_title: "'What is/are X?' -> [what X is] / [what X are] — lowercase 'what', verb moved to the end"
      explanation_why_title: "'Why <verb> X?' -> [why to <verb> X]"
    inline_noun_reference_exception: "When the link is a courtesy hover-to-learn-more on a noun already in the sentence (not a cross-link pointer), use that noun as the link text, capitalized per the CloudCannon term (e.g. [Testing Domain]), not a rephrased title."
    position_decides_not_termhood: "Grammatical position, not whether the target is a CloudCannon term, decides bare-vs-rephrased. A term-named article is still rephrased when it sits in the cross-link frame ([what Custom Permission Groups are], [sharing a Site with Site Sharing] — NOT [Custom Permission Groups] or [Site Sharing]). Use the bare term only when it's the actual noun of the surrounding sentence (e.g. 'anyone in the [Default Permission Groups] can publish')."
    examples:
      correct:
        - "To rename your *Organization*, please read our documentation on [renaming your Organization](/documentation/user-articles/rename-your-organization/)."
        - "For more information, please read our documentation on [what Branch Defaults are](/documentation/developer-articles/what-are-branch-defaults/)."
        - "For more information, please read our documentation on [what Custom Permission Groups are](/documentation/developer-articles/what-are-custom-permission-groups/)."  # CloudCannon term rephrased because it sits in the frame
        - "For more information, read our documentation on [sharing a Site with Site Sharing](/documentation/user-articles/share-a-site-with-site-sharing/)."  # imperative-titled Explanation article -> gerund
      incorrect:
        - "To rename your *Organization*, see [Rename your Organization](/documentation/user-articles/rename-your-organization/)."  # verbatim title-cased name as link text
        - "See [Customize your Organization branding](/documentation/user-articles/customize-your-organization-branding/)."  # verbatim title; also missing the 'please read our documentation on' frame
        - "For more information, please read our documentation on [Custom Permission Groups](/documentation/developer-articles/what-are-custom-permission-groups/)."  # bare term in the frame; rephrase it

renaming_and_removing_content:
  section: "1.4.5"
  rule: "When renaming, moving, or removing an article or guide that was live on `main`, add a 301 redirect in `.cloudcannon/routing.json`. Never leave a stub article behind; delete the old file and handle the redirect in routing.json."
  redirect_required_when:
    - "Renaming an article or guide (the URL slug changes with the filename)"
    - "Moving an article between collections (e.g. developer-articles to user-articles)"
    - "Removing an article entirely (redirect to the closest replacement or the parent section)"
  exception_never_on_main:
    rule: "If an article only ever existed on a branch and was never published to `main`, its URL was never live, so no redirect is needed. Repoint internal links to the new slug and delete the old file."
  chain_existing_redirects: "If an older path already redirects to the old URL, update that entry to point to the new URL as well, so every path resolves in a single hop."
  redirect_entry_shape: '{ "from": "/documentation/user-articles/old-slug/", "to": "/documentation/user-articles/new-slug/", "status": 301 }'

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
      permissions: "Must be at the top of the article, immediately after front matter, before any body content. Always start with bold 'Permissions required' heading. When a pricing notice is also present, the pricing notice comes first and the permissions notice immediately follows it (see pricing_and_permissions_order)."
      pricing: "Can be first if the entire feature is plan-specific; otherwise inline. When both a pricing and a permissions notice are present, the pricing notice comes first (see pricing_and_permissions_order)."
      pricing_and_permissions_order: "When an article genuinely needs both a pricing and a permissions notice (it gates on both plan and permission), place the pricing notice first, immediately followed by the permissions notice, before any other content. Pricing comes first because plan availability is the more fundamental gate — a reader on the wrong plan does not need the permission requirements. Mirrors STYLE_GUIDE.mdx §1.5.1."
      destructive_action_notice_stack: "For a destructive or irreversible action (e.g. deleting an Organization or Site), stack a permissions notice first (who can perform the action), immediately followed by an important notice stating the irreversibility and what is lost, before any other content. The irreversibility warning is a load-bearing caveat the reader must see before acting, so two notices at the top is expected here, not overuse. Mirrors STYLE_GUIDE.mdx §1.5.1."
    pricing_notice_content:
      single_feature_form: "**This feature is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.** OR ***Feature Name* is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**"
      overview_article_form: "Name the gated sub-features the article actually discusses; do not list the full set of gated features under the parent"
      examples:
        correct:
          - "**This feature is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**"
          - "***Deploy Previews* are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**"
          - "***Projects* are available on all Plans. *Site* branching and *Publishing Workflows* are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**"
          - "**The *Pull Requests* tab and *Deploy Previews* settings are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>. Other parts of the *Project Browser* are available on all Plans.**"
        incorrect:
          - "**Some features are only available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**"  # vague — doesn't say which features
          - "**This feature is available on our** [**Team or Enterprise Plan**](https://cloudcannon.com/pricing/)**.**"  # over-wrapped bold/link splits; also: non-doc links must be HTML anchors, not markdown
    general_rules:
      - "Prefer one notice at the start of an article (permissions, pricing, or important — never info). Two exceptions where stacking at the top is expected: (1) an article gating on both plan and permission stacks pricing then permissions (see pricing_and_permissions_order); (2) a destructive/irreversible action stacks the permissions notice then an important irreversibility notice (see destructive_action_notice_stack)."
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
    usage: "Illustrations, diagrams, conceptual graphics, and external screenshots only. Never for CloudCannon app images — those use comp.DocShot."
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
      - "Structural diagrams expressible in Mermaid syntax — flowcharts, sequence diagrams, decision trees (use comp.Mermaid instead)"

  mermaid:
    usage: "Structural diagrams whose source can be expressed in Mermaid syntax — flowcharts, sequence diagrams, decision trees, simple architecture sketches. Rendered in the reader's browser at page load via mermaid.js."
    required_attributes:
      - "chart (Mermaid source as a template literal)"
      - "alt (full sentence describing the diagram for screen readers, no-JS readers, and Pagefind)"
    optional_attributes:
      - "caption (visible caption rendered below the diagram)"
    syntax: "<comp.Mermaid alt=\"...\" chart={`graph LR\\n  A --> B\\n`} />"
    use_for:
      - "Flowcharts, branching diagrams, publish workflows"
      - "Sequence diagrams (API calls, event flows)"
      - "Small state machines, decision trees, or relationship graphs"
    never_use_for:
      - "Screenshots of the CloudCannon app (use comp.DocShot instead)"
      - "Photographs, illustrations, or graphics that are not structural (use comp.DocsImage instead)"
      - "Diagrams large enough that the source becomes harder to read than a hand-drawn image"
    runtime:
      render_location: "Client-side in the reader's browser."
      script_loading: "An inline detector script in the base layout (_includes/layouts/base.tsx) lazy-imports mermaid.esm.min.mjs and svg-pan-zoom from pinned jsDelivr URLs only when document.querySelector('pre.mermaid') matches. Non-diagram pages do not fetch either library."
      pan_zoom: "After mermaid.run() resolves, svg-pan-zoom attaches to each rendered SVG with controlIconsEnabled (visible +/- and reset buttons), drag-to-pan, fit/center on init, and mouseWheelZoomEnabled disabled (so page-scroll past a diagram doesn't trigger zoom). Re-attached after every theme-triggered re-render."
      theme: "Theme follows document.documentElement.dataset.pfTheme; the script subscribes to MutationObserver on data-pf-theme and re-runs mermaid.initialize + mermaid.run when the reader toggles theme."
      loader: "A spinner + 'Rendering diagram…' label is visible during render; CSS swaps to the rendered SVG once mermaid sets data-processed=true on the pre element."
      noscript_fallback: "When JavaScript is disabled, the raw chart source and the loader are hidden via an inlined <style> in the <noscript> block, and the alt text is shown in italics."
      pagefind: "The toMarkdown export emits '_[Diagram: {caption || alt}]_' so Pagefind indexes the alt/caption surface."

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
    annotation_markers:
      html: "<!--NUMBER-->"
      javascript_typescript_astro_css: "/*NUMBER*/"
      shell_python_ruby: "#NUMBER"
    annotation_marker_rule: "Marker must match the language's comment syntax so Prism produces a .token.comment span, which the annotation processor converts to a colored square. Never place markers inside a tag's attribute list."
    annotation_examples:
      html: "<div class=\"hero\"> <!--1-->"
      javascript: "import './styles.css'; /*1*/"
      shell: "npm install rosey #1"
    use_cases:
      - "HTML files"
      - "Markdown files"
      - "JavaScript files"
      - "Any single-format file content"
  
  annotation:
    usage: "Numbered tie-ins from prose to specific lines in code examples"
    placement: "Inside the </comp.CodeBlock> closing tag, after the closing code fence — not after the closing tag"
    numbering: "Sequential starting from 1"
    length: "1-2 sentences (concise); reference the marker, not the whole tutorial"
    prose_before_code: "Body text before the block explains purpose, parameters, returns, and relationships; readers should not depend on annotations alone"
    syntax: "<comp.Annotation number=\"N\">Explanation</comp.Annotation>"
    inline_code: "Surround annotation text with blank lines so MDX processes it as markdown, enabling backtick inline code. Without blank lines, backticks appear as literal characters."
    inline_code_example: "<comp.Annotation number=\"1\">\n\nTranslates the `alt` attribute using the key `hero.image-alt`.\n\n</comp.Annotation>"
    note: "Used with both MultiCodeBlock and CodeBlock components"
  
  datareference:
    usage: "List API options, configuration keys, or properties with their types and descriptions. Being phased out for schema-sourced keys — use referencedatatable instead."
    required_attributes:
      - "label (on each DataReferenceRow)"
      - "type_markdown (on each DataReferenceRow)"
    syntax: "<comp.DataReference>\n  <comp.DataReferenceRow label=\"option_name\" type_markdown=\"String\">\n    Description.\n  </comp.DataReferenceRow>\n</comp.DataReference>"
    rules:
      - "Use instead of markdown pipe tables for all reference content"
      - "type_markdown accepts String, Boolean, Object, Array, or other type names"
      - "Inner content of each row supports markdown"
      - "Do not use for CloudCannon configuration keys covered by the schema — use referencedatatable instead"
    never_use_markdown_tables: true

  referencedatatable:
    usage: "Display a curated list of CloudCannon configuration keys pulled from the schema. Definitions, types, badges, and examples are sourced automatically — do not duplicate them in the article."
    required_attributes:
      - "section (on each ReferenceDataRow)"
      - "ref_key (on each ReferenceDataRow)"
    syntax: "<comp.ReferenceDataTable>\n  <comp.ReferenceDataRow section=\"type.Configuration\" ref_key=\"type._inputs.*.options.required\" />\n  <comp.ReferenceDataRow section=\"type.Configuration\" ref_key=\"type._inputs.*.options.values\" />\n</comp.ReferenceDataTable>"
    valid_sections:
      - "type.Configuration — CloudCannon Configuration File keys"
      - "type.Routing — Routing keys"
      - "type.InitialSiteSettings — Initial Site Settings keys"
    ref_key_format: "type.{full_key} — e.g. type._inputs.*.options.required; variant suffixes use parentheses: type._inputs.*.options.empty_type(text)"
    rules:
      - "Order rows alphabetically by ref_key"
      - "Article tables are intentionally curated — it is acceptable to omit keys; the reference section is the exhaustive source"
      - "Do not include deprecated keys — they are documented in the reference section with the deprecation notice and recommended alternative"
      - "When a parent key links to a reference page that fully documents its children, prefer listing only the parent"
      - "Do not mix comp.DataReference and comp.ReferenceDataTable in the same table"

  glossaryterm:
    usage: "Inline glossary tooltip for terms with a glossary entry"
    required_attributes:
      - "term"
    syntax: "<comp.GlossaryTerm term=\"/user/glossary/[letter]/[term].yml\">Display Text</comp.GlossaryTerm>"
    rules:
      - "Use on first mention of a term in an article only"
      - "Term must have a corresponding YML file in user/glossary/"
      - "Replaces markdown links on first use — do not combine with markdown links"
      - "Subsequent mentions: use italics ONLY if the term is on the italicization_rules list (e.g. *Organization*, *Hosting Bandwidth*, *Overage*). A general concept that has a glossary entry but is NOT an italicised CloudCannon term stays in plain text after the first-mention comp.GlossaryTerm."
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
    - "bold_used_for_emphasis (bold outside Notice headings and **Term** — definition lists; use *italics* for UI/terms, Notice components for emphasis)"
    - "glossary_links_wrong_format"
    - "changelog_fixes_present_tense"
    - "instructions_without_numbered_steps"
    - "instructions_missing_lead_in_sentence"
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
    - "impersonal_action_sentences (e.g. 'X fixes this' instead of 'You can fix this by X')"
    - "system_focused_feature_description_in_explanation (in explanation articles and 'What is...' guide pages, prefer experiential language — what the user sees and can do — over internal mechanics descriptions)"
    - "vague_shorthand_references (e.g. 'This step covers both' without spelling out the referents)"
    - "settings_destination_wrong_noun (Org Settings destinations called 'sections' instead of 'pages'; Project Settings destinations called 'pages' instead of 'sections'; Team's Members/Groups tabs mislabeled as pages or sections)"
  
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