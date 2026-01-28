export default function GuidesListLayout(props, helpers) {
    const { title, guide_sections, search } = props;

    return (
        <div className="l-page guide-page">
            <div className="l-column">
                <div className="l-small-content">
                    <h1 className="l-heading" data-editable="text" data-prop="title">{title}</h1>

                    <editable-array data-prop="guide_sections">
                        {guide_sections?.map((section, si) => {
                            return (
                                <editable-array-item key={si}>
                                    <h2 data-editable="text" data-prop="section_title">{section.section_title}</h2>
                                    <editable-array data-prop="items" data-direction="row" className={`guide-page__cards ${section.grid_size || ''}`}>
                                        {section.items?.map((item, ii) => {
                                            const guide = search.page(`_uuid=${item.item}`);
                                            if (!guide) return null;
                                            
                                            return (
                                                <editable-array-item key={ii} className="guide-page__cards--card">
                                                    <a href={guide.url}>
                                                        <div className="guide-page__cards--card__heading">
                                                            <img src={guide.guide_icon} height="24" />
                                                            <h3>{guide.guide_title}</h3>
                                                        </div>
                                                        <p>{guide.guide_summary}</p>
                                                        <div className="guide-page__cards--card__card-arrow">
                                                            <img src={helpers.icon("arrow_forward:outlined", "material")} inline="true" />
                                                        </div>
                                                        {section.grid_size === "lg" && guide.guide_image && (
                                                            <>
                                                                <div className="img-spacer" />
                                                                <img className="guide-page__cards--card__image" src={guide.guide_image} />
                                                            </>
                                                        )}
                                                    </a>
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
        </div>
    );
}

export const layout = "layouts/base.jsx";
