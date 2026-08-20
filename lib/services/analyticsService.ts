import prisma from "@/lib/prisma";
import { Prisma } from "@/src/generated/prisma/client";

export type CountriesAnalyticsParams = {
  range?: string; // "today" | "7d" | "30d" | "all"
  page?: number;
  limit?: number;
  sortBy?: string; // "views" | "country"
  sortOrder?: string; // "asc" | "desc"
  search?: string;
};

export type CountriesAnalyticsResult = {
  data: { country: string; views: number }[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type PagesAnalyticsParams = {
  range?: string; // "today" | "7d" | "30d" | "all"
  page?: number;
  limit?: number;
  sortBy?: string; // "views" | "page"
  sortOrder?: string; // "asc" | "desc"
  search?: string;
};

export type PagesAnalyticsResult = {
  data: { page: string; views: number }[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

function rangeToSince(range: string): Date | null {
  if (range === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "7d") return new Date(Date.now() - 7 * 864e5);
  if (range === "30d") return new Date(Date.now() - 30 * 864e5);
  return null; // "all"
}

/**
 * AnalyticsService — single source of truth for admin analytics queries.
 * Called both by the /api/analytics/* routes (client-side re-fetch on
 * filter change) and directly by the analytics page.tsx Server Components
 * (initial page load) so the query logic only lives in one place.
 */
export const AnalyticsService = {
  async getCountriesAnalytics(params: CountriesAnalyticsParams = {}): Promise<CountriesAnalyticsResult> {
    const {
      range = "7d",
      page = 1,
      limit = 50,
      sortBy = "views",
      sortOrder = "desc",
      search = "",
    } = params;

    const since = rangeToSince(range);
    const pvWhere: Prisma.PageViewWhereInput = since ? { createdAt: { gte: since } } : {};
    const searchWhere: Prisma.PageViewWhereInput = search
      ? { country: { contains: search, mode: "insensitive" } }
      : {};

    const totalCountries = await prisma.pageView.groupBy({
      by: ["country"],
      where: { ...pvWhere, ...searchWhere, country: { not: "" } },
    });

    const countriesData = await prisma.pageView.groupBy({
      by: ["country"],
      _count: { id: true },
      where: { ...pvWhere, ...searchWhere, country: { not: "" } },
      orderBy:
        sortBy === "country"
          ? { country: sortOrder as "asc" | "desc" }
          : { _count: { id: sortOrder as "asc" | "desc" } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: countriesData.map((c) => ({ country: c.country, views: c._count.id })),
      pagination: {
        page,
        limit,
        total: totalCountries.length,
        totalPages: Math.ceil(totalCountries.length / limit),
      },
    };
  },

  async getPagesAnalytics(params: PagesAnalyticsParams = {}): Promise<PagesAnalyticsResult> {
    const {
      range = "7d",
      page = 1,
      limit = 50,
      sortBy = "views",
      sortOrder = "desc",
      search = "",
    } = params;

    const since = rangeToSince(range);
    const pvWhere: Prisma.PageViewWhereInput = since ? { createdAt: { gte: since } } : {};
    // Note: unlike getCountriesAnalytics, this intentionally does NOT filter
    // out empty-string values — matches the original /api/analytics/pages route.
    const searchWhere: Prisma.PageViewWhereInput = search
      ? { page: { contains: search, mode: "insensitive" } }
      : {};

    const totalPages = await prisma.pageView.groupBy({
      by: ["page"],
      where: { ...pvWhere, ...searchWhere },
    });

    const pagesData = await prisma.pageView.groupBy({
      by: ["page"],
      _count: { id: true },
      where: { ...pvWhere, ...searchWhere },
      orderBy:
        sortBy === "page"
          ? { page: sortOrder as "asc" | "desc" }
          : { _count: { id: sortOrder as "asc" | "desc" } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: pagesData.map((p) => ({ page: p.page, views: p._count.id })),
      pagination: {
        page,
        limit,
        total: totalPages.length,
        totalPages: Math.ceil(totalPages.length / limit),
      },
    };
  },
};
