"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export const useQueryFilters = (prefix: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const p = (key: string) =>
    `${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}`;

  const page = Number(searchParams.get(p("page"))) || 1;
  const search = searchParams.get(p("search")) || "";
  const outletId = searchParams.get(p("outletId"))
    ? Number(searchParams.get(p("outletId")))
    : undefined;
  const sortOrder =
    (searchParams.get(p("sortOrder")) as "asc" | "desc") || "asc";
  const sortBy = searchParams.get(p("sortBy")) || "name";

  const setFilter = useCallback(
    (key: string, value: string | number | null | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      const paramName = p(key);

      if (key !== "page") {
        params.set(p("page"), "1");
      }

      if (value === null || value === "" || value === undefined) {
        params.delete(paramName);
      } else {
        params.set(paramName, String(value));
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router, prefix],
  );

  return {
    // Values
    page,
    search,
    outletId,
    sortOrder,
    sortBy,
    // Actions (API tetap bersih: setPage, setSearch, dsb)
    setPage: (val: number) => setFilter("page", val),
    setSearch: (val: string) => setFilter("search", val),
    setOutletId: (val: number | undefined) => setFilter("outletId", val),
    setSortOrder: (val: "asc" | "desc") => setFilter("sortOrder", val),
  };
};
