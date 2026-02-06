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
        openTimeout: null,

        scheduleOpen: function () {
          this.cancelOpen();
          this.openTimeout = setTimeout(() => {
            this.tooltipopen = true;
          }, 100);
          $nextTick(() => this.update());
        },

        cancelOpen: function () {
          if (this.openTimeout) {
            clearTimeout(this.openTimeout);
            this.openTimeout = null;
          }
        },

        scheduleClose: function () {
          this.cancelOpen();
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
          const left = rect.left + window.scrollX;

          $refs.tooltip.style.top = 0;
          $refs.tooltip.style.left = 'unset';
    
          if(window.innerWidth >= 400){
            $refs.tooltip.style.top =
              rect.bottom + window.scrollY + 6 + 'px';
          }

          if((400 + left) < window.innerWidth){
            $refs.tooltip.style.left =
              left + 'px';
          } else {
             $refs.tooltip.style.right = '0px';
          }
        }
      }"
      x-on-mouseenter="scheduleOpen"
      x-on-mouseleave="scheduleClose"
      class="glossary-term-highlight"
    >
      {children}

      <template x-teleport="body">
        <div
          x-show="tooltipopen"
          x-transition
          x-ref="tooltip"
          class="term-definition"
          x-on-mouseenter="cancelClose"
          x-on-mouseleave="scheduleClose"
        >
          <div class="term-definition--close"
            x-on-click="scheduleClose">
            <img src={helpers.icon("close:outlined", "material")} inline="true" />
          </div>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </template>
    </span>
  );
}
