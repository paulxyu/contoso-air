import Destination from "@/components/Destination";
import PromoChat from "@/components/PromoChat";

const Promos = () => {
  return (
    <section className="w-full px-4 pt-2 md:pt-3 pb-12 md:pb-16 text-center">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-stretch gap-8 md:gap-6">
        <div className="flex-1">
          <Destination
            name="City escapes"
            description="Weekends in Europe"
            imageUrl="/images/b-europe.jpg"
          />
        </div>
        <div className="flex-1">
          <Destination
            name="Beach getaways"
            description="Sun, sand, relax"
            imageUrl="/images/b-beaches.jpg"
          />
        </div>
        <div className="flex-1">
          <PromoChat />
        </div>
      </div>
    </section>
  );
};

export default Promos;
