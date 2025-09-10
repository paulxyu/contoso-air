import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

const NotFoundPage = () => {
  return (
    <section className="w-full md:pt-16 pb-4 md:pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 ring-1 ring-gray-200 shadow-sm px-8 py-14 md:py-16">
          <div className="flex justify-center">
            <FaExclamationTriangle className="text-5xl text-blue-600" />
          </div>
          <div className="text-center mt-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Page not found
            </h1>
            <p className="text-sm text-gray-600 mt-3 max-w-xl mx-auto">
              Sorry, we couldn’t find that page. It may have been moved or the
              link is outdated.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Book a trip
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-blue-600 ring-1 ring-inset ring-blue-200 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
