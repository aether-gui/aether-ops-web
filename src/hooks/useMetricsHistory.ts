import { useEffect, useRef, useState } from 'react';
import { getMetrics } from '../api/system';

interface DataPoint {
  time: string;
  value: number;
}

interface MetricsHistory {
  cpuHistory: DataPoint[];
  memoryHistory: DataPoint[];
  loading: boolean;
}

const POLL_INTERVAL_MS = 60_000;

function toPoints(series: { points: { timestamp: string; value: number }[] | null }[] | undefined): DataPoint[] {
  if (!series || series.length === 0) return [];
  const points = series[0].points;
  if (!points) return [];
  return points.map(p => ({ time: p.timestamp, value: p.value }));
}

export function useMetricsHistory(): MetricsHistory {
  const [cpuHistory, setCpuHistory] = useState<DataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    function fetchMetrics() {
      const from = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      Promise.all([
        getMetrics({ metric: 'system.cpu.usage_percent', from, to, labels: 'cpu=total', aggregation: '1m' })
          .then(r => setCpuHistory(toPoints(r.series)))
          .catch(() => {}),
        getMetrics({ metric: 'system.memory.usage_percent', from, to, aggregation: '1m' })
          .then(r => setMemoryHistory(toPoints(r.series)))
          .catch(() => {}),
      ]).finally(() => setLoading(false));
    }

    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { cpuHistory, memoryHistory, loading };
}
