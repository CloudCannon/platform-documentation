interface FeaturedGuideCardProps {
  href: string;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaText?: string;
  image?: string;
}

export default function FeaturedGuideCard({
  href,
  eyebrow,
  title,
  description,
  ctaText,
  image,
}: FeaturedGuideCardProps) {
  return (
    <div className="c-card c-card--featured">
      <div className="c-card__featured-content">
        {eyebrow && <p className="c-card__featured-eyebrow">{eyebrow}</p>}
        <h2 className="c-card__title">{title}</h2>
        {description && <p className="c-card__description">{description}</p>}
        {ctaText && (
          <a href={href} className="c-card__featured-cta">
            {ctaText}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </a>
        )}
      </div>
      {image && (
        <div className="c-card__featured-image">
          <img src={image} alt="" loading="lazy" />
        </div>
      )}
    </div>
  );
}
