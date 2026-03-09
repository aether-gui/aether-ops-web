import { get, post } from './client';
import type { OnRampTask, Component, ComponentStateItem, InventorySyncResult } from '../types/api';

export function listComponents() {
  return get<Component[] | null>('/onramp/components');
}

export function executeAction(component: string, action: string) {
  return post<OnRampTask>(`/onramp/components/${component}/${action}`);
}

export function listTasks() {
  return get<OnRampTask[] | null>('/onramp/tasks');
}

export function getTask(id: string, offset?: number) {
  const params: Record<string, string | number> = {};
  if (offset !== undefined) params.offset = offset;
  return get<OnRampTask>(`/onramp/tasks/${id}`, params);
}

export function listComponentStates() {
  return get<ComponentStateItem[] | null>('/onramp/state');
}

export function syncInventory() {
  return post<InventorySyncResult>('/onramp/inventory/sync');
}
