import { useState, useCallback, useEffect } from 'react';
import type { ManagedNode, CheckResult } from '../types/api';

const STORAGE_KEY = 'aether_wizard_state';

export interface WizardData {
  currentStep: number;
  nodes: ManagedNode[];
  nodeVerification: Record<string, 'pending' | 'verified' | 'failed'>;
  excludedNodeIds: string[];
  preflightResults: CheckResult[];
  preflightPassed: boolean;
  roleAssignments: Record<string, string[]>;
  deploymentStarted: boolean;
}

const DEFAULT_STATE: WizardData = {
  currentStep: 0,
  nodes: [],
  nodeVerification: {},
  excludedNodeIds: [],
  preflightResults: [],
  preflightPassed: false,
  roleAssignments: {},
  deploymentStarted: false,
};

function loadState(): WizardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore corrupt state
  }
  return DEFAULT_STATE;
}

function saveState(state: WizardData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useWizardState() {
  const [data, setData] = useState<WizardData>(loadState);

  useEffect(() => {
    saveState(data);
  }, [data]);

  const update = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const setStep = useCallback((step: number) => {
    setData((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const resetWizard = useCallback(() => {
    setData(DEFAULT_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { data, update, setStep, resetWizard };
}
