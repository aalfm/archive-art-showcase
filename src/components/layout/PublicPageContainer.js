export default function PublicPageContainer({
  children,
  className = '',
  innerClassName = '',
}) {
  return (
    <section className={`public-page-section ${className}`.trim()}>
      <div className={`showcase-container ${innerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
