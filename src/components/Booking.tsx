"use client";
import { Flight, Airport } from "@/types/flight";
import type { ReactNode } from "react";
import BookingSegment from "@/components/BookingSegment";

interface BookingProps {
  passengerName: string;
  outbound: Flight;
  inbound?: Flight;
  passengers: number;
  fromAirport: Airport;
  toAirport: Airport;
  onPurchase?: () => void;
  onCancel?: () => void;
  total: number;
  purchasing?: boolean;
  disablePurchase?: boolean;
  disablePurchaseNote?: ReactNode | null;
}

export default function Booking(props: BookingProps) {
  const {
    passengerName,
    outbound,
    inbound,
    passengers,
    onPurchase,
    onCancel,
    total,
    purchasing = false,
    disablePurchase = false,
    disablePurchaseNote = null,
  } = props;
  const totalPerPassenger = total / passengers;
  return (
    <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={onCancel}
          className="text-xs font-medium text-blue-600 hover:underline mb-3"
          type="button"
        >
          ← Shop for another flight
        </button>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          Flight summary
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Please review your details before confirming your booking.
        </p>
      </div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-start rounded-3xl">
        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur ring-1 ring-gray-100 shadow-sm p-3 sm:p-5 space-y-5">
          <div className="rounded-xl border border-dashed border-gray-200 p-4 bg-white/60">
            <span className="text-xs font-semibold tracking-wide text-gray-500">
              Passenger:
            </span>{" "}
            <span className="font-semibold">{passengerName}</span>
          </div>
          <BookingSegment label="OUTBOUND" flight={outbound} />
          {inbound && <BookingSegment label="RETURN" flight={inbound} />}
          <div className="pt-4 border-t border-gray-200" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur ring-1 ring-gray-100 shadow-sm p-5 flex flex-col">
          <h2 className="text-base font-semibold mb-3">Total</h2>
          <div className="text-3xl font-extrabold tracking-tight mb-1">
            ${total}
          </div>
          <div className="text-xs text-gray-600 mb-4">
            for {passengers} traveler(s) • ${totalPerPassenger} each
          </div>
          <ul className="text-xs text-gray-600 space-y-1 mb-6">
            <li>Includes taxes and fees</li>
            <li>Free 24-hour cancellation</li>
          </ul>
          <div className="mt-auto flex gap-3">
            <button
              type="button"
              onClick={onPurchase}
              disabled={purchasing || disablePurchase}
              className="flex-1 rounded-lg bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {purchasing ? "Processing..." : "Purchase"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white text-sm font-medium px-4 py-2.5 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          {disablePurchase && disablePurchaseNote && (
            <p className="mt-4 text-[11px] text-gray-600 font-medium leading-relaxed">
              {disablePurchaseNote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
