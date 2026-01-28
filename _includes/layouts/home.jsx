import Hero from '../../_components/ContentBlocks/Hero.jsx';
import CentredBlock from '../../_components/ContentBlocks/CentredBlock.jsx';
import CardGrid from '../../_components/ContentBlocks/CardGrid.jsx';
import LeftRightBlock from '../../_components/ContentBlocks/LeftRightBlock.jsx';

export default function HomeLayout(props, helpers) {
    const { content_blocks } = props;
    
    const arrowIconUrl = helpers.icon("arrow_forward:outlined", "material");
    const expandMoreIconUrl = helpers.icon("expand_more:outlined", "material");
    const arrowBackIconUrl = helpers.icon("arrow_back_ios:outlined", "material");
    const arrowForwardIconUrl = helpers.icon("arrow_forward_ios:outlined", "material");
    
    // Pre-rendered component templates for CloudCannon live editing
    // These are HTML strings that Alpine.js swaps in at runtime
    const renderedComponents = {
        hero: `<div class="c-hero">
            <h1 x-text="block.title"></h1>
            <div class="t-searcher">
                <div class="t-searcher-inner" @click.away="isModalOpen = false; $focusSearch(false);">
                    <h2>Search</h2>
                    <div id="searchbox"></div>
                    <a class="mobile-filters cc-helper__altbutton" data-pfmod-suppressed="true">Filters <img src="${expandMoreIconUrl}" inline="true" /></a>
                    <div id="searchcontainer">
                        <div id="searchfilter"></div>
                        <div id="resultscontainer">
                            <div id="searchsummary"></div>
                            <div id="searchresults"></div>
                        </div>
                    </div>
                    <div id="searchpagination"></div>
                    <div id="pagination-prev__template">
                        <img src="${arrowBackIconUrl}" inline="true" />
                    </div>
                    <div id="pagination-next__template">
                        <img src="${arrowForwardIconUrl}" inline="true" />
                    </div>
                </div>
            </div>
        </div>`,
        
        centredblock: `<div class="c-centred-block" :style="{ 
            backgroundImage: 'url(' + block.background_image + ')',
            '--centred-block-background-light': block.light_mode_background_color,
            '--centred-block-background-dark': block.dark_mode_background_color,
            '--centred-block-text-light': block.light_mode_text_color,
            '--centred-block-text-dark': block.dark_mode_text_color
        }">
            <div class="c-centred-block__inner">
                <h2 x-text="block.heading"></h2>
                <p x-html="block.description"></p>
                <div>
                    <template x-for="button in block.buttons">
                        <a :href="button.button_link" class="cc-helper__button c-button" x-text="button.button_text"></a>
                    </template>
                </div>
            </div>
        </div>`,
        
        cardgrid: `<div class="c-card-grid">
            <template x-for="card in block.cards">
                <a class="c-card-grid__card" x-bind:class="card.span_two ? 'span-two' : ''" :href="card.url && card.url != '' ? card.url : null">
                    <h2 x-text="card.heading"></h2>
                    <template x-if="card.description && card.description != ''">
                        <p x-html="card.description"></p>
                    </template>
                    <div class="c-card-grid__card--items" x-show="card.items && card.items.length > 0">
                        <template x-for="(item, index) in card.items">
                            <div style="display: contents;">
                                <a class="c-card c-card--list-item" :href="item.url && item.url != '' ? item.url : null">
                                    <div class="c-card__icon" x-data="{ svg: '' }"
                                        x-init="fetch('https://cdn.jsdelivr.net/npm/@material-design-icons/svg@0.14.15/outlined/'+item.icon+'.svg').then(res => res.text()).then(txt => svg = txt)"
                                        x-html="svg">
                                    </div>
                                    <h3 class="c-card__title" x-text="item.heading"></h3>
                                    <div><!-- spacer for grid layout --></div>
                                    <p class="c-card__description" x-html="item.description"></p>
                                    <div class="c-card__footer" x-show="item.url" style="grid-column:span 2">
                                        <div class="c-card__arrow" x-data="{ svg: '' }"
                                            x-init="fetch('${arrowIconUrl}').then(res => res.text()).then(txt => svg = txt)"
                                            x-html="svg"
                                            aria-hidden="true"></div>
                                    </div>
                                </a>
                                <template x-if="(index+1) < card.items.length">
                                    <hr/>
                                </template>
                            </div>
                        </template>
                    </div>
                    <div x-show="card.url">
                        <div class="c-card-grid__card-arrow" x-data="{ svg: '' }"
                            x-init="fetch('${arrowIconUrl}').then(res => res.text()).then(txt => svg = txt)"
                            x-html="svg">
                        </div>
                    </div>
                    <template x-if="card.image && card.image != ''">
                        <div>
                            <div class="img-spacer"></div>
                            <img loading="lazy" :src="card.image" alt="" />
                        </div>
                    </template>
                </a>
            </template>
        </div>`,
        
        leftrightblock: `<div class="c-left-right-block">
            <div class="c-left-right-block__left" x-data="{block: block.left}">
                <template x-if="block.block_type == 'text'">
                    <div>
                        <h2 x-text="block.heading"></h2>
                        <p x-html="block.description"></p>
                        <div>
                            <template x-for="button in block.buttons">
                                <a :href="button.button_link" class="cc-helper__button c-button" x-text="button.button_text"></a>
                            </template>
                        </div>
                    </div>
                </template>
                <template x-if="block.block_type == 'image'">
                    <img :src="block.image" />
                </template>
            </div>
            <div class="c-left-right-block__right" x-data="{block: block.right}">
                <template x-if="block.block_type == 'text'">
                    <div>
                        <h2 x-text="block.heading"></h2>
                        <p x-html="block.description"></p>
                        <div>
                            <template x-for="button in block.buttons">
                                <a :href="button.button_link" class="cc-helper__button c-button" x-text="button.button_text"></a>
                            </template>
                        </div>
                    </div>
                </template>
                <template x-if="block.block_type == 'image'">
                    <img :src="block.image" />
                </template>
            </div>
        </div>`
    };

    // Map component types to JSX components for static rendering
    const componentMap = {
        hero: Hero,
        centredblock: CentredBlock,
        cardgrid: CardGrid,
        leftrightblock: LeftRightBlock
    };

    return (
        <>
            <script defer src="https://unpkg.com/alpinejs@3.14.9/dist/cdn.min.js"></script>
            <script src="/assets/js/custom-live.js" type="text/javascript"></script>
            
            <script dangerouslySetInnerHTML={{ __html: `
                window.renderedComponents = {
                    "hero": \`${renderedComponents.hero.replace(/`/g, '\\`')}\`,
                    "centredblock": \`${renderedComponents.centredblock.replace(/`/g, '\\`')}\`,
                    "cardgrid": \`${renderedComponents.cardgrid.replace(/`/g, '\\`')}\`,
                    "leftrightblock": \`${renderedComponents.leftrightblock.replace(/`/g, '\\`')}\`
                };
            `}} />
            
            <div x-data="{ contentBlocks: [] }" x-init={`
                new CloudCannonLive(data => {
                    this.contentBlocks = data?.content_blocks || []
                })
            `}>
                {/* Static rendering for non-CloudCannon environments */}
                <div className="static-content" x-show="contentBlocks.length == 0">
                    {content_blocks?.map((block, index) => {
                        const Component = componentMap[block._component_type];
                        if (!Component) return null;
                        return (
                            <div key={index} x-data={`{ block: ${JSON.stringify(block)} }`}>
                                <Component helpers={helpers} />
                            </div>
                        );
                    })}
                </div>
                
                {/* CloudCannon live preview region (hidden if not in live editing) */}
                <div id="live-preview" x-show="contentBlocks && contentBlocks.length > 0">
                    <template x-for="(block, i) in contentBlocks" alpine:key="i">
                        <div className="block" x-html="window.renderedComponents[block._component_type] || 'Missing component'"></div>
                    </template>
                </div>
            </div>
        </>
    );
}

export const layout = "layouts/base.jsx";
