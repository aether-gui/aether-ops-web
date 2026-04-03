import { get, post } from './client';
import type { PreflightSummary, FixResult, FixAllResult } from '../types/api';

export function runPreflightChecks(options?: { nodeId?: string; scope?: 'all-nodes' }) {
  const params: Record<string, string> = {};
  if (options?.nodeId) params.node_id = options.nodeId;
  if (options?.scope) params.scope = options.scope;
  return get<PreflightSummary>('/preflight', Object.keys(params).length ? params : undefined);
}

export function runSingleCheck(id: string, nodeId?: string) {
  const params: Record<string, string> = {};
  if (nodeId) params.node_id = nodeId;
  return get<PreflightSummary>(`/preflight/${id}`, Object.keys(params).length ? params : undefined);
}

export function applyFix(id: string, nodeId?: string) {
  const path = nodeId
    ? `/preflight/${id}/fix?node_id=${encodeURIComponent(nodeId)}`
    : `/preflight/${id}/fix`;
  return post<FixResult>(path);
}

export function fixAll(nodeId?: string) {
  const path = nodeId
    ? `/preflight/fix-all?node_id=${encodeURIComponent(nodeId)}`
    : '/preflight/fix-all';
  return post<FixAllResult>(path);
}
