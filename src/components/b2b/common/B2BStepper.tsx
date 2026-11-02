'use client';

import {cn} from '@heroui/react';

export interface StepItem {
  id: string;
  label: string;
  optional?: boolean;
}

export interface B2BStepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

/**
 * B2B 统一步骤指示器组件
 *
 * @example
 * ```tsx
 * <B2BStepper
 *   steps={[
 *     { id: 'contact', label: 'Contact Info' },
 *     { id: 'delivery', label: 'Delivery' },
 *     { id: 'confirm', label: 'Confirm' },
 *   ]}
 *   currentStep={1}
 * />
 * ```
 */
export const B2BStepper = ({
                             steps,
                             currentStep,
                             className,
                           }: B2BStepperProps) => {
  return (
      <div className={cn('flex items-center justify-between mb-6 px-2', className)}>
        {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* 连接线 */}
              {index < steps.length - 1 && (
                  <div
                      className={cn(
                          'absolute top-3 left-[50%] w-full h-0.5',
                          index < currentStep ? 'bg-primary' : 'bg-default-200'
                      )}
                  />
              )}

              {/* 步骤圆圈 */}
              <div
                  className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-colors',
                      index <= currentStep
                          ? 'bg-primary text-white'
                          : 'bg-default-200 text-default-500'
                  )}
              >
                {index + 1}
              </div>

              {/* 步骤标签 - 桌面端显示 */}
              <span
                  className={cn(
                      'text-xs mt-1 hidden sm:block text-center',
                      index <= currentStep ? 'text-primary font-medium' : 'text-default-500'
                  )}
              >
            {step.label}
                {step.optional && (
                    <span className="text-default-400 ml-1">(Optional)</span>
                )}
          </span>

              {/* 步骤标签 - 移动端只显示当前步骤 */}
              <span className="text-xs mt-1 sm:hidden text-default-600">
            {index === currentStep && step.label}
          </span>
            </div>
        ))}
      </div>
  );
};
