"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SliderProduct = {
  id: string;
  name: string;
  slug: string;
  images: { mediaFile: { url: string } }[];
};

export default function RecentProductsSlider({ products }: { products: SliderProduct[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) return null;

  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % products.length);

  return (
    <div className="relative w-full max-w-7xl mx-auto h-56 sm:h-80 lg:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f1219] to-[#07090e] border border-slate-800/60 shadow-2xl group">
      {products.map((product, index) => {
        const imageUrl = product.images[0]?.mediaFile.url;
        return (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-row items-center p-6 sm:p-12 lg:p-20 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <div className="flex-1 pr-4 sm:pr-8">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md mb-3 sm:mb-4">
                New Arrival
              </span>
              <h3 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 line-clamp-2 leading-tight">
                {product.name}
              </h3>
              <Link 
                href={`/product/${product.slug}`}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-base font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                Shop Now
              </Link>
            </div>
            <div className="relative w-32 h-32 sm:w-56 sm:h-56 lg:w-80 lg:h-80 flex-shrink-0">
              {imageUrl ? (
                <Image
                  src={`${imageUrl}${imageUrl.includes("?") ? "&" : "?"}tr=w-500,h-500,q-80`}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                  No Image
                </div>
              )}
            </div>
          </div>
        );
      })}

      {products.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
          >
            <ChevronRight size={16} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
