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

const CalculatorBreadcrumbs: React.FC<CalculatorBreadcrumbsProps> = ({ steps }) => {
  return (
    <nav style={{ border: '2px solid red', padding: '10px', margin: '10px', width: '100%' }}>
      <p style={{ color: 'red', fontWeight: 'bold' }}>--- BREADCRUMB TEST ---</p>
      {steps.map(step => (
        <span key={step.name} style={{ marginRight: '15px' }}>
          {step.name}
        </span>
      ))}
    </nav>
  );
};

export default CalculatorBreadcrumbs;
