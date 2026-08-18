"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

interface URLPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function URLPagination({ currentPage, totalPages }: URLPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between w-full mt-6 border-t border-border pt-4">
      <div className="text-sm text-muted-foreground font-medium">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => router.push(createPageURL(currentPage - 1))}
          className="h-9 w-9 p-0 bg-card border-border hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => router.push(createPageURL(currentPage + 1))}
          className="h-9 w-9 p-0 bg-card border-border hover:bg-muted transition-colors disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </Button>
      </div>
    </div>
  );
}
