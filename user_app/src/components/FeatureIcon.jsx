// Premium duotone SVG icons (Flaticon-style line + soft fill).
// Crisp at any size, fully animatable, no external assets or licensing.
// `color` drives the stroke + tint; each icon uses currentColor.

const ICONS = {
  shield: (
    <>
      <path
        d="M12 3.2 18.5 6v5.2c0 4.4-2.9 7.4-6.5 8.6-3.6-1.2-6.5-4.2-6.5-8.6V6L12 3.2Z"
        className="fi-fill"
      />
      <path
        d="M12 3.2 18.5 6v5.2c0 4.4-2.9 7.4-6.5 8.6-3.6-1.2-6.5-4.2-6.5-8.6V6L12 3.2Z"
        className="fi-stroke"
      />
      <path d="m9 11.8 2.1 2.1L15 10" className="fi-stroke fi-accent2" />
    </>
  ),
  chat: (
    <>
      <path
        d="M5 5h14a1.8 1.8 0 0 1 1.8 1.8v7A1.8 1.8 0 0 1 19 15.6H9.6L5.5 18.8v-3.2H5A1.8 1.8 0 0 1 3.2 13.8v-7A1.8 1.8 0 0 1 5 5Z"
        className="fi-fill"
      />
      <path
        d="M5 5h14a1.8 1.8 0 0 1 1.8 1.8v7A1.8 1.8 0 0 1 19 15.6H9.6L5.5 18.8v-3.2H5A1.8 1.8 0 0 1 3.2 13.8v-7A1.8 1.8 0 0 1 5 5Z"
        className="fi-stroke"
      />
      <circle cx="8.5" cy="10.3" r="1" className="fi-dot" />
      <circle cx="12" cy="10.3" r="1" className="fi-dot" />
      <circle cx="15.5" cy="10.3" r="1" className="fi-dot" />
    </>
  ),
  book: (
    <>
      <path
        d="M12 6.4C10.4 5.1 8.4 4.4 6 4.4c-1.1 0-1.6.5-1.6 1.6v10.4c0 .8.6 1.2 1.4 1.1 2.2-.2 4.3.5 6.2 1.9 1.9-1.4 4-2.1 6.2-1.9.8.1 1.4-.3 1.4-1.1V6c0-1.1-.5-1.6-1.6-1.6-2.4 0-4.4.7-6 2Z"
        className="fi-fill"
      />
      <path
        d="M12 6.4C10.4 5.1 8.4 4.4 6 4.4c-1.1 0-1.6.5-1.6 1.6v10.4c0 .8.6 1.2 1.4 1.1 2.2-.2 4.3.5 6.2 1.9 1.9-1.4 4-2.1 6.2-1.9.8.1 1.4-.3 1.4-1.1V6c0-1.1-.5-1.6-1.6-1.6-2.4 0-4.4.7-6 2Z"
        className="fi-stroke"
      />
      <path d="M12 6.4v12.5" className="fi-stroke" />
    </>
  ),
  lotus: (
    <>
      <path
        d="M12 20c-4.4 0-8-2.7-8-6 1.7-.4 3.2-.2 4.5.4C7.5 11 8.8 8.4 12 6c3.2 2.4 4.5 5 3.5 8.4 1.3-.6 2.8-.8 4.5-.4 0 3.3-3.6 6-8 6Z"
        className="fi-fill"
      />
      <path
        d="M12 20c-4.4 0-8-2.7-8-6 1.7-.4 3.2-.2 4.5.4C7.5 11 8.8 8.4 12 6c3.2 2.4 4.5 5 3.5 8.4 1.3-.6 2.8-.8 4.5-.4 0 3.3-3.6 6-8 6Z"
        className="fi-stroke"
      />
      <path d="M12 20c-2.2-1.2-3.3-3.2-3.3-6M12 20c2.2-1.2 3.3-3.2 3.3-6" className="fi-stroke" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" className="fi-stroke" />
      <rect x="7" y="12.5" width="2.6" height="5" rx="0.8" className="fi-bar" />
      <rect x="11.6" y="9" width="2.6" height="8.5" rx="0.8" className="fi-bar" />
      <rect x="16.2" y="6" width="2.6" height="11.5" rx="0.8" className="fi-bar" />
    </>
  ),
  folder: (
    <>
      <path
        d="M4 6.5A1.8 1.8 0 0 1 5.8 4.7h3.1c.5 0 1 .2 1.3.6l1.1 1.2h7A1.8 1.8 0 0 1 21 8.3v8.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 16.7V6.5Z"
        className="fi-fill"
      />
      <path
        d="M4 6.5A1.8 1.8 0 0 1 5.8 4.7h3.1c.5 0 1 .2 1.3.6l1.1 1.2h7A1.8 1.8 0 0 1 21 8.3v8.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 16.7V6.5Z"
        className="fi-stroke"
      />
      <path d="m12 9.6 1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2L8.8 12l2.2-.3 1-2.1Z" className="fi-stroke fi-accent2" />
    </>
  ),
  trend: (
    <>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" className="fi-stroke" />
      <path d="m7 15 3.2-3.6 2.6 2.2L18 8" className="fi-stroke fi-accent2" />
      <path d="M18 8h-3M18 8v3" className="fi-stroke fi-accent2" />
    </>
  ),
};

export default function FeatureIcon({ name, size = 30, color = "currentColor", className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={`feature-svg ${className}`}
      style={{ color }}
      aria-hidden="true"
    >
      {ICONS[name] || ICONS.shield}
    </svg>
  );
}
