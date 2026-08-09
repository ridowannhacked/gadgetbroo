"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Star, Images } from "lucide-react";
import Image from "next/image";
import { MediaPickerDialog, type MediaFileRecord } from "@/components/admin/media/MediaPickerDialog";
import { updateProductSchema, UpdateProductValues } from "../../../../../../../zodSchemas/productSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { Switch } from "@/components/ui/switch";

type Category = { id: string; name: string; slug: string };

type UploadedMedia = {
  id?: string;
  url: string;
  fileId: string;
  name: string;
  isPrimary: boolean;
  mediaType: "image" | "video";
};

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<UpdateProductValues>({
    resolver: zodResolver(updateProductSchema) as Resolver<UpdateProductValues>,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      brand: "",
      categoryId: "",
      isActive: false,
      isFeatured: false,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) {
          form.reset({
            name: data.product.name,
            slug: data.product.slug,
            description: data.product.description,
            brand: data.product.brand,
            categoryId: data.product.categoryId,
            isActive: data.product.isActive,
            isFeatured: data.product.isFeatured,
            variants: data.product.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              color: v.color || undefined,
              storage: v.storage || undefined,
              size: v.size || undefined,
              isActive: v.isActive,
            })),
          });
          
          if (data.product.images) {
            setUploadedMedia(data.product.images.map((img: any) => ({
              id: img.id,
              url: img.mediaFile.url,
              fileId: img.mediaFile.fileId,
              name: img.mediaFile.name,
              isPrimary: img.isPrimary,
              mediaType: img.mediaFile.fileType,
            })));
          }
        }
      })
      .catch(() => toast.error("Failed to load product details"))
      .finally(() => setLoading(false));
  }, [productId, form]);

  const handleMediaSelect = async (selected: MediaFileRecord | MediaFileRecord[]) => {
    const incoming = Array.isArray(selected) ? selected : [selected];
    const hasImage = uploadedMedia.some((m) => m.mediaType === "image");
    
    for (let i = 0; i < incoming.length; i++) {
      const f = incoming[i];
      if (uploadedMedia.some((p) => p.fileId === f.fileId)) continue;
      
      const mediaType = f.fileType === "video" ? "video" : "image";
      const isPrimary = !hasImage && mediaType === "image" && i === 0;
      
      // Save directly to API
      try {
        const res = await fetch(`/api/products/${productId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: f.url, fileId: f.fileId, name: f.name, isPrimary }),
        });
        const data = await res.json();
        if (res.ok) {
          setUploadedMedia((prev) => [...prev, { id: data.image.id, url: f.url, fileId: f.fileId, name: f.name, mediaType, isPrimary }]);
        }
      } catch (err) {
        toast.error("Failed to add image");
      }
    }
  };

  const setPrimaryImage = async (index: number) => {
    const item = uploadedMedia[index];
    if (!item.id) return;
    
    try {
      await fetch(`/api/products/${productId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: item.id }),
      });
      
      setUploadedMedia((prev) =>
        prev.map((m, i) => ({ ...m, isPrimary: m.mediaType === "image" && i === index }))
      );
    } catch (err) {
      toast.error("Failed to update primary image");
    }
  };

  const removeMedia = async (index: number) => {
    const item = uploadedMedia[index];
    if (item.id) {
      try {
        await fetch(`/api/products/${productId}/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId: item.id }),
        });
      } catch (err) {
        toast.error("Failed to remove image");
        return;
      }
    }
    
    setUploadedMedia((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (item.isPrimary && next.some(m => m.mediaType === "image")) {
        const firstImg = next.findIndex((m) => m.mediaType === "image");
        if (firstImg >= 0 && next[firstImg].id) {
           // Fire and forget auto primary update
           fetch(`/api/products/${productId}/images`, {
             method: "PATCH",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ imageId: next[firstImg].id }),
           });
           next[firstImg] = { ...next[firstImg], isPrimary: true };
        }
      }
      return next;
    });
  };

  async function onSubmit(values: UpdateProductValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update product");
        return;
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Loading product data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Product</h1>
        <p className="text-sm text-gray-400 mt-1">Update your product details and variants</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-white">Basic Information</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple iPhone 15 Pro 256GB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="apple-iphone-15-pro-256gb" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select
                        className="w-full bg-[#161a22] border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:border-slate-500"
                        {...field}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel>Featured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Variants</h2>
              </div>
              <Button
                type="button"
                onClick={() => append({ name: "", sku: "", price: 0, stock: 0, isActive: true })}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 h-auto"
              >
                <Plus size={14} className="mr-1" /> Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-slate-700/60 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Variant {index + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <FormField control={form.control} name={`variants.${index}.name`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Variant Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    <FormField control={form.control} name={`variants.${index}.sku`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Price (৳)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    <FormField control={form.control} name={`variants.${index}.color`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Color <span className="text-gray-500">(optional)</span></FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                    <FormField control={form.control} name={`variants.${index}.storage`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Storage <span className="text-gray-500">(optional)</span></FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                      )} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">Product Media</h2>
                <p className="text-xs text-gray-400 mt-0.5">Media updates are saved instantly. Use ★ to set the primary image.</p>
              </div>
              <Button type="button" onClick={() => setMediaPickerOpen(true)} className="shrink-0 bg-slate-700 hover:bg-slate-600 text-white text-sm gap-2">
                <Images size={16} /> Add Media
              </Button>
            </div>

            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedMedia.map((item, index) => (
                  <div key={item.fileId} className={`relative rounded-lg overflow-hidden border-2 transition-colors ${item.isPrimary ? "border-sky-500" : "border-slate-700"}`}>
                    {item.mediaType === "image" ? (
                      <Image src={`${item.url}${item.url.includes("?") ? "&" : "?"}tr=w-400`} alt={item.name} width={200} height={200} className="w-full h-32 object-cover" />
                    ) : (
                      <video src={item.url} className="w-full h-32 object-cover bg-black" muted playsInline />
                    )}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      {item.mediaType === "image" && (
                        <button type="button" onClick={() => setPrimaryImage(index)} className={`p-1 rounded-full text-xs ${item.isPrimary ? "bg-sky-500 text-white" : "bg-black/60 text-gray-300 hover:text-white"}`}>
                          <Star size={12} fill={item.isPrimary ? "white" : "none"} />
                        </button>
                      )}
                      <button type="button" onClick={() => removeMedia(index)} className="p-1 rounded-full bg-black/60 text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>Cancel</Button>
            <LoadingButton type="submit" loading={submitting}>Update Product</LoadingButton>
          </div>
        </form>
      </Form>

      <MediaPickerDialog open={mediaPickerOpen} onOpenChange={setMediaPickerOpen} defaultTab="library" multiple={true} allowedTypes="all" onSelect={handleMediaSelect} />
    </div>
  );
}
