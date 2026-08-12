// app/(admin)/admin/(dashboard)/products/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Search, ChevronDown, ArrowUpDown,
  List, LayoutGrid, Pencil, Trash2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteProductButton } from "./HandleProductAction";

type ProductFromAPI = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string; slug: string };
  images: { mediaFile: { url: string; name: string | null } }[];
  lowestPrice: number;
  totalStock: number;
  stockStatus: "in" | "low" | "out";
  _count: { variants: number; images: number };
};

type Category = { id: string; name: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductFromAPI[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "in" | "low" | "out">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [featured, setFeatured] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories for the filter dropdown
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories(data.categories || []);
        }
      })
      .catch(() => { });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (featured) params.set("featured", featured);
      if (activeTab !== "all") params.set("stock", activeTab);
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (Array.isArray(data)) {
         // Fallback in case backend hasn't deployed or returned old format
         setProducts(data);
      } else {
         setProducts(data.products || []);
         setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, featured, activeTab, sortBy, sortDir, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const StockBadge = ({ status, count }: { status: string; count: number }) => {
    if (status === "out") return <span className="text-red-500 font-medium text-xs">Out of Stock</span>;
    if (status === "low") return (
      <span className="bg-[#2d2115] text-[#e0a052] text-xs font-medium px-2.5 py-1 rounded-full border border-[#4a3520]">
        Low ({count})
      </span>
    );
    return <span className="text-emerald-400 text-xs font-medium">In Stock ({count})</span>;
  };

  return (
    <div className="min-h-screen bg-[#0b0d0f] text-slate-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Products
            <span className="text-slate-400 text-base font-normal">({products.length})</span>
          </h1>
          <Link href="/admin/products/new">
            <Button className="bg-[#0e6ba8] hover:bg-[#0b5485] text-white flex items-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="bg-[#101318]/90 border border-slate-800/80 rounded-xl p-4 sm:p-6 space-y-6 shadow-2xl backdrop-blur-md">

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or slug..."
                className="w-full bg-[#161a22] border border-slate-800 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-slate-700 transition-colors placeholder:text-slate-500"
              />
            </div>

            <div className="relative min-w-[150px]">
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                className="w-full bg-[#161a22] border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 pr-8 appearance-none outline-none focus:border-slate-700 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={featured}
                onChange={(e) => { setFeatured(e.target.value); setPage(1); }}
                className="w-full bg-[#161a22] border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 pr-8 appearance-none outline-none focus:border-slate-700 cursor-pointer"
              >
                <option value="">All Products</option>
                <option value="true">Featured</option>
                <option value="false">Non Featured</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#161a22] border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 pr-8 appearance-none outline-none focus:border-slate-700 cursor-pointer"
              >
                <option value="createdAt">Sort: Date Added</option>
                <option value="name">Sort: Name</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="bg-[#161a22] border border-slate-800 text-slate-300 hover:bg-slate-800/50 text-sm px-3 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="capitalize">{sortDir}</span>
            </button>
          </div>

          {/* Tabs + View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-6 text-sm">
              {(["all", "in", "low", "out"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`transition-colors font-medium ${activeTab === tab ? "text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {tab === "all" ? "All" : tab === "in" ? "In Stock" : tab === "low" ? "Low Stock (≤5)" : "Out of Stock"}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#161a22] border border-slate-800 rounded-lg p-0.5 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-[#0e6ba8] text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#0e6ba8] text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-sm">No products found.</p>
              <Link href="/admin/products/new" className="text-sky-400 hover:text-sky-300 text-sm mt-2 inline-block">
                Add your first product →
              </Link>
            </div>
          ) : viewMode === "list" ? (

            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-sm font-medium border-b border-slate-800/80">
                    <th className="py-3 px-4 font-normal">Product</th>
                    <th className="py-3 px-4 font-normal">Category</th>
                    <th className="py-3 px-4 font-normal">Price</th>
                    <th className="py-3 px-4 font-normal">Stock</th>
                    <th className="py-3 px-4 font-normal">Featured</th>
                    <th className="py-3 px-4 font-normal">Status</th>
                    <th className="py-3 px-4 font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800/60 rounded-md border border-slate-700/50 flex-shrink-0 overflow-hidden">
                            {product.images[0] ? (
                              <Image
                                src={`${product.images[0]?.mediaFile?.url}${product.images[0]?.mediaFile?.url.includes("?") ? "&" : "?"}tr=w-100`}
                                alt={product.images[0]?.mediaFile?.name ?? product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800/80" />
                            )}
                          </div>
                          <div className="max-w-[240px]">
                            <div className="font-semibold text-slate-100 truncate">{product.name}</div>
                            <div className="text-slate-500 text-xs truncate mt-0.5">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{product.category.name}</td>
                      <td className="py-4 px-4 text-slate-200 font-medium">৳{product.lowestPrice.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <StockBadge status={product.stockStatus} count={product.totalStock} />
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {product.isFeatured ? (
                          <span className="text-amber-400 text-xs font-medium">Yes</span>
                        ) : (
                          <span className="text-slate-500 text-xs">No</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${product.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                          }`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {/* <button className="text-slate-400 hover:text-red-400 transition-colors p-1"> */}
                          {/*   <Trash2 className="w-4 h-4" /> */}
                          {/* </button> */}
                          <DeleteProductButton
                            product={product}
                            onSuccess={fetchProducts}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (

            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-colors">
                  <div className="aspect-square bg-slate-800/60 relative">
                    {product.images[0] ? (
                      <Image
                        src={`${product.images[0]?.mediaFile?.url}${product.images[0]?.mediaFile?.url.includes("?") ? "&" : "?"}tr=w-400`}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">No image</div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="font-semibold text-slate-100 text-sm truncate">{product.name}</div>
                    <div className="text-slate-400 text-xs">{product.category.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 text-sm font-medium">৳{product.lowestPrice.toLocaleString()}</span>
                      <StockBadge status={product.stockStatus} count={product.totalStock} />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-slate-400 hover:text-slate-200 p-1">
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button className="text-slate-400 hover:text-red-400 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-4">
              <span className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-[#161a22] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-[#161a22] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
