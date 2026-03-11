import { useState } from 'react';
import { Info } from 'lucide-react';

export default function VersionIndicator() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-300 text-xs rounded-md hover:bg-gray-700 transition-colors shadow-lg"
        title="Version information"
      >
        <Info size={12} />
        <span className="font-mono">{__APP_VERSION__}</span>
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-gray-300 text-xs rounded-md shadow-xl p-3 min-w-64">
            <div className="space-y-2">
              <div>
                <div className="text-gray-400 mb-1">Version</div>
                <div className="font-mono">{__APP_VERSION__}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Build Time</div>
                <div className="font-mono">{new Date(__BUILD_TIME__).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
