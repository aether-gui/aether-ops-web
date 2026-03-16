import { Activity, Server, Radio, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listNodes } from '../api/nodes';
import { listComponentStates } from '../api/onramp';
import { getCpu, getMemory, getOs } from '../api/system';
import type { ManagedNode, ComponentStateItem, CPUInfo, MemoryInfo, OSInfo } from '../types/api';

export default function Overview() {
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [components, setComponents] = useState<ComponentStateItem[]>([]);
  const [systemInfo, setSystemInfo] = useState<{ cpu?: CPUInfo; memory?: MemoryInfo; os?: OSInfo }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listNodes().then(setNodes).catch(() => []),
      listComponentStates().then(c => setComponents(c || [])).catch(() => []),
      getCpu().then(cpu => setSystemInfo(prev => ({ ...prev, cpu }))).catch(() => {}),
      getMemory().then(memory => setSystemInfo(prev => ({ ...prev, memory }))).catch(() => {}),
      getOs().then(os => setSystemInfo(prev => ({ ...prev, os }))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const coreComponents = components.filter(c =>
    ['5gc', 'sd-core', 'amf', 'smf', 'upf', 'nrf', 'ausf', 'udm', 'udr', 'pcf'].some(name =>
      c.component.toLowerCase().includes(name)
    )
  );

  const ranNodes = nodes.filter(n => n.roles?.includes('gnb'));
  const healthyComponents = components.filter(c => c.state === 'running' || c.state === 'installed').length;
  const totalComponents = components.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          High-level summary of your deployment status
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-intel-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    healthyComponents > 0 ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <CheckCircle className={`w-5 h-5 ${
                      healthyComponents > 0 ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Components</p>
                    <p className="text-lg font-bold text-gray-900">{healthyComponents}/{totalComponents}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-intel-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Core Components</p>
                    <p className="text-lg font-bold text-gray-900">{coreComponents.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Radio className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">RAN Nodes</p>
                    <p className="text-lg font-bold text-gray-900">{ranNodes.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Connected UEs</p>
                    <p className="text-lg font-bold text-gray-900">N/A</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
              </div>
              <div className="p-6 space-y-4">
                {systemInfo.os && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Hostname</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemInfo.os.hostname}</span>
                  </div>
                )}
                {systemInfo.cpu && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">CPU Cores</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemInfo.cpu.physical_cores} physical / {systemInfo.cpu.logical_cores} logical</span>
                  </div>
                )}
                {systemInfo.memory && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Memory Usage</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemInfo.memory.physical_usage_percent.toFixed(1)}%</span>
                  </div>
                )}
                {systemInfo.os && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">OS</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{systemInfo.os.platform}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Component Status</h2>
              </div>
              <div className="p-6 space-y-4">
                {components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No components deployed</p>
                    <p className="text-xs text-gray-400 mt-1">Run the setup wizard to get started</p>
                  </div>
                ) : (
                  components.slice(0, 5).map((comp) => (
                    <div key={comp.component} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{comp.component}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        comp.state === 'running' ? 'bg-green-100 text-green-700' :
                        comp.state === 'installed' ? 'bg-blue-100 text-blue-700' :
                        comp.state === 'stopped' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {comp.state}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Infrastructure Nodes</h2>
            </div>
            {nodes.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Server className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No nodes configured</p>
                  <p className="text-xs text-gray-400 mt-1">Add nodes through the setup wizard</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Node
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {nodes.map((node) => (
                      <tr key={node.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {node.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {node.address}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {node.roles?.join(', ') || 'none'}
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
