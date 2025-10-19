import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Shield, Crown, User as UserIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: string[];
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);

      // Remove all existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as 'admin' | 'partner' | 'standard' }]);

      if (insertError) throw insertError;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const role = roles[0] || 'standard';
    
    if (role === 'admin') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Shield className="w-3 h-3" />
          Owner/Admin
        </Badge>
      );
    }
    
    if (role === 'partner') {
      return (
        <Badge variant="default" className="gap-1">
          <Crown className="w-3 h-3" />
          Partner
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="gap-1">
        <UserIcon className="w-3 h-3" />
        Customer
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">
                    {user.full_name || 'No name'}
                  </h3>
                  {getRoleBadge(user.roles)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={user.roles[0] || 'standard'}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Owner/Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="partner">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Partner
                      </div>
                    </SelectItem>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Customer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {updating === user.id && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
