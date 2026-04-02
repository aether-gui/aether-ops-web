import { Database, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listComponentStates } from '../api/onramp';
import type { ComponentStateItem } from '../types/api';

export default function Core() {
  const [components, setComponents] = useState<ComponentStateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComponentStates()
      .then(c => setComponents(c || []))
      .catch(() => [])
      .finally(() => setLoading(false));
  }, []);

  const coreComponents = components.filter(c =>
    ['5gc', 'sd-core', 'amf', 'smf', 'upf', 'nrf', 'ausf', 'udm', 'udr', 'pcf'].some(name =>
      c.component.toLowerCase().includes(name)
    )
  );

  const runningCount = coreComponents.filter(c => c.status === 'running').length;
  const totalCount = coreComponents.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">5G Core</h1>
        <p className="text-sm text-gray-600 mt-1">
          Core network components and configuration
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-intel-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-intel-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Total Components</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  runningCount > 0 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    runningCount > 0 ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Running</p>
                  <p className="text-2xl font-bold text-gray-900">{runningCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  runningCount === totalCount && totalCount > 0 ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Activity className={`w-5 h-5 ${
                    runningCount === totalCount && totalCount > 0 ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                  <p className={`text-lg font-semibold ${
                    runningCount === totalCount && totalCount > 0 ? 'text-green-600' :
                    runningCount > 0 ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {runningCount === totalCount && totalCount > 0 ? 'Operational' :
                     runningCount > 0 ? 'Partial' : 'Stopped'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Core Components</h2>
            </div>
            {coreComponents.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No core components deployed</p>
                  <p className="text-xs text-gray-400 mt-1">Deploy 5G core through the setup wizard or deployment page</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Component
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coreComponents.map((comp) => (
                      <tr key={comp.component} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {comp.component}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comp.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            comp.status === 'running' ? 'bg-green-100 text-green-700' :
                            comp.status === 'installed' ? 'bg-blue-100 text-blue-700' :
                            comp.status === 'stopped' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {comp.status === 'running' ? 'Running' :
                             comp.status === 'installed' ? 'Installed' :
                             comp.status === 'stopped' ? 'Stopped' : 'Error'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
