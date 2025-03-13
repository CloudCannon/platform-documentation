const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs");
const { matter } = require("md-front-matter");
const fg = require("fast-glob");

const common_content_structures = [];

const common_content_files = fg.sync([
  path.join(__dirname, "_common_content/**/*.mdx"),
]);

console.log(`Loading common content from ${common_content_files.join(", ")}`);

const ssg_data = yaml.load(
  fs.readFileSync(path.join(__dirname, "_data/ssgs.yml"), "utf8"),
);
const guide_series_data = yaml.load(
  fs.readFileSync(path.join(__dirname, "_data/guide_series.yml"), "utf8"),
);
const docshot_data = yaml.load(
  fs.readFileSync(path.join(__dirname, "_data/docshots.yml"), "utf8"),
);

for (const common_content_file of common_content_files) {
  const file_content = fs.readFileSync(common_content_file, {
    encoding: "utf8",
  });
  const { data } = matter(file_content);

  const structure_value = {
    label: data.content_name,
    preview: {
      text: [data.content_name],
    },
    value: {
      _file: common_content_file,
    },
    _inputs: {},
  };

  for (const [param, settings] of Object.entries(data.parameters)) {
    structure_value.value[param] = null;
    structure_value._inputs[param] = {
      type: settings.type,
      comment: settings.comment,
    };
  }

  common_content_structures.push(structure_value);
}

const snip = (name) => path.join(__dirname, `.cloudcannon/snippets/${name}`);

const _snippets = {
  ...require(snip("code_block.json")),
  ...require(snip("data_reference.json")),
  ...require(snip("docs_image.json")),
  ...require(snip("docshot.js"))(docshot_data.source),
  ...require(snip("docs_video.json")),
  ...require(snip("multi_code_block.json")),
  ...require(snip("notice.json")),
  ...require(snip("tabs.json")),
  ...require(snip("youtube.json")),
  ...require(snip("example.json")),
  ...require(snip("common_content.json")),
  ...require(snip("common_content_param.json")),
  ...require(snip("system_version_default.json")),
  ...require(snip("system_version_list.json")),
  ...require(snip("slot.json")),
  // Make sure fallbacks comes last ! ! !
  ...require(snip("fallbacks.json")),
};

