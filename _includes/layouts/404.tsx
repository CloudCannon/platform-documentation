export default function NotFoundLayout() {
  return (
    <div className="l-page">
      <div className="l-column">
        <div className="l-small-content" style={{ "padding-bottom": "40px" }}>
          <div
            className="l-content-split"
            style={{ "justify-content": "center" }}
          >
            <main id="main-content">
              <div className="l-home-card">
                <h1 className="l-heading l-center-heading" data-skip-anchor="">
                  Page not found
                </h1>
                <p style={{ "text-align": "center" }}>
                  We couldn't find the page you were looking for. It either
                  doesn't exist or has been moved.
                </p>

                <pagefind-modal-trigger placeholder="Search"></pagefind-modal-trigger>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
export const title = "Page not found";
