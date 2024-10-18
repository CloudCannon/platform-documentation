export default function ({comp, label, type_markdown, children}, helpers) {
    return (
        <div className="c-data-reference__item">
            <div className="c-data-reference__header">
                <code className="c-data-reference__key">{ label }</code>
                {type_markdown &&
                    <span dangerouslySetInnerHTML={
                        { __html: helpers.md(type_markdown).replace(/^<p>/, ' — ').replace(/<\/p>$/, '') }
                    } />
                }
            </div>
            <div className="c-data-reference__description">{children}</div>
        </div>
    );
}