import { Check } from 'lucide-react';

export interface StepDef {
  label: string;
  description: string;
}

interface StepperProps {
  steps: StepDef[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav className="flex items-center justify-center gap-0 px-4 py-6">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        const circleClasses = `w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
          isComplete
            ? 'bg-intel-600 text-white'
            : isCurrent
              ? 'bg-intel-600 text-white ring-4 ring-intel-100'
              : 'bg-gray-200 text-gray-500'
        }`;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              {isComplete && onStepClick ? (
                <button
                  onClick={() => onStepClick(i)}
                  className={`${circleClasses} cursor-pointer hover:ring-2 hover:ring-intel-200`}
                  aria-label={`Go to ${step.label}`}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              ) : (
                <div className={circleClasses}>
                  {isComplete ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>
              )}
              <p
                className={`text-xs font-medium text-center ${
                  isFuture ? 'text-gray-400' : 'text-gray-800'
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-18px] transition-colors duration-300 ${
                  i < currentStep ? 'bg-intel-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
