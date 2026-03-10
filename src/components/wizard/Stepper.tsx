import { Check } from 'lucide-react';

export interface StepDef {
  label: string;
  description: string;
}

interface StepperProps {
  steps: StepDef[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav className="flex items-center justify-center gap-0 px-4 py-6">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isComplete
                    ? 'bg-intel-600 text-white'
                    : isCurrent
                      ? 'bg-intel-600 text-white ring-4 ring-intel-100'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isComplete ? <Check size={16} strokeWidth={3} /> : i + 1}
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-medium ${
                    isFuture ? 'text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 hidden sm:block">{step.description}</p>
              </div>
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
