const path = require("path");

const _snippets = {
    ...require(path.join(__dirname, ".cloudcannon/snippets/code_block.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/conditional.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/data_reference.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/docs_image.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/multi_code_block.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/notice.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/tabs.json")),
    ...require(path.join(__dirname, ".cloudcannon/snippets/youtube.json")),
}

module.exports = {
    _snippets_imports: {
        mdx: true
    },
    _snippets,
    collections_config: {
        articles: {
            path: 'articles',
            output: true,
            icon: 'article',
            url: '/articles/[slug]/',
            parser: 'front-matter',
            schemas: {
                default: {
                    path: ".cloudcannon/schemas/article.mdx"
                }
            }
        },
        changelog: {
            path: 'changelogs',
            output: true,
            icon: 'tips_and_updates',
            url: '/changelog/[slug]/',
            parser: 'front-matter',
            sort: {
              key: 'path',
              order: 'desc'
            },
            create: {
              path: '{date|year}-{date|month}-{date|day}_{title|slugify}.[ext]',
              _inputs: {
                date: {
                  instance_value: 'NOW'
                }
              }
            },
            schemas: {
                default: {
                    path: ".cloudcannon/schemas/changelog.mdx"
                }
            }
        },
        data: {
            path: '_data',
            filter: {
                base: 'none',
                include: [
                    'navigation.yml',
                    'meta.yml',
                    'headingnav.yml',
                    'ssgs.yml'
                ]
            }
        }
    },
    _editables: {
        content: {
            format: true,
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
            image: true,
            table: true,
            snippet: true
        }
    },
    _structures: {
        related_links: {
            values: {
                value: {
                    name: '',
                    url: ''
                }
            }
        }
    },
    _inputs: {
        _created_at: {
            instance_value: 'NOW',
        },
        _uuid: {
            instance_value: 'UUID',
        }
    },
    commit_templates: [
        {template_string: '{message}'}
    ],
    timezone: 'Pacific/Auckland',
    base_url: 'documentation'
}