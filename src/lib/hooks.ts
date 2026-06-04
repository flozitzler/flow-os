"use client";

import { useState, useEffect } from "react";

export function useFetch<T>(url: string, refreshInterval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
          setLoading(false);
        }
      }
    }

    load();

    let interval: ReturnType<typeof setInterval> | undefined;
    if (refreshInterval) {
      interval = setInterval(load, refreshInterval);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [url, refreshInterval]);

  return { data, loading, error };
}
