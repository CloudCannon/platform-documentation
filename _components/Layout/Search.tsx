


export const SearchResultTemplate = `
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


export function SearchResults() {
  return (
    <div className="t-searcher-layout">
      <pagefind-filter-pane filter="site" label="Filters" expanded></pagefind-filter-pane>
      <div className="t-searcher-results">
        <pagefind-summary></pagefind-summary>
        <pagefind-results>
          <script type="text/pagefind-template" dangerouslySetInnerHTML={{ __html: SearchResultTemplate }} />
        </pagefind-results>
      </div>
    </div>
  );
}
/**
 * Modal search component.
 */
export default function Search() {
  return (
    <>
      <pagefind-modal>
        <pagefind-modal-header>
          <pagefind-input></pagefind-input>
        </pagefind-modal-header>
        <pagefind-modal-body>
          <SearchResults />
        </pagefind-modal-body>
        <pagefind-modal-footer>
          <pagefind-keyboard-hints></pagefind-keyboard-hints>
        </pagefind-modal-footer>
      </pagefind-modal>
      <noscript>
        <div className="t-noscript-search">
          <p>
            Search requires JavaScript. Browse the{" "}
            <a href="/documentation/">documentation home</a>{" "}
            or use your browser's find function (Ctrl/Cmd+F).
          </p>
        </div>
      </noscript>
    </>
  );
}
