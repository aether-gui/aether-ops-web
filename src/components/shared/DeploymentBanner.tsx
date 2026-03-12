import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Circle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Rocket,
} from 'lucide-react';
import { getWizardState } from '../../api/wizard';
import { listNodes } from '../../api/nodes';
import { executeAction } from '../../api/onramp';
import { useTaskPoller } from '../../hooks/useTaskPoller';
import { getDeployStepsForRoles, type DeployStep } from '../../config/deployOrder';
import TaskMonitorModal from '../steps/TaskMonitorModal';

type StepStatus = 'pending' | 'running' | 'succeeded' | 'failed';
type BannerState = 'loading' | 'idle' | 'running' | 'succeeded' | 'failed';

export default function DeploymentBanner() {
  const [bannerState, setBannerState] = useState<BannerState>('loading');
  const [expanded, setExpanded] = useState(false);
  const [deploySteps, setDeploySteps] = useState<DeployStep[]>([]);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [showMonitor, setShowMonitor] = useState(false);
  const [monitorLabel, setMonitorLabel] = useState('');
  const runningRef = useRef(false);

  const { task, error: taskError, reset: resetPoller } = useTaskPoller(currentTaskId);

  // Bootstrap: check wizard state for an active task
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const state = await getWizardState();
        if (!state.active_task || cancelled) {
          setBannerState('idle');
          return;
        }

        const nodes = (await listNodes()) ?? [];
        const allRoles = [...new Set(nodes.flatMap((n) => n.roles ?? []))];
        const steps = getDeployStepsForRoles(allRoles);

        if (steps.length === 0 || cancelled) {
          setBannerState('idle');
          return;
        }

        const activeTask = state.active_task;
        const idx = steps.findIndex(
          (s) => s.component === activeTask.component && s.action === activeTask.action
        );

        const statuses: StepStatus[] = steps.map((_, i) => {
          if (i < idx) return 'succeeded';
          if (i === idx) return 'running';
          return 'pending';
        });

        setDeploySteps(steps);
        setStepStatuses(statuses);
        setCurrentStepIdx(idx >= 0 ? idx : 0);
        setMonitorLabel(idx >= 0 ? steps[idx].label : steps[0].label);
        setCurrentTaskId(activeTask.id);
        runningRef.current = true;
        setBannerState('running');
      } catch {
        setBannerState('idle');
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const advanceToNext = useCallback(
    async (nextIdx: number) => {
      if (nextIdx >= deploySteps.length) {
        runningRef.current = false;
        setBannerState('succeeded');
        return;
      }

      const step = deploySteps[nextIdx];
      setCurrentStepIdx(nextIdx);
      setStepStatuses((prev) => {
        const next = [...prev];
        next[nextIdx] = 'running';
        return next;
      });
      setMonitorLabel(step.label);
      resetPoller();

      try {
        const t = await executeAction(step.component, step.action);
        setCurrentTaskId(t.id);
      } catch {
        setStepStatuses((prev) => {
          const next = [...prev];
          next[nextIdx] = 'failed';
          return next;
        });
        runningRef.current = false;
        setBannerState('failed');
      }
    },
    [deploySteps, resetPoller]
  );

  // React to task status changes
  useEffect(() => {
    if (!task || !runningRef.current) return;
    if (task.status === 'succeeded') {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[currentStepIdx] = 'succeeded';
        return next;
      });
      advanceToNext(currentStepIdx + 1);
    } else if (task.status === 'failed') {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[currentStepIdx] = 'failed';
        return next;
      });
      runningRef.current = false;
      setBannerState('failed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.status]);

  const retryFailed = useCallback(() => {
    if (currentStepIdx < 0 || currentStepIdx >= deploySteps.length) return;
    runningRef.current = true;
    setBannerState('running');
    advanceToNext(currentStepIdx);
  }, [currentStepIdx, deploySteps.length, advanceToNext]);

  const completedCount = useMemo(
    () => stepStatuses.filter((s) => s === 'succeeded').length,
    [stepStatuses]
  );

  const stepIcon = (status: StepStatus) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'running':
        return <Loader2 size={16} className="text-sky-500 animate-spin" />;
      default:
        return <Circle size={16} className="text-gray-300" />;
    }
  };

  // Render nothing if no deployment is active
  if (bannerState === 'loading' || bannerState === 'idle') return null;

  const barColor =
    bannerState === 'succeeded'
      ? 'bg-emerald-50 border-emerald-200'
      : bannerState === 'failed'
        ? 'bg-red-50 border-red-200'
        : 'bg-sky-50 border-sky-200';

  const barTextColor =
    bannerState === 'succeeded'
      ? 'text-emerald-800'
      : bannerState === 'failed'
        ? 'text-red-800'
        : 'text-sky-800';

  const currentLabel =
    currentStepIdx >= 0 && currentStepIdx < deploySteps.length
      ? deploySteps[currentStepIdx].label
      : '';

  return (
    <div className={`border-b ${barColor}`}>
      {/* Collapsed bar */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`w-full flex items-center gap-3 px-6 py-3 text-left ${barTextColor}`}
      >
        {bannerState === 'running' && <Loader2 size={16} className="animate-spin flex-shrink-0" />}
        {bannerState === 'succeeded' && <CheckCircle size={16} className="flex-shrink-0" />}
        {bannerState === 'failed' && <XCircle size={16} className="flex-shrink-0" />}

        <span className="text-sm font-medium flex-1">
          {bannerState === 'succeeded' && 'Deployment Complete'}
          {bannerState === 'failed' && `Deployment Failed: ${currentLabel}`}
          {bannerState === 'running' && `Deploying: ${currentLabel} (${completedCount + 1}/${deploySteps.length})`}
        </span>

        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pb-4 space-y-2">
          {deploySteps.map((step, idx) => {
            const status = stepStatuses[idx];
            return (
              <div
                key={step.component + step.action}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  status === 'running'
                    ? 'bg-sky-100/60'
                    : status === 'failed'
                      ? 'bg-red-100/60'
                      : status === 'succeeded'
                        ? 'bg-emerald-100/40'
                        : 'bg-white/60'
                }`}
              >
                {stepIcon(status)}
                <span className="flex-1 font-medium text-gray-900">{step.label}</span>
                {status === 'running' && (
                  <button
                    onClick={() => setShowMonitor(true)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    View Output
                  </button>
                )}
                {status === 'failed' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMonitor(true)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      View Output
                    </button>
                    <button
                      onClick={retryFailed}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                    >
                      <RotateCcw size={11} />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {bannerState === 'succeeded' && (
            <div className="flex items-center gap-3 pt-2">
              <Rocket size={16} className="text-emerald-500" />
              <span className="text-sm text-emerald-700 font-medium">
                All components installed successfully.
              </span>
            </div>
          )}
        </div>
      )}

      <TaskMonitorModal
        open={showMonitor}
        onClose={() => setShowMonitor(false)}
        task={task}
        error={taskError}
        label={monitorLabel}
      />
    </div>
  );
}
