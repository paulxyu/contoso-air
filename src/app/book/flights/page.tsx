"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/components/BookingProvider";
import Flights from "@/components/Flights";
import AirportData from "@/data/airports.json";
import { Airport } from "@/types/flight";
import {
  minutesToDuration,
  generateMockFlights,
} from "@/utils/mockFlightGenerator";

const FlightPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    selectFlights,
    setPassengers,
    passengers: ctxPassengers,
  } = useBooking();

  const fromCode = searchParams.get("fromCode");
  const toCode = searchParams.get("toCode");
  const passengersParam = searchParams.get("passengers") || "1";
  const dpa = searchParams.get("dpa"); // outbound depart
  const dpb = searchParams.get("dpb"); // return depart (if round trip)
  const passengers = Number(passengersParam) || 1;

  if (ctxPassengers !== passengers) setPassengers(passengers);

  const { fromAirport, toAirport } = useMemo(() => {
    return {
      fromAirport: AirportData.find((a) => a.code === fromCode) as
        | Airport
        | undefined,
      toAirport: AirportData.find((a) => a.code === toCode) as
        | Airport
        | undefined,
    };
  }, [fromCode, toCode]);

  const { outbound, inbound } = useMemo(() => {
    if (!fromAirport || !toAirport || !dpa)
      return { outbound: [], inbound: [] };
    return generateMockFlights({
      from: fromAirport,
      to: toAirport,
      departISO: dpa,
      returnISO: dpb,
    });
  }, [fromAirport, toAirport, dpa, dpb]);

  if (!fromCode || !toCode || !dpa || !fromAirport || !toAirport) {
    return (
      <p className="p-6 text-sm text-red-600">
        Missing or invalid flight search parameters.
      </p>
    );
  }

  return (
    <Flights
      outbound={outbound}
      inbound={inbound}
      passengers={passengers}
      fromAirport={fromAirport}
      toAirport={toAirport}
      formatDuration={(mins) => minutesToDuration(mins)}
      onComplete={({ outbound: o, inbound: i }) => {
        selectFlights(o, i || null);
        const params = new URLSearchParams(searchParams.toString());
        params.set("outboundId", o.id);
        if (i) params.set("inboundId", i.id);
        else params.delete("inboundId");
        router.push(`/book/purchase?${params.toString()}`);
      }}
    />
  );
};

export default FlightPage;
