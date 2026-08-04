import { useState, useMemo, useCallback } from 'react';

export interface SortConfig<T> {
  key: keyof T | string;
  direction: 'asc' | 'desc';
}

export function useSort<T>(items: T[], initialSort: SortConfig<T> | null = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;

    const sorted = [...items];
    const { key, direction } = sortConfig;

    sorted.sort((a: any, b: any) => {
      let valA = a;
      let valB = b;

      if (typeof key === 'string' && key.includes('.')) {
        const parts = key.split('.');
        for (const part of parts) {
          valA = valA?.[part];
          valB = valB?.[part];
        }
      } else {
        valA = a[key as keyof T];
        valB = b[key as keyof T];
      }

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return direction === 'asc'
        ? valA > valB ? 1 : -1
        : valB > valA ? 1 : -1;
    });

    return sorted;
  }, [items, sortConfig]);

  const toggleSort = useCallback((key: keyof T | string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    sortConfig,
    toggleSort,
    clearSort,
    sortedItems,
  };
}
