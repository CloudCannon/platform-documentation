import type { Comp } from "../../_types.d.ts";

/**
 * Modal search component.
 */
export default function Search({ comp }: { comp: Comp }) {
  return (
    <>
      <pagefind-modal>
        <pagefind-modal-header>
          <pagefind-input></pagefind-input>
        </pagefind-modal-header>
        <pagefind-modal-body>
          <comp.Layout.SearchResults />
        </pagefind-modal-body>
        <pagefind-modal-footer>
          <pagefind-keyboard-hints></pagefind-keyboard-hints>
        </pagefind-modal-footer>
      </pagefind-modal>
      <noscript>
        <div className="t-noscript-search">
          <p>
            Search requires JavaScript. Browse the{" "}
            <a href="/documentation/">documentation home</a>{" "}
            or use your browser's find function (Ctrl/Cmd+F).
          </p>
        </div>
      </noscript>
    </>
  );
}
