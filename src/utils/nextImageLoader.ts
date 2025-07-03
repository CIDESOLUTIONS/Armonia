// lib/utils/nextImageLoader.ts
export const imageLoader = ({ src, width, quality }) => {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
};