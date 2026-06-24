import { useState, useEffect, useRef } from 'react';
import { searchItems } from '../api/itemSearch';
import type { WikiItem } from '../types';

export function useSearch(query: string) {
  const [results, setResults] = useState<WikiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      try {
        const items = await searchItems(trimmed);
        setResults(items);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading };
}
