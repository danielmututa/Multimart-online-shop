// src/pages/BlogAndProductsApproval.tsx
import  { useState, useEffect } from 'react';
import { 
  Search,
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertCircle,
  Calendar,
  User,
  FileText,
  Package,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { 
  getAllApprovals, 
  processApproval, 
  getApprovalStats 
} from '@/api/subscriptionApi';
import { ApprovalItem } from '@/components/interfaces/subscription';
import { toast } from 'sonner';

const BlogAndProductsApproval = () => {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ApprovalItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'product'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load data on mount
  useEffect(() => {
    loadApprovals();
    loadStats();
  }, []);

  // Load all approvals
  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await getAllApprovals();
      setItems(data);
    } catch (error: any) {
      console.error('Failed to load approvals:', error);
      toast.error(error.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const statsData = await getApprovalStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Filter items
  useEffect(() => {
    let result = items;
    
    // Search filter
    if (searchTerm) {
      result = result.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submittedBy.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter);
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, typeFilter, statusFilter]);

  // Handle approval
//  const handleApprove = async (id: number, type: 'blog' | 'product') => {
//   try {
//     setProcessingId(id);
//     await processApproval({
//       id: id,
//       type: type,
//       action: 'approve'
//     });


      
//       toast.success('Item approved successfully!');
      
//       // Reload data
//       await loadApprovals();
//       await loadStats();
//     } catch (error: any) {
//       console.error('Failed to approve:', error);
//       toast.error(error.message || 'Failed to approve item');
//     } finally {
//       setProcessingId(null);
//     }
//   };


const handleApprove = async (id: number, type: 'blog' | 'product') => {
  try {
    setProcessingId(id);
    await processApproval({
      approvalId: id,  // Changed from 'id' to 'approvalId'
      type: type,
      action: 'approve'
    });
    
    toast.success('Item approved successfully!');
    
    // Reload data
    await loadApprovals();
    await loadStats();
  } catch (error: any) {
    console.error('Failed to approve:', error);
    toast.error(error.message || 'Failed to approve item');
  } finally {
    setProcessingId(null);
  }
};



  // Handle rejection
// const handleReject = async (id: number, type: 'blog' | 'product') => {
//   try {
//     setProcessingId(id);
//     await processApproval({
//       id: id,
//       type: type,
//       action: 'reject'
//     });
      
//       toast.success('Item rejected successfully!');
      
//       // Reload data
//       await loadApprovals();
//       await loadStats();
//     } catch (error: any) {
//       console.error('Failed to reject:', error);
//       toast.error(error.message || 'Failed to reject item');
//     } finally {
//       setProcessingId(null);
//     }
//   };



const handleReject = async (id: number, type: 'blog' | 'product') => {
  try {
    setProcessingId(id);
    await processApproval({
      approvalId: id,  // Changed from 'id' to 'approvalId'
      type: type,
      action: 'reject'
    });
    
    toast.success('Item rejected successfully!');
    
    // Reload data
    await loadApprovals();
    await loadStats();
  } catch (error: any) {
    console.error('Failed to reject:', error);
    toast.error(error.message || 'Failed to reject item');
  } finally {
    setProcessingId(null);
  }
};




  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    if (type === 'blog') {
      return <FileText className="w-4 h-4" />;
    }
    return <Package className="w-4 h-4" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Payment Approvals Dashboard
        </h1>
        <p className="text-gray-600">
          Review and approve subscription payments submitted by merchants
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="activation">Activation</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="col-span-4 font-semibold text-gray-700">Payment Info</div>
          <div className="col-span-2 font-semibold text-gray-700">Merchant</div>
          <div className="col-span-2 font-semibold text-gray-700">Date</div>
          <div className="col-span-2 font-semibold text-gray-700">Status</div>
          <div className="col-span-2 font-semibold text-gray-700">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No payments found</p>
              <p className="text-sm mt-1">Try changing your filters</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                {/* Payment Info Column */}
                <div className="col-span-4">
                  <div className="flex items-start gap-3">
                    {/* <div className={`p-2 rounded-lg ${item.type === 'activation' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}> */}
                    {/* <div className={`p-2 rounded-lg ${item.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}> */}
                      <div className={`p-2 rounded-lg ${item.type === 'blog' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          ${item.content.amount}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.content.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merchant Column */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{item.submittedBy.name}</p>
                      <p className="text-sm text-gray-500">{item.submittedBy.email}</p>
                    </div>
                  </div>
                </div>

                {/* Date Column */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-900">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="col-span-2">
                  {getStatusBadge(item.status)}
                </div>

                {/* Actions Column */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => {
                        // View payment proof
                        if (item.content.paymentProofUrl) {
                          window.open(item.content.paymentProofUrl, '_blank');
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    
                    {item.status === 'pending' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" disabled={processingId === item.id}>
                            {processingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Actions'
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* <DropdownMenuItem
                            onClick={() => handleApprove(item.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReject(item.id)}
                            className="text-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </DropdownMenuItem> */}

                          <DropdownMenuItem
  onClick={() => handleApprove(item.id, item.type)}
  className="text-green-600"
>
  <CheckCircle className="w-4 h-4 mr-2" />
  Approve
</DropdownMenuItem>
<DropdownMenuItem
  onClick={() => handleReject(item.id, item.type)}
  className="text-red-600"
>
  <XCircle className="w-4 h-4 mr-2" />
  Reject
</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <p>Showing {filteredItems.length} of {items.length} payments</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Subscription</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAndProductsApproval;









