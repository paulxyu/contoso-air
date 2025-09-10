// Utility functions related to booking lifecycle

export function generateBookingRef(): string {
  // 6-character alphanumeric reference (letters only) e.g. ZXQKJD
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += letters[Math.floor(Math.random() * letters.length)];
  }
  return ref;
}

export function hashSeat(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const row = (h % 30) + 1; // 1-30
  const seat = String.fromCharCode(65 + (h % 6)); // A-F
  return `${row}${seat}`;
}

// Build the flights search URL based on form style inputs.
// Inputs:
//  - from: origin IATA code (required)
//  - to: destination IATA code (required)
//  - depart: date string YYYY-MM-DD (required)
//  - ret: optional return date string YYYY-MM-DD
//  - passengers: number (default 1)
// Returns path beginning with /book/flights?...
export function buildFlightSearchURL(opts: {
  from: string | undefined | null;
  to: string | undefined | null;
  depart: string | undefined | null;
  ret?: string | undefined | null;
  passengers?: string | number | null;
}): string | null {
  const { from, to, depart, ret, passengers } = opts;
  if (!from || !to || !depart) return null;
  const dpa = `${depart}T07:00:00.000Z`;
  const dpb = ret ? `${ret}T07:00:00.000Z` : '';
  const params = new URLSearchParams();
  params.set('fromCode', from);
  params.set('toCode', to);
  params.set('passengers', (passengers ?? '1').toString());
  params.set('dpa', dpa);
  if (dpb) params.set('dpb', dpb);
  return `/book/flights?${params.toString()}`;
}
