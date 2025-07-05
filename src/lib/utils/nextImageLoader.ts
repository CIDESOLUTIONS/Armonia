// C:\Users\meciz\Documents\armonia\frontend\src\lib\utils\nextImageLoader.ts
export default function imageLoader({ src, width, quality }) {
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}