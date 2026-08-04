import React, { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { FieldError } from 'react-hook-form';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError | string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClassName, className = '', id, required, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <FieldWrapper label={label} error={error} id={inputId} required={required} className={wrapperClassName}>
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`flex h-10 w-full rounded-lg border border-border/80 bg-background/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
            error ? 'border-destructive/80 focus-visible:ring-destructive' : 'hover:border-border focus-visible:ring-violet-500'
          } ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

Input.displayName = 'Input';
