import { Radio, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusNetwork() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">5G Network Status</h1>
        <p className="text-sm text-gray-600 mt-1">
          Operational condition of 5G services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Core Health</p>
              <p className="text-lg font-semibold text-green-600">Healthy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">gNB Connected</p>
              <p className="text-2xl font-bold text-gray-900">2/2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Active UEs</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Core Services</h2>
          </div>
          <div className="p-6 space-y-3">
            {['AMF', 'SMF', 'UPF', 'NRF', 'AUSF', 'UDM', 'UDR', 'PCF'].map((service) => (
              <div key={service} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{service}</span>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Running
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">RAN Connectivity</h2>
          </div>
          <div className="p-6 space-y-3">
            {['gNB-01', 'gNB-02'].map((gnb) => (
              <div key={gnb} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">{gnb}</span>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No recent network activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
