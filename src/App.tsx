import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SetupWizard from './components/wizard/SetupWizard';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Overview from './pages/Overview';
import DeploymentInfrastructure from './pages/DeploymentInfrastructure';
import Core from './pages/Core';
import RAN from './pages/RAN';
import UEs from './pages/UEs';
import BackupRestore from './pages/BackupRestore';
import StatusNetwork from './pages/StatusNetwork';
import StatusKubernetes from './pages/StatusKubernetes';
import StatusInfrastructure from './pages/StatusInfrastructure';
import StatusSecurity from './pages/StatusSecurity';
import VersionIndicator from './components/shared/VersionIndicator';
import { getWizardState, getFirstIncompleteStep } from './api/wizard';
import { Loader2 } from 'lucide-react';


function AppRoutes() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [initialStep, setInitialStep] = useState(0);

  useEffect(() => {
    getWizardState()
      .then((state) => {
        if (!state.completed && !state.active_task) {
          const step = getFirstIncompleteStep(state);
          setInitialStep(step);
          navigate('/setup', { replace: true });
        }
        setStatus('ready');
      })
      .catch(() => {
        navigate('/setup', { replace: true });
        setStatus('ready');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={28} className="text-intel-600 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/setup" element={<SetupWizard initialStep={initialStep} />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="deployment" element={<DeploymentInfrastructure />} />
        <Route path="5g/core" element={<Core />} />
        <Route path="5g/ran" element={<RAN />} />
        <Route path="5g/ues" element={<UEs />} />
        <Route path="operations/backup" element={<BackupRestore />} />
        <Route path="status/network" element={<StatusNetwork />} />
        <Route path="status/kubernetes" element={<StatusKubernetes />} />
        <Route path="status/infrastructure" element={<StatusInfrastructure />} />
        <Route path="status/security" element={<StatusSecurity />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <VersionIndicator />
    </BrowserRouter>
  );
}
