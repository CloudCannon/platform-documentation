/**
 * CSS class utility functions
 */

type ClassValue = string | boolean | null | undefined;

/**
 * Combines class names, filtering out falsy values
 * @param classes - Class names to combine
 * @returns Combined class string
 * 
 * @example
 * cx('base', isActive && 'is-active', isOpen && 'nav-open')
 * // Returns: "base is-active" if isActive is true and isOpen is false
 */
export function cx(...classes: ClassValue[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Builds a BEM modifier class
 * @param block - The BEM block name
 * @param modifier - The modifier name
 * @param condition - Whether to apply the modifier
 * @returns The full class string with optional modifier
 * 
 * @example
 * withModifier('c-code-block', 'annotated', hasAnnotations)
 * // Returns: "c-code-block c-code-block--annotated" if condition is true
 */
export function withModifier(block: string, modifier: string, condition: boolean): string {
    if (condition) {
        return `${block} ${block}--${modifier}`;
    }
    return block;
}
