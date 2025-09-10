"use client";
import { Flight } from "@/types/flight";

interface FlightOptionProps {
  flight: Flight;
  selected: boolean;
  onSelect: (flight: Flight) => void;
  formatDuration: (minutes: number) => string;
}

const FlightOption = ({
  flight,
  selected,
  onSelect,
  formatDuration,
}: FlightOptionProps) => {
  return (
    <li key={flight.id}>
      <button
        type="button"
        onClick={() => onSelect(flight)}
        className={`w-full text-left rounded-xl border px-4 py-3 transition shadow-sm ${
          selected
            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-300"
            : "border-gray-200 hover:border-blue-400"
        }`}
      >
        <div className="grid grid-cols-3 items-start gap-4">
          <div className="flex flex-col">
            <span className="font-medium leading-tight">
              {flight.flightNumber}
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              {flight.stops && flight.stops > 0
                ? `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`
                : "Non-stop"}
            </span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="leading-tight">
              {new Date(flight.depart).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              →{" "}
              {new Date(flight.arrive).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              {formatDuration(flight.durationMinutes)}
            </span>
          </div>
          <div className="text-right text-sm font-semibold tabular-nums">
            ${flight.price}
          </div>
        </div>
      </button>
    </li>
  );
};

export default FlightOption;
