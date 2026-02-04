import Card from "../../_components/Card/Card.tsx";
import { GridCard } from "../../_components/Card/index.ts";
import InlineSearch from "../../_components/Layout/InlineSearch.tsx";
import type { Helpers } from "../../_types.d.ts";

interface Item {
  url?: string;
  icon?: string;
  heading: string;
  description: string;
}

interface DocSection {
  heading: string;
  description: string;
  image?: string;
  items?: Item[];
}

interface LinkSection {
  url?: string;
  heading: string;
  description: string;
}

interface CommunitySection {
  heading: string;
  description: string;
  background_image?: string;
  light_mode_background_color?: string;
  dark_mode_background_color?: string;
  light_mode_text_color?: string;
  dark_mode_text_color?: string;
  button_text?: string;
  button_link?: string;
}

interface BetaSection {
  visible: boolean;
  heading: string;
  description: string;
  image?: string;
  button_text?: string;
  button_link?: string;
}

interface Props {
  hero_title: string;
  user_docs?: DocSection;
  developer_docs?: DocSection;
  changelog?: LinkSection;
  community?: CommunitySection;
  beta?: BetaSection;
}

export default function HomeLayout(props: Props, helpers: Helpers) {
  const {
    hero_title,
    user_docs,
    developer_docs,
    changelog,
    community,
    beta,
  } = props;

  const arrowIconUrl = helpers.icon("arrow_forward:outlined", "material");

  // Helper to render a documentation card with items
  const renderDocCard = (
    data: DocSection,
    propPrefix: string,
    hasImage = true,
  ) => (
    <GridCard
      title={data.heading}
      description={data.description}
      image={hasImage && data.image ? helpers.url(data.image) : undefined}
      helpers={helpers}
      dataEditable={{
        title: {
          "data-editable": "text",
          "data-prop": `${propPrefix}.heading`,
        },
        description: data.description
          ? {
            "data-editable": "text",
            "data-prop": `${propPrefix}.description`,
          }
          : {},
        image: hasImage && data.image
          ? { "data-editable": "src", "data-prop": `${propPrefix}.image` }
          : {},
      }}
    >
      <div className="c-card-grid__card--items">
        {data.items?.map((item, index) => (
          <div key={index} style={{ display: "contents" }}>
            <a
              className="c-card c-card--list-item"
              href={item.url || undefined}
            >
              <div className="c-card__icon">
                <img
                  src={helpers.icon(`${item.icon}:outlined`, "material")}
                  inline="true"
                />
              </div>
              <h3 className="c-card__title">{item.heading}</h3>
              <div>{/* spacer for grid layout */}</div>
              <p className="c-card__description">{item.description}</p>
              {item.url && (
                <div
                  className="c-card__footer"
                  style={{ "grid-column": "span 2" }}
                >
                  <div className="c-card__arrow" aria-hidden="true">
                    <img src={arrowIconUrl} inline="true" />
                  </div>
                </div>
              )}
            </a>
            {index < (data.items?.length || 0) - 1 && <hr />}
          </div>
        ))}
      </div>
    </GridCard>
  );

  return (
    <div id="main-content">
      {/* Hero Section with Search */}
      <div className="c-hero">
        <h1 data-editable="text" data-prop="hero_title">{hero_title}</h1>
        <InlineSearch autofocus />
      </div>

      {/* Card Grid Section */}
      <div className="c-card-grid">
        {/* User Documentation Card */}
        {user_docs && renderDocCard(user_docs, "user_docs")}

        {/* Developer Documentation Card */}
        {developer_docs && renderDocCard(developer_docs, "developer_docs")}

        {/* Changelog Card */}
        {changelog && (
          <div style={{ "grid-column": "span 2" }}>
            <Card
              href={changelog.url}
              title={changelog.heading}
              description={changelog.description}
              showArrow
              helpers={helpers}
            />
          </div>
        )}
      </div>

      {/* Community CTA Section */}
      {community && (
        <div
          className="c-centred-block"
          style={{
            "background-image": community.background_image
              ? `url(${helpers.url(community.background_image)})`
              : undefined,
            "--centred-block-background": community.light_mode_background_color
              ? `light-dark(${community.light_mode_background_color}, ${
                community.dark_mode_background_color ||
                community.light_mode_background_color
              })`
              : undefined,
            "--centred-block-text": community.light_mode_text_color
              ? `light-dark(${community.light_mode_text_color}, ${
                community.dark_mode_text_color ||
                community.light_mode_text_color
              })`
              : undefined,
          } as Record<string, string | undefined>}
        >
          <div className="c-centred-block__inner">
            <h2 data-editable="text" data-prop="community.heading">
              {community.heading}
            </h2>
            <p data-editable="text" data-prop="community.description">
              {community.description}
            </p>
            <div>
              {community.button_text && community.button_link && (
                <a
                  href={community.button_link}
                  className="cc-helper__button c-button"
                >
                  {community.button_text}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Beta Section */}
      {beta?.visible && (
        <div className="c-left-right-block">
          <div className="c-left-right-block__left">
            <div>
              <h2 data-editable="text" data-prop="beta.heading">
                {beta.heading}
              </h2>
              <p data-editable="text" data-prop="beta.description">
                {beta.description}
              </p>
              <div>
                {beta.button_text && beta.button_link && (
                  <a
                    href={beta.button_link}
                    className="cc-helper__button c-button"
                  >
                    {beta.button_text}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="c-left-right-block__right">
            {beta.image && (
              <img
                src={beta.image}
                alt=""
                data-editable="image"
                data-prop="beta.image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const layout = "layouts/base.tsx";
