import { Airport, Flight } from '@/types/flight';

export function minutesToDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m ? `${m}m` : ''}`.trim();
}

export function generateMockFlights(args: {
  from: Airport;
  to: Airport;
  departISO: string;
  returnISO?: string | null;
}): { outbound: Flight[]; inbound: Flight[] } {
  const { from, to, departISO, returnISO } = args;
  const baseDepart = new Date(departISO).getTime();

  const outbound: Flight[] = [
    { id: `CA123-${departISO}`, flightNumber: 'CA123', from, to, depart: departISO, arrive: new Date(baseDepart + 210 * 60000).toISOString(), durationMinutes: 210, price: 199, stops: 0, direction: 'outbound' },
    { id: `CA456-${departISO}`, flightNumber: 'CA456', from, to, depart: departISO, arrive: new Date(baseDepart + 300 * 60000).toISOString(), durationMinutes: 300, price: 149, stops: 1, direction: 'outbound' },
    { id: `CA202-${departISO}`, flightNumber: 'CA202', from, to, depart: departISO, arrive: new Date(baseDepart + 120 * 60000).toISOString(), durationMinutes: 120, price: 249, stops: 0, direction: 'outbound' },
  ];

  const inbound: Flight[] = !returnISO ? [] : (() => {
    const baseReturn = new Date(returnISO).getTime();
    return [
      { id: `CA789-${returnISO}`, flightNumber: 'CA789', from: to, to: from, depart: returnISO, arrive: new Date(baseReturn + 240 * 60000).toISOString(), durationMinutes: 240, price: 179, stops: 0, direction: 'return' },
      { id: `CA101-${returnISO}`, flightNumber: 'CA101', from: to, to: from, depart: returnISO, arrive: new Date(baseReturn + 360 * 60000).toISOString(), durationMinutes: 360, price: 129, stops: 1, direction: 'return' },
    ];
  })();

  return { outbound, inbound };
}
