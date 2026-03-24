import { Activity, Server, Radio, Users, AlertCircle, CheckCircle, Loader2, Clock, MemoryStick } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { listNodes } from '../api/nodes';
import { listComponentStates } from '../api/onramp';
import { getProviders } from '../api/meta';
import { getCpu, getMemory, getOs } from '../api/system';
import { useMetricsHistory } from '../hooks/useMetricsHistory';
import type { ManagedNode, ComponentStateItem, CPUInfo, MemoryInfo, OSInfo, ProvidersInfo } from '../types/api';

function Sparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (data.length < 2) return null;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const fill = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={fill} fill={color} fillOpacity={0.15} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const HIDDEN_COMPONENTS = new Set(['4gc', 'amp']);

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(' ');
}

function formatOsString(os: OSInfo): string {
  const name = os.platform.charAt(0).toUpperCase() + os.platform.slice(1);
  const ver = os.platform_version ? ` ${os.platform_version}` : '';
  const kernel = os.kernel_version ? `${os.os} ${os.kernel_version}` : os.os;
  const arch = os.kernel_arch || '';
  const details = [kernel, arch].filter(Boolean).join(', ');
  return details ? `${name}${ver} (${details})` : `${name}${ver}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function deriveWebuiState(providers: ProvidersInfo | null): string {
  if (!providers) return 'unknown';
  const degraded = providers.providers.some(p => p.degraded);
  return degraded ? 'degraded' : 'running';
}

export default function Overview() {
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [rawComponents, setRawComponents] = useState<ComponentStateItem[]>([]);
  const [providers, setProviders] = useState<ProvidersInfo | null>(null);
  const [systemInfo, setSystemInfo] = useState<{ cpu?: CPUInfo; memory?: MemoryInfo; os?: OSInfo }>({});
  const [loading, setLoading] = useState(true);
  const { cpuHistory, memoryHistory } = useMetricsHistory();

  useEffect(() => {
    Promise.all([
      listNodes().then(n => setNodes(n || [])).catch(() => []),
      listComponentStates().then(c => setRawComponents(c || [])).catch(() => []),
      getProviders().then(setProviders).catch(() => null),
      getCpu().then(cpu => setSystemInfo(prev => ({ ...prev, cpu }))).catch(() => {}),
      getMemory().then(memory => setSystemInfo(prev => ({ ...prev, memory }))).catch(() => {}),
      getOs().then(os => setSystemInfo(prev => ({ ...prev, os }))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const components = useMemo(() => {
    const filtered = rawComponents.filter(
      c => !HIDDEN_COMPONENTS.has(c.component.toLowerCase()),
    );
    const webuiState = deriveWebuiState(providers);
    const webuiEntry: ComponentStateItem = {
      component: 'WebUI',
      state: webuiState,
      status: webuiState,
    };
    return [webuiEntry, ...filtered];
  }, [rawComponents, providers]);

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
                <h2 className="text-lg font-semibold text-gray-900">WebUI Host</h2>
                <p className="text-xs text-gray-500 mt-0.5">System information for the host running this WebUI instance</p>
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
                {systemInfo.os && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">OS</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatOsString(systemInfo.os)}</span>
                  </div>
                )}
                {systemInfo.cpu && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">CPU</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {systemInfo.cpu.physical_cores} physical / {systemInfo.cpu.logical_cores} logical
                      </span>
                      {cpuHistory.length > 1 && (
                        <Sparkline data={cpuHistory} color="#3b82f6" />
                      )}
                    </div>
                  </div>
                )}
                {systemInfo.memory && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MemoryStick className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Memory</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatBytes(systemInfo.memory.used_bytes)} / {formatBytes(systemInfo.memory.total_bytes)} ({systemInfo.memory.usage_percent.toFixed(1)}%)
                      </span>
                      {memoryHistory.length > 1 && (
                        <Sparkline data={memoryHistory} color="#10b981" />
                      )}
                    </div>
                  </div>
                )}
                {systemInfo.os && systemInfo.os.uptime_seconds > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">Uptime</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatUptime(systemInfo.os.uptime_seconds)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
              </div>
              <div className="p-6 space-y-4">
                {components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No components deployed</p>
                    <p className="text-xs text-gray-400 mt-1">Run the setup wizard to get started</p>
                  </div>
                ) : (
                  components.slice(0, 6).map((comp) => (
                    <div key={comp.component} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{comp.component}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        comp.state === 'running' ? 'bg-green-100 text-green-700' :
                        comp.state === 'installed' ? 'bg-blue-100 text-blue-700' :
                        comp.state === 'degraded' ? 'bg-amber-100 text-amber-700' :
                        comp.state === 'stopped' ? 'bg-gray-100 text-gray-700' :
                        comp.state === 'unknown' ? 'bg-gray-100 text-gray-500' :
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
