import RelativeDate from "../RelativeDate.tsx";

interface CardProps {
  href?: string;
  title?: string;
  description?: string;
  category?: string;
  icon?: string;
  image?: string;
  date?: Date | string;
  label?: string;
  showArrow?: boolean;
  arrowDirection?: "forward" | "back";
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  variant?: string;
  className?: string;
  children?: unknown;
  helpers?: {
    icon?: (name: string, set: string) => string;
  };
  [key: string]: unknown;
}

/**
 * Unified Card component for consistent card styling across the site.
 *
 * Handles both interactive (link) and non-interactive (static) cards,
 * with multiple variants for different use cases.
 */
export default function Card({
  href,
  title,
  description,
  category,
  icon,
  image,
  date,
  label,
  showArrow,
  arrowDirection = "forward",
  headingLevel = "h3",
  variant = "default",
  className = "",
  children,
  helpers,
  ...rest
}: CardProps) {
  const isInteractive = Boolean(href);
  const Element = isInteractive ? "a" : "div";
  const Heading = headingLevel;

  // Default showArrow to true for interactive cards, false for non-interactive
  const shouldShowArrow = showArrow !== undefined ? showArrow : isInteractive;

  // Build class names
  const cardClasses = [
    "c-card",
    variant !== "default" && `c-card--${variant}`,
    className,
  ].filter(Boolean).join(" ");

  // Get arrow icon URL
  const arrowIconName = arrowDirection === "back"
    ? "arrow_back"
    : "arrow_forward";
  const arrowIconUrl = helpers?.icon?.(`${arrowIconName}:outlined`, "material");

  // Common link props for interactive cards
  const allProps = isInteractive ? { href, ...rest } : { ...rest };

  return (
    <Element className={cardClasses} {...allProps}>
      {/* Optional label (e.g., "Previous", "Next") */}
      {label && <strong className="c-card__label">{label}</strong>}

      {/* Heading with optional icon */}
      {title && (
        <div className="c-card__heading">
          {icon && (
            <img
              src={icon}
              alt=""
              className="c-card__icon"
              aria-hidden="true"
            />
          )}
          <Heading className="c-card__title">{title}</Heading>
        </div>
      )}

      {/* Optional date (for changelog) */}
      {date && (
        <p className="c-card__date">
          <RelativeDate date={date} />
        </p>
      )}

      {/* Description text */}
      {description && <p className="c-card__description">{description}</p>}

      {/* Custom children content */}
      {children}

      {/* Footer with optional category badge and arrow */}
      {(category || shouldShowArrow) && (
        <div className="c-card__footer">
          {category && <span className="c-card__category">{category}</span>}
          {shouldShowArrow && arrowIconUrl && (
            <img
              src={arrowIconUrl}
              alt=""
              className="c-card__arrow"
              aria-hidden="true"
              inline="true"
            />
          )}
        </div>
      )}

      {/* Optional bottom image */}
      {image && (
        <div className="c-card__image-container">
          <div className="c-card__image-spacer" />
          <img
            src={image}
            alt=""
            className="c-card__image"
            loading="lazy"
          />
        </div>
      )}
    </Element>
  );
}
