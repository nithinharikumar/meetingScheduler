import React, { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: { message?: string } | string;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, wrapperClassName, className = '', id, required, children, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <FieldWrapper label={label} error={error} id={selectId} required={required} className={wrapperClassName}>
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`flex h-10 w-full rounded-lg border border-border/80 bg-background/30 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-destructive/80 focus-visible:ring-destructive' : 'hover:border-border focus-visible:ring-violet-500'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  }
);

Select.displayName = 'Select';
