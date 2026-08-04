import { useState, useMemo, useCallback } from 'react';

export function useFilter<T>(
  items: T[],
  initialFilters: Partial<Record<keyof T | string, any>> = {}
) {
  const [filters, setFilters] = useState<Partial<Record<keyof T | string, any>>>(initialFilters);

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      return Object.entries(filters).every(([field, filterValue]) => {
        if (filterValue === undefined || filterValue === null || filterValue === '') {
          return true;
        }

        let itemValue = item;
        if (field.includes('.')) {
          const parts = field.split('.');
          for (const part of parts) {
            if (itemValue == null) break;
            itemValue = itemValue[part];
          }
        } else {
          itemValue = item[field];
        }

        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }

        if (typeof filterValue === 'function') {
          return filterValue(itemValue);
        }

        return itemValue === filterValue;
      });
    });
  }, [items, filters]);

  const updateFilters = useCallback((newFilters: Partial<Record<keyof T | string, any>>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredItems,
  };
}
