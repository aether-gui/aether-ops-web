import { Radio, Activity, Signal, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listNodes } from '../api/nodes';
import { listComponentStates } from '../api/onramp';
import type { ManagedNode, ComponentStateItem } from '../types/api';

export default function RAN() {
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [components, setComponents] = useState<ComponentStateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listNodes().then(setNodes).catch(() => []),
      listComponentStates().then(c => setComponents(c || [])).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  const ranNodes = nodes.filter(n => n.roles?.includes('gnb'));
  const ranComponents = components.filter(c =>
    ['ran', 'gnb', 'srs', 'ueransim'].some(name =>
      c.component.toLowerCase().includes(name)
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Radio Access Network</h1>
        <p className="text-sm text-gray-600 mt-1">
          gNodeB instances and radio simulators
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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">RAN Nodes</p>
                  <p className="text-2xl font-bold text-gray-900">{ranNodes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">RAN Components</p>
                  <p className="text-2xl font-bold text-gray-900">{ranComponents.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Signal className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Active Cells</p>
                  <p className="text-2xl font-bold text-gray-900">N/A</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">RAN Nodes</h2>
            </div>
            {ranNodes.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No RAN nodes configured</p>
                  <p className="text-xs text-gray-400 mt-1">Add nodes with the gnb role through the setup wizard</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {ranNodes.map((node) => (
                  <div key={node.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{node.address}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Configured
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Node ID</p>
                        <p className="text-sm font-medium text-gray-900">{node.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Roles</p>
                        <p className="text-sm font-medium text-gray-900">{node.roles?.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Port</p>
                        <p className="text-sm font-medium text-gray-900">{node.port || 22}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {ranComponents.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">RAN Components</h2>
              </div>
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
                    {ranComponents.map((comp) => (
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
