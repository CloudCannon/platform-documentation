module.exports = (source) => {
  return {
    docshot: {
      template: "mdx_component",
      inline: false,
      preview: {
        text: "DocShot",
        view: "gallery",
        subtext: [
          {
            key: "alt",
          },
        ],
        icon: "crop_original",
        image: [
          {
            template: "",
          },
        ],
        gallery: {
          image: [
            {
              key: `https://cc-screenshots.imgix.net/${source}/{docshot_key}.webp`,
            },
          ],
        },
      },
      _inputs: {
        type: {
          type: "select",
          options: {
            values: ["photo", "screenshot", "ui-snippet"],
          },
        },
        alt: {
          type: "textarea",
          options: {
            show_count: true,
          },
        },
        docshot_key: {
          type: "text",
          comment: "[From DocShots](https://docshots.cloudcannon.com/)",
        },
      },
      definitions: {
        component_name: "comp.DocShot",
        named_args: [
          {
            editor_key: "docshot_key",
            type: "string",
          },
          {
            editor_key: "alt",
            type: "string",
          },
          {
            editor_key: "title",
            optional: true,
            type: "string",
          },
          {
            editor_key: "type",
            type: "string",
            optional: true,
            remove_empty: true,
          },
        ],
      },
    },
  };
};
