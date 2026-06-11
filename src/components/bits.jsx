export function Icon({ d, extra = null }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />{extra}
    </svg>
  );
}

export const ICONS = {
  forecast: "M4 16c2-2.5 4-2.5 6 0s4 2.5 6 0 3-2 4-1M12 3v2M5.6 5.6l1.4 1.4M18.4 5.6 17 7M12 8a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4Z",
  spots: "M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10ZM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  tackle: "M12 3v8m0 0a4 4 0 1 0 4 4M12 11a4 4 0 0 1 4 4m0 0c0 1.5-1 3-2.5 3M9 5.5 12 3l3 2.5",
  guide: "M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h13M8 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4 .5",
  log: "M5 5h14M5 12h9M5 19h6M17.5 17.5c1.2-1.4 3-1.4 3.5-.9-.5.6-2.3 2-3.5.9Zm0 0c-1-.9-2.6-.9-3.5.3.9 1.1 2.5 1 3.5-.3Z",
};

// The animation class lives on an inner group: a CSS transform animation
// would override the positioning transform attribute if both sat on the
// same element, snapping the fish to the SVG origin.
export function Fish({ x, y, s = 1, flip = false, color = "var(--sand)", cls = "" }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <g className={cls}>
        <path d="M0 0 C5 -5 13 -5 18 0 C13 5 5 5 0 0 Z" fill={color} opacity=".92" />
        <path d="M18 0 L24 -4 L24 4 Z" fill={color} opacity=".92" />
        <circle cx="5" cy="-1.2" r="1" fill="var(--deep)" />
      </g>
    </g>
  );
}
