import { useState, useEffect } from "react";

const LIMIT = 10;
const STORAGE_KEY = "promptuno_usage_count_v2";

export function useUsageLimit() {
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(parseInt(saved, 10), LIMIT) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, count.toString());
  }, [count]);

  const increment = () => setCount((prev) => prev + 1);
  const reset = () => setCount(0); // For dev/testing purposes if needed

  return {
    count,
    isLimitReached: count >= LIMIT,
    limit: LIMIT,
    increment,
    reset,
  };
}
