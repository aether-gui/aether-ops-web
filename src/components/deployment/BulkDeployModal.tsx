import { useState, useCallback, useRef } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle, Circle } from 'lucide-react';
import Modal from '../shared/Modal';
import { uploadBulkDeployFile, startDeployment } from '../../api/onramp';
import { DEPLOY_ORDER } from '../../config/deployOrder';
import type { BulkDeployResource } from '../../types/api';

interface BulkDeployModalProps {
  open: boolean;
  onClose: () => void;
  onDeployStarted: () => void;
}

type Phase = 'upload' | 'review' | 'deploying' | 'done';

function labelForComponent(component: string, action: string): string {
  const match = DEPLOY_ORDER.find((s) => s.component === component && s.action === action);
  return match?.label ?? `${component}/${action}`;
}

export default function BulkDeployModal({ open, onClose, onDeployStarted }: BulkDeployModalProps) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<BulkDeployResource[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setPhase('upload');
    setFile(null);
    setUploading(false);
    setError(null);
    setResources([]);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadBulkDeployFile(file);
      if (!result.valid) {
        setError(
          result.errors?.join(', ') || 'The file could not be parsed. Check the format and try again.',
        );
        return;
      }
      setResources(result.resources);
      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file]);

  const handleConfirmDeploy = useCallback(async () => {
    setPhase('deploying');
    setError(null);
    try {
      const actions = resources.map((r) => ({ component: r.component, action: r.action }));
      await startDeployment({ actions });
      setPhase('done');
      onDeployStarted();
      setTimeout(handleClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start deployment');
      setPhase('review');
    }
  }, [resources, onDeployStarted, handleClose]);

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Deployment" wide>
      <div className="space-y-4">
        {/* Upload phase */}
        {phase === 'upload' && (
          <>
            <p className="text-sm text-gray-600">
              Upload a deployment manifest file to deploy multiple resources at once.
              Supported formats: YAML, JSON.
            </p>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to select a file'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                .yaml, .yml, or .json
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".yaml,.yml,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-intel-600 rounded-lg hover:bg-intel-700 transition-colors disabled:opacity-50"
              >
                {uploading && <Loader2 size={14} className="animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload & Parse'}
              </button>
            </div>
          </>
        )}

        {/* Review phase */}
        {phase === 'review' && (
          <>
            <p className="text-sm text-gray-600">
              The following resources will be deployed. Review and confirm to proceed.
            </p>

            <div className="space-y-1">
              {resources.map((r, i) => (
                <div
                  key={`${r.component}-${r.action}-${i}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <Circle size={18} className="text-gray-300" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {labelForComponent(r.component, r.action)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.component}/{r.action}
                      {r.target_node && (
                        <span className="ml-2 text-gray-400">→ {r.target_node}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setPhase('upload');
                  setResources([]);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmDeploy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-intel-600 rounded-lg hover:bg-intel-700 transition-colors"
              >
                Deploy ({resources.length} resources)
              </button>
            </div>
          </>
        )}

        {/* Deploying phase */}
        {phase === 'deploying' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 size={32} className="text-intel-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-700">Starting deployment...</p>
          </div>
        )}

        {/* Done phase */}
        {phase === 'done' && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle size={32} className="text-emerald-500 mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Deployment started successfully.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Track progress in the deployment banner above.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
