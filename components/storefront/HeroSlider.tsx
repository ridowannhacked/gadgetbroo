"use client";

import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Banner = {
  id: string;
  title: string;
  url: string;
  linkUrl: string | null;
};

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto mt-[-5vh]">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
          Pro power. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Next-gen performance.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 font-light">
          Discover the latest technology designed to push the boundaries of what's possible.
        </p>
      </div>
    );
  }

  const activeBanner = banners[currentIndex];

  return (
    <div className="absolute inset-0 w-full h-full group">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black z-0 transition-opacity duration-1000 ease-in-out">
        {/* We map through all to keep them in DOM for faster transitions, using opacity */}
        {banners.map((banner, index) => (
          <Image
            key={banner.id}
            src={banner.url}
            alt={banner.title}
            fill
            className={`object-cover object-center transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0}
          />
        ))}
      </div>

      {/* Content (Button only now, positioned at bottom) */}
      <div className="relative z-10 flex flex-col items-center justify-end pb-24 h-full px-8 w-full max-w-7xl mx-auto">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`transition-all duration-700 ease-in-out absolute bottom-24 transform ${
              index === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            {banner.linkUrl && (
              <Link 
                href={banner.linkUrl}
                className="inline-flex bg-white text-black font-semibold px-10 py-4 rounded-full hover:bg-slate-200 transition-colors shadow-2xl items-center gap-2"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-all cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex ? "w-8 h-2 bg-blue-500" : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
