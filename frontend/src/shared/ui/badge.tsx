import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        success:
          'border-transparent bg-success text-success-foreground hover:bg-success/80',
        warning:
          'border-transparent bg-warning text-warning-foreground hover:bg-warning/80',
        outline: 'text-foreground border-border bg-transparent',
        // Room specific styles
        room1: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40',
        room2: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40',
        room3: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
        room4: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40',
        room5: 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200/60 dark:border-pink-800/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export const getRoomBadgeVariant = (roomName: string): 'room1' | 'room2' | 'room3' | 'room4' | 'room5' => {
  const normalized = roomName.toLowerCase();
  if (normalized.includes('1') || normalized.includes('purple')) return 'room1';
  if (normalized.includes('2') || normalized.includes('blue')) return 'room2';
  if (normalized.includes('3') || normalized.includes('green') || normalized.includes('emerald')) return 'room3';
  if (normalized.includes('4') || normalized.includes('orange') || normalized.includes('amber')) return 'room4';
  if (normalized.includes('5') || normalized.includes('pink') || normalized.includes('rose')) return 'room5';
  
  // Fallback map based on name hashing if no direct match
  const hash = roomName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = (hash % 5) + 1;
  return `room${index}` as any;
};

export { Badge, badgeVariants };
