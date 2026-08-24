import { useCallback, useEffect, useState } from "react";

export function useApiData(fetchFn, fallbackData) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res);
      setLive(true);
      return res;
    } catch (err) {
      setData(fallbackData);
      setLive(false);
      setError(err);
      return fallbackData;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLive(true);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setData(fallbackData);
        setLive(false);
        setError(err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  return { data, loading, live, error, refresh };
}
