import { useNavigate } from 'react-router-dom'

export function TopBar({
  title,
  onBack,
}: {
  title: string
  onBack?: () => void
}) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      <button
        type="button"
        className="topbar__back"
        aria-label="Back"
        onClick={() => (onBack ? onBack() : navigate(-1))}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__spacer" />
    </div>
  )
}
