import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

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
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <li key={step.name}>
            <div className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              )}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (step.step < currentStep) {
                    onStepClick(step.step);
                  }
                }}
                className={`text-sm font-medium ${
                  step.step === currentStep
                    ? 'text-bel-blue dark:text-blue-400'
                    : step.step < currentStep
                    ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-current={step.step === currentStep ? 'page' : undefined}
              >
                {step.name}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CalculatorBreadcrumbs;
