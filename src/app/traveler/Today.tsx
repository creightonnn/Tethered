import { useTrip } from '../../lib/TripProvider'
import { TopBar } from '../components/TopBar'
import { DepartureCountdown } from '../components/Countdown'

export default function Today() {
  const { trip } = useTrip()

  return (
    <div className="screen screen--pad-top">
      <TopBar title="Today" />

      <div className="card">
        <DepartureCountdown
          label={trip.departureLabel}
          targetIso={trip.departureAt}
        />
      </div>

      <div className="card">
        <p className="eyebrow">Hotel</p>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
          {trip.hotel.name}
        </p>
        <div className="info-row">
          <span className="info-row__label">Address</span>
          <span className="info-row__value">{trip.hotel.addressEn}</span>
        </div>
        <div className="info-row">
          <span className="info-row__label">Show a taxi driver</span>
          <span className="info-row__value" lang="ja">
            {trip.hotel.addressLocal}
          </span>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Airport</p>
        {trip.airport.legs.map((leg) => (
          <div className="info-row" key={leg.flightNo}>
            <span className="info-row__label">
              {leg.from} → {leg.to}
            </span>
            <span className="info-row__value">
              {leg.flightNo} · {leg.time}
            </span>
          </div>
        ))}
        <div className="info-row">
          <span className="info-row__label">Gate</span>
          <span className="info-row__value">{trip.airport.gate}</span>
        </div>
        <div className="instruction-callout">{trip.airport.instruction}</div>
      </div>
    </div>
  )
}
