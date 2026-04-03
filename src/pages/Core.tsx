import { Database, Activity, Loader2, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import type { DashboardComponent } from '../types/api';

type RuntimeStatus = 'running' | 'degraded' | 'error' | 'installing' | 'absent' | 'unknown';

function deriveRuntimeStatus(comp: DashboardComponent): RuntimeStatus {
  if (comp.status === 'installing' || comp.status === 'uninstalling') return 'installing';
  const probe = comp.probe_result;
  if (!probe) {
    if (comp.status === 'not_installed') return 'absent';
    return 'unknown';
  }
  if (probe.status === 'not_installed') return 'absent';
  if (probe.status === 'degraded') return 'degraded';
  if (probe.status === 'installed' && probe.healthy) return 'running';
  if (probe.status === 'installed' && !probe.healthy) return 'error';
  return 'unknown';
}

function statusLabel(status: RuntimeStatus): string {
  switch (status) {
    case 'running': return 'Running';
    case 'degraded': return 'Degraded';
    case 'error': return 'Error';
    case 'installing': return 'Installing';
    case 'absent': return 'Absent';
    default: return 'Unknown';
  }
}

function statusBadgeClass(status: RuntimeStatus): string {
  switch (status) {
    case 'running': return 'bg-green-100 text-green-700';
    case 'degraded': return 'bg-amber-100 text-amber-700';
    case 'error': return 'bg-red-100 text-red-700';
    case 'installing': return 'bg-blue-100 text-blue-700';
    case 'absent': return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100 text-gray-500';
  }
}

export default function Core() {
  const { data: dashboard, loading } = useDashboard();

  const coreComponents = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.components
      .filter(c =>
        ['5gc', 'sd-core', 'amf', 'smf', 'upf', 'nrf', 'ausf', 'udm', 'udr', 'pcf'].some(name =>
          c.name.toLowerCase().includes(name)
        )
      )
      .map(c => ({
        ...c,
        runtimeStatus: deriveRuntimeStatus(c),
      }));
  }, [dashboard]);

  const runningCount = coreComponents.filter(c => c.runtimeStatus === 'running').length;
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
                        Health
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {coreComponents.map((comp) => (
                      <tr key={comp.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comp.name}</p>
                            {comp.probe_result?.message && (
                              <p className="text-xs text-gray-500">{comp.probe_result.message}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {comp.probe_result?.healthy ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Healthy
                            </span>
                          ) : comp.runtimeStatus === 'absent' ? (
                            <span className="text-gray-400">--</span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Unhealthy
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusBadgeClass(comp.runtimeStatus)}`}>
                            {statusLabel(comp.runtimeStatus)}
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
