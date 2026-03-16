import { Radio, Activity, Signal } from 'lucide-react';

export default function RAN() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Radio Access Network</h1>
        <p className="text-sm text-gray-600 mt-1">
          gNodeB instances and radio simulators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">RAN Nodes</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Active Cells</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
              <Signal className="w-5 h-5 text-intel-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Connected</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">RAN Nodes</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'gNB-01', type: 'srsRAN', cells: 2, status: 'Connected' },
            { name: 'gNB-02', type: 'srsRAN', cells: 2, status: 'Connected' },
          ].map((node) => (
            <div key={node.name} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{node.type}</p>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {node.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Active Cells</p>
                  <p className="text-lg font-semibold text-gray-900">{node.cells}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PLMN</p>
                  <p className="text-sm font-medium text-gray-900">001-01</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Frequency</p>
                  <p className="text-sm font-medium text-gray-900">3.5 GHz</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
