import { get, put, del } from './client';

export interface WizardStepState {
  completed: boolean;
  completed_at: string | null;
}

export interface WizardState {
  completed: boolean;
  steps: {
    nodes: WizardStepState;
    preflight: WizardStepState;
    roles: WizardStepState;
    config: WizardStepState;
    deployment: WizardStepState;
  };
  active_task: {
    id: string;
    component: string;
    action: string;
    target: string;
    status: string;
  } | null;
}

export type WizardStepName = 'nodes' | 'preflight' | 'roles' | 'config' | 'deployment';

const STEP_ORDER: WizardStepName[] = ['nodes', 'preflight', 'roles', 'config', 'deployment'];

export function getWizardState() {
  return get<WizardState>('/wizard');
}

export function markStepComplete(step: WizardStepName) {
  return put<WizardState>(`/wizard/steps/${step}`, {});
}

export function resetWizard() {
  return del<void>('/wizard');
}

export function getFirstIncompleteStep(state: WizardState): number {
  const idx = STEP_ORDER.findIndex((s) => !state.steps[s]?.completed);
  if (idx === -1) return 0;
  return idx;
}
