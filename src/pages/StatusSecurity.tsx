import { Shield, CheckCircle, AlertCircle, Server } from 'lucide-react';

export default function StatusSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Status</h1>
        <p className="text-sm text-gray-600 mt-1">
          Runtime security and confidential computing posture
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">TDX Capable</p>
              <p className="text-2xl font-bold text-gray-900">3/3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-intel-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Protected Containers</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Attestation</p>
              <p className="text-lg font-semibold text-green-600">Valid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Intel TDX Status</h2>
        </div>
        <div className="p-6 space-y-3">
          {['node-01', 'node-02', 'node-03'].map((node) => (
            <div key={node} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{node}</p>
                  <p className="text-xs text-gray-500">Intel Xeon with TDX Support</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                TDX Enabled
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Confidential Containers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Namespace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attestation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'amf-0', namespace: 'sdcore', node: 'node-01' },
                { name: 'smf-0', namespace: 'sdcore', node: 'node-02' },
                { name: 'upf-0', namespace: 'sdcore', node: 'node-03' },
                { name: 'nrf-0', namespace: 'sdcore', node: 'node-01' },
              ].map((container) => (
                <tr key={container.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {container.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {container.namespace}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {container.node}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      TDX Protected
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Valid</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Confidential Computing Active</p>
            <p className="text-blue-800">
              Intel TDX provides hardware-based memory encryption and isolation for containers,
              protecting sensitive workloads from unauthorized access at the infrastructure layer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
