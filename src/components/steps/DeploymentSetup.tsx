import { useState } from 'react';
import type { WizardData } from '../../hooks/useWizardState';

interface DeploymentSetupProps {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

export default function DeploymentSetup({ data, update }: DeploymentSetupProps) {
  const [deploymentName, setDeploymentName] = useState(data.deploymentName || '');
  const [error, setError] = useState('');

  const handleNameChange = (value: string) => {
    setDeploymentName(value);
    setError('');

    if (value.trim().length >= 3) {
      update({ deploymentName: value.trim() });
    } else {
      update({ deploymentName: '' });
    }
  };

  const handleBlur = () => {
    if (deploymentName.trim().length > 0 && deploymentName.trim().length < 3) {
      setError('Deployment name must be at least 3 characters');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Create Deployment
        </h2>
        <p className="text-sm text-gray-600">
          A Deployment represents your private 5G environment. It contains all the components
          and configuration required to operate your network.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Most users operate a single Deployment</p>
            <p className="text-blue-800">
              The system supports multiple deployments, but typically one deployment
              is sufficient for managing your private 5G network.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="deployment-name" className="block text-sm font-medium text-gray-700 mb-2">
            Deployment Name
          </label>
          <input
            id="deployment-name"
            type="text"
            value={deploymentName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="e.g., Production, Lab Environment, Campus Network"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-offset-0 outline-none transition-colors ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-intel-500 focus:ring-intel-200'
            }`}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          {!error && deploymentName.trim().length >= 3 && (
            <p className="mt-2 text-sm text-green-600">✓ Valid deployment name</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-intel-600 font-bold">•</span>
              <span>Your deployment will be created with the specified name</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-intel-600 font-bold">•</span>
              <span>The system will switch to operate within this deployment context</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-intel-600 font-bold">•</span>
              <span>Remaining setup steps will configure components inside this deployment</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
