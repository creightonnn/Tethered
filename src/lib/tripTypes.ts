export interface Pin {
  lat: number
  lng: number
  note: string
}

export interface FlightLeg {
  from: string
  to: string
  flightNo: string
  time: string
}

export interface RosterMember {
  id: string
  name: string
  checkedIn: boolean
}

export interface Trip {
  code: string
  name: string
  guideNames: string[]

  departureLabel: string
  departureAt: string // ISO timestamp

  announcement: { text: string; postedAt: string } | null

  busPin: Pin | null

  meetingPoint: { label: string; time: string; lat: number; lng: number } | null

  hotel: {
    name: string
    addressEn: string
    addressLocal: string
    lat: number
    lng: number
  }

  airport: {
    terminal: string
    gate: string
    legs: FlightLeg[]
    instruction: string
  }

  roster: RosterMember[]
  rollCallActive: boolean
  rollCallStartedAt: string | null
}
