import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

interface WizardNavProps {
  currentStep: number;
  totalSteps: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  loading?: boolean;
}

export default function WizardNav({
  currentStep,
  totalSteps,
  canContinue,
  onBack,
  onContinue,
  continueLabel,
  loading,
}: WizardNavProps) {
  const isLast = currentStep === totalSteps - 1;
  const label = continueLabel ?? (isLast ? 'Deploy' : 'Continue');

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-8 py-4 bg-white">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>
      <button
        onClick={onContinue}
        disabled={!canContinue || loading}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-intel-600 rounded-lg hover:bg-intel-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : isLast ? (
          <Rocket size={16} />
        ) : null}
        {label}
        {!isLast && !loading && <ChevronRight size={16} />}
      </button>
    </div>
  );
}
