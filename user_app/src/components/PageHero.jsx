import Mascot from "./Mascot.jsx";

// Shared page header banner: title + subtitle on the left, mascot (or custom
// node) on the right. Pass `mascot={null}` to hide the illustration, or use
// `right` to render a custom element (e.g. an emergency card) instead.
export default function PageHero({ title, subtitle, mascot = "wave", mascotSize = 150, right, children }) {
  return (
    <section className="page-hero">
      <div className="page-hero-text">
        <h1 className="page-hero-title">{title}</h1>
        {subtitle && <p className="page-hero-sub">{subtitle}</p>}
        {children}
      </div>
      {right ? (
        <div className="page-hero-right">{right}</div>
      ) : mascot ? (
        <div className="page-hero-mascot">
          <Mascot variant={mascot} size={mascotSize} />
        </div>
      ) : null}
    </section>
  );
}
