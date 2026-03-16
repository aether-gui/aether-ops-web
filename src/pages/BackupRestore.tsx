import { Database, Download, Upload, Clock } from 'lucide-react';

export default function BackupRestore() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-sm text-gray-600 mt-1">
          Core database backup and recovery operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-intel-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-intel-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Backup</h2>
              <p className="text-sm text-gray-600">Back up core database</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create a snapshot of the core database including subscriber data,
            configuration, and network state.
          </p>
          <button className="w-full px-4 py-2.5 bg-intel-600 text-white font-medium rounded-lg hover:bg-intel-700 transition-colors">
            Create Backup Now
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Restore Backup</h2>
              <p className="text-sm text-gray-600">Restore from backup</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Restore the core database from a previous backup. This will replace
            current data with the selected backup.
          </p>
          <button className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Select Backup to Restore
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Backups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Backup Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  name: 'core-db-2026-03-16-14-30',
                  date: '2026-03-16 14:30:00',
                  size: '24.5 MB',
                  type: 'Automatic',
                },
                {
                  name: 'core-db-2026-03-15-14-30',
                  date: '2026-03-15 14:30:00',
                  size: '23.8 MB',
                  type: 'Automatic',
                },
                {
                  name: 'core-db-2026-03-14-14-30',
                  date: '2026-03-14 14:30:00',
                  size: '23.2 MB',
                  type: 'Automatic',
                },
              ].map((backup) => (
                <tr key={backup.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{backup.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{backup.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button className="text-intel-600 hover:text-intel-700 font-medium">
                        Restore
                      </button>
                      <span className="text-gray-300">|</span>
                      <button className="text-gray-600 hover:text-gray-700">Download</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
