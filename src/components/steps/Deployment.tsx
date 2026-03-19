import { useMemo } from 'react';
import {
  Rocket,
  Circle,
} from 'lucide-react';
import type { DeployStep } from '../../config/deployOrder';
import { displayNameForRole } from '../../config/roles';
import type { WizardData } from '../../hooks/useWizardState';

interface DeploymentProps {
  data: WizardData;
  deploySteps: DeployStep[];
}

export default function Deployment({ data, deploySteps }: DeploymentProps) {
  const excluded = useMemo(() => new Set(data.excludedNodeIds), [data.excludedNodeIds]);
  const includedNodes = useMemo(
    () => data.nodes.filter((n) => !excluded.has(n.id)),
    [data.nodes, excluded]
  );

  if (deploySteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Rocket size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Components to Deploy</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          No roles were assigned that require deployment. Go back to assign roles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Deployment</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review the deployment plan and start installation when ready.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Deployment Summary</p>
        <div className="space-y-2">
          {includedNodes.map((node) => {
            const roles = data.roleAssignments[node.id] ?? [];
            if (roles.length === 0) return null;
            return (
              <div key={node.id} className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">{node.name}</span>
                <span className="text-gray-400">-</span>
                <div className="flex flex-wrap gap-1">
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 bg-intel-50 text-intel-700 text-xs font-medium rounded"
                    >
                      {displayNameForRole(r)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 mb-6">
        {deploySteps.map((step) => (
          <div
            key={step.component + step.action}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <Circle size={18} className="text-gray-300" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{step.label}</p>
              <p className="text-xs text-gray-500">
                {step.component}/{step.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
