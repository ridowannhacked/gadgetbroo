import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowRight, Search } from "lucide-react";

// Force dynamic if needed, or rely on ISR/revalidation
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const [categories, recentProducts, heroBanners] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isActive: true, isDeleted: false },
          take: 1,
          include: {
            images: {
              where: { isPrimary: true },
              include: { mediaFile: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      take: 12,
      orderBy: { createdAt: "desc" }, // or you could use a random approach if preferred, but desc is standard for "latest" mixed
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          include: { mediaFile: true },
          take: 1
        },
        variants: {
          where: { isActive: true, isDeleted: false },
          orderBy: { price: 'asc' },
          take: 1
        }
      }
    }),
    prisma.siteMedia.findMany({
      where: { isActive: true, placement: "HERO_SLIDER" },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  const activeHero = heroBanners[0]; // For now, just use the first active hero banner

  // Duplicate categories array to make the infinite marquee scroll seamless
  const marqueeCategories = [...categories, ...categories, ...categories];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {/* Dynamic Background Banner */}
        {activeHero ? (
          <>
            <div className="absolute inset-0 bg-black z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${activeHero.url}?tr=w-1920`} 
                alt={activeHero.title}
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0" />
            
            <div className="relative z-10 flex flex-col items-start text-left px-8 w-full max-w-7xl mx-auto">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 max-w-2xl">
                {activeHero.title}
              </h1>
              {activeHero.linkUrl && (
                <Link 
                  href={activeHero.linkUrl}
                  className="bg-blue-600 text-white font-medium px-8 py-3.5 rounded-full hover:bg-blue-500 transition-colors flex items-center gap-2"
                >
                  Explore Offer <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Fallback Static Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-[#0a0a0a]/50 to-[#0a0a0a] z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0,rgba(0,0,0,0)_50%)]" />
            
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto mt-[-5vh]">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
                Pro power. <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Next-gen performance.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 font-light">
                Discover the latest technology designed to push the boundaries of what's possible. 
                Sleek, powerful, and ready for whatever comes next.
              </p>
            </div>
          </>
        )}
        
        {/* Global Search Bar (Positioned at bottom of hero) */}
        <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-4 z-20">
          <form action="/store" method="GET" className="relative flex items-center w-full group">
            <Search className="absolute left-6 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              name="search"
              placeholder="Search for smartphones, laptops, accessories..." 
              className="w-full bg-[#111318] border border-slate-700 text-white placeholder:text-slate-500 rounded-full py-4 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xl"
            />
            <button type="submit" className="absolute right-2 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-full hover:bg-blue-500 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Mixed Products Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">Latest Arrivals</h2>
            <p className="text-slate-400 mt-2">Discover the newest technology added to our collection.</p>
          </div>
          <Link 
            href="/store"
            className="bg-blue-600/10 border border-blue-500/30 text-blue-400 font-medium px-8 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            Browse All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {recentProducts.map((product) => {
            const primaryImage = product.images[0]?.mediaFile.url || null;
            const startingPrice = product.variants[0]?.price;

            return (
              <Link 
                href={`/product/${product.slug}`} 
                key={product.id}
                className="group flex flex-col bg-[#0f1219] border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="aspect-square w-full rounded-xl bg-[#0a0a0a] flex items-center justify-center mb-6 overflow-hidden relative">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={`${primaryImage}${primaryImage.includes("?") ? "&" : "?"}tr=w-400`} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-700">No Image</div>
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{product.brand}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{product.category.name}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="text-lg font-bold text-slate-200">
                      {startingPrice ? `৳${Number(startingPrice).toFixed(2)}` : 'TBA'}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-12">
          <Link href="/store" className="bg-slate-800 text-white font-medium px-8 py-3 rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700">
            View the full catalog <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Explore Categories - Infinite Marquee Slider AT THE BOTTOM */}
      <section className="py-20 border-t border-white/5 relative overflow-hidden bg-[#0d0f14]">
        <div className="text-center mb-10 px-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Shop by Category</h2>
          <p className="text-slate-400 mt-2">Explore our specialized collections.</p>
        </div>

        {/* Marquee Container */}
        <div className="flex overflow-hidden w-full group py-4">
          <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] group-hover:![animation-play-state:paused] gap-6 px-3">
            {marqueeCategories.map((category, index) => {
              // Use category image, or fallback to the first product's image in this category
              const catImage = category.image || category.products[0]?.images[0]?.mediaFile.url;

              return (
                <Link 
                  href={`/store#${category.slug}`} 
                  key={`${category.id}-${index}`}
                  className="relative w-64 h-80 shrink-0 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                  
                  {catImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={`${catImage}${catImage.includes("?") ? "&" : "?"}tr=w-400`} 
                      alt={category.name} 
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">No Image</div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs text-blue-400">View Collection</span>
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} GadgetBroo. All rights reserved.</p>
      </footer>
    </div>
  );
}
