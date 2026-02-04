interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  helpers: {
    icon: (name: string, set: string) => string;
  };
}

/**
 * Breadcrumb - Shared breadcrumb navigation component
 *
 * Displays ancestor links leading up to the current page.
 * The current page itself is never included - it's displayed as the page title (h1).
 * Items are separated by arrow icons.
 */
export default function Breadcrumb({ items, helpers }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <div className="l-breadcrumb" data-pagefind-ignore>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && (
            <img
              src={helpers.icon("arrow_forward_ios:outlined", "material")}
              inline="true"
            />
          )}
          <a href={item.href}>{item.label}</a>
        </span>
      ))}
    </div>
  );
}
