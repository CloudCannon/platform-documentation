export default function ({comp}, helpers) {
    const selector = comp.SSGSelector();
    return (
        <div className="c-docs-ssg-callout" x-data="{
            initial_selected_name: null,
            selected_name: null,
            show_message: true
        }" x-init="
            $store.conditionals.register('ssg-name');
            selected_name = $store.conditionals.selected('ssg-name') || selected_name;
            initial_selected_name = selected_name;
        "  alpine:ssgchange="
            selected_name = $store.conditionals.selected('ssg-name') || selected_name;
        "
        x-show="!initial_selected_name">

            <div className="c-notice c-notice--info c-ssg-callout">
                <div className="c-notice__content" x-show="!selected_name">
                    <p>
                        <b>Working with a specific static site generator?</b><br/>
                        Customize CloudCannon's documentation to suit your SSG.
                    </p>
                    <div dangerouslySetInnerHTML={{__html: selector}}></div>
                </div>
                <div className="c-notice__content" x-show="selected_name">
                    <p>
                        <b>Great! We'll show you documentation relevant to <span x-text="selected_name"></span>.</b><br/>
                        You can change this any time using the dropdown in the navigation bar.
                    </p>
                </div>
            </div>
        </div>
    );
}


