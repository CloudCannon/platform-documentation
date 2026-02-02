interface NoticeProps {
  info_type: string;
  children: unknown;
}

export default function Notice({ info_type, children }: NoticeProps) {
  return (
    <div className={`c-notice c-notice--${info_type}`}>
      <div data-pagefind-ignore="all" className="c-notice__icon">
        <img
          src={`/assets/img/${info_type}.svg`}
          className="logo"
          inline="true"
        />
      </div>
      <div className="c-notice__content">
        {children}
      </div>
    </div>
  );
}
