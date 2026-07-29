export function StatTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: string
  tone?: 'neutral' | 'good' | 'warn'
}) {
  return (
    <div className="stat-tile" data-tone={tone}>
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
    </div>
  )
}
