// app/(admin)/admin/(dashboard)/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  CreateCategoryButton,
  EditCategoryButton,
  DeleteCategoryButton,
  CategoryData,
} from "./HandleCategoryAction";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error();
      const data: CategoryData[] = await res.json();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Categories
          </h1>
          <CreateCategoryButton onSuccess={fetchCategories} />
        </div>

        <div className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm font-medium border-b border-slate-800/60">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Products</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No categories yet.
                    </td>
                  </tr>
                ) : categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{category.name}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">{category.slug}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${category.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        }`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{category._count.products}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <EditCategoryButton category={category} onSuccess={fetchCategories} />
                        <DeleteCategoryButton category={category} onSuccess={fetchCategories} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="block md:hidden divide-y divide-slate-800/60">
            {categories.length === 0 ? (
              <p className="py-10 text-center text-slate-500 text-sm">No categories yet.</p>
            ) : categories.map((category) => (
              <div key={category.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <EditCategoryButton category={category} onSuccess={fetchCategories} />
                    <DeleteCategoryButton category={category} onSuccess={fetchCategories} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/40">
                  <span className={`px-2 py-0.5 rounded font-medium ${category.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-gray-500/10 text-gray-400"
                    }`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                  <span>Products: <strong className="text-slate-200">{category._count.products}</strong></span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
