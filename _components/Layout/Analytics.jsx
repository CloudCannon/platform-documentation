export default function Analytics({ hubspot_id, ga_id, ga_verify }) {
    return (
        <>
            {hubspot_id && (
                <script 
                    type="text/javascript" 
                    id="hs-script-loader" 
                    async 
                    defer 
                    src={`//js-na1.hs-scripts.com/${hubspot_id}.js`}
                />
            )}
            
            {ga_id && (
                <>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`} />
                    <script dangerouslySetInnerHTML={{ __html: `
                        if (window.inEditorMode === undefined && window.location.host === "cloudcannon.com") {
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${ga_id}');
                        }
                    `}} />
                </>
            )}
            
            {ga_verify && (
                <meta name="google-site-verification" content={ga_verify} />
            )}
        </>
    );
}
