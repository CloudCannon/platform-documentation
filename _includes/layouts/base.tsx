import Analytics from "../../_components/Layout/Analytics.tsx";
import Nav from "../../_components/Layout/Nav.tsx";
import Search from "../../_components/Layout/Search.tsx";
import Footer from "../../_components/Layout/Footer.tsx";
import Hubspot from "../../_components/Layout/Hubspot.tsx";
import type { Details, HeaderNavigation, Helpers } from "../../_types.d.ts";

interface FooterNav {
  [key: string]: unknown;
}

interface Props {
  content: unknown;
  title?: string;
  details?: Details;
  description?: string;
  url: string;
  image?: string;
  omit_trailing_title?: boolean;
  prevent_robots?: boolean;
  explicit_canonical?: string;
  headingnav?: HeaderNavigation;
  footernav?: FooterNav;
  hubspot_id?: string;
  ga_id?: string;
  ga_verify?: string;
}

export default function BaseLayout(props: Props, helpers: Helpers) {
  const {
    content,
    title,
    details,
    description,
    url,
    image,
    omit_trailing_title,
    prevent_robots,
    explicit_canonical,
    headingnav,
    footernav,
    hubspot_id,
    ga_id,
    ga_verify,
  } = props;

  const pageTitle_ = title || details?.title || "";
  const pageDescription = description || details?.description || "";
  const pageTitle = omit_trailing_title
    ? pageTitle_
    : `${pageTitle_} | CloudCannon Documentation`;
  const ogImage = image ||
    "/documentation/static/CloudCannonDocumentationog.jpg";

  let canonicalUrl = `https://cloudcannon.com${url}`;
  if (explicit_canonical?.length && explicit_canonical.length > 0) {
    canonicalUrl = explicit_canonical.startsWith("http")
      ? url
      : `https://cloudcannon.com${explicit_canonical}`;
  }

  return (
    <html lang="en" className="page-loading">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="/documentation/assets/css/site.css" rel="stylesheet" type="text/css" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/documentation/static/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/documentation/static/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/documentation/static/favicon-16x16.png"
        />
        <link rel="manifest" href="/documentation/static/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#034ad8" />
        <meta name="theme-color" content="#ffffff" />

        <title>{pageTitle}</title>

        {/* SEO tags */}
        <meta content="CloudCannon Documentation" property="og:site_name" />
        {prevent_robots && <meta name="robots" content="noindex, nofollow" />}

        {/* Page description for SEO */}
        <meta content={pageDescription} name="description" />
        <meta content={pageDescription} property="og:description" />
        <meta content={pageDescription} property="twitter:description" />

        {/* Meta tags for open graph and twitter */}
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="@CloudCannon" name="twitter:site" />
        <meta content={pageTitle_} name="og:title" />
        <meta content={pageTitle_} name="twitter:title" />
        <meta content="website" property="og:type" />
        <meta content={ogImage} name="og:image" />
        <meta content={ogImage} name="twitter:image" />
        <meta content={pageDescription} name="twitter:image:alt" />
        <meta content="@CloudCannon" name="twitter:creator" />

        <meta content={`https://cloudcannon.com${url}`} property="og:url" />
        <link href={canonicalUrl} rel="canonical" />

        <Analytics
          hubspot_id={hubspot_id}
          ga_id={ga_id}
          ga_verify={ga_verify}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
                    (() => {
                        try {
                            if (window.self === window.top) {
                                return;
                            }
                        } catch (e) {
                            console.warn(e);
                        }

                        document.documentElement.classList.add("iframed");
                        const base = document.createElement("base");
                        base.target = "_blank";
                        document.getElementsByTagName('head')[0].appendChild(base);
                    })();
                `,
          }}
        />

        <script
          src="/documentation/_pagefind/pagefind-component-ui.js"
          type="module"
          defer
        />
        <script src="/documentation/assets/js/site.js" type="text/javascript" defer />
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              if (document.querySelector('pre.mermaid')) {
                const [{ default: mermaid }, { default: svgPanZoom }] = await Promise.all([
                  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'),
                  import('https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.2/+esm'),
                ]);
                const SHARED_THEME_CSS = \`
                  g.node rect, g.node circle, g.node ellipse, g.node polygon, g.node path {
                    stroke-width: 2px;
                  }
                  .edgePath .path, .flowchart-link {
                    stroke-width: 2px;
                  }
                \`;
                const SHARED_CONFIG = {
                  startOnLoad: false,
                  themeCSS: SHARED_THEME_CSS,
                  securityLevel: 'strict',
                  // Layout engine reads fontSize when measuring text, so this
                  // resizes nodes too — not just the rendered glyphs.
                  flowchart: { padding: 20, nodeSpacing: 60, rankSpacing: 60 },
                };
                const SHARED_FONT_SIZE = '18px';
                const initMermaid = () => {
                  const isDark = document.documentElement.dataset.pfTheme === 'dark';
                  if (isDark) {
                    mermaid.initialize({
                      ...SHARED_CONFIG,
                      theme: 'dark',
                      themeVariables: { fontSize: SHARED_FONT_SIZE },
                    });
                  } else {
                    mermaid.initialize({
                      ...SHARED_CONFIG,
                      theme: 'default',
                      themeVariables: {
                        fontSize: SHARED_FONT_SIZE,
                        // node fills (covers all the variants the default theme uses)
                        primaryColor: '#E6EDFB',
                        secondaryColor: '#E6EDFB',
                        tertiaryColor: '#E6EDFB',
                        nodeBkg: '#E6EDFB',
                        mainBkg: '#E6EDFB',
                        clusterBkg: '#E6EDFB',
                        // borders + lines (all brand blue)
                        primaryBorderColor: '#034ad8',
                        secondaryBorderColor: '#034ad8',
                        tertiaryBorderColor: '#034ad8',
                        nodeBorder: '#034ad8',
                        clusterBorder: '#034ad8',
                        lineColor: '#034ad8',
                        defaultLinkColor: '#034ad8',
                        // keep all text plain black
                        primaryTextColor: '#000000',
                        secondaryTextColor: '#000000',
                        tertiaryTextColor: '#000000',
                      },
                    });
                  }
                };
                const PAN_STEP = 40;
                const ICON_URLS = ${JSON.stringify({
                  "pan-up": helpers.icon("keyboard_arrow_up:outlined", "material"),
                  "pan-down": helpers.icon("keyboard_arrow_down:outlined", "material"),
                  "pan-left": helpers.icon("keyboard_arrow_left:outlined", "material"),
                  "pan-right": helpers.icon("keyboard_arrow_right:outlined", "material"),
                  "zoom-in": helpers.icon("zoom_in:outlined", "material"),
                  "zoom-out": helpers.icon("zoom_out:outlined", "material"),
                  "reset": helpers.icon("crop_free:outlined", "material"),
                })};
                const ACTIONS = [
                  ['pan-up',    'Pan up'],
                  ['zoom-in',   'Zoom in'],
                  ['pan-left',  'Pan left'],
                  ['reset',     'Reset view'],
                  ['pan-right', 'Pan right'],
                  ['pan-down',  'Pan down'],
                  ['zoom-out',  'Zoom out'],
                ];
                const buildControls = (mountTarget, panZoomInst) => {
                  mountTarget.querySelector('.c-mermaid__controls')?.remove();
                  const panel = document.createElement('div');
                  panel.className = 'c-mermaid__controls';
                  panel.innerHTML = ACTIONS.map(([action, label]) =>
                    \`<button type="button" data-action="\${action}" aria-label="\${label}" style="--c-mermaid-icon: url('\${ICON_URLS[action]}')"></button>\`
                  ).join('');
                  panel.addEventListener('click', e => {
                    const btn = e.target.closest('button');
                    if (!btn) return;
                    const action = btn.dataset.action;
                    if (action === 'pan-up')         panZoomInst.panBy({ x: 0,         y: PAN_STEP });
                    else if (action === 'pan-down')  panZoomInst.panBy({ x: 0,         y: -PAN_STEP });
                    else if (action === 'pan-left')  panZoomInst.panBy({ x: PAN_STEP,  y: 0 });
                    else if (action === 'pan-right') panZoomInst.panBy({ x: -PAN_STEP, y: 0 });
                    else if (action === 'zoom-in')   panZoomInst.zoomIn();
                    else if (action === 'zoom-out')  panZoomInst.zoomOut();
                    else if (action === 'reset')     { panZoomInst.resetZoom(); panZoomInst.center(); panZoomInst.fit(); }
                  });
                  mountTarget.appendChild(panel);
                };
                let panZoomInstances = [];
                const attachPanZoom = () => {
                  panZoomInstances.forEach(inst => { try { inst.destroy(); } catch (_) {} });
                  panZoomInstances = [];
                  document.querySelectorAll('.c-mermaid').forEach(figure => {
                    const pre = figure.querySelector('pre.mermaid');
                    const svg = pre?.querySelector('svg');
                    if (!pre || !svg) return;
                    const vb = svg.viewBox?.baseVal;
                    const w = (vb && vb.width)  || parseFloat(svg.getAttribute('width'))  || 800;
                    const h = (vb && vb.height) || parseFloat(svg.getAttribute('height')) || 600;
                    pre.style.aspectRatio = w + ' / ' + h;
                    if (!svg.getAttribute('width'))  svg.setAttribute('width',  '100%');
                    if (!svg.getAttribute('height')) svg.setAttribute('height', '100%');
                    try {
                      const inst = svgPanZoom(svg, {
                        controlIconsEnabled: false,
                        fit: true,
                        center: true,
                        mouseWheelZoomEnabled: false,
                        minZoom: 0.5,
                        maxZoom: 10,
                      });
                      panZoomInstances.push(inst);
                      buildControls(pre, inst);
                    } catch (e) {
                      console.warn('svg-pan-zoom init failed:', e);
                    }
                  });
                };
                document.querySelectorAll('pre.mermaid').forEach(el => { el.dataset.mermaidSource = el.textContent; });
                initMermaid();
                try {
                  await mermaid.run();
                  attachPanZoom();
                } catch (e) {
                  document.querySelectorAll('.c-mermaid__loader-text').forEach(el => { el.textContent = 'Diagram failed to render.'; });
                  console.error('Mermaid render failed:', e);
                }
                // Theme toggle: render the new SVG off-DOM via mermaid.render,
                // then swap it in atomically. The old (wrong-theme) SVG stays
                // visible until the swap, so there's no blank frame.
                new MutationObserver(async () => {
                  initMermaid();
                  for (const pre of document.querySelectorAll('pre.mermaid')) {
                    const source = pre.dataset.mermaidSource;
                    if (!source) continue;
                    try {
                      const id = 'm-' + Math.random().toString(36).slice(2);
                      const { svg } = await mermaid.render(id, source);
                      pre.innerHTML = svg;
                      pre.setAttribute('data-processed', 'true');
                    } catch (e) {
                      console.error('Mermaid re-render failed:', e);
                    }
                  }
                  attachPanZoom();
                }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-pf-theme'] });
              }
            `,
          }}
        />
      </head>

      <body
        x-init="$themeManager.initTheme(); init()"
        x-data={`{
                    'isMainNavOpen': false, 
                    'isPageNavOpen': false, 
                    'showmobilenav': false,
                    themePreference: localStorage.getItem('cc_darkMode') || 'system',
                    effectiveTheme: (function() {
                        var pref = localStorage.getItem('cc_darkMode') || 'system';
                        if (pref === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        return pref;
                    })(),
                    ...$layoutOffsets,
                    ...$themeManager
                }`}
        x-effect="document.documentElement.style.colorScheme = themePreference === 'system' ? '' : effectiveTheme; document.documentElement.dataset.pfTheme = effectiveTheme"
        alpine-scroll-window="updateOffset()"
      >
        {/* Apply theme immediately to prevent flash - Alpine will take over state management */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
                    (function() {
                        var pref = localStorage.getItem('cc_darkMode') || 'system';
                        var theme = pref;
                        if (pref === 'system') {
                            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        }
                        document.documentElement.dataset.pfTheme = theme;
                        if (pref === 'dark') {
                            document.documentElement.style.colorScheme = 'dark';
                        } else if (pref === 'light') {
                            document.documentElement.style.colorScheme = 'light';
                        }
                        // 'system' leaves colorScheme unset, inheriting from :root's "light dark"
                    })();
                `,
          }}
        />

        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <pagefind-config bundle-path="/documentation/_pagefind/" base-url="/"></pagefind-config>

        {headingnav?.banner_html && (
          <>
            <div
              className="l-banner"
              x-ref="announcement"
              id="announcement-banner"
            >
              <div className="l-banner__inner">
                <div
                  dangerouslySetInnerHTML={{ __html: headingnav.banner_html }}
                />
                <button
                  type="button"
                  aria-label="close announcement banner"
                  onclick="sessionStorage.setItem('announcementBannerOpenDocs123', 'false'); document.getElementById('announcement-banner').hidden = true;"
                >
                  <div className="flex items-center">
                    <div className="inner-cross">
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                            if (sessionStorage.getItem("announcementBannerOpenDocs123") === "false") {
                                document.getElementById("announcement-banner").hidden = true;
                            }
                        `,
              }}
            />
          </>
        )}

        <div className="l-nav">
          <Nav headingnav={headingnav} url={url} helpers={helpers} />
        </div>

        <Search />

        {typeof content === "string"
          ? <div dangerouslySetInnerHTML={{ __html: content }} />
          : content}

        <div className="l-footer">
          <Footer footernav={footernav} helpers={helpers} />
        </div>

        <Hubspot />

        <div className="iframe-controls">
          <a href={url} target="_blank">
            Open in a new tab
            <img src="/assets/img/open_in_new.svg" inline="true" />
          </a>
        </div>

        <script src="https://status.cloudcannon.com/embed/script.js" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
                    function enableTransitions() {
                        requestAnimationFrame(function() {
                            document.documentElement.classList.remove('page-loading');
                        });
                    }
                    if (document.readyState === 'complete') {
                        enableTransitions();
                    } else {
                        window.addEventListener('load', enableTransitions);
                    }
                `,
          }}
        />
      </body>
    </html>
  );
}
