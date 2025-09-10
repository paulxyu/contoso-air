"use client";
import { useState } from "react";
import FlightOption from "@/components/FlightOption";
import { Flight, Airport } from "@/types/flight";

interface FlightsProps {
  outbound: Flight[];
  inbound?: Flight[];
  passengers: number;
  fromAirport: Airport;
  toAirport: Airport;
  formatDuration: (minutes: number) => string;
  onComplete?: (selection: { outbound: Flight; inbound?: Flight }) => void;
}

const Flights = ({
  outbound,
  inbound = [],
  passengers,
  fromAirport,
  toAirport,
  formatDuration,
  onComplete,
}: FlightsProps) => {
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedInbound, setSelectedInbound] = useState<Flight | null>(null);

  const totalPrice =
    (selectedOutbound ? selectedOutbound.price : 0) +
    (selectedInbound ? selectedInbound.price : 0);

  const perPassenger = totalPrice * passengers;

  const ready = selectedOutbound && (inbound.length === 0 || selectedInbound);

  return (
    <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Available Flights
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {fromAirport.city} ({fromAirport.code}) → {toAirport.city} (
          {toAirport.code}){inbound.length > 0 && " (Round trip)"}
        </p>
      </div>
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm px-5 sm:px-6 py-4 md:py-5 space-y-10">
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Select departing flight
          </h2>
          <ul className="space-y-3">
            {outbound.map((f) => (
              <FlightOption
                key={f.id}
                flight={f}
                selected={selectedOutbound?.id === f.id}
                onSelect={setSelectedOutbound}
                formatDuration={formatDuration}
              />
            ))}
          </ul>
        </div>
        {inbound.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              Select returning flight
            </h2>
            <ul className="space-y-3">
              {inbound.map((f) => (
                <FlightOption
                  key={f.id}
                  flight={f}
                  selected={selectedInbound?.id === f.id}
                  onSelect={setSelectedInbound}
                  formatDuration={formatDuration}
                />
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {ready ? (
              <>
                Total (x{passengers}):{" "}
                <span className="font-semibold text-gray-900">
                  ${perPassenger}
                </span>
              </>
            ) : (
              "Select flight(s) to continue"
            )}
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (ready && selectedOutbound) {
                onComplete?.({
                  outbound: selectedOutbound,
                  inbound: selectedInbound || undefined,
                });
              }
            }}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition ${
              ready
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
};

export default Flights;
