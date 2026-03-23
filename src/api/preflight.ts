import { get, post } from './client';
import type { PreflightSummary, FixResult } from '../types/api';

export function runPreflightChecks() {
  return get<PreflightSummary>('/preflight');
}

export function runNodePreflightChecks(nodeId: string) {
  return get<PreflightSummary>(`/preflight?node_id=${encodeURIComponent(nodeId)}`);
}

export function runAllNodesPreflightChecks() {
  return get<PreflightSummary>('/preflight?scope=all-nodes');
}

export function runSingleCheck(id: string) {
  return get<PreflightSummary>(`/preflight/${id}`);
}

export function applyFix(id: string) {
  return post<FixResult>(`/preflight/${id}/fix`);
}

export function applyNodeFix(nodeId: string, checkId: string) {
  return post<FixResult>(`/preflight/${checkId}/fix?node_id=${encodeURIComponent(nodeId)}`);
}
