import { useState, useEffect, useCallback } from 'react';
import { getDeployment } from '../api/onramp';
import type { Deployment, DeploymentStatus } from '../types/api';

const TERMINAL: Set<DeploymentStatus> = new Set(['succeeded', 'failed', 'canceled']);

interface UseDeploymentPollerOptions {
  intervalMs?: number;
}

export function useDeploymentPoller(
  deploymentId: string | null,
  opts: UseDeploymentPollerOptions = {},
) {
  const { intervalMs = 1500 } = opts;
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setDeployment(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!deploymentId) {
      reset();
      return;
    }

    let timer: ReturnType<typeof setInterval>;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await getDeployment(deploymentId);
        if (cancelled) return;
        setDeployment(result);
        setError(null);
        if (TERMINAL.has(result.status)) {
          clearInterval(timer);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to poll deployment');
      }
    };

    poll();
    timer = setInterval(poll, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [deploymentId, intervalMs, reset]);

  return { deployment, error, reset };
}
