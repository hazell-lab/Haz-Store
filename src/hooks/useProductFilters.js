import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_FILTERS,
  filtersToParams,
  getActiveFilterChips,
  getShopResults,
  parseFilters,
} from "../utils/filters.js";

// shop filters live in the url (?q=&category=&price=&rating=&availability=&sort=)
// so results can be shared, bookmarked and restored with the back button
export function useProductFilters(products, categories) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);
  const filters = useMemo(() => parseFilters(searchParams, categoryNames), [searchParams, categoryNames]);

  const results = useMemo(() => getShopResults(products, filters), [products, filters]);
  const chips = useMemo(() => getActiveFilterChips(filters), [filters]);

  // typing in search replaces the history entry instead of adding one per key
  const setFilter = useCallback(
    (key, value) => {
      const next = { ...filters, [key]: value };
      setSearchParams(filtersToParams(next), { replace: key === "q" });
    },
    [filters, setSearchParams]
  );

  const clearFilter = useCallback((key) => setFilter(key, DEFAULT_FILTERS[key]), [setFilter]);

  // keeps the sort, resets everything else
  const clearAll = useCallback(() => {
    setSearchParams(filtersToParams({ ...DEFAULT_FILTERS, sort: filters.sort }));
  }, [filters.sort, setSearchParams]);

  // filters in the panel (search has its own field)
  const panelCount = chips.filter((chip) => chip.key !== "q").length;

  return { filters, results, chips, panelCount, setFilter, clearFilter, clearAll };
}
