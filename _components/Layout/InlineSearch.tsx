interface InlineSearchProps {
  placeholder?: string;
  autofocus?: boolean;
  className?: string;
}

/**
 * Inline search component with filters and results.
 * Used on the home page and 404 page.
 */
export default function InlineSearch({
  placeholder = "Search documentation...",
  autofocus = false,
  className,
}: InlineSearchProps) {
  return (
    <div className={`t-inline-search ${className || ""}`}>
      <pagefind-input
        placeholder={placeholder}
        {...(autofocus ? { autofocus: true } : {})}
      ></pagefind-input>
      <div className="t-inline-search__results">
        <pagefind-filter-pane filter="site"></pagefind-filter-pane>
        <div className="t-inline-search__main">
          <pagefind-summary></pagefind-summary>
          <pagefind-results></pagefind-results>
        </div>
      </div>
    </div>
  );
}
