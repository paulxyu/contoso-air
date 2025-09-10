"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

/** Shape of a captured site error */
export interface SiteErrorRecord {
  id: string;
  message: string;
  time: number;
  source: "runtime" | "promise" | "manual";
  stack?: string;
}

interface ErrorsProps {
  /** Provide initial errors (optional) */
  initialErrors?: SiteErrorRecord[];
  /** Auto capture window runtime & unhandledrejection events */
  autoCapture?: boolean;
  /** Max number of stored errors */
  max?: number;
}

/**
 * Floating error center (bottom-left) inspired by Next.js dev overlay indicator.
 * Collects runtime / promise rejections (if autoCapture) and lets users inspect & clear.
 */
const Errors: React.FC<ErrorsProps> = ({
  initialErrors = [],
  autoCapture = true,
  max = 50,
}) => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<SiteErrorRecord[]>(initialErrors);
  const [flash, setFlash] = useState(false); // brief animation when new error arrives
  const flashTimeout = useRef<number | null>(null);

  const addError = useCallback(
    (partial: Omit<SiteErrorRecord, "id" | "time"> & { time?: number }) => {
      setErrors((prev) => {
        const next: SiteErrorRecord = {
          id: crypto.randomUUID(),
          // Use provided time if any else now
          time: partial.time ?? Date.now(),
          message: partial.message,
          source: partial.source,
          stack: partial.stack,
        };
        const updated = [...prev, next].slice(-max);
        return updated;
      });
      setFlash(true);
      if (flashTimeout.current) window.clearTimeout(flashTimeout.current);
      flashTimeout.current = window.setTimeout(() => setFlash(false), 1200);
    },
    [max]
  );

  // Auto capture global errors
  useEffect(() => {
    if (!autoCapture) return;
    const onError = (e: ErrorEvent) => {
      const errObj = e.error instanceof Error ? e.error : undefined;
      addError({
        message: e.message || "Unknown runtime error",
        source: "runtime",
        stack: errObj?.stack,
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      let message = "Unhandled promise rejection";
      let stack: string | undefined;
      if (e.reason) {
        if (typeof e.reason === "string") message = e.reason;
        else if (e.reason instanceof Error) {
          message = e.reason.message;
          stack = e.reason.stack;
        } else {
          try {
            message = JSON.stringify(e.reason);
          } catch {
            /* ignore */
          }
        }
      }
      addError({ message, source: "promise", stack });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [autoCapture, addError]);

  const clearAll = () => setErrors([]);

  const formattedTime = (ts: number) =>
    new Date(ts).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {/* Toggle (hidden when panel open) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="contoso-errors-panel"
          className="group relative inline-flex items-center justify-center rounded-full p-[2px] shadow-lg border border-red-500/70 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
        >
          <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-40" />
          <span
            className={`relative flex h-12 w-12 items-center justify-center rounded-full text-xs font-semibold tracking-wide ${
              errors.length
                ? "bg-gradient-to-br from-rose-500 to-orange-600 text-white"
                : "bg-[#132130] text-white/60"
            }`}
          >
            {errors.length ? (
              <>
                ERR
                {flash && (
                  <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold animate-bounce shadow ring-2 ring-[#091324]">
                    {errors.length}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px]">OK</span>
            )}
          </span>
          <span className="sr-only">
            {errors.length ? `${errors.length} site errors` : "No site errors"}
          </span>
        </button>
      )}

      {open && (
        <div
          id="contoso-errors-panel"
          role="dialog"
          aria-label="Site error messages"
          className="w-[min(400px,92vw)] h-[480px] sm:h-[520px] rounded-xl border border-white/10 bg-[#091324]/95 backdrop-blur-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-white">
                Site Errors
              </span>
              <span className="text-[11px] text-white/60">
                {errors.length
                  ? `${errors.length} issue${errors.length === 1 ? "" : "s"}`
                  : "No current issues"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!!errors.length && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded px-2 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
                aria-label="Close error panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm text-white/90"
            aria-live="polite"
          >
            {errors.length === 0 && (
              <div className="mt-8 text-center text-white/50 text-xs space-y-3">
                <p>No errors captured.</p>
                <p className="text-white/40">
                  Runtime and unhandled promise errors will appear here while
                  this tab is open.
                </p>
              </div>
            )}
            {errors
              .slice()
              .reverse()
              .map((err) => (
                <div
                  key={err.id}
                  className="group relative rounded-lg border border-red-500 bg-rose-500/10 p-3 text-[13px] leading-relaxed shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="font-medium text-rose-200">
                      {err.source.toUpperCase()}
                    </strong>
                    <time
                      dateTime={new Date(err.time).toISOString()}
                      className="text-[10px] font-mono text-white/40"
                    >
                      {formattedTime(err.time)}
                    </time>
                  </div>
                  <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-[13px] text-rose-50/90">
                    {err.message}
                  </pre>
                  {err.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer select-none text-[11px] text-white/50 hover:text-white/70">
                        Stack trace
                      </summary>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-black/40 p-2 text-[10px] leading-snug text-white/70">
                        {err.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 bg-[#0b172c]/90 p-3 flex items-center justify-between text-[11px] text-white/40">
            <span>Error center · Ephemeral</span>
            <button
              type="button"
              onClick={() =>
                addError({
                  message: "Manual test error (sample)",
                  source: "manual",
                  stack: new Error("Manual test").stack,
                })
              }
              className="rounded bg-white/5 px-2 py-1 font-medium text-white/60 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              Add test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Errors;
