interface CopyPageDropdownProps {
  title: string;
  url: string;
}

export default function CopyPageDropdown(
  { title, url }: CopyPageDropdownProps,
) {
  const normalizedUrl = url.replace(/\/+/g, "/").replace(/\/?$/, "/");
  const mdPath = `${normalizedUrl}index.md`;
  const pageUrl = `https://cloudcannon.com${normalizedUrl}`;

  return (
    <div
      className="c-copy-page"
      data-pagefind-ignore="all"
      x-data={`{
        open: false,
        copied: false,
        copiedTimer: null,

        async copyText(text) {
          await navigator.clipboard.writeText(text);
          this.open = false;
          this.showCopied();
        },

        async fetchMd() {
          const res = await fetch('${mdPath}');
          if (!res.ok) throw new Error('Failed to fetch');
          return await res.text();
        },

        async copyMarkdown() {
          try {
            const md = await this.fetchMd();
            await this.copyText(md);
          } catch { /* silently fail */ }
        },

        async copyUrl() {
          await this.copyText('${pageUrl}');
        },

        async copyForLlm() {
          try {
            const md = await this.fetchMd();
            const prompt = 'The following is CloudCannon documentation about ${title.replace(/'/g, "\\'")}:\\n\\n' + md;
            await this.copyText(prompt);
          } catch { /* silently fail */ }
        },

        showCopied() {
          this.copied = true;
          clearTimeout(this.copiedTimer);
          this.copiedTimer = setTimeout(() => { this.copied = false; }, 2000);
        }
      }`}
    >
      <button
        type="button"
        className="c-copy-page__trigger"
        alpine:class="{ 'c-copy-page__trigger--copied': copied }"
        x-on-click="if (!copied) open = !open"
        aria-label="Copy page content"
        title="Copy page content"
      >
        <svg
          x-show="!copied"
          width="15"
          height="17"
          viewBox="0 0 15 17"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12.75 15H4.5V4.5H12.75V15ZM12.75 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H12.75C13.1478 16.5 13.5294 16.342 13.8107 16.0607C14.092 15.7794 14.25 15.3978 14.25 15V4.5C14.25 4.10218 14.092 3.72064 13.8107 3.43934C13.5294 3.15804 13.1478 3 12.75 3ZM10.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V12H1.5V1.5H10.5V0Z" />
        </svg>
        <svg
          x-show="copied"
          x-cloak="true"
          width="15"
          height="17"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span x-show="!copied">Copy page</span>
        <span x-show="copied" x-cloak="true" role="status" aria-live="polite">Copied</span>
        <svg
          className="c-copy-page__chevron"
          alpine:class="{ 'c-copy-page__chevron--open': open, 'c-copy-page__chevron--hidden': copied }"
          width="10"
          height="6"
          viewBox="0 0 10 6"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div className="c-copy-page__menu" x-cloak="true" x-show="open" x-transition alpine-click-outside="open = false">
        <button type="button" className="c-copy-page__option" x-on-click="copyMarkdown()">
          <strong>Copy as Markdown</strong>
          <span>Page content as clean Markdown</span>
        </button>
        <button type="button" className="c-copy-page__option" x-on-click="copyUrl()">
          <strong>Copy page URL</strong>
          <span>{pageUrl}</span>
        </button>
        <button type="button" className="c-copy-page__option" x-on-click="copyForLlm()">
          <strong>Copy for LLM prompt</strong>
          <span>Markdown wrapped in context for LLMs</span>
        </button>
      </div>
    </div>
  );
}

export function toMarkdown(): string {
  return "";
}
