import ChatButton from "./ChatButton";

const PromoChat = () => {
  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-600 text-white p-5 flex flex-col justify-between">
      {/* Decorative subtle pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.35) 0, transparent 55%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.25) 0, transparent 60%)",
        }}
      />
      <div className="relative flex flex-col gap-3 text-left">
        <h3 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
          Plan smarter with our AI travel assistant
        </h3>
        <p className="text-sm md:text-base text-white/90 max-w-sm leading-relaxed">
          Ask about destinations, deals, and tips. It&apos;s like having a
          travel pro on call.
        </p>
      </div>
      <div className="relative text-left">
        <ChatButton
          className="inline-flex items-center gap-2 rounded-md bg-white/95 text-indigo-700 font-semibold px-5 py-2.5 text-sm shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/70 focus:ring-offset-indigo-700"
          aria-label="Open AI travel assistant chat"
        >
          <span>Chat now</span>
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
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </ChatButton>
      </div>
    </div>
  );
};

export default PromoChat;
