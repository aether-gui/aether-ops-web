import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../shared/Modal';

interface UninstallConfirmModalProps {
  open: boolean;
  onClose: () => void;
  component: string;
  label: string;
  onConfirm: () => void;
  loading: boolean;
}

export default function UninstallConfirmModal({
  open,
  onClose,
  component,
  label,
  onConfirm,
  loading,
}: UninstallConfirmModalProps) {
  const isK8s = component === 'k8s';

  return (
    <Modal open={open} onClose={onClose} title={`Uninstall ${label}`}>
      <div className="space-y-4">
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">This action cannot be easily undone.</p>
            <p>
              Uninstalling <strong>{label}</strong> will remove the component and all
              associated resources from the cluster.
            </p>
            {isK8s && (
              <p className="mt-2 font-medium text-red-700">
                Warning: Removing Kubernetes will affect all other deployed components
                that depend on it. You should uninstall other components first.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Uninstalling...' : 'Uninstall'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
