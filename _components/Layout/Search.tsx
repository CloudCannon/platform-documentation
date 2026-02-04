/**
 * Modal search component.
 */
export default function Search() {
  return (
    <>
      <pagefind-modal>
        <pagefind-modal-header>
          <pagefind-input></pagefind-input>
        </pagefind-modal-header>
        <pagefind-modal-body>
          <div className="t-searcher-layout">
            <pagefind-filter-pane filter="site"></pagefind-filter-pane>
            <div className="t-searcher-results">
              <pagefind-summary></pagefind-summary>
              <pagefind-results></pagefind-results>
            </div>
          </div>
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
