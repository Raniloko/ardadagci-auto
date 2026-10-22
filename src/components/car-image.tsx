import { photoSize, photoSrc, photoSrcSet, type Photo } from "@/lib/images";

export function CarImage({ photo, sizes, alt, eager = false, className }: { photo: Photo | undefined; sizes: string; alt: string; eager?: boolean; className?: string }) {
  if (!photo) return null;
  return (
    <img
      src={photoSrc(photo)}
      srcSet={photoSrcSet(photo) || undefined}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      {...(eager ? { fetchPriority: "high" as const } : {})}
      {...photoSize(photo)}
      {...(className ? { className } : {})}
    />
  );
}
