import * as React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60 dark:bg-muted/30', className)}
      {...props}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="border border-border/80 bg-card rounded-xl p-5 h-24 flex items-center justify-between shadow-sm">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-2 w-28" />
          </div>
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="border border-border/80 bg-card rounded-xl p-6 space-y-5 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-5 gap-4 border-b border-border/60 pb-2">
          {[...Array(5)].map((_, idx) => (
            <Skeleton key={idx} className="h-4 w-20" />
          ))}
        </div>
        {[...Array(5)].map((_, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-5 gap-4 py-2 border-b border-border/20 items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-md justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border min-w-[900px]">
        <div className="p-4 flex justify-center">
          <Skeleton className="h-4 w-8" />
        </div>
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="p-4 border-l border-border space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="min-w-[900px] h-[400px] relative p-6 flex flex-col justify-between">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-[1px] flex-1" />
          </div>
        ))}
        <div className="absolute inset-0 left-[80px] p-4 flex gap-8 pointer-events-none">
          <Skeleton className="h-24 w-full self-start rounded-lg opacity-40 mt-8" />
          <Skeleton className="h-16 w-full self-center rounded-lg opacity-40" />
          <Skeleton className="h-32 w-full self-end rounded-lg opacity-40 mb-12" />
        </div>
      </div>
    </div>
  );
}
