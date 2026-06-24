import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchPriceSingle } from '../api/universalis';

interface PriceTooltipProps {
  itemId: number;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'right';
}

export default function PriceTooltip({ itemId, children, side = 'top' }: PriceTooltipProps) {
  const [price, setPrice] = useState<{ price: number | null; worldName: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fetchedRef = useRef(false);

  const fetchPrice = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    const info = await fetchPriceSingle(itemId);
    setPrice(info);
    setLoading(false);
  }, [itemId]);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
      fetchPrice();
    }, 500);
  }, [fetchPrice]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tooltipClasses = side === 'right'
    ? 'absolute top-1/2 left-full -translate-y-1/2 ml-2 z-50 pointer-events-none'
    : side === 'bottom'
    ? 'absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none'
    : 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none';

  const arrowClasses = side === 'right'
    ? 'absolute right-full top-1/2 -translate-y-1/2 -mr-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-600'
    : side === 'bottom'
    ? 'absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-600'
    : 'absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-600';

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {visible && (
        <div className={tooltipClasses}>
          <div className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
            {loading ? (
              <span className="text-gray-400 text-xs">查詢價格中...</span>
            ) : price && price.price != null ? (
              <div className="text-xs">
                <span className="text-green-400 font-bold">{price.price.toLocaleString()}</span>
                <span className="text-gray-400"> G ({price.worldName || '未知伺服器'})</span>
              </div>
            ) : (
              <span className="text-gray-500 text-xs">無市場價格</span>
            )}
          </div>
          <div className={arrowClasses} />
        </div>
      )}
    </div>
  );
}
