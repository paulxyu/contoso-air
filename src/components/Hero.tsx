"use client";

import { useRouter } from "next/navigation";
import ChatButton from "@/components/ChatButton";
import AirportData from "@/data/airports.json";
import { Airport } from "@/types/flight";
import { buildFlightSearchURL } from "@/utils/mockBookingGenerator";

const airports: Airport[] = AirportData.sort((a, b) =>
  a.city.localeCompare(b.city)
);

const fieldBase =
  "h-14 w-full px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

const Hero = () => {
  const router = useRouter();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const url = buildFlightSearchURL({
      from: (form.querySelector("#from") as HTMLSelectElement)?.value,
      to: (form.querySelector("#to") as HTMLSelectElement)?.value,
      depart: (form.querySelector("#depart") as HTMLInputElement)?.value,
      ret: (form.querySelector("#return") as HTMLInputElement)?.value,
      passengers:
        (form.querySelector("#passengers") as HTMLSelectElement)?.value || "1",
    });
    if (url) router.push(url);
  };
  return (
    <section
      className="relative py-20 mb-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/images/b-getaway.jpg)" }}
    >
      <div className="absolute inset-0 bg-blue-900/60" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
            Find your next adventure
          </h1>
          <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
            Compare flights, discover destinations, and book your perfect trip
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="mt-6 mx-auto w-full max-w-7xl flex flex-col items-start gap-4 lg:flex-row lg:flex-nowrap lg:gap-3"
        >
          <select
            id="from"
            aria-label="From"
            className={`${fieldBase} lg:flex-1`}
            defaultValue=""
          >
            <option value="" disabled>
              From
            </option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
          <select
            id="to"
            aria-label="To"
            className={`${fieldBase} lg:flex-1`}
            defaultValue=""
          >
            <option value="" disabled>
              To
            </option>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
          <input
            id="depart"
            type="date"
            aria-label="Departure date"
            className={`${fieldBase} lg:flex-1`}
          />
          <input
            id="return"
            type="date"
            aria-label="Return date"
            className={`${fieldBase} lg:flex-1`}
          />
          <select
            id="passengers"
            aria-label="Passengers"
            className={`${fieldBase} flex-none w-full xs:w-32 lg:w-24`}
            defaultValue="1"
          >
            <option value="" disabled>
              Passengers
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button
            type="submit"
            className="flex-none w-full lg:w-auto h-14 px-8 rounded-md bg-blue-500 text-white font-semibold transition hover:bg-yellow-600"
          >
            Search Flights
          </button>
        </form>
        <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-4xl">
          {[
            "Summer deals",
            "City breaks",
            "Beach trips",
            "Last-minute",
            "✨ Ask the AI travel assistant",
          ].map((label) => {
            const isAI = label.includes("AI");
            const baseClasses =
              `px-5 py-2.5 rounded-full text-sm sm:text-base font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ` +
              (isAI
                ? "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white hover:from-fuchsia-400 hover:via-pink-400 hover:to-rose-400 focus:ring-pink-400"
                : "bg-purple-600/90 text-white hover:bg-purple-500 focus:ring-purple-400");
            if (isAI) {
              return (
                <ChatButton
                  key={label}
                  className={baseClasses}
                  aria-label={label}
                >
                  {label}
                </ChatButton>
              );
            }
            return (
              <button
                key={label}
                type="button"
                className={baseClasses}
                aria-label={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div></div>
    </section>
  );
};

export default Hero;
