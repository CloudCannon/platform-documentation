# CloudCannon Style Guide — Agent Reference

Machine-readable style rules for AI agents and automated linters. These rules are a companion to the human-readable guide at `STYLE_GUIDE.mdx`, which contains the full prose explanations, examples, and rationale behind every rule. When rules conflict or a case is ambiguous, `STYLE_GUIDE.mdx` is authoritative.

**Before writing or editing any documentation, read `STYLE_GUIDE.mdx` in full.**

**For agents making updates to this file:** Also update the corresponding section in `STYLE_GUIDE.mdx` with the prose explanation and examples. Update the revision history in both files: `last_updated` and `style_guide_version` in the YAML block below, and the `Last Updated` and `Version` fields and the revision history table (Section 4) in `STYLE_GUIDE.mdx`.

```yaml
style_guide_version: "2.63"
last_updated: "2026-09-10"

documentation_architecture:
  single_source_of_truth:
    prefer: "Specific, single-purpose pages. Split by discrete topic or distinct reading context (e.g. opt-in/configurable behavior vs default behavior). Splitting for specificity is good."
    one_home: "Each behavior, feature, or screen has one home page. A general page may summarize a topic in a short paragraph and link to the specific page that covers it thoroughly — intended pattern, not duplication."
    similarity_ok: "Similar content across pages covering DIFFERENT topics is accurate, not duplication (e.g. Snippets pages, where each snippet type behaves similarly but has its own home)."
    avoid: "The SAME behavior or appearance documented in full on two pages, even when both are accurate — dilutes search and will drift. Consolidate to one authoritative page; others defer with a short summary and a link."
    always_cross_link: true
    split_on_the_readers_question:
      rule: "A page covers ONE question. A title naming a subject area, a settings screen, or two unlike things is a bundle; content answering a different question moves to the page that owns that question, however topically adjacent. A shared location in the app is NOT a reason to share a page. Mirrors STYLE_GUIDE.mdx architecture section."
      worked_examples:
        - "Partner access and permissions (subject-area bundle, 6 sections) -> How do Partners access their Client Organizations? (3 sections); auditing compressed to one sentence, removing access moved to hand-over-or-detach, the client's view moved to the client-audience article"
        - "Merging and Pull Requests (action bundled with a concept) -> Review and merge a Pull Request; the concept keeps What is a Pull Request?"
        - "Enable pull request features (keyed to a settings screen) -> Configure Deploy Previews + Turn on optional Project tabs"
    combine_when_one_decision:
      rule: "Options the reader must compare belong on one page, and that page needs the section neither half could carry alone (a 'How to choose' or equivalent). Two pages each describing one half of a choice leave the choice undocumented."
      worked_example: "Structure Sites across Organizations and Projects + Structure your clients' Sites -> Best practices for structuring client Sites, which gained '## How to choose'"
    conjunction_titles:
      rule: "A conjunction in a title is a signal to check, not a fault. It is correct when the two things are decided together."
      legitimate_classes:
        paired_routes: ["Hand over or detach a Client Organization", "Join or leave an Organization", "Enable or disable a flag"]
        one_mechanism_two_faces: ["What are Add-Ons and Overages?", "What are Partner Points and Rewards?"]
        one_artifact_two_forms: ["Download invoices and receipts", "Edit your Project name and description"]
      split_instead_when: "The conjunction joins different KINDS of thing: an action with a concept, or a screen with its contents."
    deferring_is_routing:
      rule: "A page that defers keeps only the sentence its own question needs, and its pointer names what the reader will find at the target. Never keep the full procedure on both the deferring and the owning page."
      correct: "For how to give your client control of a Client Organization, and what detaching changes, please read our documentation on [handing over or detaching a Client Organization](...)."
      incorrect: "For more information on these processes, please read our documentation on [handing over or detaching a Client Organization](...)."
    split_by_audience:
      rule: "When two audiences need the same event framed differently, give each its own page with its own title, and have the MANAGING audience's page point to the other. One direction only. See documentation_types.explanation.action_shaped.structure for the pointer section."
      worked_example: "partner/articles/hand-over-or-detach-a-client-organization.mdx points to user/articles/take-over-your-organization-from-a-partner.mdx, not the reverse"
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
    rule: "Plan names are capitalized AND italicized. The product noun 'Plan' must never appear bare — a tier name or the word 'Subscription' must immediately precede it every time. Write '*[Tier] Plan*' (*Standard Plan*, *Team Plan*, *Enterprise Plan*, *Free Plan*) or '*Subscription Plan*' (plural *Subscription Plans*). Rephrase every former head-noun, state-descriptor, and attributive use to carry 'Subscription'."
    italicize_and_capitalize:
      - "Named tiers: *Standard Plan*, *Team Plan*, *Enterprise Plan*, *Free Plan*, *Lite Plan*"
      - "*Lite Plan* is offered only to Partner Program members for their Client Organizations; document it in partner/ only"
      - "Generic product noun: *Subscription Plan*, *Subscription Plans*"
    never_bare_plan:
      rule: "'Plan' as the product noun never stands with only an article, possessive, or adjective in front of it, and never modifies another noun on its own. Rephrase so a tier name or 'Subscription' immediately precedes 'Plan'."
      rewrites:
        - "your plan / the plan / each plan -> *your Subscription Plan* / *the Subscription Plan* / *each Subscription Plan*"
        - "change plans / a range of plans -> *change Subscription Plans* / *a range of Subscription Plans*"
        - "current plan / paid plan / new plan / legacy plan -> *current Subscription Plan* / *paid Subscription Plan* / *new Subscription Plan* / *legacy Subscription Plan*"
        - "plan pricing / plan limits / plan changes / plan details -> *Subscription Plan* pricing / *Subscription Plan* limits / *Subscription Plan* changes / *Subscription Plan* details"
    glossary_link:
      rule: "*Subscription Plan* takes a glossary link on first mention (comp.GlossaryTerm, term /user/glossary/s/subscription-plan.yml, glossary_term_name 'Subscription Plan'); subsequent mentions are italicized with no link. Named tiers are italicized but take no glossary link."
    ui_labels_exempt:
      rule: "UI labels match the app verbatim, regardless of this rule (reproduce exact casing)."
      capitalized_in_app: ["Review your Subscription Plan (button)", "Update your Subscription Plan (page)", "Your Subscription Plan (page)", "Plan resources (label)"]
    correct:
      - "Your trial starts on the *Standard Plan*."
      - "You can upgrade your *Subscription Plan* at any time."
      - "If your usage is above your new *Subscription Plan's* limits, resolve the flagged resources."
    incorrect:
      - "Your trial starts on the Standard plan."              # tier name not capitalized or italicized
      - "You can upgrade your Plan at any time."               # bare product noun; write *Subscription Plan*
      - "You can upgrade your subscription plan at any time."  # lowercase and not italicized
      - "Compare plan pricing."                                # attributive bare 'plan'; write *Subscription Plan* pricing

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
    - "Dataset"
    - "Visual Editor"
    - "Content Editor"
    - "Data Editor"
    - "Source Editor"
    - "Data Panel"
    - "API Object"  # the Visual Editor API object from useVersion(); generic plural "API objects" stays lowercase
    - "Collection Browser"
    - "File Browser"
    - "Sites Browser"
    - "Organizations Browser"
    - "Client Organizations Browser"
    - "Site Dashboard"
    - "Organization Home"
    - "Editing Interface"
    - "Editing Interface Header"
    - "Editable Region"
    - "Filter Bar"
    - "Card"
    - "Context Menu"
    - "Site Navigation"
    - "Section Navigation"
    - "Site Header"
    - "App Sidebar"
    - "Trial Countdown"
    - "Git Provider"
    - "Git Repository"
    - "Subscription"        # an Organization's billing relationship with CloudCannon
    - "Subscription Plan"
    - "Client Organization"
    - "Partner Organization"
    - "Partner Program"
    - "Partner Points"
    - "Form"
    - "Inbox"
    - "Inbox Target"
  
  preferred_terms:
    "Git Repository": ["repo", "git repo", "Git repository"]
    "Git Provider": ["source provider", "git host", "Git provider"]
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
  - "powerful"
  - "seamless"
  - "seamlessly"
  - "effortless"
  - "robust"
  - "intuitive"

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
  describe_dont_sell:
    rule: "Describe what a feature or API does, plainly and accurately. Do not use marketing or value-laden language, and never claim a capability the product does not have."
    reference: "STYLE_GUIDE.mdx §1.1.9"
    avoid_marketing_words:
      - "powerful"
      - "seamless"
      - "effortless"
      - "robust"
      - "intuitive"
      - "blazing-fast"
      - "smart"
      - "useful"
    correct:
      - "Pass an Input configuration to control where the file is uploaded and which asset sources are offered."
      - "Resolves to undefined if the file does not exist."
    incorrect:
      - "Pass an Input configuration to control the upload destination, filename, and allowed types."
      - "Gracefully handles any missing file."
    overstatement_is_a_factual_error: "Most damaging in reference and developer documentation, where readers act on the exact claim. Document only what the implementation does; trace each claim to code, configuration, or observed UI behavior before writing it."
  first_person_plural_we_exceptions:
    articles:
      - article_path: "/documentation/developer-articles/what-is-the-visual-editor-api/"
        note: "Company dogfoods public Visual Editor API (see prose §2.2.5 Exception 1)"
      - filename_pattern: "introduction-to-*.mdx"
        note: "Section-introduction articles may use editorial scaffolding such as 'we cover:' or 'Let's briefly introduce these topics.' Keep to one or two sentences per intro; body must still use 'you' for reader actions (see prose §2.2.5 Exception 2)"
    guide_transition_sentences: "'we'll' is permitted in the closing transition sentence of guide pages (e.g. 'In the next step of this guide, we'll...')"

formatting_rules:
  oxford_comma: true
  latin_abbreviations:
    rule: "Write e.g. and i.e. with a following comma, and use them only inside parentheses. In running prose, write 'for example'. Mirrors STYLE_GUIDE.mdx §1.2.1."
    correct: ["(e.g., `jetstream.com`, `www.jetstream.com`)", "for example, a 4 MB webpage"]
    incorrect: ["(e.g. `jetstream.com`)", "e.g., in running prose without parentheses"]
  list_item_punctuation:
    complete_sentences: "Take a period"
    fragments: "No period. Fragments following a colon lead-in also start lowercase."
    correct: "'Have ready:' followed by 'your *Organization* name'"
    incorrect: "'Have ready:' followed by 'Your *Organization* name.'"
  sentence_case_headings: true
  ui_elements_italicized: true   # body text only; see headings_no_italics
  code_inline_backticks: true

  headings_no_italics:
    rule: "Do not italicize CloudCannon terms or UI elements in headings. Headings stay in plain text (sentence case) even where the same term is italicized in body text. Capitalize CloudCannon terms as usual; only the italics are dropped. Also never use comp.GlossaryTerm in a heading. Mirrors STYLE_GUIDE.mdx §1.2 Headings."
    correct:
      - "Branching from the Main Branch"
      - "What Subscription Plan does my Organization use?"
    incorrect:
      - "Branching from the *Main Branch*"
      - "What *Subscription Plan* does my *Organization* use?"

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
      - "guide_eyebrow in a guide's _data.yml: a single trailing emoji permitted (e.g. \"Billing 💳\", \"Welcome! 👋\")"
    limits: "Maximum one emoji per page, only in the permitted locations above"
    never_in: ["body content", "instruction steps", "reference material", "changelogs", "glossary entries", "explanation articles"]

  ui_element_formatting:
    pattern: "*[Element Name]*"
    examples:
      - "*Save* button"
      - "*Site Navigation*"
      - "*+ Add* dropdown"
    name_control_type:
      rule: "When instructing the reader to interact with a control, name its type after the italicized label (button, link, icon, tab, dropdown, field, checkbox, toggle). Never a bare 'Click *X*'. The label is italicized; the type descriptor stays plain (see compound_nouns_with_concepts). Applies most in instruction steps but holds anywhere an interaction is directed. Mirrors STYLE_GUIDE.mdx §1.4.1 (Name the Control Type)."
      correct:
        - "Click the *Apply Coupon* button."
        - "Enter your code in the *Coupon Code* field."
      incorrect:
        - "Click *Apply Coupon*."
      exception: "When the descriptor is part of the literal label (e.g. the *Project Settings* tab), the whole name is the label; do not add a second descriptor."
    interpolated_labels:
      rule: "When a control builds its label from a value (the plan, Project, or Team Member it acts on), put the variable part in square brackets inside the italics: *Delete [Project Name]*, *View as [Team Member Name]*, *Select [Plan Name]*. The control-type descriptor stays plain and outside the italics. Never quote only the fixed part of the label, never hardcode one variant, and do not talk around it with a generic phrase — the bracketed placeholder carries the label shape the reader matches against the screen. Mirrors STYLE_GUIDE.mdx §1.4.1 (Labels That Include a Variable)."
      correct:
        - "Click the *Delete [Project Name]* button."
        - "Select the *View as [Team Member Name]* option."
        - "Click the *Select [Plan Name]* button under the *Subscription Plan* you want."
      incorrect:
        - "Click the *Select* button."            # partial quote; the button reads "Select Standard"
        - "Click the *Select Standard* button."   # hardcodes one variant
        - "Click the button for the plan you want."  # talks around the label
  
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

  filename_matches_title:
    rule: "An article's filename (which sets its URL slug) must be the slugified version of its details.title: lowercase, hyphens for spaces, no special characters. Title and slug must always stay in sync."
    on_rename: "If you change a title, rename the file to match in the same change, update every link and related_articles entry pointing to it, and add a redirect in .cloudcannon/routing.json if the old URL has shipped to main."
    exception: "Changelogs use a date-prefixed descriptive slug (MM-DD_descriptive-title.mdx), not the title."

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
      mechanism_question: "how-do-*.mdx | how-does-*.mdx"
      context_benefits: "why-*.mdx"
      best_practices: "best-practice-*.mdx | best-practices-*.mdx"
      section_introduction: "introduction-to-*.mdx"
      action_shaped: "slugified imperative title (e.g. hand-over-or-detach-a-client-organization.mdx)"
      section_index: "index.mdx"
    title_patterns:
      concept_definition: "What is|What are"
      mechanism_question: "How do|How does"
      context_benefits: "Why [action/feature]"
      best_practices: "Best practice for|Best practices for"
      section_introduction: "Introduction to"
      action_shaped: "[Imperative verb] ..., no question mark"
      reference_shaped: "bare noun phrase (e.g. 'The File Browser', 'General Flags')"
      section_index: "About [Section Name]"
    action_shaped:
      rule: "An imperative title with no question mark is an Explanation article when it explains an event or relationship the reader takes part in, rather than walking them through one procedure. Understanding-oriented: it covers what the routes are, what each changes, and what the reader cannot do. An Instructions article would instead give numbered steps for one route. Cross-links use the gerund rephrase (see cross_link_pointer). Mirrors STYLE_GUIDE.mdx §2.2.3."
      examples: ["Hand over or detach a Client Organization", "Take over your Organization from a partner", "Share a Site with Site Sharing", "Understand your CloudCannon invoice"]
      structure:
        - "Framing opening (1-2 paragraphs): name the thing and the routes covered; say which routes are independent and in what order they normally happen"
        - "One ## per route or action, named as the action: what it changes, what it leaves untouched, who can do it"
        - "Cross-audience pointer (optional, last ##): when the same event is documented for the other side of the relationship, link there. One direction only, from the managing audience to the affected audience"
        - "Related Information: inline prose, not a standalone section"
    gerund_titles:
      rule: "Gerund titles are prohibited for Instruction articles and should be avoided for Explanation articles; prefer the action-shaped or 'What is...?' form. The ban applies to TITLES ONLY: ## headings may use gerunds ('Inviting other Partner Organization members', 'Earning Partner Points'). Mirrors STYLE_GUIDE.mdx §2.2.3."
    mechanism_question_vs_instructions:
      rule: "An interrogative title starting 'How do' or 'How does' and ending in a question mark is an Explanation article — it asks how something works. The Instructions pattern 'How to [action]' is task-oriented and takes no question mark. Mirrors STYLE_GUIDE.mdx §2.2.3 and §2.3.3."
      explanation: ["How do Partners access their Client Organizations?", "How does billing work in the Partner Program?"]
      instructions: ["How to publish a Site"]
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
      _type: ["developer_articles", "user_articles", "partner_articles", "developer_guides", "user_guides"]
      item: "[UUID of related article]"
      guide_link_rule: "When linking to a guide, include only one page from that guide (normally the index). Do not list multiple pages from the same guide as separate items."
    section_introduction_topic_sections:
      rule: "Use ## topic sections only when a topic group holds MORE THAN ONE article. Where each topic is a single article, drop the topic sections and let the topic-summary list carry the links directly, one bullet per article: [Article title](/path/) then an em dash then a one-sentence description. A heading, an explanatory paragraph, and a 'For a more in-depth explanation' lead-in wrapped around a single link is scaffolding, not structure. Mirrors STYLE_GUIDE.mdx §2.2.4."
      measured_threshold: "Every intro article keeping the sectioned form carries 1.7 to 8.5 links per ## section. The two flattened on 2026-09-09 had exactly one link per topic."
      flat_examples: ["partner/articles/introduction-to-client-organizations.mdx", "partner/articles/introduction-to-the-partner-program.mdx"]
    structure_varies_by_type:
      concept_definition:
        - "Opening definition"
        - "Context and purpose"
        - "Features and functionality"
        - "Related information"
      mechanism_question:
        - "Opening answer to the title question"
        - "How it works"
        - "Variations and limits (optional)"
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
    data_yml_fields:
      required: ["_schema: guide_data", "_uuid", "guide_title", "guide_summary", "guide_icon", "guide_icon_invert_for_dark_mode", "initial_section_heading"]
      featured_card_optional:
        guide_eyebrow: "Short label above the title on a featured guide card; the one place an emoji is permitted in guide metadata (e.g. \"Billing 💳\")"
        guide_cta_text: "The card's button text, written as an imperative (e.g. \"Set up your subscription\")"
        guide_image: "The card's thumbnail, separate from guide_icon"
        guide_priority: "Orders featured cards; leave empty for the default order"
      note: "_schema must be guide_data, not default, because using default breaks the guide. Mirrors STYLE_GUIDE.mdx §2.4.1a."
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
        rule: "End every guide page (except more-resources pages) with a brief unlinked transition sentence previewing the next step"
        pattern: "In the next step of this guide, we'll [describe what the next page covers]."
        index_pattern: "On the introduction (index.mdx): In the first step of this guide, we'll [describe what the first page covers]."
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
      user_guide_variant:
        rule: "The required_elements above are the developer-guide shape. In user/guides/, the support routes go at the END, not under the opening, and the further reading is two levels deep. Mirrors STYLE_GUIDE.mdx §2.4.8."
        structure:
          - "Congratulatory opening + accomplishment recap: 'Congratulations! 🎉 You have finished the [Guide Title] guide.' then 'By following each step in this guide, you have...'"
          - "## [Section] articles (e.g. 'User articles') is the one place a ## heading names a documentation section rather than a reader outcome; contextual ### subheadings beneath it carry that job, each with a one-sentence prose intro and a bullet list"
          - "## Next steps (last section): one sentence on where the reader stands, then a bullet list of help routes (this guide and the articles above, an Owner who can grant missing access, the support team, the CloudCannon Community), closing with a short sign-off such as 'You're all set!'"
  
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
      _type: ["developer_articles", "user_articles", "partner_articles", "developer_guides", "user_guides"]
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
    alternative_methods:
      rule: "Use a ## subheading per method only when each is a full procedure. A second entry point that needs no steps of its own stays inline as one sentence after the main procedure, with no heading. Mirrors STYLE_GUIDE.mdx §2.3.5."
      inline_example: "Alternatively, you can also create a *Client Organization* from your *Organization Home* page, by clicking the *Create a Client* icon on the *Clients* card."
    numbered_steps:
      content: "imperative_actions_only"
      explanations: "prose_before_list | prose_after_list | prose_between_two_complete_lists"
      outcome_then_media: "The final outcome sentence ('CloudCannon will...') goes immediately after the numbered list. Any comp.DocShot or screenshot belongs AFTER the outcome sentence, not between the last step and the outcome. Order: steps -> outcome sentence -> DocShot. Mirrors STYLE_GUIDE.mdx §2.3.4 (Describe Outcomes)."
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
          - "Editing Interface"        # the four editing surfaces as a group
          - "Editing Interface Header" # the bar at the top of each
          - "Editable Region"
          - "Site Dashboard"
          - "Organization Home"
          - "Data Panel"
          - "App Sidebar"
          - "Site Header"
          - "Site Navigation"
          - "Section Navigation"
          - "Trial Countdown"   # the days-remaining trial indicator in the App Sidebar
          - "Collection Browser"
          - "File Browser"
          - "Sites Browser"
          - "Organizations Browser"
          - "Client Organizations Browser"
          - "Filter Bar"   # the filter element above a list; the button inside it is Add Filter
          - "Card"         # the repeated item block used throughout the app: browsers, lists, and inside inputs
          - "Context Menu" # the menu a control opens in place; written as "the *Context Menu*", never prefixed with its heading
        core_concepts:
          - "Site"
          - "Organization"
          - "Client Organization"
          - "Partner Organization"
          - "Subscription"
          - "Subscription Plan"
          - "Project"
          - "Collection"
          - "Dataset"
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
          - "API Object"
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
          - "Billing Period"
          - "Free Trial"
          - "Partner Program"
          - "Partner Points"
          - "Form"
          - "Inbox"
          - "Inbox Target"
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

      form_generic_vs_concept:
        rule: "Italicise *Form* when it names the CloudCannon feature (the *Forms* page, a *Form* reaching an *Inbox*). Leave 'form' plain for the HTML element or the thing a visitor fills in ('add an HTML form to a page', 'the fields on your form', 'a form submission'). Mirrors the concept_vs_action split. See STYLE_GUIDE.mdx §1.4.1."

      app_lowercases_inbox_in_labels:
        rule: "The concept is *Inbox* / *Inbox Target*, but several app controls lowercase it. Reproduce a control's casing exactly (UI labels always match the app) and keep the concept capitalised in the surrounding prose. Mirrors STYLE_GUIDE.mdx §1.4.1."
        app_labels: ["*Set default inbox*", "*Unset default inbox for site*", "*Delete inbox from site*", "*Create inbox*", "*Add target*", "*Connected inboxes (1 of 10)*"]
        correct: "Click the *Set default inbox* option to make this *Inbox* the default."
        incorrect: "Click the *Set default Inbox* option."

      partner_role_vs_concept:
        rule: "Italicise *Partner* only where it names the CloudCannon role or group (*Partner Permission Group*; a *Partner* acting in a *Client Organization*). Leave 'partner' and 'agency' plain where they name the company in the relationship. *Partner Program*, *Partner Organization*, *Partner Points*, and *Client Organization* are always italicised. Mirrors STYLE_GUIDE.mdx §1.4.1."
        italic_when_concept: ["*Partner Permission Group*", "*Partner Program*", "*Partner Organization*", "*Partner Points*", "*Client Organization*"]
        plain_when_role: ["ask your partner first", "the agency that set up your Organization", "your client's agency"]

      adjacent_italic_spans:
        rule: "Two italic spans in a row are correct when they name two different things: *Partner Organization's* *Owners Permission Group*, the *Client Organization's* *Team* page. The two-span form is wrong only when it splits a SINGLE name (*Owners* *Permission Group*); see specific_group_names_in_body_prose. Mirrors STYLE_GUIDE.mdx §1.4.1."

      guide_titles_not_italicised:
        rule: "A guide's own title is plain in prose: 'the Subscribe to CloudCannon guide', not 'the *Subscribe to CloudCannon* guide'. Guide titles are page names, not UI elements. Mirrors STYLE_GUIDE.mdx §1.4.1."

      unlabelled_containers_are_still_terms:
        rule: "A UI element does not need a visible label in the app to be a CloudCannon term. Containers such as the Filter Bar, a Card, or the App Sidebar are named by the documentation even though the app renders no such string — the app labels the controls INSIDE them (Add Filter, Save). Never conclude a term is invented because it cannot be found in app source, and never rename a container to match a button it contains. Verify a container's name against existing documentation usage, not a source search. Mirrors STYLE_GUIDE.mdx §1.4.1."
        examples:
          - "*Filter Bar* is the element; *Add Filter* is the button inside it"
          - "*Card* is the element; the app labels no string 'Card' in a list view"

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

      specific_group_names_in_body_prose:
        rule: "When body prose names a specific Permission Group, put the group name and 'Permission Group' in ONE italic span: *Owners Permission Group*, *Billing Permission Group*, *Partner Permission Group*. Use the plural where the app's group name is plural (Owners, Editors, Technical Editors). Never split into two spans, and never singularise a plural group name."
        add_default_when: "Insert 'Default' only when the default-vs-custom distinction is doing work in the sentence, normally a comparison with *Custom Permission Groups*: *Owners Default Permission Group*."
        shorthand: "'*Owners* group' is acceptable in running prose after the full name has been used."
        scope_note: "Does not change group_names_in_permissions_notices, which governs the notice pattern *Owners* [Default Permission Groups](...)."
        examples:
          correct:
            - "Members of the *Owners Permission Group* in your *Partner Organization* see every client."
            - "Only members of the *Owners Default Permission Group* can view, create, and delete *API Keys*. You can grant each of these actions to a *Custom Permission Group*."  # comparison, so Default earns its place
          incorrect:
            - "Members of the *Owners* *Permission Group*…"        # two spans
            - "Members of the *Owner Permission Group*…"           # singular; the group is named Owners
            - "CloudCannon adds you to the *Owners Default Permission Group*."  # nothing contrasted; drop Default

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
    pattern: "/documentation/[user|developer|partner]-articles/[slug]/"
    syntax: "[Link text](/documentation/...)"
    examples:
      - "/documentation/user-articles/what-is-a-collection/"
      - "/documentation/developer-articles/configure-your-collections/"
      - "/documentation/partner-articles/what-is-a-client-organization/"

  heading_anchors:
    rule: "Append the slugified heading as an anchor when the reader needs one section rather than the whole article. The link text rephrases the HEADING, not the article title, in the same lowercase descriptive form as any other cross-link. The anchor must match the slugified heading exactly, because a renamed heading breaks the link silently. Mirrors STYLE_GUIDE.mdx §1.4.4."
    examples:
      - "[leaving a Permission Group](/documentation/user-articles/manage-my-permissions/#leave-a-permission-group)"
      - "[Owners Permission Group](/documentation/user-articles/what-are-default-permission-groups/#owners)"
  
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
    navigational_lists_use_the_title:
      rule: "The rephrase rules below apply to the cross-link pointer frame in PROSE only. A navigational list of further reading (section introduction articles, guide more-resources pages, any list indexing pages) uses the article title VERBATIM as link text, followed by an em dash and a one-sentence description, so the reader can see which page they are being sent to. Mirrors STYLE_GUIDE.mdx §1.4.4."
      correct_list_entry: "[What is a Client Organization?](/documentation/partner-articles/what-is-a-client-organization/) then an em dash then 'Learn how a Client Organization keeps a client's team and billing separate from your own.'"
      correct_prose: "please read our documentation on [what a Client Organization is](...)"
    rephrase_by_title_type:
      action_verb_title: "Rephrase the action-verb (imperative) title as a lowercase gerund phrase, whether the article is categorized Instructions or Explanation. 'Rename your Organization' -> [renaming your Organization]; 'Review and merge a Pull Request' -> [reviewing and merging a Pull Request]; the Explanation article 'Share a Site with Site Sharing' -> [sharing a Site with Site Sharing]"
      explanation_what_title: "'What is/are X?' -> [what X is] / [what X are] — lowercase 'what', verb moved to the end"
      explanation_how_title: "'How do/does X <verb>?' -> [how X <verbs>] — lowercase 'how', drop the auxiliary do/does, conjugate the verb to agree with the subject ('How do Partners access their Client Organizations?' -> [how Partners access their Client Organizations]; 'How does billing work in the Partner Program?' -> [how billing works in the Partner Program])"
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
      pricing: "Can be first if the entire feature is gated; otherwise inline. When both a pricing and a permissions notice are present, the pricing notice comes first (see pricing_and_permissions_order)."
      section_scoped_gate: "A gate scoped to ONE option or section belongs immediately under that heading, not at the top. When an article compares several approaches and only one is gated, or a single section covers a gated capability, hoisting the notice would overstate the gate as covering the article's whole subject, which pricing_notice_content's 'identify the gated feature' rule exists to prevent. A gate on the article's subject still goes at the top. Mirrors STYLE_GUIDE.mdx §1.5.1."
      guides_carry_no_permissions_notice: "Guide pages never use a permissions notice. State the access a guide requires as a prerequisite bullet on its index.mdx, and mention a step's specific requirement in an inline info notice where it applies. The permissions notice is an article pattern. Mirrors STYLE_GUIDE.mdx §1.5.1."
      pricing_and_permissions_order: "When an article genuinely needs both a pricing and a permissions notice (it gates on both plan and permission), place the pricing notice first, immediately followed by the permissions notice, before any other content. Pricing comes first because plan availability is the more fundamental gate — a reader on the wrong plan does not need the permission requirements. Mirrors STYLE_GUIDE.mdx §1.5.1."
      destructive_action_notice_stack: "For a destructive or irreversible action (e.g. deleting an Organization or Site), stack a permissions notice first (who can perform the action), immediately followed by an important notice stating the irreversibility and what is lost, before any other content. The irreversibility warning is a load-bearing caveat the reader must see before acting, so two notices at the top is expected here, not overuse. Mirrors STYLE_GUIDE.mdx §1.5.1."
    pricing_notice_content:
      scope: "The pricing notice answers 'can I use this?', not only 'which plan is this on'. Use it for any access gate: a Subscription Plan tier, a private Beta the reader must request access to, or a programme they must belong to. Reserve `important` for caveats about using a feature the reader already has. Mirrors STYLE_GUIDE.mdx §1.5.1."
      non_plan_gate_form: "State the gate and how to get through it. Private Beta: '**This feature is available through a private Beta.**' followed by what it covers and a support contact. If access is granted per account rather than per Organization, say so."
      single_feature_form: '**This feature is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.** OR ***Feature Name* is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**'
      overview_article_form: "Name the gated sub-features the article actually discusses; do not list the full set of gated features under the parent"
      examples:
        correct:
          - '**This feature is available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**'
          - '***Deploy Previews* are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**'
          - '***Projects* are available on all Plans. *Site* branching and *Publishing Workflows* are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**'
          - '**The *Pull Requests* tab and *Deploy Previews* settings are available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>. Other parts of the *Project Browser* are available on all Plans.**'
        incorrect:
          - '**Some features are only available on our <a href="https://cloudcannon.com/pricing/">Team or Enterprise Plan</a>.**'  # vague — doesn't say which features
          - '**This feature is available on our** [**Team or Enterprise Plan**](https://cloudcannon.com/pricing/)**.**'  # over-wrapped bold/link splits; also: non-doc links must be HTML anchors, not markdown
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
    alt_frame:
      rule: "Open alt text with 'A screenshot of the [surface]', then say what it shows. Use 'A screenshot of a...' for one instance of a repeated thing, and 'A closeup of the...' for a tight crop. Mirrors STYLE_GUIDE.mdx §1.5.2."
      example: 'alt="A screenshot of the Invoices page in CloudCannon, showing a list of past invoices grouped by year."'
    title_frame:
      rule: "Titles take the form 'The [name] [control type]': 'The Site Dashboard', 'The Add SSL Certificate modal', 'The Payment details section'. Sentence case for the surrounding words."
    terms_in_attributes:
      rule: "Capitalize CloudCannon terms inside alt and title, and never italicise them, since attributes render as plain text and asterisks would be literal. Applies to DocShot, DocsImage, DocsVideo, and Mermaid. Mirrors STYLE_GUIDE.mdx §1.5.2."
      correct: ['title="The Trial Countdown in the App Sidebar"']
      incorrect: ['title="The trial countdown in the App Sidebar"', 'alt="...the context menu..."', 'title="The *Site Dashboard*"']

  docsimage:
    usage: "Illustrations, diagrams, conceptual graphics, and external screenshots only. Never for CloudCannon app images — those use comp.DocShot."
    required_attributes:
      - "path"
      - "alt"
      - "title"
      - "type"
    use_for:
      - "Illustrations and diagrams"
      - "Screenshots that are not of the CloudCannon app — external services or live Site pages in a plain browser"
      - "External screenshots (assets/external_screenshots/)"
    never_use_for:
      - "Screenshots of the CloudCannon app (use comp.DocShot instead)"
      - "UI snippets showing CloudCannon interface elements (use comp.DocShot instead)"
      - "Structural diagrams expressible in Mermaid syntax — flowcharts, sequence diagrams, decision trees (use comp.Mermaid instead)"

  mermaid:
    alt_frame: "Open Mermaid alt text with 'A diagram shows', the diagram counterpart to the DocShot alt frame. Mirrors STYLE_GUIDE.mdx §1.5.5."
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
  
  optionstable:
    usage: "List hand-authored API options, method parameters, or configuration keys that are not sourced from the CloudCannon schema, with their types and descriptions. For schema-sourced keys, use referencedatatable instead."
    required_attributes:
      - "label (on each OptionsRow)"
      - "type_markdown (on each OptionsRow)"
    optional_attributes:
      - "required (on each OptionsRow; boolean, renders a red Required pill next to the label)"
    syntax: "<comp.OptionsTable>\n  <comp.OptionsRow label=\"option_name\" type_markdown=\"`string`\">\n    Description.\n  </comp.OptionsRow>\n</comp.OptionsTable>"
    rules:
      - "Use instead of markdown pipe tables for all reference content"
      - "type_markdown accepts string, boolean, Object, Array, or other type names"
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
      - "Do not mix comp.OptionsTable and comp.ReferenceDataTable in the same table"

  glossaryterm:
    usage: "Inline glossary tooltip for terms with a glossary entry"
    required_attributes:
      - "term"
    syntax: "<comp.GlossaryTerm term=\"/user/glossary/[letter]/[term].yml\">Display Text</comp.GlossaryTerm>"
    rules:
      - "Use on first mention of a term in an article's body prose only"
      - "Term must have a corresponding YML file in user/glossary/"
      - "Replaces markdown links on first use — do not combine with markdown links"
      - "Subsequent mentions: use italics ONLY if the term is on the italicization_rules list (e.g. *Organization*, *Hosting Bandwidth*, *Overage*). A general concept that has a glossary entry but is NOT an italicised CloudCannon term stays in plain text after the first-mention comp.GlossaryTerm."
      - "Display text can differ from glossary_term_name (plurals, derived forms)"
      - "Never replace an existing markdown link with a glossary term — if text is already a link, leave it as a link"

validation_rules:
  check_for:
    - "markdown_tables_used_instead_of_optionstable"
    - "passive_voice"
    - "missing_alt_text"
    - "broken_internal_links"
    - "markdown_syntax_used_for_external_links"
    - "inconsistent_terminology"
    - "missing_oxford_commas"
    - "vague_defer_pointer (a cross-link pointer that does not say what is at the target, e.g. 'for more information on these processes')"
    - "duplicated_procedure (the same procedure documented in full on both the deferring page and the owning page)"
    - "intro_section_wrapping_single_link (a ## topic section in a section introduction article whose bullet list holds only one article link)"
    - "navigational_list_entry_rephrased (a further-reading list entry whose link text rephrases the article title instead of using it verbatim)"
    - "latin_abbreviation_missing_comma (e.g. or i.e. without a following comma, or used outside parentheses)"
    - "list_fragment_capitalised_or_punctuated (a fragment after a colon lead-in starting with a capital or ending in a period)"
    - "unlisted_term_lowercase (Subscription, Editable Region, Editing Interface, Site Dashboard, Organization Home, Client Organization, Partner Organization, Partner Program, Partner Points written plain in body prose)"
    - "partner_role_over_italicised (*Partner* or *partner* italicised where it names the company rather than the CloudCannon role or group)"
    - "guide_title_italicised (a guide's own title wrapped in asterisks in prose)"
    - "docshot_alt_missing_frame (alt text not opening with 'A screenshot of the/a' or 'A closeup of the'; Mermaid alt not opening with 'A diagram shows')"
    - "term_lowercase_in_attribute (a listed CloudCannon term lowercased inside alt or title)"
    - "term_italicised_in_attribute (asterisks inside an alt or title value)"
    - "permissions_notice_in_guide_page (a guide page carrying info_type=\"permissions\")"
    - "article_scope_gate_notice_buried (a pricing or permissions notice for a gate on the article's subject placed mid-article)"
    - "partner_articles_type_missing (a related_articles entry pointing at partner/articles with a non-partner_articles _type)"
    - "incorrect_capitalization"
    - "non_italicized_ui_elements"
    - "interaction_missing_control_type (a bare 'Click *X*' with no control-type descriptor like button/link/icon/tab/field)"
    - "partial_ui_label_quote (an italicised label quoting only the fixed part of an interpolated control label, e.g. *Select* for a button that reads 'Select Standard'; use the bracketed placeholder form *Select [Plan Name]*)"
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
    - "docshot_before_outcome_sentence (a DocShot/screenshot placed between the last step and the outcome sentence; order must be steps -> outcome sentence -> DocShot)"
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
