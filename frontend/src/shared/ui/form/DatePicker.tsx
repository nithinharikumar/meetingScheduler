import React, { forwardRef } from 'react';
import { Input } from './Input';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: { message?: string } | string;
  wrapperClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => <Input ref={ref} type="date" {...props} />
);

DatePicker.displayName = 'DatePicker';
