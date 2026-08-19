import { useEffect, useState } from "react";

export function useApiData(fetchFn, fallbackData) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFn()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLive(true);
      })
      .catch(() => {
        if (cancelled) return;
        setData(fallbackData);
        setLive(false);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, live };
}
