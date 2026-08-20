import type { Helpers } from "../_types.d.ts";

interface GlossaryTermProps {
  term: string;
  children: unknown;
}

export default function GlossaryTerm(
  { term, children }: GlossaryTermProps,
  helpers: Helpers,
) {
  const content =
    `<span class="eyebrow">Glossary term</span><h3>${helpers.get_glossary_term_name(term)}</h3>${
      helpers.get_glossary_term(term)
    }`;
  return (
    <span
      x-data="{
        aName: '--gloss-' + Math.random().toString(36).slice(2, 10),
        show: false,
        openT: null,
        closeT: null,
        open() {
          this.cancelClose();
          clearTimeout(this.openT);
          this.openT = setTimeout(() => { this.show = true; }, 100);
        },
        close() {
          this.cancelOpen();
          clearTimeout(this.closeT);
          this.closeT = setTimeout(() => { this.show = false; }, 100);
        },
        closeNow() {
          this.cancelOpen();
          this.cancelClose();
          this.show = false;
        },
        cancelOpen() { clearTimeout(this.openT); this.openT = null; },
        cancelClose() { clearTimeout(this.closeT); this.closeT = null; },
        onDocClick(e) {
          if (!this.show) return;
          if (this.$el.contains(e.target)) return;
          if (this.$refs.tooltip && this.$refs.tooltip.contains(e.target)) return;
          this.closeNow();
        },
      }"
      x-bind:style="'anchor-name: ' + aName"
      x-on:mouseenter="open"
      x-on:mouseleave="close"
      {...{
        "x-on:keydown.escape.window": "closeNow",
        "x-on:click.window": "onDocClick",
      }}
      class="glossary-term-highlight"
    >
      {children}

      {/* Teleport into <body>: a <div> as a direct child of an inline
          <span> would be auto-corrected out by the HTML parser (span is
          phrasing-only), severing it from Alpine's x-data scope and
          losing the aName binding. */}
      <template x-teleport="body">
        <div
          x-show="show"
          x-transition
          x-ref="tooltip"
          x-bind:style="'position-anchor: ' + aName"
          x-on:mouseenter="cancelClose"
          x-on:mouseleave="close"
          class="term-definition"
          role="tooltip"
        >
          <button
            type="button"
            class="term-definition__close"
            aria-label="Close"
            x-on:click="closeNow"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </template>
    </span>
  );
}

export function toMarkdown(
  _props: GlossaryTermProps,
  childrenMd: string,
): string {
  return `**${childrenMd.trim()}**`;
}
