import Analytics from '../../_components/Layout/Analytics.jsx';
import Nav from '../../_components/Layout/Nav.jsx';
import Search from '../../_components/Layout/Search.jsx';
import Footer from '../../_components/Layout/Footer.jsx';
import Hubspot from '../../_components/Layout/Hubspot.jsx';

export default function BaseLayout(props, helpers) {
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
        ga_verify
    } = props;

    const pageTitle_ = title || details?.title || '';
    const pageDescription = description || details?.description || '';
    const pageTitle = omit_trailing_title ? pageTitle_ : `${pageTitle_} | CloudCannon Documentation`;
    const ogImage = image || "/documentation/static/CloudCannonDocumentationog.jpg";
    
    let canonicalUrl = `https://cloudcannon.com${url}`;
    if (explicit_canonical?.length > 0) {
        canonicalUrl = explicit_canonical.startsWith("http") 
            ? url 
            : `https://cloudcannon.com${explicit_canonical}`;
    }

    const showSearch = url !== "/documentation/";

    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.cloudcannon.com/css/2025-TT-Norms-Pro_400_500_800-swap.css" rel="stylesheet" type="text/css" async="" />
                <link href="/assets/css/site.css" rel="stylesheet" type="text/css" />
                <link href="/_pagefind/pagefind-modular-ui.css" rel="stylesheet" type="text/css" />
                <link rel="apple-touch-icon" sizes="180x180" href="/documentation/static/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/documentation/static/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/documentation/static/favicon-16x16.png" />
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

                <Analytics hubspot_id={hubspot_id} ga_id={ga_id} ga_verify={ga_verify} />

                <script dangerouslySetInnerHTML={{ __html: `
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
                `}} />

                <script src="/assets/js/site.js" type="text/javascript" defer="" />
            </head>

            <body 
                x-cloak=""
                x-init="mobiledocnav = $refs.mobiledocnav;init()"
                x-data={`{'isModalOpen': false, 
                    'isMainNavOpen': false, 
                    'isPageNavOpen': false, 
                    'showmobilenav': false,
                    darkMode: localStorage.getItem('cc_darkMode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
                    ...$layoutOffsets
                }`}
                alpine-keydown-escape="isModalOpen=false; $focusSearch(isModalOpen);"
                alpine-keydown-window-prevent-ctrl-k="isModalOpen=!isModalOpen; $focusSearch(isModalOpen);"
                alpine-keydown-window-prevent-cmd-k="isModalOpen=!isModalOpen; $focusSearch(isModalOpen);"
                alpine:class="darkMode == 'dark' ? 'dark' : ''"
                alpine-scroll-window="updateOffset()"
            >
                {headingnav?.banner_html && (
                    <>
                        <script dangerouslySetInnerHTML={{ __html: `
                            let announcementBannerOpen = sessionStorage.getItem("announcementBannerOpenDocs") ? JSON.parse(sessionStorage.getItem("announcementBannerOpenDocs")) : true;
                            var root = document.documentElement;
                            if(!announcementBannerOpen)
                                root.style.setProperty('--announcementBanner', 'none');
                            else
                                root.style.setProperty('--announcementBanner', 'flex');
                        `}} />
                        <div className="l-banner" x-ref="announcement" style={{ display: 'var(--announcementBanner)' }}>
                            <div className="l-banner__inner">
                                <div dangerouslySetInnerHTML={{ __html: headingnav.banner_html }} />
                                <button 
                                    aria-label="close announcement banner"
                                    alpine:click={`sessionStorage.setItem('announcementBannerOpenDocs', false);
                                        document.querySelector('.l-banner').style.display = 'none';`}
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
                    </>
                )}

                <div className="l-nav">
                    <Nav headingnav={headingnav} url={url} helpers={helpers} />
                </div>

                {showSearch && <Search helpers={helpers} />}

                {typeof content === 'string' 
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
            </body>
        </html>
    );
}
