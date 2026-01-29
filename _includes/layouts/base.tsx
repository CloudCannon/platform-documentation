import Analytics from '../../_components/Layout/Analytics.tsx';
import Nav from '../../_components/Layout/Nav.tsx';
import Search from '../../_components/Layout/Search.tsx';
import Footer from '../../_components/Layout/Footer.tsx';
import Hubspot from '../../_components/Layout/Hubspot.tsx';
import type { Helpers, Details, HeaderNavigation } from '../../_types.d.ts';

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
        ga_verify
    } = props;

    const pageTitle_ = title || details?.title || '';
    const pageDescription = description || details?.description || '';
    const pageTitle = omit_trailing_title ? pageTitle_ : `${pageTitle_} | CloudCannon Documentation`;
    const ogImage = image || "/documentation/static/CloudCannonDocumentationog.jpg";
    
    let canonicalUrl = `https://cloudcannon.com${url}`;
    if (explicit_canonical?.length && explicit_canonical.length > 0) {
        canonicalUrl = explicit_canonical.startsWith("http") 
            ? url 
            : `https://cloudcannon.com${explicit_canonical}`;
    }

    const showSearch = url !== "/documentation/";

    return (
        <html lang="en" className="no-transitions">
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

                <script src="/assets/js/site.js" type="text/javascript" defer />
            </head>

            <body 
                x-init="$themeManager.initTheme(); init()"
                x-data={`{
                    'isModalOpen': false, 
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
                alpine-keydown-escape="isModalOpen=false; $focusSearch(isModalOpen);"
                alpine-keydown-window-prevent-ctrl-k="isModalOpen=!isModalOpen; $focusSearch(isModalOpen);"
                alpine-keydown-window-prevent-cmd-k="isModalOpen=!isModalOpen; $focusSearch(isModalOpen);"
                x-effect="document.body.style.colorScheme = themePreference === 'system' ? '' : effectiveTheme"
                alpine-scroll-window="updateOffset()"
            >
                {/* Apply theme immediately to prevent flash - Alpine will take over state management */}
                <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                        var pref = localStorage.getItem('cc_darkMode') || 'system';
                        if (pref === 'dark') {
                            document.body.style.colorScheme = 'dark';
                        } else if (pref === 'light') {
                            document.body.style.colorScheme = 'light';
                        }
                        // 'system' leaves colorScheme unset, inheriting from :root's "light dark"
                    })();
                `}} />

                <a href="#main-content" className="skip-link">
                    Skip to content
                </a>

                {headingnav?.banner_html && (
                    <>
                        <div className="l-banner" x-ref="announcement" id="announcement-banner">
                            <div className="l-banner__inner">
                                <div dangerouslySetInnerHTML={{ __html: headingnav.banner_html }} />
                                <button 
                                    type="button"
                                    aria-label="close announcement banner"
                                    onclick="sessionStorage.setItem('announcementBannerOpenDocs', 'false'); document.getElementById('announcement-banner').hidden = true;"
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
                        <script dangerouslySetInnerHTML={{ __html: `
                            if (sessionStorage.getItem("announcementBannerOpenDocs") === "false") {
                                document.getElementById("announcement-banner").hidden = true;
                            }
                        `}} />
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

                <script dangerouslySetInnerHTML={{ __html: `
                    function enableTransitions() {
                        requestAnimationFrame(function() {
                            document.documentElement.classList.remove('no-transitions');
                        });
                    }
                    if (document.readyState === 'complete') {
                        enableTransitions();
                    } else {
                        window.addEventListener('load', enableTransitions);
                    }
                `}} />
            </body>
        </html>
    );
}
