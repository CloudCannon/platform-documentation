import Card from '../../_components/Card/Card.jsx';

export default function GuidesListLayout(props, helpers) {
    const { title, guide_sections, search } = props;

    return (
        <div className="l-page guide-page">
            <div className="l-column">
                <div className="l-small-content">
                    <h1 className="l-heading" data-editable="text" data-prop="title">{title}</h1>

                    <editable-array data-prop="guide_sections">
                        {guide_sections?.map((section, si) => {
                            const isSmallGrid = section.grid_size === 'sm';
                            const isLargeGrid = section.grid_size === 'lg';
                            
                            return (
                                <editable-array-item key={si}>
                                    <h2 data-editable="text" data-prop="section_title">{section.section_title}</h2>
                                    <editable-array 
                                        data-prop="items" 
                                        data-direction="row" 
                                        className={`c-card-container--guides ${section.grid_size || ''}`}
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
                                                        image={isLargeGrid ? guide.guide_image : null}
                                                        variant="guide"
                                                        className={isSmallGrid ? 'c-card--guide-sm' : ''}
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
        </div>
    );
}

export const layout = "layouts/base.jsx";
