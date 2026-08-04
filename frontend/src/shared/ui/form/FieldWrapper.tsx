import React from 'react';
import { cn } from "../../utils/cn";

interface FieldWrapperProps {
  label?: string;
  error?: { message?: string } | string;
  children: React.ReactNode;
  id?: string;
  className?: string;
  required?: boolean;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  error,
  children,
  id,
  className = '',
  required = false,
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={cn('flex', 'items-center', 'gap-1', 'text-xs', 'font-semibold', 'uppercase', 'tracking-wider', 'text-muted-foreground', 'select-none')}
        >
          {label}
          {required && <span className={cn('text-destructive')}>*</span>}
        </label>
      )}
      {children}
      {errorMessage && (
        <p className={cn('text-xs', 'font-medium', 'text-destructive', 'mt-1', 'animate-in', 'fade-in', 'duration-200')}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};
