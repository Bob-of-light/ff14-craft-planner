import { useState, useRef, useCallback } from 'react';
import { fetchPrices } from '../api/universalis';
import type { PriceInfo } from '../types';

export function usePrice() {
  const [prices, setPrices] = useState<Map<number, PriceInfo>>(new Map());
  const loadingRef = useRef<Set<number>>(new Set());
  const cacheRef = useRef<Map<number, PriceInfo>>(new Map());

  const getPrice = useCallback(async (itemId: number): Promise<PriceInfo | null> => {
    if (cacheRef.current.has(itemId)) {
      return cacheRef.current.get(itemId)!;
    }
    if (loadingRef.current.has(itemId)) return null;

    loadingRef.current.add(itemId);

    try {
      const map = await fetchPrices([itemId]);
      const info = map.get(itemId);
      if (info) {
        const priceInfo: PriceInfo = {
          itemId,
          price: info.price,
          worldName: info.worldName,
          loading: false,
        };
        cacheRef.current.set(itemId, priceInfo);
        setPrices((prev) => new Map(prev).set(itemId, priceInfo));
        return priceInfo;
      }
    } catch {
      // ignore
    } finally {
      loadingRef.current.delete(itemId);
    }

    return null;
  }, []);

  const prefetchPrices = useCallback(async (itemIds: number[]) => {
    const uncached = itemIds.filter((id) => !cacheRef.current.has(id));
    if (uncached.length === 0) return;

    const map = await fetchPrices(uncached);
    const newEntries: [number, PriceInfo][] = [];
    map.forEach((info, itemId) => {
      const priceInfo: PriceInfo = {
        itemId,
        price: info.price,
        worldName: info.worldName,
        loading: false,
      };
      cacheRef.current.set(itemId, priceInfo);
      newEntries.push([itemId, priceInfo]);
    });

    if (newEntries.length > 0) {
      setPrices((prev) => new Map([...prev, ...newEntries]));
    }
  }, []);

  const clearPrices = useCallback(() => {
    cacheRef.current.clear();
    loadingRef.current.clear();
    setPrices(new Map());
  }, []);

  return { prices, getPrice, prefetchPrices, clearPrices };
}
