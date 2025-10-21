'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SubscriptionManager } from '@/components/admin/subscription-manager';

interface User {
  id: string;
  email: string;
  name?: string;
  plan_name?: string;
  subscription_status?: string;
  created_at: string;
  last_login?: string;
  login_count: number;
  is_admin: boolean;
}

interface UserFilters {
  search: string;
  plan: string;
  status: string;
  admin: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    plan: 'all',
    status: 'all',
    admin: 'all',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filters]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        plan: filters.plan,
        status: filters.status,
        admin: filters.admin,
        page: currentPage.toString(),
        limit: usersPerPage.toString()
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to empty array on error
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.plan !== 'all') {
      filtered = filtered.filter(user => user.plan_name === filters.plan);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.subscription_status === filters.status);
    }

    if (filters.admin !== 'all') {
      filtered = filtered.filter(user => 
        filters.admin === 'admin' ? user.is_admin : !user.is_admin
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let updateData: any = {};
      
      switch (action) {
        case 'suspend':
          updateData.subscription_status = 'suspended';
          break;
        case 'activate':
          updateData.subscription_status = 'active';
          break;
        case 'make_admin':
          updateData.is_admin = true;
          break;
        case 'remove_admin':
          updateData.is_admin = false;
          break;
        default:
          return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      // Reload users to get updated data
      await loadUsers();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'suspended':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'pro':
        return 'text-blue-600 bg-blue-50';
      case 'free':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, subscriptions, and permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadUsers} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:filter-bold-duotone" className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <Input
                placeholder="Search by email or name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Plan</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.plan}
                onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Admin</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.admin}
                onChange={(e) => setFilters(prev => ({ ...prev, admin: e.target.value }))}
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="user">Regular Users</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="h-5 w-5" />
              Users ({filteredUsers.length})
            </div>
            <div className="text-sm text-gray-500">
              Showing {paginatedUsers.length} of {filteredUsers.length} users
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Icon icon="solar:user-bold-duotone" className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name || 'No name'}
                            {user.is_admin && (
                              <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-blue-600 ml-1 inline" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(user.plan_name)}`}>
                        {user.plan_name || 'free'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscription_status)}`}>
                        {user.subscription_status || 'active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Email</label>
                                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Name</label>
                                  <p className="text-sm text-gray-900">{selectedUser.name || 'No name'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Plan</label>
                                  <p className="text-sm text-gray-900">{selectedUser.plan_name || 'free'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Status</label>
                                  <p className="text-sm text-gray-900">{selectedUser.subscription_status || 'active'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Login Count</label>
                                  <p className="text-sm text-gray-900">{selectedUser.login_count}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Admin</label>
                                  <p className="text-sm text-gray-900">{selectedUser.is_admin ? 'Yes' : 'No'}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <SubscriptionManager user={user} onUpdate={loadUsers} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Icon icon="solar:menu-dots-bold-duotone" className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.subscription_status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                <Icon icon="solar:pause-circle-bold-duotone" className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                                <Icon icon="solar:play-circle-bold-duotone" className="h-4 w-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                            
                            {!user.is_admin ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'make_admin')}>
                                <Icon icon="solar:shield-plus-bold-duotone" className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'remove_admin')}>
                                <Icon icon="solar:shield-cross-bold-duotone" className="h-4 w-4 mr-2" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem className="text-red-600">
                              <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <Icon icon="solar:arrow-left-bold-duotone" className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <Icon icon="solar:arrow-right-bold-duotone" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
