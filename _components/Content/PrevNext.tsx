import Card from "../Card/Card.tsx";
import type { Details, Helpers } from "../../_types.d.ts";

interface Page {
  url?: string;
  details?: Details;
}

interface PrevNextProps {
  prev?: Page;
  next?: Page;
  guideIcon?: string;
  guideTitle?: string;
  details?: Details;
  totalPages?: number;
  helpers: Helpers;
}

export default function PrevNext(
  { prev, next, guideIcon, guideTitle, details, totalPages, helpers }:
    PrevNextProps,
) {
  return (
    <>
      <div className="c-card-container--prev-next" data-pagefind-ignore>
        {prev?.url
          ? (
            <Card
              href={prev.url}
              label="Previous"
              title={prev.details?.title}
              description={prev.details?.description}
              variant="prev-next"
              className="c-card--prev"
              arrowDirection="back"
              helpers={helpers}
            />
          )
          : <div />}

        {next?.url
          ? (
            <Card
              href={next.url}
              label="Next"
              title={next.details?.title}
              description={next.details?.description}
              variant="prev-next"
              helpers={helpers}
            />
          )
          : <div />}
      </div>

      <div className="c-prev-next-mobile" data-pagefind-ignore>
        {prev?.url
          ? (
            <a href={prev.url}>
              <img
                src={helpers.icon("arrow_back:outlined", "material")}
                inline="true"
              />
            </a>
          )
          : (
            <img
              src={helpers.icon("arrow_back:outlined", "material")}
              inline="true"
            />
          )}
        <div className="c-prev-next-mobile__info">
          <div className="c-prev-next-mobile__pages">
            {guideIcon && <img src={guideIcon} />} <span>{guideTitle}</span>
            {" "}
            ({details?.order}/{totalPages})
          </div>
          <span className="c-prev-next-mobile__title">
            {details?.title}
          </span>
        </div>
        {next?.url
          ? (
            <a href={next.url}>
              <img
                src={helpers.icon("arrow_forward:outlined", "material")}
                inline="true"
              />
            </a>
          )
          : (
            <img
              src={helpers.icon("arrow_forward:outlined", "material")}
              inline="true"
            />
          )}
      </div>
    </>
  );
}
