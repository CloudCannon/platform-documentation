import TextBlock from './TextBlock.jsx';

export default function LeftRightBlock() {
    return (
        <div className="c-left-right-block">
            <div className="c-left-right-block__left" x-data="{block: block.left}">
                <template x-if="block.block_type == 'text'">
                    <TextBlock />
                </template>
                <template x-if="block.block_type == 'image'">
                    <img alpine:src="block.image" />
                </template>
            </div>
            <div className="c-left-right-block__right" x-data="{block: block.right}">
                <template x-if="block.block_type == 'text'">
                    <TextBlock />
                </template>
                <template x-if="block.block_type == 'image'">
                    <img alpine:src="block.image" />
                </template>
            </div>
        </div>
    );
}
