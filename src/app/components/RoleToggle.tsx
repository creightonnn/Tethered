import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../lib/TripProvider'

export function RoleToggle() {
  const { role, switchRole } = useTrip()
  const navigate = useNavigate()

  if (!role) return null

  function go(next: 'traveler' | 'guide') {
    if (next !== role) {
      switchRole(next)
      navigate('/app')
    }
  }

  return (
    <div className="role-toggle" role="tablist" aria-label="Demo view">
      <button
        type="button"
        role="tab"
        aria-selected={role === 'traveler'}
        className="role-toggle__btn"
        data-active={role === 'traveler'}
        onClick={() => go('traveler')}
      >
        Traveler view
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={role === 'guide'}
        className="role-toggle__btn"
        data-active={role === 'guide'}
        onClick={() => go('guide')}
      >
        Guide view
      </button>
    </div>
  )
}
