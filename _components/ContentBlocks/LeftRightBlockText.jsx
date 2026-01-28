export default function LeftRightBlockText() {
    return (
        <div>
            <h2 x-text="block.heading"></h2>
            <p x-html="block.description"></p>
            <div>
                <template x-for="button in block.buttons">
                    <a alpine:href="button.button_link" className="cc-helper__button c-button" x-text="button.button_text"></a>
                </template>
            </div>
        </div>
    );
}
