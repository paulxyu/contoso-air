import Destination from "@/components/Destination";
import DestinationData from "@/data/destinations.json";

interface Destination {
  id: number;
  name: string;
  imageUrl: string;
}

const popularDestinations: Destination[] = DestinationData;

const PopularDestinations = () => {
  return (
    <section className="w-full px-4 pt-12 md:pt-16 pb-4 md:pb-6 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          Popular right now
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto">
          Handpicked cities with great weather and better prices.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {popularDestinations.map((destination) => (
            <div
              key={destination.id}
              className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200/60 dark:border-gray-700"
            >
              <Destination
                name={destination.name}
                imageUrl={destination.imageUrl}
                priority={destination.id === 1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