module.exports = {
  _snippets_imports: {
    mdx: true,
  },
  _snippets,
  data_config: {
    article_topics: {
      path: "/_data/article_topics.yml",
    },
  },
  _select_data: {
    docs_ssgs: ssg_data.ssgs,
    docs_guide_series: guide_series_data.series,
    diataxis_category: [
      {
        name: 'Explanation',
        icon: 'lightbulb',
        icon_color: '#06d6a0',
      },
      {
        name: 'Guide',
        icon: 'handshake',
        icon_color: '#26547c',
      },
      {
        name: 'Instructions',
        icon: 'info',
        icon_color: '#ef476f',
      },
      {
        name: 'Reference',
        icon: 'fact_check',
        icon_color: '#ffd166',
      },
    ],
    key_value_type: [
      {
        name: 'Array',
        icon: 'data_array',
      },
      {
        name: 'Boolean',
        icon: 'check_box',
      },
      {
        name: 'Number',
        icon: '123',
      },
      {
        name: 'Object',
        icon: 'add_box',
      },
      {
        name: 'String',
        icon: 'abc',
      },
      {
        name: 'Array of Numbers',
        icon: '123',
      },
      {
        name: 'Array of Objects',
        icon: 'add_box',
      },
      {
        name: 'Array of Strings',
        icon: 'abc',
      },
    ],
  },
  collections_config: {
    pages: {
      path: "",
      glob: [
        "index.mdx",
        "guides.mdx",
        "changelog/*",
        "articles/index.mdx",
        "404/*"
      ]
    },
    common_content: {
      paths: {
        dam_uploads:
          "[collection|slugify]/{date|year}/{date|month}/[asset-filename]",
      },
      path: "_common_content",
      output: false,
      icon: "copy_all",
      parser: "front-matter",
      schemas: {
        default: {
          path: ".cloudcannon/schemas/common_content.mdx",
        },
      },
      _inputs: {
        content_name: {
          comment:
            "Give this piece of reusable content a descriptive name, as this is what you will select when inserting it in a page",
        },
        parameters: {
          type: "object",
          comment: "Define any keys you created in Substitution snippets here",
          options: {
            subtype: "mutable",
            entries: {
              structures: {
                values: [
                  {
                    value: {
                      comment: null,
                      type: null,
                    },
                    _inputs: {
                      comment: {
                        comment:
                          "Text that will be shown alongside this parameter when using this piece of custom content",
                      },
                      type: {
                        comment:
                          "The CloudCannon input type that should be used for editing this parameter",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    articles: {
      path: "articles",
      output: true,
      icon: "article",
      url: "/articles/[slug]/",
      parser: "front-matter",
      schemas: {
        default: {
          path: ".cloudcannon/schemas/article.mdx",
        },
      },
    },
    guides: {
      path: "guides",
      output: true,
      icon: "handshake",
      url: "/guides/[relative_base_path]/[slug]/",
      parser: "front-matter",
      schemas: {
        default: {
          path: ".cloudcannon/schemas/guide-item.mdx",
        },
        guide_data: {
          path: ".cloudcannon/schemas/guide-data.yml",
          _inputs: {
            guide_target_ssgs: {
              type: "multiselect",
              options: {
                values: "_select_data.docs_ssgs",
                value_key: "name",
                preview: {
                  label: {
                    key: "name",
                  },
                },
              },
            },
            guide_series: {
              type: "select",
              options: {
                values: "_select_data.docs_guide_series",
                value_key: "id",
                preview: {
                  label: {
                    key: "name",
                  },
                },
              },
            },
          },
        },
      },
    },
    changelog: {
      path: "changelogs",
      output: true,
      icon: "newspaper",
      url: (filePath) => {
        const regex =
          /^changelogs\/([0-9]{4})\-([0-9]{2})\-([0-9]{2})_(.+)\.mdx?/;
        const [, year, month, day, slug] = filePath.match(regex) || [];
        return `/changelog/${year}/${month}/${day}/${slug}.html`;
      },
      parser: "front-matter",
      sort: {
        key: "path",
        order: "desc",
      },
      create: {
        path: "{date|year}-{date|month}-{date|day}_{title|slugify}.[ext]",
        _inputs: {
          date: {
            instance_value: "NOW",
          },
        },
      },
      schemas: {
        default: {
          path: ".cloudcannon/schemas/changelog.mdx",
        },
      },
    },
    data: {
      path: "_data",
      filter: {
        base: "none",
        include: ["navigation.yml", "meta.yml", "headingnav.yml", "ssgs.yml", "article_topics.yml"],
      },
    },
    keys: {
      path: "_keys",
      icon: "key",
      preview: {
        text: {
          key: "key_name",
        },
        metadata: [
          {
            text: {
              key: "key_value_type",
            },
            icon: "data_object",
          },
          {
            text: {
              key: "parent_keys",
            },
            icon: "escalator_warning",
          },
        ],
      },
      create: {
        path: "[relative_base_path]/{key_name|slugify}.yml",
      },
      schemas: {
        default: {
          path: ".cloudcannon/schemas/key-definition.yml",
          _inputs: {
            key_name: {
              type: "text",
            },
            key_singular_name: {
              type: "text",
            },
            key_value_type: {
              type: "multiselect",
              options: {
                values: "_select_data.key_value_type",
                value_key: "name",
                preview: {
                  label: {
                    key: "name",
                  },
                },
              },
            },
            key_description: {
              type: "markdown",
              options: {
                format: "p h1 h2 h3 h4 h5 h6",
                blockquote: true,
                bold: true,
                italic: true,
                strike: true,
                subscript: true,
                superscript: true,
                underline: true,
                link: true,
                bulletedlist: true,
                numberedlist: true,
                code: true,
                embed: true,
                horizontalrule: true,
                table: true,
                snippet: true,
              },
            },
            key_documentation: {
              type: "object",
              comment: "Add a documentation link.",
              options: {
                subtype: "object",
                structures: {
                  values: [
                    {
                      label: "Key Documentation Link",
                      comment: "For more information, please read our documentation on...",
                      value: {
                        text: null,
                        url: null,
                      },
                    },
                  ],
                },
              },
            },
            parent_keys: {
              type: "multiselect",
              options: {
                values: "collections.keys",
                value_key: "key_name",
                preview: {
                  label: {
                    key: "key_name",
                  },
                },
              },
            },
            subkeys: {
              type: "multiselect",
              options: {
                values: "collections.keys",
                value_key: "key_name",
                preview: {
                  label: {
                    key: "key_name",
                  },
                },
              },
            },
          },
        },
      },
    },
    glossary: {
      path: "_glossary",
      icon: "abc",
      preview: {
        text: {
          key: "key_name",
        },
      },
      schemas: {
        default: {
          path: ".cloudcannon/schemas/glossary-term.yml",
          _inputs: {
            glossary_term_name: {
              type: "text",
            },
            term_description: {
              type: "textarea",
              comment: "Keep this as short as possible (i.e., 125 characters).",
              context: {
                open: false,
                title: "Help",
                icon: "help",
                content: "Try not to use the term name in the description."
              },
              options: {
                show_count: true,
              },
            },
          },
        },
      },
    },
  },
  collection_groups: [
    {
      heading: "Users",
      collections: [
        "articles",
        "guides",
        "glossary"
      ]
    },
    {
      heading: "Developers",
      collections: [
        "keys"
      ]
    },
    {
      heading: "Other",
      collections: [
        "changelog",
        "pages"
      ]
    },
    {
      heading: "Data",
      collections: [
        "data",
        "common_content"
      ]
    }
  ],
  _editables: {
    content: {
      format: "p h1 h2 h3 h4 h5 h6",
      blockquote: true,
      bold: true,
      italic: true,
      strike: true,
      subscript: true,
      superscript: true,
      underline: true,
      link: true,
      bulletedlist: true,
      numberedlist: true,
      code: true,
      embed: true,
      horizontalrule: true,
      table: true,
      snippet: true,
    },
  },
  _structures: {
    related_links: {
      values: {
        value: {
          name: "",
          url: "",
        },
      },
    },
    common_content_types: {
      values: common_content_structures,
    },
  },
  _inputs: {
    _created_at: {
      instance_value: "NOW",
    },
    _uuid: {
      instance_value: "UUID",
    },
    description: {
      options: {
        show_count: true,
      },
    },
    explicit_canonical: {
      type: "url",
      comment:
        "Optionally reference a different page or URL that this page should set as its canonical URL",
    },
    article_category: {
      type: "multichoice",
      comment:
        "Choose a [Diataxis category](https://diataxis.fr/compass/).",
      context: {
        open: false,
        title: "Help",
        icon: "help",
        content: "Acquire skill and understand: Explanation \n\n Acquire skill and act: Guide \n\n Apply skill and understand: Reference \n\n Apply skill and act: Instructions",
      },
      options: {
        values: "_select_data.diataxis_category",
        preview: {
          icon_color: [
            {
              key: 'icon_color',
            },
          ],
        },
      },
    },
    author_notes: {
      type: "object",
      options: {
        subtype: "object",
      },
    },
    article_topic: {
      type: "multiselect",
      comment: "Select which topics apply to this article.",
      options: {
        values: "data.article_topics",
      },
    },
  },
  commit_templates: [{ template_string: "{message}" }],
  timezone: "Pacific/Auckland",
  base_url: "documentation",
};
