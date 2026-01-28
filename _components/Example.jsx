export default function ({open_label = "Show example", close_label = "Hide example", children}) {
    return (
        <details className="c-example">
            <summary data-pagefind-ignore>
                <span className="__open">{open_label}</span>
                <span className="__close">{close_label}</span>
            </summary>
            {children}
        </details>
    );
}
