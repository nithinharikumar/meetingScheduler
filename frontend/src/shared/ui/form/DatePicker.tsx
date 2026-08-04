import React, { forwardRef } from 'react';
import { Input } from './Input';
import { FieldError } from 'react-hook-form';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: FieldError | string;
  wrapperClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => <Input ref={ref} type="date" {...props} />
);

DatePicker.displayName = 'DatePicker';
