export default function LeftRightBlock() {
    return (
        <div className="c-left-right-block">
            <div className="c-left-right-block__left" x-data="{block: block.left}">
                <template x-if="block.block_type == 'text'">
                    <div>
                        <h2 x-text="block.heading"></h2>
                        <p x-html="block.description"></p>
                        <div>
                            <template x-for="button in block.buttons">
                                <a alpine:href="button.button_link" className="cc-helper__button c-button" x-text="button.button_text"></a>
                            </template>
                        </div>
                    </div>
                </template>
                <template x-if="block.block_type == 'image'">
                    <img alpine:src="block.image" />
                </template>
            </div>
            <div className="c-left-right-block__right" x-data="{block: block.right}">
                <template x-if="block.block_type == 'text'">
                    <div>
                        <h2 x-text="block.heading"></h2>
                        <p x-html="block.description"></p>
                        <div>
                            <template x-for="button in block.buttons">
                                <a alpine:href="button.button_link" className="cc-helper__button c-button" x-text="button.button_text"></a>
                            </template>
                        </div>
                    </div>
                </template>
                <template x-if="block.block_type == 'image'">
                    <img alpine:src="block.image" />
                </template>
            </div>
        </div>
    );
}
