import type { Trip } from './tripTypes'

const TRAVELER_NAMES = [
  'Carol M.',
  'Gene M.',
  'Diane K.',
  'Roger K.',
  'Patty S.',
  'Walt S.',
  'Linda F.',
  'Harold F.',
  'Judy N.',
  'Barbara P.',
  'Ted P.',
  'Nancy O.',
  'Ray O.',
  'Susan T.',
  'Marilyn D.',
  'Doug D.',
  'Ellen W.',
  'Frank W.',
]

export function createSeedTrip(): Trip {
  const departureAt = new Date(Date.now() + 42 * 60_000).toISOString()

  return {
    code: 'HOKKAIDO',
    name: 'Hokkaido Explorer, Day 6, Sapporo',
    guideNames: ['Panda', 'Yuki'],

    departureLabel: 'Back on the bus',
    departureAt,

    announcement: {
      text: 'Meeting at the fountain by Bay 4 if you get turned around, same spot as this morning.',
      postedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    },

    busPin: {
      lat: 43.0686,
      lng: 141.3508,
      note: 'Silver coach, "Hokkaido Explorer" sign in the window, north curb, Bay 4, Sapporo Station bus terminal',
    },

    meetingPoint: null,

    hotel: {
      name: 'Sapporo Grand Hotel',
      addressEn: '4 Chome Kita 1 Jonishi, Chuo Ward, Sapporo, Hokkaido',
      addressLocal: '北海道札幌市中央区北1条西4丁目',
      lat: 43.0645,
      lng: 141.3489,
    },

    airport: {
      terminal: 'New Chitose (CTS) → Haneda (HND) → Honolulu (HNL)',
      gate: 'Gate 22, check in at Counter 4',
      legs: [
        { from: 'CTS', to: 'HND', flightNo: 'JL 512', time: '10:20 AM' },
        { from: 'HND', to: 'HNL', flightNo: 'JL 782', time: '4:50 PM' },
      ],
      instruction:
        'Meet by the JAL check-in counters. Take the elevator down to Departures, not the escalator. It splits the group.',
    },

    roster: TRAVELER_NAMES.map((name, i) => ({
      id: `traveler-${i}`,
      name,
      checkedIn: false,
    })),

    rollCallActive: false,
    rollCallStartedAt: null,
  }
}
