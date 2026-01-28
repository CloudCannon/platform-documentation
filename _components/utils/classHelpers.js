/**
 * CSS class utility functions
 */

/**
 * Combines class names, filtering out falsy values
 * @param {...(string|boolean|null|undefined)} classes - Class names to combine
 * @returns {string} Combined class string
 * 
 * @example
 * cx('base', isActive && 'is-active', isOpen && 'nav-open')
 * // Returns: "base is-active" if isActive is true and isOpen is false
 */
export function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

/**
 * Builds a BEM modifier class
 * @param {string} block - The BEM block name
 * @param {string} modifier - The modifier name
 * @param {boolean} condition - Whether to apply the modifier
 * @returns {string} The full class string with optional modifier
 * 
 * @example
 * withModifier('c-code-block', 'annotated', hasAnnotations)
 * // Returns: "c-code-block c-code-block--annotated" if condition is true
 */
export function withModifier(block, modifier, condition) {
    if (condition) {
        return `${block} ${block}--${modifier}`;
    }
    return block;
}
