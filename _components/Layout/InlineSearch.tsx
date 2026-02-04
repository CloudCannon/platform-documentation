import { SearchResults, SearchResultTemplate } from "./Search.tsx";

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
      <SearchResults />
    </div>
  );
}
