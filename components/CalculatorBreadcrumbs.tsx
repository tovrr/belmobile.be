import React from 'react';

interface BreadcrumbStep {
  name: string;
  step: number;
}

interface CalculatorBreadcrumbsProps {
  steps: BreadcrumbStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const CalculatorBreadcrumbs: React.FC<CalculatorBreadcrumbsProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Calculator Steps" className="w-full py-2">
      {/* Conteneur pour le défilement horizontal sur mobile */}
      <ol role="list" className="flex items-center overflow-x-auto no-scrollbar px-4 sm:px-0">
        {steps.map((step, index) => {
          const isCurrent = step.step === currentStep;
          const isCompleted = step.step < currentStep;

          return (
            <li key={step.name} className="relative flex-shrink-0" style={{ paddingRight: '1.2rem' }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (isCompleted) {
                    onStepClick(step.step);
                  }
                }}
                className={`
                  relative flex items-center h-12 pl-5 pr-2
                  font-bold text-xs sm:text-sm tracking-wide
                  transition-all duration-300 ease-in-out
                  rounded-md
                  transform hover:-translate-y-0.5
                  ${isCurrent
                    ? 'bg-bel-blue text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_5px_15px_rgba(59,130,246,0.4)] z-20'
                    : isCompleted
                    ? 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-200 shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-600 hover:shadow-md cursor-pointer z-10'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span className="truncate max-w-[150px] sm:max-w-none">{step.name}</span>
                
                {/* Séparateur biseauté */}
                <div
                  className={`
                    absolute top-0 -right-3 h-full w-6
                    transform -skew-x-[22deg]
                    rounded-r-md
                    ${isCurrent
                      ? 'bg-bel-blue'
                      : isCompleted
                      ? 'bg-white dark:bg-slate-700 border-r border-t border-b border-gray-200 dark:border-slate-600'
                      : 'bg-gray-100 dark:bg-slate-800'
                    }
                  `}
                ></div>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CalculatorBreadcrumbs;
