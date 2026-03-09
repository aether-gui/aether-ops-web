import { useState, useEffect, useRef, useCallback } from 'react';
import { getTask } from '../api/onramp';
import type { OnRampTask } from '../types/api';

interface UseTaskPollerOptions {
  intervalMs?: number;
}

export function useTaskPoller(taskId: string | null, opts: UseTaskPollerOptions = {}) {
  const { intervalMs = 1000 } = opts;
  const [task, setTask] = useState<OnRampTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const accumulatedOutput = useRef('');

  const reset = useCallback(() => {
    setTask(null);
    setError(null);
    offsetRef.current = 0;
    accumulatedOutput.current = '';
  }, []);

  useEffect(() => {
    if (!taskId) {
      reset();
      return;
    }

    offsetRef.current = 0;
    accumulatedOutput.current = '';

    let timer: ReturnType<typeof setInterval>;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getTask(taskId, offsetRef.current);
        if (cancelled) return;

        if (result.output) {
          accumulatedOutput.current += result.output;
        }
        offsetRef.current = result.output_offset;

        setTask({ ...result, output: accumulatedOutput.current });
        setError(null);

        if (result.status !== 'running' && result.status !== 'pending') {
          clearInterval(timer);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to poll task');
      }
    };

    poll();
    timer = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [taskId, intervalMs, reset]);

  return { task, error, reset };
}
