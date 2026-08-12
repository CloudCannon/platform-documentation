const SearchResultTemplate = `
<li class="pf-result">
  <a class="c-card c-card--search" href="{{ meta.url | default(url) | safeUrl }}"{{#if options.link_target}} target="{{ options.link_target }}"{{/if}}>
    {{#if and(options.show_images, meta.image)}}
    <img class="c-card__image" src="{{ meta.image }}" alt="{{ meta.image_alt | default(meta.title) }}">
    {{/if}}
    <div class="c-card__heading">
      <h3 class="c-card__title">{{ meta.title }}</h3>
    </div>
    {{#if excerpt}}
    <p class="c-card__description">{{+ excerpt +}}</p>
    {{/if}}
    <div class="c-card__footer">
      <div class="c-card__tags">
        {{#if meta.category}}
        <span class="c-card__category">{{ meta.category }}</span>
        {{/if}}
        {{#if meta.article_category}}
        <span class="c-card__category">{{ meta.article_category }}</span>
        {{/if}}
      </div>
      <span class="c-card__arrow" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
      </span>
    </div>
  </a>
  {{#if sub_results}}
  <ul class="c-card__sub-results">
    {{#each sub_results as sub}}
    <li class="c-card__sub-result">
      <a class="c-card__sub-result-link" href="{{ sub.url | safeUrl }}">{{ sub.title }}</a>
      <p class="c-card__sub-result-excerpt">{{+ sub.excerpt +}}</p>
    </li>
    {{/each}}
  </ul>
  {{/if}}
</li>
`;

export default function SearchResults() {
  return (
    <div
      className="t-searcher-layout"
      x-data
      x-show="$store.search.hasQuery"
      x-cloak
    >
      <div
        className="cc-search-pills"
        x-data="searchPills"
        x-show="entries().length"
        x-cloak
        role="radiogroup"
        aria-label="Filter by section"
      >
        <button
          type="button"
          className="cc-search-pills__pill"
          x-bind:class="{ 'cc-search-pills__pill--active': !selected }"
          x-bind:aria-pressed="!selected"
          x-on:click="setFilter('')"
        >
          <span>All</span>
          <span className="cc-search-pills__count" x-text="totalCount()"></span>
        </button>
        <template x-for="[value, count] in entries()" x-bind:key="value">
          <button
            type="button"
            className="cc-search-pills__pill"
            x-bind:class="{ 'cc-search-pills__pill--active': selected === value }"
            x-bind:aria-pressed="selected === value"
            x-on:click="setFilter(value)"
          >
            <span x-text="value"></span>
            <span className="cc-search-pills__count" x-text="count"></span>
          </button>
        </template>
      </div>
      <div className="t-searcher-results">
        <div className="cc-search-summary">
          <pagefind-summary></pagefind-summary>
          <span
            className="cc-search-summary__scope"
            x-data
            x-show="$store.search.hasQuery && $store.search.selectedFilter"
            x-cloak
          >
            {" in "}
            <strong x-text="$store.search.selectedFilter"></strong>
          </span>
        </div>
        <pagefind-results>
          <script type="text/pagefind-template" dangerouslySetInnerHTML={{ __html: SearchResultTemplate }} />
        </pagefind-results>
      </div>
    </div>
  );
}
