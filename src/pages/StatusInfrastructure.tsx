import { Server, Cpu, HardDrive, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCpu, getMemory, getDisks, getOs } from '../api/system';
import { listNodes } from '../api/nodes';
import type { CPUInfo, MemoryInfo, DiskInfo, OSInfo, ManagedNode } from '../types/api';

export default function StatusInfrastructure() {
  const [systemInfo, setSystemInfo] = useState<{
    cpu?: CPUInfo;
    memory?: MemoryInfo;
    disks?: DiskInfo;
    os?: OSInfo;
  }>({});
  const [nodes, setNodes] = useState<ManagedNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCpu().then(cpu => setSystemInfo(prev => ({ ...prev, cpu }))).catch(() => {}),
      getMemory().then(memory => setSystemInfo(prev => ({ ...prev, memory }))).catch(() => {}),
      getDisks().then(disks => setSystemInfo(prev => ({ ...prev, disks }))).catch(() => {}),
      getOs().then(os => setSystemInfo(prev => ({ ...prev, os }))).catch(() => {}),
      listNodes().then(setNodes).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  const totalDiskUsage = systemInfo.disks?.partitions.reduce((sum, p) => sum + p.usage_percent, 0) || 0;
  const avgDiskUsage = systemInfo.disks?.partitions.length
    ? totalDiskUsage / systemInfo.disks.partitions.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure Status</h1>
        <p className="text-sm text-gray-600 mt-1">
          Runtime condition of infrastructure nodes
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-intel-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Nodes</p>
                  <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-intel-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">CPU Cores</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemInfo.cpu?.physical_cores || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Memory</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemInfo.memory?.physical_usage_percent !== undefined ? `${systemInfo.memory.physical_usage_percent.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Disk</p>
                  <p className="text-2xl font-bold text-gray-900">{avgDiskUsage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">System Resources</h2>
            </div>
            <div className="p-6 space-y-4">
              {systemInfo.os && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Hostname</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.os.hostname}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Operating System</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.os.os}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Platform</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.os.platform}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kernel</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.os.kernel_version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Architecture</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.os.arch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.floor(systemInfo.os.uptime_seconds / 3600)}h {Math.floor((systemInfo.os.uptime_seconds % 3600) / 60)}m
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {systemInfo.cpu && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Model</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.cpu.model_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Physical Cores</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.cpu.physical_cores}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Logical Cores</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.cpu.logical_cores}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Frequency</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.cpu.frequency_mhz} MHz</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cache Size</p>
                      <p className="text-sm font-medium text-gray-900">{systemInfo.cpu.cache_size_kb} KB</p>
                    </div>
                  </div>
                </div>
              )}

              {systemInfo.memory && systemInfo.memory.physical_usage_percent !== undefined && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Physical Memory</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(systemInfo.memory.physical_used_bytes / 1024 / 1024 / 1024).toFixed(2)} GB / {(systemInfo.memory.physical_total_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${systemInfo.memory.physical_usage_percent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{systemInfo.memory.physical_usage_percent.toFixed(1)}% used</p>
                    </div>
                    {systemInfo.memory.swap_total_bytes > 0 && systemInfo.memory.swap_usage_percent !== undefined && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Swap Memory</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(systemInfo.memory.swap_used_bytes / 1024 / 1024 / 1024).toFixed(2)} GB / {(systemInfo.memory.swap_total_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-intel-600 h-2 rounded-full"
                            style={{ width: `${systemInfo.memory.swap_usage_percent}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{systemInfo.memory.swap_usage_percent.toFixed(1)}% used</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {systemInfo.disks && systemInfo.disks.partitions.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disk Partitions</h3>
                  <div className="space-y-3">
                    {systemInfo.disks.partitions.map((partition, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{partition.mount_point}</span>
                            <span className="text-xs text-gray-500 ml-2">({partition.device})</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {(partition.used_bytes / 1024 / 1024 / 1024).toFixed(2)} GB / {(partition.total_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${partition.usage_percent}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{partition.usage_percent.toFixed(1)}% used • {partition.fs_type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {nodes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Managed Nodes</h2>
              </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Port
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {node.port || 22}
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
