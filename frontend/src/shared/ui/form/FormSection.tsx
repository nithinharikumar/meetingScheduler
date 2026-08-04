import React from 'react';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </div>
  );
};
