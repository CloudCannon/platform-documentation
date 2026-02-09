interface NavWrapperProps {
  children: unknown;
  className?: string;
  popoverId?: string;
}

/**
 * NavWrapper - Wrapper component for navigation sections
 *
 * Provides the standard navigation container using the Popover API for
 * mobile menu toggling. On desktop, the nav is always visible via CSS.
 * Use this as the outer wrapper for all nav components.
 *
 * Includes scrollContainer Alpine data for scroll state tracking,
 * which enables ScrollGradient components to show/hide based on scroll position.
 */
export default function NavWrapper({
  children,
  className = "",
  popoverId = "docs-nav-popover",
}: NavWrapperProps) {
  const baseClass = "t-docs-nav";

  return (
    <nav
      id={popoverId}
      popover="auto"
      className={`${baseClass} ${className}`.trim()}
      x-ref="navParent"
      x-data="scrollContainer"
      data-pagefind-ignore
    >
      {children}
    </nav>
  );
}
