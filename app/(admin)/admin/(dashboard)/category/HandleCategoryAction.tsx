// app/(admin)/admin/(dashboard)/categories/HandleCategoryAction.tsx
"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategorySchema,
  CreateCategoryValues,
  updateCategorySchema,
  UpdateCategoryValues,
} from "@/zodSchemas/categorySchema";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count: { products: number };
};

// ─── Slug generator helper ───────────────────────────
function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── CREATE ──────────────────────────────────────────
type CreateProps = { onSuccess: () => void };

export function CreateCategoryButton({ onSuccess }: CreateProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema) as Resolver<CreateCategoryValues>,
    defaultValues: { name: "", slug: "", description: "", image: "", isActive: true },
  });

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue("name", value);
    form.setValue("slug", toSlug(value));
  };

  async function onSubmit(values: CreateCategoryValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create category");
        return;
      }
      toast.success("Category created");
      form.reset();
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0e6ba8] hover:bg-[#0b5485] text-white flex items-center gap-2 px-4 py-2 rounded-md transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>Add a new product category to the store.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Smart Watch"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
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
                    <Input placeholder="smart-watch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-gray-400 font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Category description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <LoadingButton type="submit" loading={loading} className="w-full">
              Create Category
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── EDIT ────────────────────────────────────────────
type EditProps = { category: CategoryData; onSuccess: () => void };

export function EditCategoryButton({ category, onSuccess }: EditProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateCategoryValues>({
    resolver: zodResolver(updateCategorySchema) as Resolver<UpdateCategoryValues>,
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      isActive: category.isActive,
    },
  });

  async function onSubmit(values: UpdateCategoryValues) {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update category");
        return;
      }
      toast.success("Category updated");
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-slate-400 hover:text-white transition-colors p-1"
          title="Edit category"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the details for &quot;{category.name}&quot;.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <LoadingButton type="submit" loading={loading} className="w-full">
              Save Changes
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── DELETE ──────────────────────────────────────────
type DeleteProps = { category: CategoryData; onSuccess: () => void };

export function DeleteCategoryButton({ category, onSuccess }: DeleteProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (category._count.products > 0) {
      toast.error(`Cannot delete — ${category._count.products} product(s) use this category`);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete");
        return;
      }
      toast.success(`"${category.name}" deleted`);
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-slate-400 hover:text-red-400 transition-colors p-1"
          title="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            {category._count.products > 0 ? (
              <span className="text-red-500 font-medium">
                ⚠ {category._count.products} product(s) are using this category. Remove them first.
              </span>
            ) : (
              "This will permanently delete the category. This cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || category._count.products > 0}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </span>
            ) : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
