"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

type CategoryProps = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  products: any[];
};

export default function CategorySlider({ categories }: { categories: CategoryProps[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Duplicate categories to create a seamless infinite loop.
  // We use 4 copies to ensure there is always enough overflow.
  const displayCategories = [...categories, ...categories, ...categories, ...categories];

  // Continuous smooth scrolling logic
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const animate = () => {
      // Only auto-scroll if the user isn't interacting
      if (!isDown && !isHovered) {
        slider.scrollLeft += 1; // Adjust speed by changing this value (pixels per frame)

        // Seamless infinite loop:
        // We have 4 sets of categories. If we scroll past the first set,
        // we can silently jump back to the exact same visual position at the start.
        // We calculate the width of exactly ONE set by dividing scrollWidth by 4.
        const singleSetWidth = slider.scrollWidth / 4;
        
        if (slider.scrollLeft >= singleSetWidth) {
          slider.scrollLeft -= singleSetWidth;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isDown, isHovered]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    sliderRef.current.style.cursor = "grabbing";
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsHovered(false);
    if (sliderRef.current) sliderRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    setIsDown(false);
    if (sliderRef.current) sliderRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // Prevent link dragging so it doesn't conflict with mouse scroll
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="relative w-full overflow-hidden group py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}} />
      <div
        ref={sliderRef}
        className="flex gap-4 sm:gap-6 px-4 sm:px-8 overflow-x-auto pb-8 pt-2 hide-scroll"
        style={{ cursor: "grab", scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {displayCategories.map((category, index) => {
          const catImage = category.image || category.products[0]?.images[0]?.mediaFile.url;

          return (
            <Link
              href={`/store#${category.slug}`}
              key={`${category.id}-${index}`}
              onDragStart={handleDragStart}
              className="relative w-44 h-56 sm:w-64 sm:h-80 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />

              {catImage ? (
                <Image
                  src={`${catImage}${catImage.includes("?") ? "&" : "?"}tr=w-400`}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 176px, 256px"
                  className="object-cover opacity-60 pointer-events-none"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 pointer-events-none">No Image</div>
              )}

              <div className="absolute bottom-0 left-0 p-4 sm:p-6 z-20 w-full pointer-events-none">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{category.name}</h3>
                <div className="w-full flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-blue-400">View Collection</span>
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                    <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Scroll Indicators (Fade edges) */}
      <div className="absolute top-0 left-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#0d0f14] to-transparent pointer-events-none z-30" />
      <div className="absolute top-0 right-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#0d0f14] to-transparent pointer-events-none z-30" />
    </div>
  );
}
