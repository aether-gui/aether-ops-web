import { get, post, put, del } from './client';
import type { ManagedNode, NodeCreateInput, NodeUpdateInput } from '../types/api';

export function listNodes() {
  return get<ManagedNode[] | null>('/nodes');
}

export function getNode(id: string) {
  return get<ManagedNode>(`/nodes/${id}`);
}

export function createNode(input: NodeCreateInput) {
  return post<ManagedNode>('/nodes', input);
}

export function updateNode(id: string, input: NodeUpdateInput) {
  return put<ManagedNode>(`/nodes/${id}`, input);
}

export function deleteNode(id: string) {
  return del<{ message: string }>(`/nodes/${id}`);
}
