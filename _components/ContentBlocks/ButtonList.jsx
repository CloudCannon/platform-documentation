/**
 * ButtonList - Alpine.js template for rendering a list of buttons
 * 
 * Uses Alpine.js x-for to iterate over block.buttons array.
 * Each button has button_link and button_text properties.
 * 
 * @param {Object} props
 * @param {string} props.buttonVar - Alpine.js variable name for buttons (default: "block.buttons")
 */
export default function ButtonList({ buttonVar = "block.buttons" }) {
    return (
        <template x-for={`button in ${buttonVar}`}>
            <a 
                alpine:href="button.button_link" 
                className="cc-helper__button c-button" 
                x-text="button.button_text"
            />
        </template>
    );
}
