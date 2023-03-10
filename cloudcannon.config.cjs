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
                    path: "schemas/article.mdx"
                }
            }
        },
        changelog: {
            path: 'changelogs',
            output: true,
            icon: 'tips_and_updates',
            url: '/changelog/[slug]/',
            parser: 'front-matter',
            schemas: {
                default: {
                    path: "schemas/changelog.mdx"
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
        change_logs: {
            values: {
                value: {
                    name: 'Initial Version',
                    _created_at: null 
                }
            }
        },
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
    }
}