"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-destructive rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Failed to load data</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm">
        There was an error communicating with the server or database.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => reset()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Request
        </button>
        <Link 
          href="/admin"
          className="bg-muted text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors border border-border"
        >
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}
