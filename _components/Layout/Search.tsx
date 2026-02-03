export default function Search() {
  return (
    <>
      <pagefind-modal></pagefind-modal>
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
