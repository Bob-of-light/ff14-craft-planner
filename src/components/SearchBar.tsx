import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜尋物品名稱（繁/簡中皆可）..."
        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg
                   text-white placeholder-gray-400 text-lg
                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                   transition-colors"
      />
      {value && (
        <button
          onClick={() => { setValue(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xl"
        >
          &times;
        </button>
      )}
    </div>
  );
}
