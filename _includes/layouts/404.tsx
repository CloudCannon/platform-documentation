import NotFoundContent from "../../_components/Layout/NotFoundContent.tsx";

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
              <NotFoundContent />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
export const title = "Page not found";
