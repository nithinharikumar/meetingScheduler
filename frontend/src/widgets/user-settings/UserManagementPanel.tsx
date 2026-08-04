import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchUsers, updateUserRole, deleteUser } from '../../features/user/api';
import { useAuthStore } from '../../shared/hooks/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import { DropdownMenu, DropdownItem } from '../../shared/ui/dropdown-menu';
import { TableSkeleton } from '../../shared/ui/skeleton';
import { Shield, Trash2, MoreHorizontal, User as UserIcon, Clock } from 'lucide-react';
import { CreateUserDialog } from './CreateUserDialog';
import { useUIStore } from '../../shared/hooks/useUIStore';
import { Label } from '../../shared/ui/label';

export const UserManagementPanel: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { businessStartHour, businessEndHour, setBusinessHours } = useUIStore();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin',
  });

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update role');
    },
  });

  const { mutate: removeUser } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete user');
    },
  });

  if (currentUser?.role !== 'Admin' && currentUser?.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Shield className="w-12 h-12 mb-4 text-destructive/50" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm">Only administrators can access user settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="border border-border shadow-sm bg-card">
        <CardHeader className="border-b border-border p-6 bg-background-secondary/50">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Global Settings
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Configure application-wide settings such as business hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-6 max-w-md">
            <div className="space-y-2 flex-1">
              <Label htmlFor="startHour">Business Start Hour</Label>
              <select
                id="startHour"
                value={businessStartHour}
                onChange={(e) => setBusinessHours(Number(e.target.value), businessEndHour)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="endHour">Business End Hour</Label>
              <select
                id="endHour"
                value={businessEndHour}
                onChange={(e) => setBusinessHours(businessStartHour, Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i} disabled={i <= businessStartHour}>
                    {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm bg-card">
        <CardHeader className="border-b border-border p-6 bg-background-secondary/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" /> User Management
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Manage roles and permissions for all users in the system.
              </CardDescription>
            </div>
            {currentUser?.role === 'SuperAdmin' && (
              <CreateUserDialog />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background-secondary/50 select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4 px-6">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-muted-foreground/5 transition-colors group">
                      <td className="py-4 px-6 font-bold text-foreground">{user.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'warning' : 'success'}
                          className="px-2 py-0.5 text-[10px] tracking-wider uppercase border-0"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {currentUser?.role === 'SuperAdmin' && user._id !== currentUser._id && (
                          <DropdownMenu
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-muted-foreground/10 text-muted-foreground"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            }
                          >
                            <DropdownItem
                              onClick={() => updateRole({ userId: user._id, role: 'Admin' })}
                              disabled={user.role === 'Admin'}
                            >
                              <Shield className="w-3.5 h-3.5" /> Make Admin
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => updateRole({ userId: user._id, role: 'Manager' })}
                              disabled={user.role === 'Manager'}
                            >
                              <Shield className="w-3.5 h-3.5" /> Make Manager
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => updateRole({ userId: user._id, role: 'Employee' })}
                              disabled={user.role === 'Employee'}
                            >
                              <Shield className="w-3.5 h-3.5" /> Make Employee
                            </DropdownItem>
                            <DropdownItem
                              variant="destructive"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                  removeUser(user._id);
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete User
                            </DropdownItem>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
