import GlossaryNav from '../../_components/Nav/GlossaryNav.tsx';
import NavSidebar from '../../_components/Layout/NavSidebar.tsx';
import Card from '../../_components/Card/Card.tsx';
import type { Helpers } from '../../_types.d.ts';

interface GlossaryEntry {
    glossary_term_name: string;
    term_description: string;
}

interface Props {
    all_letters?: () => string[];
}

export default async function GlossaryListLayout(props: Props, helpers: Helpers) {
    const { all_letters } = props;
    const letters = all_letters?.() || [];

    // Pre-fetch all glossary entries by letter (async)
    const entriesByLetter = await Promise.all(
        letters.map(async (letter) => {
            const entries = (await helpers.get_by_letter?.("", letter) || []) as GlossaryEntry[];
            return { letter, entries };
        })
    );

    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar>
                    <GlossaryNav 
                        title="User Glossary"
                        allLetters={all_letters}
                    />
                </NavSidebar>
                <div className="u-card-box l-small-content">
                    <h1 className="l-heading u-margin-bottom-0 u-padding-bottom-0">
                        User Glossary
                    </h1>

                    <div className="l-content-split" x-data="$visibleNavHighlighter">
                        <main id="main-content" className="c-card-container--glossary">
                            {entriesByLetter.flatMap(({ letter, entries }) => [
                                <h2 key={`heading-${letter}`} id={letter.toLowerCase()} className="l-heading u-margin-bottom-0 u-padding-bottom-0 glossary-letter-heading">
                                    {letter.toUpperCase()}
                                </h2>,
                                ...(entries && entries.length > 0 ? (
                                    entries.map((entry, i) => (
                                        <Card
                                            key={`${letter}-${i}`}
                                            title={entry.glossary_term_name}
                                            variant="glossary"
                                            helpers={helpers}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: helpers.md(entry.term_description) }} />
                                        </Card>
                                    ))
                                ) : [
                                    <Card
                                        key={`${letter}-empty`}
                                        variant="glossary"
                                        helpers={helpers}
                                    >
                                        <p>No glossary entries found for the letter "{letter.toUpperCase()}".</p>
                                    </Card>
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

export const layout = "layouts/base.tsx";
export const title = '';
export const description = '';
