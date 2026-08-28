import { useEffect, useState } from 'react';

interface PublicStats {
  pageViews: number;
  pathsCompleted: number;
  badgesEarned: number;
  checkoutsCompleted: number;
}

const STATS_URL = (import.meta.env.VITE_STATS_URL as string | undefined)?.replace(/\/+$/, '') || '';

export function usePublicStats(): { stats: PublicStats | null; loading: boolean } {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!STATS_URL) return;

    setLoading(true);
    fetch(STATS_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Stats API error: ${res.status}`);
        return res.json() as Promise<PublicStats>;
      })
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
