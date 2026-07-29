export function CompassArrow({
  bearing,
  heading,
  size = 120,
}: {
  bearing: number
  heading: number | null
  size?: number
}) {
  const rotation = bearing - (heading ?? 0)

  return (
    <div
      className="compass__arrow"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path
          d="M50 8 L74 62 L50 48 L26 62 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}
