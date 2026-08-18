"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Oops! Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We encountered an unexpected error while loading this page. Please try again.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => reset()}
          className="flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link 
          href="/"
          className="bg-muted text-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors border border-border"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
