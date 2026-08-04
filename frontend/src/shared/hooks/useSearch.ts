import { useState, useMemo } from 'react';

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T | string)[],
  initialQuery = ''
) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    return items.filter((item: any) => {
      return searchFields.some((field) => {
        if (typeof field === 'string' && field.includes('.')) {
          const parts = field.split('.');
          let val = item;
          for (const part of parts) {
            if (val == null) return false;
            val = val[part];
          }
          return val != null && String(val).toLowerCase().includes(lowerQuery);
        }

        const value = item[field as keyof T];
        return value != null && String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [items, query, searchFields]);

  return {
    query,
    setQuery,
    results,
  };
}
