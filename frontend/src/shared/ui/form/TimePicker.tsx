import React, { forwardRef } from 'react';
import { Input } from './Input';

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: { message?: string } | string;
  wrapperClassName?: string;
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  (props, ref) => <Input ref={ref} type="time" {...props} />
);

TimePicker.displayName = 'TimePicker';
