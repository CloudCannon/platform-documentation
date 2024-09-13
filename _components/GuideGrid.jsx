export default function ({comp, search, series = "starters", card_type = "interactive", card_eyebrow, title_replace}, helpers) {
    const starter_guide_pages = search.pages(`url^=/documentation/guides/ guide_series=${series}`, "date=desc");
    const starter_guide_indexes = starter_guide_pages.filter(page => page.src.slug === "index");
    const starter_alpine_data = starter_guide_indexes.map(page => {
        return {
            url: page.data.url,
            id: page.data.guide_id,
            image: page.data.guide_image,
            title: title_replace ? page.data.guide_title.replace(new RegExp(title_replace, 'i'), '') : page.data.guide_title,
            description: page.data.description,
            ssgs: page.data.guide_target_ssgs,
        }
    });
    starter_alpine_data.sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className={`guide-list`} 
            x-data={JSON.stringify({ 
                guides: starter_alpine_data,
                selected_name: null,
                misc_guides: [],
                suggested_guides: []
            })}
            x-init="
                selected_name = $store.conditionals.selected('ssg-label');
                suggested_guides = guides.filter(g => g.ssgs.includes(selected_name));
                misc_guides = guides.filter(g => !g.ssgs.includes(selected_name));
                "
            alpine:ssgchange="
                selected_name = $store.conditionals.selected('ssg-label');
                suggested_guides = guides.filter(g => g.ssgs.includes(selected_name));
                misc_guides = guides.filter(g => !g.ssgs.includes(selected_name));
            ">

            <div className={`c-${card_type}-cards`}>
                <template x-for="guide in suggested_guides">

                    <div className={`c-${card_type}-card c-${card_type}-card--sol`}>
                        <img loading="lazy" className={`c-${card_type}-card__image`} {...{":src": "guide.image", ":alt": "`${guide.title} logo`"}} width="50" height="50" />
                        <div className={`c-${card_type}-card__title`}>
                            { card_eyebrow ? <h4>{card_eyebrow}</h4> : <></> }
                            <h3 x-text="guide.title"></h3>
                        </div>

                        { card_type === "interactive" ?
                            <>
                                <div className="c-interactive-card__content" x-text="guide?.description || 'Learn how to get your website set up on the CloudCannon CMS.'"></div>
                                <svg height="28" viewBox="0 0 28 28" width="28" xmlns="http://www.w3.org/2000/svg"><path d="m14.0003.666504-2.35 2.349996 9.3 9.3167h-20.283308v3.3333h20.283308l-9.3 9.3167 2.35 2.35 13.3334-13.3334z"/></svg>
                            </>
                            : <></>
                        }

                        <a {...{":href": "guide.url", ":aria-label": "guide.title"}} className={`c-${card_type}-card__link`}></a>
                    </div>

                </template>

                <template x-for="guide in misc_guides">

                    <div className={`c-${card_type}-card`}>
                        <img loading="lazy" className={`c-${card_type}-card__image`} {...{":src": "guide.image", ":alt": "`${guide.title} logo`"}} width="50" height="50" />
                        <div className={`c-${card_type}-card__title`}>
                            { card_eyebrow ? <h4>{card_eyebrow}</h4> : <></> }
                            <h3 x-text="guide.title"></h3>
                        </div>

                        { card_type === "interactive" ?
                            <>
                                <div className="c-interactive-card__content" x-text="guide?.description || 'Learn how to get your website set up on the CloudCannon CMS.'"></div>
                                <svg height="28" viewBox="0 0 28 28" width="28" xmlns="http://www.w3.org/2000/svg"><path d="m14.0003.666504-2.35 2.349996 9.3 9.3167h-20.283308v3.3333h20.283308l-9.3 9.3167 2.35 2.35 13.3334-13.3334z"/></svg>
                            </>
                            : <></>
                        }

                        <a {...{":href": "guide.url", ":aria-label": "guide.title"}} className={`c-${card_type}-card__link`}></a>
                    </div>

                </template>
            </div>
        </div>
    );
}
