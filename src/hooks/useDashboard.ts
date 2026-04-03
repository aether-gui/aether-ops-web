import { useState, useEffect, useCallback } from 'react';
import { getDashboard, refreshDashboard } from '../api/onramp';
import type { DashboardBody } from '../types/api';

interface UseDashboardOptions {
  pollInterval?: number;
}

export function useDashboard(opts: UseDashboardOptions = {}) {
  const { pollInterval = 10_000 } = opts;
  const [data, setData] = useState<DashboardBody | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await getDashboard();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await refreshDashboard();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => clearInterval(interval);
  }, [fetch, pollInterval]);

  return { data, loading, error, refresh };
}
