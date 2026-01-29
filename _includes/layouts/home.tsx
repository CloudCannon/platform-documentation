import { GridCard } from '../../_components/Card/index.ts';
import type { Helpers } from '../../_types.d.ts';

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
        beta
    } = props;
    
    const arrowIconUrl = helpers.icon("arrow_forward:outlined", "material");
    const expandMoreIconUrl = helpers.icon("expand_more:outlined", "material");
    const arrowBackIconUrl = helpers.icon("arrow_back_ios:outlined", "material");
    const arrowForwardIconUrl = helpers.icon("arrow_forward_ios:outlined", "material");

    // Helper to render a documentation card with items
    const renderDocCard = (data: DocSection, propPrefix: string, hasImage = true) => (
        <GridCard
            title={data.heading}
            description={data.description}
            image={hasImage && data.image ? helpers.url(data.image) : undefined}
            helpers={helpers}
            dataEditable={{
                title: { 'data-editable': 'text', 'data-prop': `${propPrefix}.heading` },
                description: data.description ? { 'data-editable': 'text', 'data-prop': `${propPrefix}.description` } : {},
                image: hasImage && data.image ? { 'data-editable': 'src', 'data-prop': `${propPrefix}.image` } : {}
            }}
        >
            <div className="c-card-grid__card--items">
                {data.items?.map((item, index) => (
                    <div key={index} style={{ display: 'contents' }}>
                        <a className="c-card c-card--list-item" href={item.url || undefined}>
                            <div className="c-card__icon">
                                <img src={helpers.icon(`${item.icon}:outlined`, "material")} inline="true" />
                            </div>
                            <h3 className="c-card__title">{item.heading}</h3>
                            <div>{/* spacer for grid layout */}</div>
                            <p className="c-card__description">{item.description}</p>
                            {item.url && (
                                <div className="c-card__footer" style={{ gridColumn: 'span 2' }}>
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
        <>
            {/* Hero Section with Search */}
            <div className="c-hero">
                <h1 data-editable="text" data-prop="hero_title">{hero_title}</h1>
                <div className="t-searcher">
                    <div className="t-searcher-inner">
                        <h2>Search</h2>
                        <div id="searchbox"></div>
                        <a className="mobile-filters cc-helper__altbutton" data-pfmod-suppressed="true">
                            Filters <img src={expandMoreIconUrl} inline="true" />
                        </a>
                        <div id="searchcontainer">
                            <div id="searchfilter"></div>
                            <div id="resultscontainer">
                                <div id="searchsummary"></div>
                                <div id="searchresults"></div>
                            </div>
                        </div>
                        <div id="searchpagination"></div>
                        <div id="pagination-prev__template">
                            <img src={arrowBackIconUrl} inline="true" />
                        </div>
                        <div id="pagination-next__template">
                            <img src={arrowForwardIconUrl} inline="true" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Grid Section */}
            <div className="c-card-grid">
                {/* User Documentation Card */}
                {user_docs && renderDocCard(user_docs, 'user_docs')}
                
                {/* Developer Documentation Card */}
                {developer_docs && renderDocCard(developer_docs, 'developer_docs')}
                
                {/* Changelog Card */}
                {changelog && (
                    <GridCard
                        href={changelog.url}
                        title={changelog.heading}
                        description={changelog.description}
                        spanTwo
                        showArrow={Boolean(changelog.url)}
                        helpers={helpers}
                        dataEditable={{
                            title: { 'data-editable': 'text', 'data-prop': 'changelog.heading' },
                            description: changelog.description ? { 'data-editable': 'text', 'data-prop': 'changelog.description' } : {}
                        }}
                    />
                )}
            </div>

            {/* Community CTA Section */}
            {community && (
                <div 
                    className="c-centred-block"
                    style={{
                        backgroundImage: community.background_image ? `url(${helpers.url(community.background_image)})` : undefined,
                        '--centred-block-background-light': community.light_mode_background_color || '#ffffff',
                        '--centred-block-background-dark': community.dark_mode_background_color || '#ffffff',
                        '--centred-block-text-light': community.light_mode_text_color || '#212121',
                        '--centred-block-text-dark': community.dark_mode_text_color || '#212121'
                    }}
                >
                    <div className="c-centred-block__inner">
                        <h2 data-editable="text" data-prop="community.heading">{community.heading}</h2>
                        <p data-editable="text" data-prop="community.description">{community.description}</p>
                        <div>
                            {community.button_text && community.button_link && (
                                <a href={community.button_link} className="cc-helper__button c-button">
                                    {community.button_text}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Beta Section */}
            {beta && (
                <div className="c-left-right-block">
                    <div className="c-left-right-block__left">
                        <div>
                            <h2 data-editable="text" data-prop="beta.heading">{beta.heading}</h2>
                            <p data-editable="text" data-prop="beta.description">{beta.description}</p>
                            <div>
                                {beta.button_text && beta.button_link && (
                                    <a href={beta.button_link} className="cc-helper__button c-button">
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
        </>
    );
}

export const layout = "layouts/base.tsx";
