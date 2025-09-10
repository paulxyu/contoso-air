"use client";
import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Booking from "@/components/Booking";
import { useBooking } from "@/components/BookingProvider";
import AirportData from "@/data/airports.json";
import { Airport, BookingRecord, BookingDetail } from "@/types/flight";
import { generateBookingRef } from "@/utils/mockBookingGenerator";
import { useAuth } from "@/components/AuthProvider";

const PurchasePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fromCode = searchParams.get("fromCode");
  const toCode = searchParams.get("toCode");
  const dpa = searchParams.get("dpa");

  const {
    outbound,
    inbound,
    passengers: contextPassengers,
    clearSelection,
    hydrated,
  } = useBooking();

  const outboundId = searchParams.get("outboundId");
  const { isAuthenticated, user } = useAuth();
  const currentPathWithQuery = useMemo(() => {
    if (typeof window === "undefined") return "/book/purchase";
    return window.location.pathname + window.location.search;
  }, []);

  const passengersParam =
    searchParams.get("passengers") || String(contextPassengers || 1);
  const passengers = contextPassengers || Number(passengersParam) || 1;

  const fromAirport = AirportData.find((a) => a.code === fromCode) as
    | Airport
    | undefined;
  const toAirport = AirportData.find((a) => a.code === toCode) as
    | Airport
    | undefined;

  if (!fromAirport || !toAirport || !dpa) {
    return (
      <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Purchase</h1>
          <p className="text-sm text-red-600">
            Missing required booking details.
          </p>
        </div>
      </section>
    );
  }

  if (!outbound && (outboundId || !hydrated)) {
    return (
      <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Purchase</h1>
          <p className="text-sm text-gray-500">Loading selection...</p>
        </div>
      </section>
    );
  }

  if (!outbound) {
    return (
      <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Purchase</h1>
          <p className="text-sm text-red-600">
            No flight selected.{" "}
            <button className="underline" onClick={() => router.push("/book")}>
              Return to search
            </button>
          </p>
        </div>
      </section>
    );
  }

  const total = (outbound.price + (inbound ? inbound.price : 0)) * passengers;

  async function handlePurchase() {
    if (purchasing) return;
    if (!isAuthenticated) return;
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengers,
          outboundId: outbound!.id,
          inboundId: inbound?.id || null,
          total,
          user: user ? { username: user.username } : null,
        }),
      });
      const data = await res.json();
      const bookingRef: string =
        searchParams.get("bookingRef") ||
        data.bookingRef ||
        generateBookingRef();
      try {
        // Clear any in-progress selection now that booking is finalized
        window.localStorage.removeItem("bookingSelection");
        // Persist the completed booking so the confirmation page (or future pages)
        // can load it directly without reconstructing from query params/context.
        const bookingRecord: BookingRecord = {
          ref: bookingRef,
          createdAt: Date.now(),
          passengers,
          outboundId: outbound!.id,
          inboundId: inbound?.id || null,
          total,
          user: user ? { username: user.username } : null,
        };
        // Unified persisted booking detail (superset of BookingRecord)
        const persisted: BookingDetail = {
          ...bookingRecord,
          // flatten flights & airports to avoid nested redundant objects
          outboundFlight: outbound!,
          inboundFlight: inbound || null,
          fromAirport: fromAirport!,
          toAirport: toAirport!,
        };
        // Append to bookings array in localStorage (legacy entries with old shape are still read and normalized)
        const existingRaw = window.localStorage.getItem("bookings");
        let arr: unknown[] = [];
        if (existingRaw) {
          try {
            arr = JSON.parse(existingRaw);
            if (!Array.isArray(arr)) arr = [];
          } catch {
            arr = [];
          }
        }
        arr.push(persisted);
        window.localStorage.setItem("bookings", JSON.stringify(arr));
      } catch {}
      router.push(`/book/confirmation`);
    } catch {
      setError("Failed to complete purchase. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <>
      <Booking
        passengerName="Paul" // placeholder; would come from user profile
        outbound={outbound}
        inbound={inbound || undefined}
        passengers={passengers}
        fromAirport={fromAirport}
        toAirport={toAirport}
        total={total}
        purchasing={purchasing}
        onPurchase={handlePurchase}
        onCancel={() => {
          clearSelection();
          router.back();
        }}
        disablePurchase={!isAuthenticated}
        disablePurchaseNote={
          !isAuthenticated ? (
            <span>
              <a
                href={`/login?redirect=${encodeURIComponent(
                  currentPathWithQuery
                )}`}
                className="underline text-blue-600 font-medium"
              >
                Sign in
              </a>{" "}
              to finish your booking.
            </span>
          ) : null
        }
      />
      {error ? (
        <p className="px-6 -mt-3 text-xs text-red-600 font-medium">{error}</p>
      ) : null}
    </>
  );
};

export default PurchasePage;
