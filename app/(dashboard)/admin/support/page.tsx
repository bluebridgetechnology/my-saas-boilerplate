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

interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

interface TicketFilters {
  search: string;
  status: string;
  priority: string;
  assigned: string;
}

export default function SupportTicketsManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assigned: 'all',
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 20;

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, filters]);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          user_id: 'user1',
          user_email: 'john@example.com',
          user_name: 'John Doe',
          subject: 'Unable to upload large images',
          description: 'I\'m trying to upload images larger than 10MB but getting an error. I have a Pro subscription.',
          status: 'open',
          priority: 'high',
          created_at: '2024-01-20T10:30:00Z',
          updated_at: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          user_id: 'user2',
          user_email: 'sarah@example.com',
          user_name: 'Sarah Smith',
          subject: 'Watermark not appearing correctly',
          description: 'The watermark I added is not showing up on the processed images.',
          status: 'in_progress',
          priority: 'medium',
          assigned_to: 'admin@resizesuite.com',
          created_at: '2024-01-19T14:22:00Z',
          updated_at: '2024-01-20T09:15:00Z',
        },
        {
          id: '3',
          user_id: 'user3',
          user_email: 'mike@example.com',
          user_name: 'Mike Johnson',
          subject: 'Batch processing taking too long',
          description: 'Processing 50 images is taking over 10 minutes. Is this normal?',
          status: 'resolved',
          priority: 'medium',
          assigned_to: 'admin@resizesuite.com',
          resolution: 'This is normal for large batches. Consider using smaller batches for faster processing.',
          created_at: '2024-01-18T16:45:00Z',
          updated_at: '2024-01-19T11:30:00Z',
        },
        {
          id: '4',
          user_id: 'user4',
          user_email: 'lisa@example.com',
          user_name: 'Lisa Brown',
          subject: 'Account billing issue',
          description: 'I was charged twice for my Pro subscription this month.',
          status: 'open',
          priority: 'urgent',
          created_at: '2024-01-20T08:15:00Z',
          updated_at: '2024-01-20T08:15:00Z',
        },
        {
          id: '5',
          user_id: 'user5',
          user_email: 'david@example.com',
          user_name: 'David Wilson',
          subject: 'Feature request: PDF support',
          description: 'Would it be possible to add PDF to image conversion?',
          status: 'closed',
          priority: 'low',
          assigned_to: 'admin@resizesuite.com',
          resolution: 'PDF support is planned for Q2 2024. Thank you for the suggestion!',
          created_at: '2024-01-15T12:30:00Z',
          updated_at: '2024-01-17T16:20:00Z',
        },
      ];
      
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (filters.search) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.user_email.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.assigned !== 'all') {
      if (filters.assigned === 'assigned') {
        filtered = filtered.filter(ticket => ticket.assigned_to);
      } else if (filters.assigned === 'unassigned') {
        filtered = filtered.filter(ticket => !ticket.assigned_to);
      }
    }

    setFilteredTickets(filtered);
    setCurrentPage(1);
  };

  const handleTicketAction = async (ticketId: string, action: string, value?: string) => {
    try {
      // Simulate API call - replace with actual API endpoint
      console.log(`Performing ${action} on ticket ${ticketId}`, value);
      
      // Update local state
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          switch (action) {
            case 'assign':
              return { ...ticket, assigned_to: value, status: 'in_progress', updated_at: new Date().toISOString() };
            case 'unassign':
              return { ...ticket, assigned_to: undefined, status: 'open', updated_at: new Date().toISOString() };
            case 'resolve':
              return { ...ticket, status: 'resolved', resolution: value, updated_at: new Date().toISOString() };
            case 'close':
              return { ...ticket, status: 'closed', updated_at: new Date().toISOString() };
            case 'reopen':
              return { ...ticket, status: 'open', updated_at: new Date().toISOString() };
            case 'priority':
              return { ...ticket, priority: value as any, updated_at: new Date().toISOString() };
            default:
              return ticket;
          }
        }
        return ticket;
      }));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-50';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  );

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
    };
  };

  const stats = getTicketStats();

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
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support tickets and inquiries</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadTickets} variant="outline" size="sm">
            <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Icon icon="solar:download-bold-duotone" className="h-4 w-4 mr-2" />
            Export Tickets
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
              <div className="text-sm text-gray-600">Open</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-gray-600">Urgent</div>
            </div>
          </CardContent>
        </Card>
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
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Assignment</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.assigned}
                onChange={(e) => setFilters(prev => ({ ...prev, assigned: e.target.value }))}
              >
                <option value="all">All Tickets</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:headphones-round-sound-bold-duotone" className="h-5 w-5" />
              Tickets ({filteredTickets.length})
            </div>
            <div className="text-sm text-gray-500">
              Showing {paginatedTickets.length} of {filteredTickets.length} tickets
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ticket</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{ticket.subject}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{ticket.user_name}</div>
                        <div className="text-sm text-gray-500">{ticket.user_email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {ticket.assigned_to || 'Unassigned'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Icon icon="solar:eye-bold-duotone" className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ticket Details</DialogTitle>
                            </DialogHeader>
                            {selectedTicket && (
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Subject</label>
                                  <p className="text-sm text-gray-900">{selectedTicket.subject}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">User</label>
                                  <p className="text-sm text-gray-900">{selectedTicket.user_name} ({selectedTicket.user_email})</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Description</label>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>
                                {selectedTicket.resolution && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Resolution</label>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.resolution}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <p className="text-sm text-gray-900">{selectedTicket.status}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <p className="text-sm text-gray-900">{selectedTicket.priority}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Icon icon="solar:menu-dots-bold-duotone" className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!ticket.assigned_to ? (
                              <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'assign', 'admin@resizesuite.com')}>
                                <Icon icon="solar:user-plus-bold-duotone" className="h-4 w-4 mr-2" />
                                Assign to Me
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'unassign')}>
                                <Icon icon="solar:user-minus-bold-duotone" className="h-4 w-4 mr-2" />
                                Unassign
                              </DropdownMenuItem>
                            )}
                            
                            {ticket.status !== 'resolved' && (
                              <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'resolve', 'Issue resolved')}>
                                <Icon icon="solar:check-circle-bold-duotone" className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            )}
                            
                            {ticket.status !== 'closed' && (
                              <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'close')}>
                                <Icon icon="solar:close-circle-bold-duotone" className="h-4 w-4 mr-2" />
                                Close Ticket
                              </DropdownMenuItem>
                            )}
                            
                            {ticket.status === 'closed' && (
                              <DropdownMenuItem onClick={() => handleTicketAction(ticket.id, 'reopen')}>
                                <Icon icon="solar:refresh-bold-duotone" className="h-4 w-4 mr-2" />
                                Reopen Ticket
                              </DropdownMenuItem>
                            )}
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
