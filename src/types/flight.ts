export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  state: string;
}

export interface Flight {
  id: string; // stable unique id (could be flightNumber + depart timestamp)
  flightNumber: string;
  from: Airport;
  to: Airport;
  depart: string; // ISO datetime string
  arrive: string; // ISO datetime string
  durationMinutes: number;
  price: number; // per passenger USD
  stops: number;
  direction: 'outbound' | 'return';
}

export interface BookingRecord {
  ref: string;
  createdAt: number;
  passengers: number;
  outboundId: string;
  inboundId?: string | null;
  total: number;
  user?: { username?: string } | null;
}

// Extended booking shape used for local persistence and UI rendering.
// This flattens what previously was split across several ad-hoc types
// (PersistedBooking, StoredBookingLite, etc.) while keeping the lean
// BookingRecord shape for API payloads.
export interface BookingDetail extends BookingRecord {
  outboundFlight: Flight;
  inboundFlight?: Flight | null;
  fromAirport: Airport;
  toAirport: Airport;
}
