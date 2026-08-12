import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowRight, Search } from "lucide-react";
import HeroSlider from "@/components/storefront/HeroSlider";
import { safeQuery } from "@/lib/safe-query";
import CategorySlider from "@/components/storefront/CategorySlider";

// Force dynamic if needed, or rely on ISR/revalidation
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  // safeQuery falls back to [] instead of failing the whole page (and, at
  // build time, the whole `next build`) if the DB is briefly unreachable.
  const [categories, recentProducts, heroBanners] = await Promise.all([
    safeQuery(
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
      []
    ),
    safeQuery(
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
      []
    ),
    safeQuery(
      prisma.siteMedia.findMany({
        where: { isActive: true, placement: "HERO_SLIDER" },
        orderBy: { sortOrder: "asc" }
      }),
      []
    )
  ]);
  
  // Filter out categories that have NO products (or no active products)
  const validCategories = categories.filter(c => c.products && c.products.length > 0);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-[45vh] md:h-[60vh] lg:h-[70vh] w-full flex items-center justify-center overflow-hidden">

        {/* The new interactive Slider handles the backgrounds and the content logic */}
        <HeroSlider banners={heroBanners.map(b => ({ id: b.id, title: b.title, url: b.url, linkUrl: b.linkUrl }))} />

        {/* Global Search Bar (Positioned at bottom of hero) */}
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {recentProducts.map((product) => {
            const primaryImage = product.images[0]?.mediaFile.url || null;
            const startingPrice = product.variants[0]?.price;

            return (
              <Link
                href={`/product/${product.slug}`}
                key={product.id}
                className="group flex flex-col bg-[#0f1219] border border-slate-800/60 rounded-2xl p-3 sm:p-5 hover:border-slate-700 transition-colors"
              >
                <div className="aspect-square w-full rounded-xl bg-[#0a0a0a] flex items-center justify-center mb-4 sm:mb-6 overflow-hidden relative">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${primaryImage}${primaryImage.includes("?") ? "&" : "?"}tr=w-400`}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-slate-700">No Image</div>
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] sm:text-xs text-slate-500">{product.brand}</span>
                    <span className="text-[8px] sm:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{product.category.name}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-2 sm:pt-4 flex items-center justify-between">
                    <div className="text-base sm:text-lg font-bold text-slate-200">
                      {startingPrice ? `৳${Number(startingPrice).toFixed(2)}` : 'TBA'}
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ArrowRight size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
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

      {/* Explore Categories - Interactive Slider AT THE BOTTOM */}
      <section className="py-20 border-t border-white/5 relative bg-[#0d0f14]">
        <div className="text-center mb-10 px-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Shop by Category</h2>
          <p className="text-slate-400 mt-2">Explore our specialized collections.</p>
        </div>

        {validCategories.length > 0 ? (
          <CategorySlider categories={validCategories} />
        ) : (
          <div className="text-center py-12 text-slate-500 bg-[#12151a] mx-4 rounded-2xl border border-slate-800">
            No categories available yet.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} GadgetBroo. All rights reserved.</p>
      </footer>
    </div>
  );
}
