"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import AirportData from "@/data/airports.json";
import { Flight, Airport } from "@/types/flight";
import { generateMockFlights } from "@/utils/mockFlightGenerator";

const STORAGE_KEY = "bookingSelection";
const STORAGE_VERSION = 1;

interface Selection {
  outbound: Flight | null;
  inbound: Flight | null;
  passengers: number;
}

interface BookingContextValue extends Selection {
  setPassengers: (n: number) => void;
  selectFlights: (outbound: Flight, inbound?: Flight | null) => void;
  clearSelection: () => void;
  hydrated: boolean;
  hydrationError?: string | null;
}

const BookingContext = createContext<BookingContextValue | undefined>(
  undefined
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [outbound, setOutbound] = useState<Flight | null>(null);
  const [inbound, setInbound] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  const selectFlights = useCallback((o: Flight, i?: Flight | null) => {
    setOutbound(o);
    setInbound(i || null);
  }, []);

  const clearSelection = useCallback(() => {
    setOutbound(null);
    setInbound(null);
  }, []);

  const attemptHydration = useCallback(() => {
    try {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const params = new URLSearchParams(search);
      const fromCode = params.get("fromCode");
      const toCode = params.get("toCode");
      const dpa = params.get("dpa");
      const dpb = params.get("dpb");
      const outboundId = params.get("outboundId");
      const inboundId = params.get("inboundId");
      const passengersParam = params.get("passengers");

      const lsRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      interface SavedSelection {
        version: number;
        passengers?: number;
        outboundId?: string | null;
        inboundId?: string | null;
        fromCode?: string | null;
        toCode?: string | null;
        dpa?: string | null;
        dpb?: string | null;
      }
      let ls: SavedSelection | null = null;
      if (lsRaw) {
        try {
          ls = JSON.parse(lsRaw);
        } catch {
          ls = null;
        }
      }

      // version check / invalidation
      if (ls && ls.version !== STORAGE_VERSION) {
        // mark as invalid so user knows they must reselect
        ls = null;
        setHydrationError(
          "Saved selection expired. Please reselect your flights."
        );
      }

      if (passengersParam) {
        const n = Number(passengersParam);
        if (n > 0) setPassengers(n);
      } else if (ls?.passengers) {
        setPassengers(Number(ls.passengers));
      }

      const airports: Airport[] = AirportData as Airport[];
      let success = false;
      if (fromCode && toCode && dpa) {
        const fromAirport = airports.find((a) => a.code === fromCode);
        const toAirport = airports.find((a) => a.code === toCode);
        if (fromAirport && toAirport) {
          const { outbound: outs, inbound: ins } = generateMockFlights({
            from: fromAirport,
            to: toAirport,
            departISO: dpa,
            returnISO: dpb,
          });
          const all = [...outs, ...ins];
          const oId = outboundId || ls?.outboundId;
          const iId = inboundId || ls?.inboundId;
          if (oId) {
            const oFlight = all.find((f) => f.id === oId) || null;
            const iFlight = iId ? all.find((f) => f.id === iId) || null : null;
            if (oFlight) {
              setOutbound(oFlight);
              success = true;
            }
            if (iFlight) setInbound(iFlight);
          }
        }
      } else if (ls?.fromCode && ls?.toCode && ls?.dpa) {
        const fromAirport = airports.find((a) => a.code === ls.fromCode);
        const toAirport = airports.find((a) => a.code === ls.toCode);
        if (fromAirport && toAirport) {
          const { outbound: outs, inbound: ins } = generateMockFlights({
            from: fromAirport,
            to: toAirport,
            departISO: ls.dpa,
            returnISO: ls.dpb,
          });
          const all = [...outs, ...ins];
          const oFlight = all.find((f) => f.id === ls.outboundId) || null;
          const iFlight = ls.inboundId
            ? all.find((f) => f.id === ls.inboundId) || null
            : null;
          if (oFlight) {
            setOutbound(oFlight);
            success = true;
          }
          if (iFlight) setInbound(iFlight);
        }
      }
      if (success) {
        setHydrationError(null);
      } else if (
        !hydrationError &&
        (outboundId ||
          inboundId ||
          (fromCode && toCode && dpa) ||
          (ls?.outboundId && ls?.fromCode))
      ) {
        setHydrationError(
          "We couldn't restore your previous flight selection. Please reselect your flights."
        );
      }
      return success;
    } catch {
      setHydrationError(
        "An unexpected error occurred restoring your selection."
      );
      return false;
    }
  }, [hydrationError]);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    attemptHydration();
    setHydrated(true);
  }, [attemptHydration]);

  // Persist selection to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      version: STORAGE_VERSION,
      passengers,
      outboundId: outbound?.id || null,
      inboundId: inbound?.id || null,
      fromCode: outbound?.from.code || null,
      toCode: outbound?.to.code || null,
      dpa: outbound?.depart || null,
      dpb: inbound?.depart || null,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [outbound, inbound, passengers]);

  useEffect(() => {
    if (!hydrationError) return;
    const t = setTimeout(() => setHydrationError(null), 6000);
    return () => clearTimeout(t);
  }, [hydrationError]);

  return (
    <BookingContext.Provider
      value={{
        outbound,
        inbound,
        passengers,
        setPassengers,
        selectFlights,
        clearSelection,
        hydrated,
        hydrationError,
      }}
    >
      {children}
      {hydrationError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
          <div className="rounded-lg bg-red-600 dark:bg-red-700 text-white shadow-lg ring-1 ring-red-400/40 dark:ring-red-500/40 px-4 py-3 text-xs sm:text-sm font-medium flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-block mt-0.5 flex-1 leading-relaxed">
                {hydrationError}
              </span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setHydrationError(null)}
                className="ml-auto shrink-0 rounded-md p-1 hover:bg-red-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => attemptHydration()}
                className="rounded-md bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.removeItem(STORAGE_KEY);
                  } catch {}
                  clearSelection();
                  setHydrationError(null);
                }}
                className="rounded-md bg-red-500/40 hover:bg-red-500/55 text-white text-xs px-3 py-1.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Clear saved
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 180ms ease-out;
        }
      `}</style>
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
