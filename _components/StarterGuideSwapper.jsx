export default function ({comp, search}, helpers) {
    const starter_guide_pages = search.pages("url^=/documentation/guides/ guide_series=starters", "date=desc");
    const starter_guide_indexes = starter_guide_pages.filter(page => page.src.slug === "index");
    const starter_alpine_data = starter_guide_indexes.map(page => {
        return {
            url: page.data.url,
            id: page.data.guide_id,
            image: page.data.guide_image,
            title: page.data.guide_title.replace(/ starter guide$/i, ''),
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
                selected_name = $store.conditionals.selected('ssg-name');
                suggested_guides = guides.filter(g => g.ssgs.includes(selected_name));
                misc_guides = guides.filter(g => !g.ssgs.includes(selected_name));
                "
            alpine:ssgchange="
                selected_name = $store.conditionals.selected('ssg-name');
                suggested_guides = guides.filter(g => g.ssgs.includes(selected_name));
                misc_guides = guides.filter(g => !g.ssgs.includes(selected_name));
            ">

            <div className="c-guide-cards">
                <template x-for="guide in suggested_guides">

                    <div className="c-guide-card c-guide-card--sol">
                        <img loading="lazy" className="c-guide-card__image" {...{":src": "guide.image", ":alt": "`${guide.title} logo`"}} width="50" height="50" />
                        <div className="c-guide-card__title">
                            <h4>Starter Guide</h4>
                            <h3 x-text="guide.title"></h3>
                        </div>

                        <a {...{":href": "guide.url", ":aria-label": "guide.title"}} className="c-guide-card__link"></a>
                    </div>

                </template>

                <template x-for="guide in misc_guides">

                    <div className="c-guide-card">
                        <img loading="lazy" className="c-guide-card__image" {...{":src": "guide.image", ":alt": "`${guide.title} logo`"}} width="50" height="50" />
                        <div className="c-guide-card__title">
                            <h4>Starter Guide</h4>
                            <h3 x-text="guide.title"></h3>
                        </div>

                        <a {...{":href": "guide.url", ":aria-label": "guide.title"}} className="c-guide-card__link"></a>
                    </div>

                </template>
            </div>
        </div>
    );
}
