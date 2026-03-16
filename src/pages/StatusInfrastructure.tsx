import { Server, Cpu, HardDrive, CheckCircle } from 'lucide-react';

export default function StatusInfrastructure() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Infrastructure Status</h1>
        <p className="text-sm text-gray-600 mt-1">
          Runtime condition of infrastructure nodes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Nodes Online</p>
              <p className="text-2xl font-bold text-gray-900">3/3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-intel-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-intel-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Avg CPU</p>
              <p className="text-2xl font-bold text-gray-900">21%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Avg Memory</p>
              <p className="text-2xl font-bold text-gray-900">38%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Health</p>
              <p className="text-lg font-semibold text-green-600">Good</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Node Health</h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'node-01', cpu: 24, memory: 42, disk: 38, network: 'Good' },
            { name: 'node-02', cpu: 18, memory: 35, disk: 42, network: 'Good' },
            { name: 'node-03', cpu: 22, memory: 38, disk: 35, network: 'Good' },
          ].map((node) => (
            <div key={node.name} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Healthy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">CPU Usage</span>
                    <span className="text-xs font-medium text-gray-900">{node.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-intel-600 h-2 rounded-full"
                      style={{ width: `${node.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Memory Usage</span>
                    <span className="text-xs font-medium text-gray-900">{node.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${node.memory}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Disk Usage</span>
                    <span className="text-xs font-medium text-gray-900">{node.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${node.disk}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Network</span>
                    <span className="text-xs font-medium text-gray-900">{node.network}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
