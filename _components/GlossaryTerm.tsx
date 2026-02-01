import type { Helpers } from "../_types.d.ts";

interface GlossaryTermProps {
  term: string;
  children: {
    __html: string;
  };
}

export default function GlossaryTerm(
  { term, children }: GlossaryTermProps,
  helpers: Helpers,
) {
  const content =
    `<span class="eyebrow">Glossary term</span><h3>${children.__html}</h3>${
      helpers.get_glossary_term(term)
    }`;
  return (
    <span
      x-data="{
        tooltipopen: false,
        closeTimeout: null,

        open: function () {
          this.cancelClose();
          this.tooltipopen = true;
          $nextTick(() => this.update())
        },

        scheduleClose: function () {
          this.cancelClose();
          this.closeTimeout = setTimeout(() => {
            this.tooltipopen = false;
          }, 100)
        },

        cancelClose: function () {
          if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
          }
        },

        update: function () {
          const rect = $el.getBoundingClientRect();
          $refs.tooltip.style.top =
            rect.bottom + window.scrollY + 6 + 'px';
          $refs.tooltip.style.left =
            rect.left + window.scrollX + 'px';
        }
      }"
      x-on:mouseenter="open"
      x-on:mouseleave="scheduleClose"
      class="glossary-term-highlight"
    >
      {children}

      <template x-teleport="body">
        <div
          x-show="tooltipopen"
          x-transition
          x-ref="tooltip"
          class="term-definition"
          x-on:mouseenter="cancelClose"
          x-on:mouseleave="scheduleClose"
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </template>
    </span>
  );
}
