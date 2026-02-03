import Card from "../../_components/Card/Card.tsx";
import type { Helpers } from "../../_types.d.ts";

interface GuideItem {
  item: string;
}

interface GuideSection {
  section_title: string;
  grid_size?: "sm" | "lg" | string;
  items?: GuideItem[];
}

interface Guide {
  url: string;
  guide_title: string;
  guide_summary: string;
  guide_icon?: string;
  guide_image?: string;
}

interface Search {
  page: (query: string) => Guide | null;
}

interface Props {
  title: string;
  guide_sections?: GuideSection[];
  search: Search;
}

export default function GuidesListLayout(props: Props, helpers: Helpers) {
  const { title, guide_sections, search } = props;

  return (
    <main id="main-content" className="l-page guide-page">
      <div className="l-column">
        <div className="l-small-content">
          <h1 className="l-heading" data-editable="text" data-prop="title">
            {title}
          </h1>

          <editable-array data-prop="guide_sections">
            {guide_sections?.map((section, si) => {
              const isSmallGrid = section.grid_size === "sm";
              const isLargeGrid = section.grid_size === "lg";

              return (
                <editable-array-item key={si}>
                  <h2 data-editable="text" data-prop="section_title">
                    {section.section_title}
                  </h2>
                  <editable-array
                    data-prop="items"
                    data-direction="row"
                    className={`c-card-container--guides ${
                      section.grid_size || ""
                    }`}
                  >
                    {section.items?.map((item, ii) => {
                      const guide = search.page(`_uuid=${item.item}`);
                      if (!guide) return null;

                      return (
                        <editable-array-item key={ii}>
                          <Card
                            href={guide.url}
                            title={guide.guide_title}
                            description={guide.guide_summary}
                            icon={guide.guide_icon}
                            image={isLargeGrid ? guide.guide_image : undefined}
                            variant="guide"
														className={[
															isSmallGrid ? "c-card--guide-sm" : "",
															guide.guide_icon_invert_for_dark_mode ? 'u-grayscale-invert-images' : ''
															].join(' ')}
                            helpers={helpers}
                          />
                        </editable-array-item>
                      );
                    })}
                  </editable-array>
                </editable-array-item>
              );
            })}
          </editable-array>
        </div>
      </div>
    </main>
  );
}

export const layout = "layouts/base.tsx";
