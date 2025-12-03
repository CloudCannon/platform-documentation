
export default function ({comp, term, children}, helpers) {
  const content = helpers.get_glossary_term(term);
  //const glossary = site.pages.filter((p) => p.data.collection === "glossary");
  return (<span class="glossary-term-highlight">{children}<span class="term-definition">{content}</span></span>);
}
