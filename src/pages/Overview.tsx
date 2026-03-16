import { Activity, Server, Radio, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          High-level summary of your deployment status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Health</p>
                <p className="text-lg font-bold text-gray-900">Healthy</p>
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
                <p className="text-xs text-gray-500 uppercase font-medium">Core Instances</p>
                <p className="text-lg font-bold text-gray-900">1</p>
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
                <p className="text-lg font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Connected UEs</p>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">5G Network</span>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Kubernetes</span>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Infrastructure</span>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No recent alerts</p>
              <p className="text-xs text-gray-400 mt-1">Your deployment is running smoothly</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Infrastructure Nodes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  node-01
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  control-plane, worker
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  24%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  42%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Ready
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
