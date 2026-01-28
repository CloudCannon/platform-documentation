import GlossaryNav from '../../_components/Nav/GlossaryNav.jsx';

export default async function GlossaryListLayout(props, helpers) {
    const { url, all_letters } = props;
    const letters = all_letters?.() || [];

    // Pre-fetch all glossary entries by letter (async)
    const entriesByLetter = await Promise.all(
        letters.map(async (letter) => {
            const entries = await helpers.get_by_letter?.("", letter) || [];
            return { letter, entries };
        })
    );

    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <aside className="l-left" x-data="{ more: true }">
                    <GlossaryNav 
                        title="User Glossary"
                        allLetters={all_letters}
                        helpers={helpers}
                    />
                    <template x-teleport="#mobile-docnav">
                        <GlossaryNav 
                            title="User Glossary"
                            allLetters={all_letters}
                            helpers={helpers}
                        />
                    </template>
                </aside>
                <div className="u-card-box l-small-content">
                    <h1 className="l-heading u-margin-bottom-0 u-padding-bottom-0">
                        User Glossary
                    </h1>

                    <div className="l-content-split" x-data="$visibleNavHighlighter">
                        <main className="l-content-cards glossary-cards">
                            {entriesByLetter.flatMap(({ letter, entries }) => [
                                <h2 key={`heading-${letter}`} id={letter.toLowerCase()} className="l-heading u-margin-bottom-0 u-padding-bottom-0 glossary-letter-heading">
                                    {letter.toUpperCase()}
                                </h2>,
                                ...(entries && entries.length > 0 ? (
                                    entries.map((entry, i) => (
                                        <div key={`${letter}-${i}`} className="glossary-entry">
                                            <h3>{entry.glossary_term_name}</h3>
                                            <div dangerouslySetInnerHTML={{ __html: helpers.md(entry.term_description) }} />
                                        </div>
                                    ))
                                ) : [
                                    <div key={`${letter}-empty`} className="glossary-entry">
                                        <p>No glossary entries found for the letter "{letter.toUpperCase()}".</p>
                                    </div>
                                ])
                            ])}
                        </main>
                        
                        <aside data-pagefind-ignore="" className="l-right">
                            <div className="l-toc-glossary" alpine:scroll="onScroll()" />
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const layout = "layouts/base.jsx";
export const title = '';
export const description = '';
