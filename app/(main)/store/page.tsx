import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowRight, Search, SlidersHorizontal, Tag } from "lucide-react";
import StoreSearch from "@/components/storefront/StoreSearch";
import { safeQuery } from "@/lib/safe-query";
import StoreSidebarClient from "@/components/storefront/StoreSidebarClient";
import RecentProductsSlider from "@/components/storefront/RecentProductsSlider";

export const revalidate = 3600;

export default async function StorePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const categoryParam = searchParams.category as string | undefined;
  const searchQuery = searchParams.search as string | undefined;

  // Fetch all active categories for the sidebar
  // safeQuery falls back to [] instead of failing the whole page (and, at
  // build time, the whole `next build`) if the DB is briefly unreachable.
  const allCategories = await safeQuery(
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    []
  );

  // Fetch categorized products based on filters
  const categories = await safeQuery(
    prisma.category.findMany({
      where: {
        isActive: true,
        ...(categoryParam ? { slug: categoryParam } : {}),
        ...(searchQuery ? {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { products: { some: { name: { contains: searchQuery, mode: 'insensitive' } } } }
          ]
        } : {})
      },
      include: {
        products: {
          where: {
            isActive: true,
            isDeleted: false,
            ...(searchQuery ? { name: { contains: searchQuery, mode: 'insensitive' } } : {})
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            images: {
              where: { isPrimary: true },
              include: { mediaFile: true },
              take: 1
            },
            variants: {
              where: { isActive: true, isDeleted: false },
              orderBy: { price: 'asc' },
              take: 1
            },
            category: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    []
  );

  const recentProducts = await safeQuery(
    prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        images: { where: { isPrimary: true }, include: { mediaFile: true }, take: 1 },
      }
    }),
    []
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200">

      {/* Header Slider */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-4">
        <RecentProductsSlider products={recentProducts} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <StoreSidebarClient>
          {/* Search Bar */}
          <div>
            <div className="flex items-center gap-2 text-white font-semibold mb-4 pb-2 border-b border-slate-800">
              <Search size={18} />
              <h3>Search</h3>
            </div>
            <StoreSearch />
          </div>

          {/* Categories List */}
          <div>
            <div className="flex items-center gap-2 text-white font-semibold mb-4 pb-2 border-b border-slate-800">
              <SlidersHorizontal size={18} />
              <h3>Categories</h3>
            </div>
            <div className="space-y-2">
              <Link
                href={`/store${searchQuery ? `?search=${searchQuery}` : ''}`}
                className={`flex items-center gap-2 text-sm transition-colors ${!categoryParam ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Tag size={14} className={!categoryParam ? 'text-blue-400' : 'text-slate-600'} />
                All Categories
              </Link>
              {allCategories.map(c => (
                <Link
                  key={c.id}
                  href={`/store?category=${c.slug}${searchQuery ? `&search=${searchQuery}` : ''}`}
                  className={`flex items-center gap-2 text-sm transition-colors ${categoryParam === c.slug ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Tag size={14} className={categoryParam === c.slug ? 'text-blue-400' : 'text-slate-600'} />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </StoreSidebarClient>

        {/* Categorized Product Grid */}
        <div className="flex-1 space-y-12">

          {searchQuery && (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl flex items-center justify-between">
              <span>Showing search results for: <strong>"{searchQuery}"</strong></span>
              <Link href={`/store${categoryParam ? `?category=${categoryParam}` : ''}`} className="text-sm underline hover:text-blue-300">
                Clear Search
              </Link>
            </div>
          )}

          {categories.filter(c => c.products.length > 0).length === 0 ? (
            <div className="bg-[#111318] rounded-2xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-slate-400 text-sm mb-6">We couldn't find any products matching your current filters.</p>
              <Link href="/store" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors">
                Clear All Filters
              </Link>
            </div>
          ) : (
            categories.map((category) => {
              if (category.products.length === 0) return null;

              return (
                <div key={category.id} className="scroll-mt-10" id={category.slug}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{category.name}</h2>
                      <p className="text-slate-400 mt-1 text-sm">{category.products.length} products available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {category.products.map((product) => {
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
                            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 mb-1">
                              <span>{product.brand}</span>
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
