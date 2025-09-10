"use client";

import { useRouter } from "next/navigation";
import AirportData from "@/data/airports.json";
import { Airport } from "@/types/flight";
import { buildFlightSearchURL } from "@/utils/mockBookingGenerator";

const airports: Airport[] = AirportData.sort((a, b) =>
  a.city.localeCompare(b.city)
);

const Book = () => {
  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const url = buildFlightSearchURL({
      from: (form.querySelector("#from") as HTMLSelectElement)?.value,
      to: (form.querySelector("#to") as HTMLSelectElement)?.value,
      passengers:
        (form.querySelector("#passengers") as HTMLSelectElement)?.value || "1",
      depart: (form.querySelector("#depart") as HTMLInputElement)?.value,
      ret: (form.querySelector("#return") as HTMLInputElement)?.value,
    });
    if (url) router.push(url);
  };

  return (
    <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold  tracking-tight">
          Book a trip
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Choose your route, dates and passengers to see available flights.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-6xl rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm px-5 sm:px-6 py-4 md:py-5"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-full bg-gray-100 p-1 text-sm font-medium select-none"
            aria-label="Trip type (static)"
          >
            {["Round trip", "One way", "Multi-city"].map((t) => {
              const active = t === "Round trip";
              return (
                <span
                  key={t}
                  aria-disabled="true"
                  className={`relative rounded-full px-4 py-1.5 ${
                    active ? "bg-blue-600 text-white shadow" : "text-gray-600"
                  }`}
                >
                  {t}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="passengers" className="sr-only">
              Passengers
            </label>
            <select
              id="passengers"
              className="min-w-[140px] rounded-md border-0 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500"
              defaultValue="1"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{`${n} ${
                  n === 1 ? "Passenger" : "Passengers"
                }`}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          <div className="group relative">
            <label
              htmlFor="from"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              From
            </label>
            <select
              id="from"
              defaultValue=""
              className="w-full appearance-none rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select departure
              </option>
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.city} ({airport.code})
                </option>
              ))}
            </select>
          </div>
          {/* To */}
          <div className="group relative">
            <label
              htmlFor="to"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              To
            </label>
            <select
              id="to"
              defaultValue=""
              className="w-full appearance-none rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select destination
              </option>
              {airports.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.city} ({airport.code})
                </option>
              ))}
            </select>
          </div>
          <div className="group relative">
            <label
              htmlFor="depart"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              Depart date
            </label>
            <input
              id="depart"
              type="date"
              className="w-full rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="group relative">
            <label
              htmlFor="return"
              className="block text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1"
            >
              Return date
            </label>
            <input
              id="return"
              type="date"
              className="w-full rounded-lg border-0 ring-1 ring-inset ring-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-4 flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Find flights
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Book;
