export default function ({comp, search}, helpers) {
    const starter_guide_pages = search.pages("url^=/documentation/guides/ guide_series=starters", "date=desc");
    const starter_guide_indexes = starter_guide_pages.filter(page => page.src.slug === "index");
    const starter_alpine_data = starter_guide_indexes.map(page => {
        return {
            url: page.data.url,
            id: page.data.guide_id,
            image: page.data.guide_image,
            title: page.data.guide_title,
            description: page.data.description,
            ssgs: page.data.guide_target_ssgs,
        }
    });

    return (
        <div className="c-interactive-card c-interactive-card--sol"
            x-data={JSON.stringify({ 
                guides: starter_alpine_data,
                selected_name: null,
                guide: null
            })}
            x-init="
                selected_name = $store.conditionals.selected('ssg-name');
                guide = guides.filter(g => g.ssgs.includes(selected_name))[0] ?? null;
                "
            alpine:ssgchange="
                selected_name = $store.conditionals.selected('ssg-name');
                guide = guides.filter(g => g.ssgs.includes(selected_name))[0] ?? null;
            ">
            <img loading="lazy" className="c-interactive-card__image" {...{":src": "guide?.image || '/documentation/static/hand.png'", ":alt": "`${guide.title} logo`"}} width="50" height="50" />
            <h3 x-text="guide?.title || 'Starter Guides'"></h3>
            <div className="c-interactive-card__content" x-text="guide?.description || 'Learn how to get your website set up on the CloudCannon CMS.'"></div>

            <svg height="28" viewBox="0 0 28 28" width="28" xmlns="http://www.w3.org/2000/svg"><path d="m14.0003.666504-2.35 2.349996 9.3 9.3167h-20.283308v3.3333h20.283308l-9.3 9.3167 2.35 2.35 13.3334-13.3334z"/></svg>
            <a {...{":href": "guide?.url || '/documentation/guides/'", ":aria-label": "guide?.title || 'Starter Guides'"}} className="c-interactive-card__link"></a>
        </div>
    );
}
