import { useState, useMemo, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Modal from '../shared/Modal';
import { DEPLOY_ORDER } from '../../config/deployOrder';
import { syncInventory, startDeployment } from '../../api/onramp';
import type { ManagedNode, ComponentStateItem } from '../../types/api';

interface DeployResourceModalProps {
  open: boolean;
  onClose: () => void;
  nodes: ManagedNode[];
  componentStates: ComponentStateItem[];
  onDeployStarted: () => void;
}

export default function DeployResourceModal({
  open,
  onClose,
  nodes,
  componentStates,
  onDeployStarted,
}: DeployResourceModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allNodeRoles = useMemo(() => {
    const roles = new Set<string>();
    nodes.forEach((n) => n.roles?.forEach((r) => roles.add(r)));
    return roles;
  }, [nodes]);

  const stateMap = useMemo(() => {
    const map = new Map<string, string>();
    componentStates.forEach((cs) => map.set(cs.component, cs.status));
    return map;
  }, [componentStates]);

  const deployOptions = useMemo(
    () =>
      DEPLOY_ORDER.map((step) => {
        const currentState = stateMap.get(step.component);
        const alreadyDeployed =
          currentState === 'installed' ||
          currentState === 'running' ||
          currentState === 'installing';
        const hasRequiredRole = allNodeRoles.has(step.requiredRole);
        return { ...step, alreadyDeployed, hasRequiredRole, currentState };
      }),
    [stateMap, allNodeRoles],
  );

  const toggle = useCallback((component: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(component)) next.delete(component);
      else next.add(component);
      return next;
    });
  }, []);

  const handleDeploy = useCallback(async () => {
    if (selected.size === 0) return;
    setDeploying(true);
    setError(null);
    try {
      try {
        await syncInventory();
      } catch {
        /* best effort */
      }
      const actions = DEPLOY_ORDER.filter((s) => selected.has(s.component)).map((s) => ({
        component: s.component,
        action: s.action,
      }));
      await startDeployment({ actions });
      onDeployStarted();
      setSelected(new Set());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start deployment');
    } finally {
      setDeploying(false);
    }
  }, [selected, onDeployStarted, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Deploy Resources" wide>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select the components to deploy. Components are deployed in the correct order automatically.
        </p>

        <div className="space-y-2">
          {deployOptions.map((opt) => {
            const disabled = opt.alreadyDeployed || !opt.hasRequiredRole || deploying;
            const checked = selected.has(opt.component);
            return (
              <label
                key={opt.component}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  disabled
                    ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                    : checked
                      ? 'bg-intel-50 border-intel-200 cursor-pointer'
                      : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(opt.component)}
                  className="w-4 h-4 rounded border-gray-300 text-intel-600 focus:ring-intel-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-500">
                    {opt.component}/{opt.action}
                    {opt.alreadyDeployed && (
                      <span className="ml-2 text-emerald-600">Already deployed</span>
                    )}
                    {!opt.hasRequiredRole && !opt.alreadyDeployed && (
                      <span className="ml-2 text-amber-600">
                        No node with required role ({opt.requiredRole})
                      </span>
                    )}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={deploying}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            disabled={selected.size === 0 || deploying}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-intel-600 rounded-lg hover:bg-intel-700 transition-colors disabled:opacity-50"
          >
            {deploying && <Loader2 size={14} className="animate-spin" />}
            {deploying ? 'Starting...' : `Deploy ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
