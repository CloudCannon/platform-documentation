export default function PrevNext({ prev, next, guideIcon, guideTitle, details, totalPages, helpers }) {
    return (
        <>
            <div className="c-prev-next-block">
                {prev?.url ? (
                    <div className="c-prev-next-block__item c-prev-next-block__item--previous">
                        <a className="c-prev-next-button" href={prev.url}>
                            <strong className="c-prev-next-block__heading c-prev-next-block__heading--previous">
                                Previous
                            </strong>
                            <div className="c-prev-next-button__details">
                                <div className="c-prev-next-button__body">{prev.details?.title}</div>
                                <div className="c-prev-next-button__header">
                                    <div className="c-prev-next-button__category">{prev.details?.description}</div>
                                </div>
                            </div>
                            <div className="c-prev-next-block__item--card-arrow">
                                <img src={helpers.icon("arrow_forward:outline", "material")} inline="true" />
                            </div>
                        </a>
                    </div>
                ) : <div />}

                {next?.url ? (
                    <div className="c-prev-next-block__item c-prev-next-block__item--next">
                        <a className="c-prev-next-button" href={next.url}>
                            <strong className="c-prev-next-block__heading c-prev-next-block__heading--next">
                                Next
                            </strong>
                            <div className="c-prev-next-button__details">
                                <div className="c-prev-next-button__body">{next.details?.title}</div>
                                <div className="c-prev-next-button__header">
                                    <div className="c-prev-next-button__category">{next.details?.description}</div>
                                </div>
                            </div>
                            <div className="c-prev-next-block__item--card-arrow">
                                <img src={helpers.icon("arrow_forward:outline", "material")} inline="true" />
                            </div>
                        </a>
                    </div>
                ) : <div />}
            </div>

            <div className="c-prev-next-mobile">
                {prev?.url ? (
                    <a href={prev.url}>
                        <img src={helpers.icon("arrow_back:outline", "material")} inline="true" />
                    </a>
                ) : (
                    <img src={helpers.icon("arrow_back:outline", "material")} inline="true" />
                )}
                <div className="c-prev-next-mobile__info">
                    <div className="c-prev-next-mobile__pages">
                        <img src={guideIcon} /> <span>{guideTitle}</span> ({details?.order}/{totalPages})
                    </div>
                    <span className="c-prev-next-mobile__title">
                        {details?.title}
                    </span>
                </div>
                {next?.url ? (
                    <a href={next.url}>
                        <img src={helpers.icon("arrow_forward:outline", "material")} inline="true" />
                    </a>
                ) : (
                    <img src={helpers.icon("arrow_forward:outline", "material")} inline="true" />
                )}
            </div>
        </>
    );
}
