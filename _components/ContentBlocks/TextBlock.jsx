/**
 * TextBlock - Reusable text block with heading, description, and buttons
 * 
 * Uses Alpine.js bindings for dynamic content from block variable.
 * Used by LeftRightBlock, LeftRightBlockText, and CentredBlock.
 */
import ButtonList from './ButtonList.jsx';

export default function TextBlock() {
    return (
        <div>
            <h2 x-text="block.heading"></h2>
            <p x-html="block.description"></p>
            <div>
                <ButtonList />
            </div>
        </div>
    );
}
