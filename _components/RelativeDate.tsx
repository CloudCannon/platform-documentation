interface RelativeDateProps {
  date: Date | string;
  className?: string;
}

/**
 * Renders a <time> element with a formatted date.
 * The `data-relative-date` attribute enables client-side progressive enhancement
 * to show relative dates like "3 days ago" for recent entries.
 */
export default function RelativeDate({ date, className }: RelativeDateProps) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <time dateTime={d.toISOString()} data-relative-date className={className}>
      {formatted}
    </time>
  );
}
