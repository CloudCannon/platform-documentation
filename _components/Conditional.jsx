export default function ({comp, ssgs = [], not_ssgs = [], children}) {
    return (
        <div
            className="c-conditional"
            x-cloak="true"
            x-data={`{ 
                ssgs: ${ JSON.stringify(ssgs) },
                not_ssgs: ${ JSON.stringify(not_ssgs) },
                icon: null,
                selected_name: null,
                show: false
            }`}
            x-init="
                icon = $store.conditionals.selected('ssg-icon');
                selected_name = $store.conditionals.selected('ssg-name');
                if (ssgs.length) {
                    show = ssgs.includes(selected_name);
                } else {
                    show = !not_ssgs.includes(selected_name);
                }"
            alpine:ssgchange="
                icon = $store.conditionals.selected('ssg-icon');
                selected_name = $store.conditionals.selected('ssg-name');
                if (ssgs.length) {
                    show = ssgs.includes(selected_name);
                } else {
                    show = !not_ssgs.includes(selected_name);
                }
            "
            x-show="show"
            >
            <p data-pagefind-ignore className="c-conditional__header" x-show="selected_name"><img x-show="icon" { ...{":src": "icon"} }/> <span className="ssg" x-text="selected_name"></span> specific doc</p>
            {children}
        </div>
    );
}
