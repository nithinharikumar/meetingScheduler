import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../utils/cn';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-30 mt-1.5 w-44 rounded-lg border border-border bg-card p-1 shadow-lg ring-1 ring-black/5 focus:outline-none',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            <div className="py-0.5" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  return (
    <button
      className={cn(
        'w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 cursor-pointer',
        variant === 'destructive'
          ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
          : 'text-foreground hover:bg-muted-foreground/10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
