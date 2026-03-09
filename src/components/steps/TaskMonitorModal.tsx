import { useMemo } from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import Modal from '../shared/Modal';
import TerminalOutput from '../shared/TerminalOutput';
import type { OnRampTask } from '../../types/api';

interface TaskMonitorModalProps {
  open: boolean;
  onClose: () => void;
  task: OnRampTask | null;
  error: string | null;
  label: string;
}

export default function TaskMonitorModal({ open, onClose, task, error, label }: TaskMonitorModalProps) {
  const statusDisplay = useMemo(() => {
    if (error) return { icon: XCircle, color: 'text-red-500', text: 'Error' };
    if (!task) return { icon: Loader2, color: 'text-sky-500', text: 'Starting...' };
    switch (task.status) {
      case 'running':
        return { icon: Loader2, color: 'text-sky-500', text: 'Running' };
      case 'succeeded':
        return { icon: CheckCircle, color: 'text-emerald-500', text: 'Succeeded' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', text: 'Failed' };
      default:
        return { icon: Clock, color: 'text-gray-400', text: task.status };
    }
  }, [task, error]);

  const elapsed = useMemo(() => {
    if (!task?.started_at) return '';
    const start = new Date(task.started_at).getTime();
    const end = task.finished_at ? new Date(task.finished_at).getTime() : Date.now();
    const seconds = Math.floor((end - start) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }, [task]);

  const Icon = statusDisplay.icon;
  const isRunning = task?.status === 'running' || task?.status === 'pending';

  return (
    <Modal open={open} onClose={onClose} title={label} wide>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              size={18}
              className={`${statusDisplay.color} ${isRunning ? 'animate-spin' : ''}`}
            />
            <span className="text-sm font-medium text-gray-700">{statusDisplay.text}</span>
          </div>
          {elapsed && (
            <span className="text-xs text-gray-400 tabular-nums">{elapsed}</span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {task?.exit_code !== undefined && task.exit_code !== 0 && task.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            Process exited with code {task.exit_code}
          </div>
        )}

        <TerminalOutput output={task?.output ?? ''} className="h-80" />
      </div>
    </Modal>
  );
}
