export default function CardGrid({ helpers }) {
    const arrowIconUrl = helpers.icon("arrow_forward:outlined", "material");
    
    return (
        <div className="c-card-grid">
            <template x-for="card in block.cards">
                <a className="c-card-grid__card" x-bind:class="card.span_two ? 'span-two' : ''" alpine:href="card.url && card.url != '' ? card.url : null">
                    <h2 x-text="card.heading"></h2>
                    <template x-if="card.description && card.description != ''">
                        <p x-html="card.description"></p>
                    </template>
                    <div className="c-card-grid__card--items" x-show="card.items && card.items.length > 0">
                        <template x-for="(item, index) in card.items">
                            <div style={{ display: 'contents' }}>
                                <a className="c-card c-card--list-item" alpine:href="item.url && item.url != '' ? item.url : null">
                                    <div className="c-card__icon" x-data="{ svg: '' }"
                                        x-init="fetch('https://cdn.jsdelivr.net/npm/@material-design-icons/svg@0.14.15/outlined/'+item.icon+'.svg').then(res => res.text()).then(txt => svg = txt)"
                                        x-html="svg">
                                    </div>
                                    <h3 className="c-card__title" x-text="item.heading"></h3>
                                    <div>{/* spacer for grid layout */}</div>
                                    <p className="c-card__description" x-html="item.description"></p>
                                    <div className="c-card__footer" x-show="item.url" style={{ gridColumn: 'span 2' }}>
                                        <div 
                                            className="c-card__arrow"
                                            x-data="{ svg: '' }"
                                            x-init={`fetch('${arrowIconUrl}').then(res => res.text()).then(txt => svg = txt)`}
                                            x-html="svg"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </a>
                                <template x-if="(index+1) < card.items.length">
                                    <hr />
                                </template>
                            </div>
                        </template>
                    </div>
                    <div x-show="card.url">
                        <div className="c-card-grid__card-arrow" x-data="{ svg: '' }"
                            x-init={`fetch('${arrowIconUrl}').then(res => res.text()).then(txt => svg = txt)`}
                            x-html="svg">
                        </div>
                    </div>
                    <template x-if="card.image && card.image != ''">
                        <div>
                            <div className="img-spacer"></div>
                            <img loading="lazy" alpine:src="card.image" alt="" />
                        </div>
                    </template>
                </a>
            </template>
        </div>
    );
}
