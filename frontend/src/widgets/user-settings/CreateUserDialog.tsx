import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createUser } from '../../features/user/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../shared/ui/dialog';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { Label } from '../../shared/ui/label';
import { cn } from '../../shared/utils/cn';
import { UserPlus } from 'lucide-react';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
});

type FormData = z.infer<typeof createUserSchema>;

export const CreateUserDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'Employee',
    },
  });

  const { mutateAsync: handleCreateUser, isPending } = useMutation({
    mutationFn: (data: FormData) => createUser(data as any),
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create user');
    },
  });

  const onSubmit = async (data: FormData) => {
    await handleCreateUser(data);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) reset();
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className={cn('text-xs', 'text-destructive')}>{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register('email')}
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
              {...register('password')}
            />
            {errors.password && (
              <p className={cn('text-xs', 'text-destructive')}>{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              {...register('role')}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <p className={cn('text-xs', 'text-destructive')}>{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
