
export default function ({comp, term, children}, helpers) {
  const content = helpers.get_glossary_term(term);
  console.log(content)

  return (
    <span
      x-data="{ tooltipopen: false,
        update() {
          const rect = this.$el.getBoundingClientRect();
          this.$refs.tooltip.style.top =
            rect.bottom + window.scrollY + 6 + 'px';
          this.$refs.tooltip.style.left =
            rect.left + window.scrollX + 'px';
        } 
      }"
      x-on:mouseover="console.log('HERE!');tooltipopen = true; $nextTick(() => update())"
      x-on:mouseout="tooltipopen = false"
      class="glossary-term-highlight"
    >
      {children}

      <template x-teleport="body">
        <div
          x-show="tooltipopen"
          x-transition
          class="term-definition"
          x-ref="tooltip"
        >
          {/* this can contain <p>, <ul>, whatever */}
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </template>
    </span>
  );
  //const content_md = helpers.get_md(content);
  //const glossary = site.pages.filter((p) => p.data.collection === "glossary");
}
