import { useState, useEffect } from 'react';

// Generic debounce hook. Extracted from SearchInput so it can be tested
// in isolation and reused anywhere we need to delay a value update.
// 300ms is the minimum specified by the brief and feels snappy in practice.
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cleanup on re-render clears the previous timer, so only the final
    // value after the user stops typing gets pushed through.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
