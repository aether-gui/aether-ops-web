import { useState, useEffect, useCallback, useMemo } from 'react';
import { Server, Plus, Upload, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { listNodes } from '../api/nodes';
import { listComponentStates, executeAction } from '../api/onramp';
import { DEPLOY_ORDER } from '../config/deployOrder';
import { displayNameForRole, rolesToComponents } from '../config/roles';
import StatusBadge from '../components/shared/StatusBadge';
import UninstallConfirmModal from '../components/deployment/UninstallConfirmModal';
import DeployResourceModal from '../components/deployment/DeployResourceModal';
import BulkDeployModal from '../components/deployment/BulkDeployModal';
import type { ManagedNode, ComponentStateItem } from '../types/api';

type Variant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';

function stateToVariant(state?: string): Variant {
  switch (state) {
    case 'running':
    case 'installed':
      return 'success';
    case 'failed':
      return 'error';
    case 'installing':
    case 'uninstalling':
      return 'loading';
    case 'stopped':
      return 'warning';
    default:
      return 'neutral';
  }
}

function stateLabel(state?: string): string {
  return state?.replace('_', ' ') ?? 'not installed';
}

function labelForComponent(component: string): string {
  return DEPLOY_ORDER.find((s) => s.component === component)?.label ?? component;
}

interface NodeComponentInfo {
  component: string;
  label: string;
  state: ComponentStateItem | undefined;
}

export default function DeploymentInfrastructure() {
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [componentStates, setComponentStates] = useState<ComponentStateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [uninstallTarget, setUninstallTarget] = useState<{
    component: string;
    label: string;
  } | null>(null);
  const [uninstalling, setUninstalling] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [nodeList, states] = await Promise.all([
        listNodes(),
        listComponentStates(),
      ]);
      setNodes(nodeList ?? []);
      setComponentStates(states ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deployment data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStates = useCallback(async () => {
    try {
      const states = await listComponentStates();
      setComponentStates(states ?? []);
    } catch {
      /* silent refresh */
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll component states every 10s; refresh immediately when a deployment completes
  useEffect(() => {
    const interval = setInterval(refreshStates, 10_000);
    const onCompleted = () => {
      // Small delay to let the backend settle after the final action
      setTimeout(refreshStates, 1_000);
    };
    window.addEventListener('deployment-completed', onCompleted);
    return () => {
      clearInterval(interval);
      window.removeEventListener('deployment-completed', onCompleted);
    };
  }, [refreshStates]);

  // Build per-node component info
  const stateMap = useMemo(() => {
    const map = new Map<string, ComponentStateItem>();
    componentStates.forEach((cs) => map.set(cs.component, cs));
    return map;
  }, [componentStates]);

  const nodeComponentMap = useMemo(() => {
    const result = new Map<string, NodeComponentInfo[]>();
    for (const node of nodes) {
      const roles = node.roles ?? [];
      const components = rolesToComponents(roles);
      const infos: NodeComponentInfo[] = components.map((c) => ({
        component: c,
        label: labelForComponent(c),
        state: stateMap.get(c),
      }));
      result.set(node.id, infos);
    }
    return result;
  }, [nodes, stateMap]);

  const handleUninstall = useCallback(async () => {
    if (!uninstallTarget) return;
    setUninstalling(true);
    try {
      await executeAction(uninstallTarget.component, 'uninstall');
      setTimeout(refreshStates, 2000);
    } catch {
      /* error shown via state refresh */
    } finally {
      setUninstalling(false);
      setUninstallTarget(null);
    }
  }, [uninstallTarget, refreshStates]);

  const handleDeployStarted = useCallback(() => {
    window.dispatchEvent(new Event('deployment-started'));
    // Delay the refresh so the backend has time to register new component states
    setTimeout(refreshStates, 2_000);
  }, [refreshStates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-intel-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployment</h1>
          <p className="text-sm text-gray-600 mt-1">
            Deploy and manage 5G components across your infrastructure nodes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Bulk Deploy
          </button>
          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-intel-600 rounded-lg hover:bg-intel-700 transition-colors"
          >
            <Plus size={16} />
            Deploy Resource
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Server size={28} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Nodes Configured</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Add nodes through the setup wizard to begin deploying components.
          </p>
        </div>
      )}

      {/* Node cards */}
      {nodes.map((node) => {
        const components = nodeComponentMap.get(node.id) ?? [];
        return (
          <div key={node.id} className="bg-white rounded-lg border border-gray-200">
            {/* Node header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                  <p className="text-sm text-gray-500">{node.ansible_host}</p>
                </div>
              </div>
              {node.roles && node.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {node.roles.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 bg-intel-100 text-intel-700 text-xs font-medium rounded-full"
                    >
                      {displayNameForRole(r)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Component list */}
            <div className="p-6">
              {components.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No components assigned to this node.
                </p>
              ) : (
                <div className="space-y-3">
                  {components.map(({ component, label, state }) => {
                    const currentState = state?.status;
                    const canUninstall =
                      currentState === 'installed' ||
                      currentState === 'running' ||
                      currentState === 'stopped' ||
                      currentState === 'failed';
                    return (
                      <div
                        key={component}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <Server className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{label}</p>
                            <p className="text-xs text-gray-500">{component}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge
                            variant={stateToVariant(currentState)}
                            label={stateLabel(currentState)}
                          />
                          {canUninstall && (
                            <button
                              onClick={() => setUninstallTarget({ component, label })}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title={`Uninstall ${label}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Modals */}
      <UninstallConfirmModal
        open={uninstallTarget !== null}
        onClose={() => setUninstallTarget(null)}
        component={uninstallTarget?.component ?? ''}
        label={uninstallTarget?.label ?? ''}
        onConfirm={handleUninstall}
        loading={uninstalling}
      />

      <DeployResourceModal
        open={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        nodes={nodes}
        componentStates={componentStates}
        onDeployStarted={handleDeployStarted}
      />

      <BulkDeployModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onDeployStarted={handleDeployStarted}
      />
    </div>
  );
}
