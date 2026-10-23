/** Car photo downloaded from MKR and stored under /public/cars (large + small WebP). */
export type Photo = { src: string; sm: string; w: number; h: number };

/** `srcset` so phones load the 640px file and large screens the 1400px one. */
export const photoSrcSet = (photo: Photo) => (photo.w > 640 ? `${photo.sm} 640w, ${photo.src} ${photo.w}w` : "");

/** Fallback `src`: the small file. */
export const photoSrc = (photo: Photo) => photo.sm;

/** Intrinsic dimensions, used to reserve layout space. */
export const photoSize = (photo: Photo) => ({ width: photo.w, height: photo.h });
