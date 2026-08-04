import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building } from 'lucide-react';
import { loginUser } from './api';
import { useAuthStore } from '../../shared/hooks/useAuthStore';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { cn } from "../../shared/utils/cn";

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type FormData = LoginFormData;

export const AuthModal: React.FC = () => {
  const login = useAuthStore((state) => state.login);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema) as any,
  });

  const { mutateAsync: performAuth, isPending } = useMutation({
    mutationFn: (data: FormData) => loginUser(data),
    onSuccess: (data) => {
      login(data);
      toast.success(`Welcome ${data.name}!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Authentication failed');
    },
  });

  const onSubmit = async (data: FormData) => {
    await performAuth(data);
  };

  return (
    <div className={cn('fixed', 'inset-0', 'z-50', 'bg-background/80', 'backdrop-blur-sm', 'flex', 'items-center', 'justify-center', 'p-4')}>
      <div className={cn('w-full', 'max-w-md', 'bg-card', 'border', 'border-border', 'shadow-xl', 'rounded-xl', 'overflow-hidden')}>
        <div className={cn('p-6', 'sm:p-8')}>
          <div className={cn('flex', 'flex-col', 'items-center', 'justify-center', 'text-center', 'space-y-2', 'mb-8')}>
            <div className={cn('bg-primary/10', 'p-3', 'rounded-full')}>
              <Building className={cn('w-8', 'h-8', 'text-primary')} />
            </div>
            <h1 className={cn('text-2xl', 'font-bold', 'tracking-tight', 'text-foreground')}>SyncSpace</h1>
            <p className={cn('text-sm', 'text-muted-foreground')}>
              Sign in to access your meeting rooms.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...formRegister('email')}
              />
              {errors.email && (
                <p className={cn('text-xs', 'text-destructive')}>{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...formRegister('password')}
              />
              {errors.password && (
                <p className={cn('text-xs', 'text-destructive')}>{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className={cn('w-full', 'font-bold', 'h-10')} loading={isPending}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
