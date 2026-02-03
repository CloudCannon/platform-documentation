/**
 * Shared content for 404 pages
 */
export default function NotFoundContent() {
  return (
    <div className="l-home-card">
      <h1 className="l-heading l-center-heading" data-skip-anchor="">
        Page not found
      </h1>
      <p style={{ "text-align": "center" }}>
        We couldn't find the page you were looking for. It either doesn't exist
        or has been moved.
      </p>

      <pagefind-searchbox
        placeholder="Search documentation..."
        class="t-404-search"
      ></pagefind-searchbox>
    </div>
  );
}
