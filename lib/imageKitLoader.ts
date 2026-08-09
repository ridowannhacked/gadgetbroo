export default function imageKitLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.includes("ik.imagekit.io")) {
    return src; // Fallback for non-imagekit images if any
  }
  
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  } else {
    params.push(`q-75`); // Default quality
  }
  
  const paramsString = params.join(",");
  
  try {
    const url = new URL(src);
    url.searchParams.set("tr", paramsString);
    return url.toString();
  } catch (e) {
    return src;
  }
}
