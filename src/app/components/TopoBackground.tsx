/** Ambient topographic-contour field for the guide instrument panel.
 * Purely decorative; drifts very slowly and is disabled under
 * prefers-reduced-motion via CSS. */
export function TopoBackground() {
  return (
    <svg
      className="gd-contours"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {[120, 190, 260, 330, 400, 470].map((r, i) => (
        <ellipse
          key={r}
          cx="400"
          cy="220"
          rx={r * 1.3}
          ry={r}
          fill="none"
          stroke="var(--green-400)"
          strokeWidth={i === 2 ? 2 : 1}
        />
      ))}
    </svg>
  )
}
