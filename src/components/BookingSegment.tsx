import { Flight } from "@/types/flight";
import { minutesToDuration } from "@/utils/mockFlightGenerator";

import { hashSeat } from "@/utils/mockBookingGenerator";

// Format boarding style with 12h clock: DDMMM h:mm AM (e.g., 07SEP 9:15 AM)
function formatBoardingDateTime(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  let hrs = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hrs >= 12 ? "PM" : "AM";
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  return `${day}${month} ${hrs}:${mins} ${ampm}`;
}

const BookingSegment = ({
  label,
  flight,
}: {
  label: string;
  flight: Flight;
}) => {
  return (
    <div className="relative rounded-xl border border-dashed border-gray-200 p-4 md:p-5 bg-white/60">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold tracking-wider text-gray-500">
          {label}
        </span>
        <span className="text-xs text-gray-500">
          Duration: {minutesToDuration(flight.durationMinutes)}
        </span>
      </div>
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-5 flex flex-col">
          <span className="text-4xl font-extrabold leading-none">
            {flight.from.code}
          </span>
          <span className="text-xs text-gray-600 mt-1">
            {flight.from.city}, {flight.from.state}
          </span>
          <span className="text-sm font-semibold mt-2">
            {formatBoardingDateTime(flight.depart)}
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <span className="text-gray-400" aria-hidden>
            →
          </span>
        </div>
        <div className="col-span-5 flex flex-col items-end text-right">
          <span className="text-4xl font-extrabold leading-none">
            {flight.to.code}
          </span>
          <span className="text-xs text-gray-600 mt-1">
            {flight.to.city}, {flight.to.state}
          </span>
          <span className="text-sm font-semibold mt-2">
            {formatBoardingDateTime(flight.arrive)}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="flex flex-col">
          <span className="font-semibold tracking-wide text-gray-500">
            Flight
          </span>
          <span className="mt-0.5 font-medium">{flight.flightNumber}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-wide text-gray-500">
            Seats
          </span>
          <span className="mt-0.5 font-medium">{hashSeat(flight.id)}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-wide text-gray-500">
            Stops
          </span>
          <span className="mt-0.5 font-medium">
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-wide text-gray-500">
            Price (pp)
          </span>
          <span className="mt-0.5 font-medium">${flight.price}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSegment;
