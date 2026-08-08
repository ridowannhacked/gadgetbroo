// components/admin/DeleteProductButton.tsx
"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

type Props = {
  product: {
    id: string;
    name: string;
    _count: { images: number; variants: number };
  };
  onSuccess: () => void;
};

export function DeleteProductButton({ product, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }

      toast.success(`"${product.name}" deleted`);
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
          type="button"
          className="text-slate-400 hover:text-red-400 transition-colors p-1"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{product.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                This will permanently delete the product
                {product._count.images > 0 && (
                  <>
                    ,{" "}
                    <span className="font-medium text-slate-300">
                      {product._count.images} image
                      {product._count.images > 1 ? "s" : ""}
                    </span>
                  </>
                )}
                {product._count.variants > 0 && (
                  <>
                    , and{" "}
                    <span className="font-medium text-slate-300">
                      {product._count.variants} variant
                      {product._count.variants > 1 ? "s" : ""}
                    </span>
                  </>
                )}
                .
              </p>
              <p className="text-red-500/90 font-medium">
                This cannot be undone. If the product is in any order, deletion
                will be blocked.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
