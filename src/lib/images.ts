/** MKR gallery image with its resized WordPress variants (e.g. "768x520"). */
export type Photo = { src: string; w: number | null; v: string[] };

const variantUrl = (src: string, size: string) => {
  const dot = src.lastIndexOf(".");
  return `${src.slice(0, dot)}-${size}${src.slice(dot)}`;
};

/** `srcset` from the smallest variant up to the original, so phones download small files. */
export function photoSrcSet(photo: Photo) {
  const parts = photo.v.map((size) => `${variantUrl(photo.src, size)} ${size.split("x")[0]}w`);
  if (photo.w && !photo.v.some((size) => Number(size.split("x")[0]) >= photo.w!)) parts.push(`${photo.src} ${photo.w}w`);
  return parts.join(", ");
}

/** Fallback `src`: the 768px variant when available, otherwise the original. */
export function photoSrc(photo: Photo) {
  const medium = photo.v.find((size) => size.startsWith("768x"));
  return medium ? variantUrl(photo.src, medium) : photo.src;
}

/** Intrinsic dimensions from the first variant, used to reserve layout space. */
export function photoSize(photo: Photo) {
  const [w, h] = (photo.v[0] ?? "").split("x").map(Number);
  return w && h ? { width: w, height: h } : {};
}
