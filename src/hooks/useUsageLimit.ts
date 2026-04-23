import { useState, useEffect } from "react";

const LIMIT = 5;
const STORAGE_KEY = "promptuno_usage_count_v2";

export function useUsageLimit() {
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.min(parseInt(saved, 10), LIMIT) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, count.toString());
  }, [count]);

  const increment = () => setCount((prev) => Math.min(prev + 1, LIMIT));
  const reset = () => setCount(0); // For dev/testing purposes if needed

  return {
    count,
    isLimitReached: count >= LIMIT,
    limit: LIMIT,
    remaining: Math.max(0, LIMIT - count),
    increment,
    reset,
  };
}
