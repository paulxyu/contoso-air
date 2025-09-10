import Image from "next/image";

interface DestinationProps {
  name: string;
  description?: string;
  imageUrl: string;
  priority?: boolean;
}

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

const Destination = ({
  name,
  description,
  imageUrl,
  priority = false,
}: DestinationProps) => {
  return (
    <figure className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        className="object-cover object-center transition-transform duration-700 will-change-transform hover:scale-105"
      />
      <figcaption className="pointer-events-none absolute inset-0 flex items-end">
        <div className="w-full bg-gradient-to-t from-black/60 via-black/25 to-transparent p-4 text-white drop-shadow text-left">
          <p className="font-semibold tracking-wide">{name}</p>
          {description && (
            <p className="mt-1 text-sm font-normal leading-snug text-white/90 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
};

export default Destination;
