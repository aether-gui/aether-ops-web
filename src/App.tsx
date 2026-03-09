import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SetupWizard from './components/wizard/SetupWizard';

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Aether WebUI</h1>
        <p className="text-gray-500">Dashboard coming soon.</p>
        <a
          href="/setup"
          className="inline-block mt-4 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
        >
          Go to Setup Wizard
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPlaceholder />} />
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
