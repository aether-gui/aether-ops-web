import { get, post } from './client';
import type { PreflightSummary, FixResult } from '../types/api';

export function runPreflightChecks() {
  return get<PreflightSummary>('/preflight');
}

export function runSingleCheck(id: string) {
  return get<PreflightSummary>(`/preflight/${id}`);
}

export function applyFix(id: string) {
  return post<FixResult>(`/preflight/${id}/fix`);
}
