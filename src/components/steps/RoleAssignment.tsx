import { useCallback, useMemo } from 'react';
import { Server, Monitor, AlertCircle } from 'lucide-react';
import { VISIBLE_ROLES, displayNameForRole } from '../../config/roles';
import { updateNode } from '../../api/nodes';
import type { WizardData } from '../../hooks/useWizardState';
import type { ManagedNode } from '../../types/api';

interface RoleAssignmentProps {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

export default function RoleAssignment({ data, update }: RoleAssignmentProps) {
  const assignments = data.roleAssignments;
  const excluded = new Set(data.excludedNodeIds);
  const includedNodes = data.nodes.filter((n) => !excluded.has(n.id));

  const allAssignedRoles = useMemo(() => {
    return includedNodes.flatMap((n) => assignments[n.id] ?? []);
  }, [assignments, includedNodes]);

  const hasSdCore = allAssignedRoles.includes('master');

  const getNodeRoles = (nodeId: string): string[] => {
    return assignments[nodeId] ?? [];
  };

  const toggleRole = useCallback(
    async (node: ManagedNode, roleApi: string) => {
      const current = assignments[node.id] ?? [];
      const next = current.includes(roleApi)
        ? current.filter((r) => r !== roleApi)
        : [...current, roleApi];

      const updated = { ...assignments, [node.id]: next };
      update({ roleAssignments: updated });

      try {
        await updateNode(node.id, { roles: next.length > 0 ? next : null });
      } catch {
        update({ roleAssignments: assignments });
      }
    },
    [assignments, update]
  );

  const isLocalhost = (n: ManagedNode) =>
    n.ansible_host === '127.0.0.1' || n.ansible_host === 'localhost';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Assign Roles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose which components each node will run. At least one node must have the SD-Core role to
          deploy the 5G core network.
        </p>
      </div>

      {!hasSdCore && allAssignedRoles.length === 0 && (
        <div className="flex items-start gap-3 mb-5 p-3 rounded-lg bg-sky-50 border border-sky-100">
          <AlertCircle size={18} className="text-sky-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-sky-700">
            No roles assigned. You can skip deployment and proceed to the dashboard, or assign roles
            below to deploy components.
          </p>
        </div>
      )}

      {allAssignedRoles.length > 0 && !hasSdCore && (
        <div className="flex items-start gap-3 mb-5 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            The SD-Core role must be assigned to at least one node before deployment.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {includedNodes.map((node) => {
          const nodeRoles = getNodeRoles(node.id);
          return (
            <div
              key={node.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  {isLocalhost(node) ? (
                    <Monitor size={16} className="text-gray-500" />
                  ) : (
                    <Server size={16} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{node.name}</p>
                    {isLocalhost(node) && (
                      <span className="px-1.5 py-0.5 bg-intel-50 text-intel-700 text-[10px] font-medium rounded">
                        LOCAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{node.ansible_host}</p>
                </div>
                {nodeRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {nodeRoles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 bg-intel-50 text-intel-700 text-xs font-medium rounded-md"
                      >
                        {displayNameForRole(r)}
                      </span>
                    ))}
                  </div>
                )}
                {nodeRoles.length === 0 && (
                  <span className="text-xs text-gray-400">No roles</span>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VISIBLE_ROLES.map((role) => {
                    const active = nodeRoles.includes(role.apiValue);
                    return (
                      <button
                        key={role.apiValue}
                        onClick={() => toggleRole(node, role.apiValue)}
                        className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                          active
                            ? 'border-intel-300 bg-intel-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            active ? 'text-intel-700' : 'text-gray-700'
                          }`}
                        >
                          {role.displayName}
                        </span>
                        <span className="text-[11px] text-gray-500 leading-snug mt-0.5">
                          {role.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
