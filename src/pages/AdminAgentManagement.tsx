// AdminAgentManagement.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  User, 
  CreditCard, 
  Phone, 
  FileText,
  Clock,
  Filter,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  GetPendingAgentApplications,
  GetAllAgentApplications,
  ApproveAgentApplication,
  RejectAgentApplication
} from '@/api/productAgentsApi';
import { ProductAgent } from '@/components/interfaces/productAgents';

const AdminAgentManagement = () => {
  const [applications, setApplications] = useState<ProductAgent[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ProductAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApp, setSelectedApp] = useState<ProductAgent | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  useEffect(() => {
    // Filter applications when search term changes
    if (!searchTerm.trim()) {
      setFilteredApplications(applications);
      return;
    }

    const filtered = applications.filter(app => {
      const fullName = app.full_name?.toLowerCase() || '';
      const nationalId = app.national_id?.toLowerCase() || '';
      const productName = app.products?.name?.toLowerCase() || '';
      const email = app.users?.email?.toLowerCase() || '';
      
      return fullName.includes(searchTerm.toLowerCase()) ||
             nationalId.includes(searchTerm.toLowerCase()) ||
             productName.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase());
    });
    setFilteredApplications(filtered);
  }, [searchTerm, applications]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Loading applications with filter: ${statusFilter}`);
      
      let data;
      if (statusFilter === 'pending') {
        data = await GetPendingAgentApplications();
      } else if (statusFilter === 'all') {
        data = await GetAllAgentApplications();
      } else {
        data = await GetAllAgentApplications({ status: statusFilter });
      }
      
      console.log('📦 Data received from API:', data);
      
      const applicationsArray = Array.isArray(data) ? data : [];
      console.log(`✅ Loaded ${applicationsArray.length} applications`);
      
      setApplications(applicationsArray);
      setFilteredApplications(applicationsArray);
    } catch (error: any) {
      console.error('❌ Failed to load applications:', error);
      alert(`Error: ${error.message || 'Failed to load applications'}`);
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (app: ProductAgent) => {
    setProcessing(true);
    try {
      await ApproveAgentApplication(app.id, commissionRate);
      
      setShowSuccessMessage(`✅ Agent ${app.full_name} approved with ${commissionRate}% commission!`);
      
      // Reload to get fresh data with updated status
      await loadApplications();
      
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (app: ProductAgent) => {
    setSelectedApp(app);
    setShowRejectDialog(true);
    setRejectionReason('');
  };

  const openDetailsDialog = (app: ProductAgent) => {
    setSelectedApp(app);
    setShowDetailsDialog(true);
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await RejectAgentApplication(selectedApp.id, rejectionReason);
      
      setShowSuccessMessage(`❌ Agent ${selectedApp.full_name} application rejected`);
      
      setShowRejectDialog(false);
      setSelectedApp(null);
      
      await loadApplications();
      
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusCounts = () => {
    const allApps = applications;
    return {
      pending: allApps.filter(a => a.status === 'pending').length,
      approved: allApps.filter(a => a.status === 'approved').length,
      rejected: allApps.filter(a => a.status === 'rejected').length,
      total: allApps.length
    };
  };

  const handleRefresh = () => {
    loadApplications();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Success Message Banner */}
        {showSuccessMessage && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={20} />
                <span className="text-sm md:text-base">{showSuccessMessage}</span>
              </div>
              <button
                onClick={() => setShowSuccessMessage(null)}
                className="text-green-700 hover:text-green-900"
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Agent Applications Management
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Review and approve agent applications
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 self-start md:self-auto"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm md:text-base">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID, product, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center gap-2">
                <Filter size={20} className="text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Only</option>
                  <option value="rejected">Rejected Only</option>
                </select>
              </div>
            </div>
          </div>

          {statusFilter === 'pending' && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
                Default Commission Rate:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
                <span className="text-sm md:text-base text-gray-600 whitespace-nowrap">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800">{getStatusCounts().total}</p>
              </div>
              <FileText className="text-gray-400" size={24} />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-yellow-700">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-800">
                  {getStatusCounts().pending}
                </p>
              </div>
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-green-700">Approved</p>
                <p className="text-lg md:text-2xl font-bold text-green-800">
                  {getStatusCounts().approved}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-red-700">Rejected</p>
                <p className="text-lg md:text-2xl font-bold text-red-800">
                  {getStatusCounts().rejected}
                </p>
              </div>
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="text-xs md:text-sm text-gray-600">
            Showing {filteredApplications.length} of {applications.length} applications
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All ({getStatusCounts().total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Pending ({getStatusCounts().pending})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Approved ({getStatusCounts().approved})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Rejected ({getStatusCounts().rejected})
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <div className="text-gray-500">Loading applications...</div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-6">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm ? 'No applications found' : 'No applications yet'}
              </p>
              <p className="text-sm text-gray-500 text-center">
                {searchTerm 
                  ? 'Try a different search term or clear the search'
                  : 'When users apply as agents, they will appear here'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border-b border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Agent Info
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Product
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          ID Number
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Payment Method
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Contact
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                                <User className="text-blue-600" size={20} />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                  {app.full_name || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {app.users?.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 truncate max-w-[120px]">
                              {app.products?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              {app.national_id || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 capitalize truncate max-w-[100px]">
                                  {app.payout_method || 'N/A'}
                                </div>
                                {app.payout_method === 'bank' && app.bank_name && (
                                  <div className="text-xs text-gray-500 truncate max-w-[100px]">
                                    {app.bank_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
                              <div className="text-sm text-gray-900 truncate max-w-[120px]">
                                {app.payout_number || app.bank_account_number || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              app.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status}
                            </span>
                            {app.status === 'approved' && app.commission_rate && (
                              <div className="text-xs text-gray-500 mt-1">
                                {app.commission_rate}% commission
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex flex-col sm:flex-row gap-2">
                              {app.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(app)}
                                    disabled={processing}
                                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
                                  >
                                    <CheckCircle size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => openRejectDialog(app)}
                                    disabled={processing}
                                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
                                  >
                                    <XCircle size={14} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openDetailsDialog(app)}
                                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap text-xs md:text-sm"
                                >
                                  <Eye size={14} />
                                  <span>View</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
              Reject Application
            </h3>
            <p className="text-gray-600 mb-4">
              Agent: <strong>{selectedApp.full_name}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm md:text-base"
              placeholder="Please provide a reason for rejection (minimum 10 characters)..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Characters: {rejectionReason.length}/10
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setSelectedApp(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || rejectionReason.length < 10}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      {showDetailsDialog && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                Application Details
              </h3>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{selectedApp.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedApp.users?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">National ID</p>
                  <p className="font-medium">{selectedApp.national_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-medium">{selectedApp.products?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payout Method</p>
                  <p className="font-medium capitalize">{selectedApp.payout_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                    selectedApp.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedApp.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              {selectedApp.status === 'approved' && selectedApp.agent_code && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-700 font-medium mb-2">Agent Code</p>
                  <p className="font-mono text-base md:text-lg bg-white p-2 rounded">{selectedApp.agent_code}</p>
                  {selectedApp.commission_rate && (
                    <p className="text-sm text-green-600 mt-2">
                      Commission Rate: {selectedApp.commission_rate}%
                    </p>
                  )}
                </div>
              )}

              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-700 font-medium mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-600 bg-white p-2 rounded">{selectedApp.rejection_reason}</p>
                </div>
              )}

              {selectedApp.reason && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Application Reason</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedApp.reason}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentManagement;
















// AdminAgentManagement.tsx - UPDATED WITH BETTER DEBUGGING
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   CheckCircle, 
//   XCircle, 
//   User, 
//   CreditCard, 
//   Phone, 
//   FileText,
//   Clock,
//   Filter,
//   Eye,
//   RefreshCw,
//   AlertCircle
// } from 'lucide-react';
// import {
//   GetPendingAgentApplications,
//   GetAllAgentApplications,
//   ApproveAgentApplication,
//   RejectAgentApplication
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const AdminAgentManagement = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [filteredApplications, setFilteredApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all'); // Changed default to 'all'
//   const [selectedApp, setSelectedApp] = useState<ProductAgent | null>(null);
//   const [showRejectDialog, setShowRejectDialog] = useState(false);
//   const [showDetailsDialog, setShowDetailsDialog] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [commissionRate, setCommissionRate] = useState(10);
//   const [processing, setProcessing] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
//   const [apiError, setApiError] = useState<string | null>(null);

//   useEffect(() => {
//     if (showSuccessMessage) {
//       const timer = setTimeout(() => {
//         setShowSuccessMessage(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccessMessage]);

//   useEffect(() => {
//     loadApplications();
//   }, [statusFilter]);

//   useEffect(() => {
//     filterApplications();
//   }, [searchTerm, applications]);

//   const loadApplications = async () => {
//     setLoading(true);
//     setApiError(null);
//     try {
//       console.log(`🔄 Loading applications with filter: ${statusFilter}`);
//       console.log(`📊 API functions available:`, {
//         GetPendingAgentApplications: typeof GetPendingAgentApplications,
//         GetAllAgentApplications: typeof GetAllAgentApplications
//       });
      
//       let data;
//       if (statusFilter === 'pending') {
//         console.log('📞 Calling GetPendingAgentApplications()');
//         data = await GetPendingAgentApplications();
//         console.log('📦 Pending applications response:', data);
//       } else if (statusFilter === 'all') {
//         console.log('📞 Calling GetAllAgentApplications()');
//         data = await GetAllAgentApplications();
//         console.log('📦 All applications response:', data);
//       } else {
//         console.log(`📞 Calling GetAllAgentApplications({ status: '${statusFilter}' })`);
//         data = await GetAllAgentApplications({ status: statusFilter });
//         console.log(`📦 ${statusFilter} applications response:`, data);
//       }
      
//       console.log('📦 Raw data received:', data);
//       console.log('📦 Data type:', typeof data);
//       console.log('📦 Is array?', Array.isArray(data));
      
//       let applicationsArray: ProductAgent[] = [];
      
//       if (Array.isArray(data)) {
//         applicationsArray = data;
//         console.log(`✅ Loaded ${applicationsArray.length} applications from array`);
//       } else if (data && typeof data === 'object') {
//         // Try to extract data from different response formats
//         if (Array.isArray(data.data)) {
//           applicationsArray = data.data;
//           console.log(`✅ Loaded ${applicationsArray.length} applications from data.data`);
//         } else if (Array.isArray(data.applications)) {
//           applicationsArray = data.applications;
//           console.log(`✅ Loaded ${applicationsArray.length} applications from data.applications`);
//         } else if (data.success && Array.isArray(data.result)) {
//           applicationsArray = data.result;
//           console.log(`✅ Loaded ${applicationsArray.length} applications from data.result`);
//         } else {
//           console.log('⚠️ Data is object but not in expected format:', data);
//           applicationsArray = [];
//         }
//       } else {
//         console.log('⚠️ Data is not array or object:', data);
//         applicationsArray = [];
//       }
      
//       console.log('📋 Applications to display:', applicationsArray);
      
//       if (applicationsArray.length === 0) {
//         console.warn('⚠️ No applications loaded. Possible issues:');
//         console.warn('1. Backend API might return empty array');
//         console.warn('2. Database might be empty');
//         console.warn('3. Authentication/permission issues');
//         console.warn('4. Wrong API endpoint');
        
//         // Test API endpoints directly
//         console.log('🔍 Testing API endpoints...');
//         try {
//           // Try to fetch directly to see what's happening
//           const testResponse = await fetch('/api/agentproduct/all');
//           const testData = await testResponse.json();
//           console.log('🔍 Direct fetch result:', testData);
//         } catch (fetchError) {
//           console.error('🔍 Direct fetch error:', fetchError);
//         }
//       }
      
//       setApplications(applicationsArray);
//       setFilteredApplications(applicationsArray);
      
//       // Log application details
//       applicationsArray.forEach((app, index) => {
//         console.log(`📝 App ${index + 1}:`, {
//           id: app.id,
//           full_name: app.full_name,
//           status: app.status,
//           product: app.products?.name,
//           commission_rate: app.commission_rate
//         });
//       });
      
//     } catch (error: any) {
//       console.error('❌ Failed to load applications:', error);
//       const errorMessage = error.message || 'Failed to load applications';
//       setApiError(errorMessage);
//       alert(`Error: ${errorMessage}`);
//       setApplications([]);
//       setFilteredApplications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterApplications = () => {
//     if (!searchTerm.trim()) {
//       setFilteredApplications(applications);
//       return;
//     }

//     const filtered = applications.filter(app => {
//       const fullName = app.full_name?.toLowerCase() || '';
//       const nationalId = app.national_id?.toLowerCase() || '';
//       const productName = app.products?.name?.toLowerCase() || '';
//       const email = app.users?.email?.toLowerCase() || '';
      
//       return fullName.includes(searchTerm.toLowerCase()) ||
//              nationalId.includes(searchTerm.toLowerCase()) ||
//              productName.includes(searchTerm.toLowerCase()) ||
//              email.includes(searchTerm.toLowerCase());
//     });
//     setFilteredApplications(filtered);
//   };

//   const handleApprove = async (app: ProductAgent) => {
//     setProcessing(true);
//     try {
//       console.log(`Approving agent ${app.id} with commission rate ${commissionRate}%`);
//       const result = await ApproveAgentApplication(app.id, commissionRate);
//       console.log('Approval result:', result);
      
//       setShowSuccessMessage(`✅ Agent ${app.full_name} approved with ${commissionRate}% commission!`);
      
//       // Update the local state immediately
//       const updatedApplications = applications.map(a => 
//         a.id === app.id 
//           ? { 
//               ...a, 
//               status: 'approved',
//               commission_rate: commissionRate.toString(),
//               agent_code: result.data?.agent_code || a.agent_code || `AG${app.id}${Date.now().toString().slice(-6)}`
//             } 
//           : a
//       );
      
//       setApplications(updatedApplications);
      
//       // Reload after a delay
//       setTimeout(() => loadApplications(), 1500);
      
//     } catch (error: any) {
//       console.error('Approval error:', error);
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const openRejectDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowRejectDialog(true);
//     setRejectionReason('');
//   };

//   const openDetailsDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowDetailsDialog(true);
//   };

//   const handleReject = async () => {
//     if (!selectedApp || !rejectionReason.trim()) {
//       alert('Please provide a rejection reason');
//       return;
//     }

//     setProcessing(true);
//     try {
//       console.log(`Rejecting agent ${selectedApp.id} with reason: ${rejectionReason}`);
//       const result = await RejectAgentApplication(selectedApp.id, rejectionReason);
//       console.log('Rejection result:', result);
      
//       setShowSuccessMessage(`❌ Agent ${selectedApp.full_name} application rejected`);
      
//       // Update the local state immediately
//       const updatedApplications = applications.map(a => 
//         a.id === selectedApp.id 
//           ? { 
//               ...a, 
//               status: 'rejected',
//               rejection_reason: rejectionReason
//             } 
//           : a
//       );
      
//       setApplications(updatedApplications);
      
//       setShowRejectDialog(false);
//       setSelectedApp(null);
//       setRejectionReason('');
      
//       // Reload after a delay
//       setTimeout(() => loadApplications(), 1500);
      
//     } catch (error: any) {
//       console.error('Rejection error:', error);
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getStatusCounts = () => {
//     const allApps = applications;
//     return {
//       pending: allApps.filter(a => a.status === 'pending').length,
//       approved: allApps.filter(a => a.status === 'approved').length,
//       rejected: allApps.filter(a => a.status === 'rejected').length,
//       total: allApps.length
//     };
//   };

//   const handleRefresh = () => {
//     loadApplications();
//   };

//   const handleTestApi = async () => {
//     console.log('🧪 Testing API endpoints...');
    
//     try {
//       // Test pending endpoint
//       console.log('🧪 Testing /api/agentproduct/pending');
//       const pendingRes = await fetch('/api/agentproduct/pending');
//       const pendingData = await pendingRes.json();
//       console.log('🧪 Pending endpoint result:', pendingData);
      
//       // Test all endpoint
//       console.log('🧪 Testing /api/agentproduct/all');
//       const allRes = await fetch('/api/agentproduct/all');
//       const allData = await allRes.json();
//       console.log('🧪 All endpoint result:', allData);
      
//       alert('API test complete. Check console for results.');
//     } catch (error) {
//       console.error('🧪 API test error:', error);
//       alert(`API test error: ${error}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-[1800px] mx-auto">
//         {/* Success Message Banner */}
//         {showSuccessMessage && (
//           <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <CheckCircle className="mr-2" size={20} />
//                 <span className="text-sm md:text-base">{showSuccessMessage}</span>
//               </div>
//               <button
//                 onClick={() => setShowSuccessMessage(null)}
//                 className="text-green-700 hover:text-green-900"
//               >
//                 <XCircle size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* API Error Banner */}
//         {apiError && (
//           <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <AlertCircle className="mr-2" size={20} />
//                 <span className="text-sm md:text-base">API Error: {apiError}</span>
//               </div>
//               <button
//                 onClick={() => setApiError(null)}
//                 className="text-red-700 hover:text-red-900"
//               >
//                 <XCircle size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
//                 Agent Applications Management
//               </h1>
//               <p className="text-sm md:text-base text-gray-600">
//                 Review and approve agent applications
//               </p>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto">
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm md:text-base"
//               >
//                 <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
//                 <span>Refresh</span>
//               </button>
//               <button
//                 onClick={handleTestApi}
//                 className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm md:text-base"
//               >
//                 <AlertCircle size={18} />
//                 <span>Test API</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <div className="lg:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search by name, ID, product, or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 flex items-center gap-2">
//                 <Filter size={20} className="text-gray-400 flex-shrink-0" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value as any)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 >
//                   <option value="all">All Applications</option>
//                   <option value="pending">Pending Only</option>
//                   <option value="approved">Approved Only</option>
//                   <option value="rejected">Rejected Only</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {statusFilter === 'pending' && (
//             <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
//               <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
//                 Default Commission Rate:
//               </label>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="range"
//                   min="0.1"
//                   max="50"
//                   step="0.1"
//                   value={commissionRate}
//                   onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                   className="flex-1"
//                 />
//                 <input
//                   type="number"
//                   min="0.1"
//                   max="50"
//                   step="0.1"
//                   value={commissionRate}
//                   onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                   className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 />
//                 <span className="text-sm md:text-base text-gray-600 whitespace-nowrap">%</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Debug Info - Only show in development */}
//         {process.env.NODE_ENV === 'development' && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 md:mb-6">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="text-sm font-medium text-yellow-800 flex items-center">
//                 <AlertCircle size={16} className="mr-1" />
//                 Debug Information
//               </h3>
//               <button
//                 onClick={() => console.log('Applications state:', applications)}
//                 className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
//               >
//                 Log State
//               </button>
//             </div>
//             <div className="text-xs text-yellow-700 grid grid-cols-2 md:grid-cols-4 gap-2">
//               <div>
//                 <span className="font-medium">Total Apps:</span> {applications.length}
//               </div>
//               <div>
//                 <span className="font-medium">Filtered:</span> {filteredApplications.length}
//               </div>
//               <div>
//                 <span className="font-medium">Status Filter:</span> {statusFilter}
//               </div>
//               <div>
//                 <span className="font-medium">Search Term:</span> {searchTerm || '(none)'}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-gray-600">Total</p>
//                 <p className="text-lg md:text-2xl font-bold text-gray-800">{getStatusCounts().total}</p>
//               </div>
//               <FileText className="text-gray-400" size={24} />
//             </div>
//           </div>
//           <div className="bg-yellow-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-yellow-700">Pending</p>
//                 <p className="text-lg md:text-2xl font-bold text-yellow-800">
//                   {getStatusCounts().pending}
//                 </p>
//               </div>
//               <Clock className="text-yellow-600" size={24} />
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-green-700">Approved</p>
//                 <p className="text-lg md:text-2xl font-bold text-green-800">
//                   {getStatusCounts().approved}
//                 </p>
//               </div>
//               <CheckCircle className="text-green-600" size={24} />
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-red-700">Rejected</p>
//                 <p className="text-lg md:text-2xl font-bold text-red-800">
//                   {getStatusCounts().rejected}
//                 </p>
//               </div>
//               <XCircle className="text-red-600" size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Filter Buttons */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
//           <div className="text-xs md:text-sm text-gray-600">
//             Showing {filteredApplications.length} of {applications.length} applications
//             {searchTerm && ` for "${searchTerm}"`}
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               All ({getStatusCounts().total})
//             </button>
//             <button
//               onClick={() => setStatusFilter('pending')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Pending ({getStatusCounts().pending})
//             </button>
//             <button
//               onClick={() => setStatusFilter('approved')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Approved ({getStatusCounts().approved})
//             </button>
//             <button
//               onClick={() => setStatusFilter('rejected')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Rejected ({getStatusCounts().rejected})
//             </button>
//           </div>
//         </div>

//         {/* Applications Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//               <div className="text-gray-500">Loading applications...</div>
//               <div className="text-xs text-gray-400 mt-2">Checking API endpoints...</div>
//             </div>
//           ) : filteredApplications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-64 p-6">
//               {applications.length === 0 ? (
//                 <>
//                   <div className="text-5xl mb-4">📭</div>
//                   <p className="text-lg font-medium text-gray-700 mb-2">
//                     No applications found
//                   </p>
//                   <p className="text-sm text-gray-500 text-center mb-4">
//                     There are no agent applications in the system.
//                   </p>
//                   <div className="flex flex-col gap-2 text-left max-w-md mx-auto">
//                     <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
//                       <p className="font-medium mb-1">Possible reasons:</p>
//                       <ul className="list-disc pl-4 space-y-1">
//                         <li>No users have applied as agents yet</li>
//                         <li>Backend API might be returning empty data</li>
//                         <li>Database connection issue</li>
//                         <li>Permission/authentication problem</li>
//                       </ul>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleTestApi}
//                     className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
//                   >
//                     Test API Connection
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <div className="text-5xl mb-4">🔍</div>
//                   <p className="text-lg font-medium text-gray-700 mb-2">
//                     No matching applications
//                   </p>
//                   <p className="text-sm text-gray-500 text-center mb-4">
//                     No applications match your search criteria.
//                   </p>
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
//                   >
//                     Clear Search
//                   </button>
//                 </>
//               )}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <div className="min-w-full inline-block align-middle">
//                 <div className="overflow-hidden border-b border-gray-200">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Agent Info
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Product
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           ID Number
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Payment Method
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Contact
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Status
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredApplications.map((app) => (
//                         <tr key={app.id} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
//                                 <User className="text-blue-600" size={20} />
//                               </div>
//                               <div className="ml-3">
//                                 <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
//                                   {app.full_name || 'N/A'}
//                                 </div>
//                                 <div className="text-xs text-gray-500 truncate max-w-[150px]">
//                                   {app.users?.email || 'N/A'}
//                                 </div>
//                                 <div className="text-xs text-gray-400 mt-1">
//                                   ID: {app.id}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                               {app.products?.name || 'N/A'}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="text-sm font-mono text-gray-900">
//                               {app.national_id || 'N/A'}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                               <div className="min-w-0">
//                                 <div className="text-sm font-medium text-gray-900 capitalize truncate max-w-[100px]">
//                                   {app.payout_method || 'N/A'}
//                                 </div>
//                                 {app.payout_method === 'bank' && app.bank_name && (
//                                   <div className="text-xs text-gray-500 truncate max-w-[100px]">
//                                     {app.bank_name}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                               <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                                 {app.payout_number || app.bank_account_number || 'N/A'}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               app.status === 'approved'
//                                 ? 'bg-green-100 text-green-800'
//                                 : app.status === 'rejected'
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {app.status}
//                             </span>
//                             {app.status === 'approved' && app.commission_rate && (
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {app.commission_rate}% commission
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap text-sm">
//                             <div className="flex flex-col sm:flex-row gap-2">
//                               {app.status === 'pending' ? (
//                                 <>
//                                   <button
//                                     onClick={() => handleApprove(app)}
//                                     disabled={processing}
//                                     className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                                   >
//                                     <CheckCircle size={14} />
//                                     <span>Approve</span>
//                                   </button>
//                                   <button
//                                     onClick={() => openRejectDialog(app)}
//                                     disabled={processing}
//                                     className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                                   >
//                                     <XCircle size={14} />
//                                     <span>Reject</span>
//                                   </button>
//                                 </>
//                               ) : (
//                                 <button
//                                   onClick={() => openDetailsDialog(app)}
//                                   className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap text-xs md:text-sm"
//                                 >
//                                   <Eye size={14} />
//                                   <span>View</span>
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Dialog */}
//       {showRejectDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md p-6">
//             <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
//               Reject Application
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Agent: <strong>{selectedApp.full_name}</strong>
//             </p>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Rejection Reason <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               rows={4}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm md:text-base"
//               placeholder="Please provide a reason for rejection (minimum 10 characters)..."
//             />
//             <div className="text-xs text-gray-500 mt-1">
//               Characters: {rejectionReason.length}/10
//             </div>
//             <div className="flex flex-col sm:flex-row gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowRejectDialog(false);
//                   setSelectedApp(null);
//                   setRejectionReason('');
//                 }}
//                 className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReject}
//                 disabled={processing || rejectionReason.length < 10}
//                 className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
//               >
//                 {processing ? 'Rejecting...' : 'Confirm Reject'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Details Dialog */}
//       {showDetailsDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-start mb-6">
//               <h3 className="text-lg md:text-xl font-bold text-gray-800">
//                 Application Details
//               </h3>
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XCircle size={24} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Full Name</p>
//                   <p className="font-medium">{selectedApp.full_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email</p>
//                   <p className="font-medium">{selectedApp.users?.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">National ID</p>
//                   <p className="font-medium">{selectedApp.national_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Product</p>
//                   <p className="font-medium">{selectedApp.products?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Payout Method</p>
//                   <p className="font-medium capitalize">{selectedApp.payout_method}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Status</p>
//                   <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
//                     selectedApp.status === 'approved'
//                       ? 'bg-green-100 text-green-800'
//                       : selectedApp.status === 'rejected'
//                       ? 'bg-red-100 text-red-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {selectedApp.status}
//                   </span>
//                 </div>
//               </div>

//               {selectedApp.status === 'approved' && selectedApp.agent_code && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-green-700 font-medium mb-2">Agent Code</p>
//                   <p className="font-mono text-base md:text-lg bg-white p-2 rounded">{selectedApp.agent_code}</p>
//                   {selectedApp.commission_rate && (
//                     <p className="text-sm text-green-600 mt-2">
//                       Commission Rate: {selectedApp.commission_rate}%
//                     </p>
//                   )}
//                 </div>
//               )}

//               {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-red-700 font-medium mb-2">Rejection Reason</p>
//                   <p className="text-sm text-red-600 bg-white p-2 rounded">{selectedApp.rejection_reason}</p>
//                 </div>
//               )}

//               {selectedApp.reason && (
//                 <div className="mt-4">
//                   <p className="text-sm text-gray-600 mb-2">Application Reason</p>
//                   <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedApp.reason}</p>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6">
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm md:text-base"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminAgentManagement;
























// AdminAgentManagement.tsx - FIXED VERSION
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   CheckCircle, 
//   XCircle, 
//   User, 
//   CreditCard, 
//   Phone, 
//   FileText,
//   Clock,
//   Filter,
//   Eye,
//   RefreshCw
// } from 'lucide-react';
// import {
//   GetPendingAgentApplications,
//   GetAllAgentApplications,
//   ApproveAgentApplication,
//   RejectAgentApplication
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const AdminAgentManagement = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [filteredApplications, setFilteredApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
//   const [selectedApp, setSelectedApp] = useState<ProductAgent | null>(null);
//   const [showRejectDialog, setShowRejectDialog] = useState(false);
//   const [showDetailsDialog, setShowDetailsDialog] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [commissionRate, setCommissionRate] = useState(10);
//   const [processing, setProcessing] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

//   useEffect(() => {
//     if (showSuccessMessage) {
//       const timer = setTimeout(() => {
//         setShowSuccessMessage(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccessMessage]);

//   useEffect(() => {
//     loadApplications();
//   }, [statusFilter]);

//   useEffect(() => {
//     filterApplications();
//   }, [searchTerm, applications]);

//   const loadApplications = async () => {
//     setLoading(true);
//     try {
//       console.log(`🔄 Loading applications with filter: ${statusFilter}`);
      
//       let data;
//       if (statusFilter === 'pending') {
//         data = await GetPendingAgentApplications();
//       } else if (statusFilter === 'all') {
//         data = await GetAllAgentApplications();
//       } else {
//         data = await GetAllAgentApplications({ status: statusFilter });
//       }
      
//       console.log('📦 Data received from API:', data);
      
//       const applicationsArray = Array.isArray(data) ? data : [];
//       console.log(`✅ Loaded ${applicationsArray.length} applications`);
      
//       setApplications(applicationsArray);
//       setFilteredApplications(applicationsArray);
//     } catch (error: any) {
//       console.error('❌ Failed to load applications:', error);
//       alert(`Error: ${error.message || 'Failed to load applications'}`);
//       setApplications([]);
//       setFilteredApplications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterApplications = () => {
//     if (!searchTerm.trim()) {
//       setFilteredApplications(applications);
//       return;
//     }

//     const filtered = applications.filter(app => {
//       const fullName = app.full_name?.toLowerCase() || '';
//       const nationalId = app.national_id?.toLowerCase() || '';
//       const productName = app.products?.name?.toLowerCase() || '';
//       const email = app.users?.email?.toLowerCase() || '';
      
//       return fullName.includes(searchTerm.toLowerCase()) ||
//              nationalId.includes(searchTerm.toLowerCase()) ||
//              productName.includes(searchTerm.toLowerCase()) ||
//              email.includes(searchTerm.toLowerCase());
//     });
//     setFilteredApplications(filtered);
//   };

//   const handleApprove = async (app: ProductAgent) => {
//     setProcessing(true);
//     try {
//       console.log(`Approving agent ${app.id} with commission rate ${commissionRate}%`);
//       await ApproveAgentApplication(app.id, commissionRate);
      
//       setShowSuccessMessage(`✅ Agent ${app.full_name} approved with ${commissionRate}% commission!`);
      
//       // Update the local state immediately
//       const updatedApplications = applications.map(a => 
//         a.id === app.id 
//           ? { 
//               ...a, 
//               status: 'approved',
//               commission_rate: commissionRate.toString(),
//               agent_code: a.agent_code || `AG${app.id}${Date.now().toString().slice(-6)}`
//             } 
//           : a
//       );
      
//       setApplications(updatedApplications);
      
//       // Also reload to get fresh data from server
//       setTimeout(() => loadApplications(), 1000);
      
//     } catch (error: any) {
//       console.error('Approval error:', error);
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const openRejectDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowRejectDialog(true);
//     setRejectionReason('');
//   };

//   const openDetailsDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowDetailsDialog(true);
//   };

//   const handleReject = async () => {
//     if (!selectedApp || !rejectionReason.trim()) {
//       alert('Please provide a rejection reason');
//       return;
//     }

//     setProcessing(true);
//     try {
//       console.log(`Rejecting agent ${selectedApp.id} with reason: ${rejectionReason}`);
//       await RejectAgentApplication(selectedApp.id, rejectionReason);
      
//       setShowSuccessMessage(`❌ Agent ${selectedApp.full_name} application rejected`);
      
//       // Update the local state immediately
//       const updatedApplications = applications.map(a => 
//         a.id === selectedApp.id 
//           ? { 
//               ...a, 
//               status: 'rejected',
//               rejection_reason: rejectionReason
//             } 
//           : a
//       );
      
//       setApplications(updatedApplications);
      
//       setShowRejectDialog(false);
//       setSelectedApp(null);
//       setRejectionReason('');
      
//       // Also reload to get fresh data from server
//       setTimeout(() => loadApplications(), 1000);
      
//     } catch (error: any) {
//       console.error('Rejection error:', error);
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const getStatusCounts = () => {
//     const allApps = applications;
//     return {
//       pending: allApps.filter(a => a.status === 'pending').length,
//       approved: allApps.filter(a => a.status === 'approved').length,
//       rejected: allApps.filter(a => a.status === 'rejected').length,
//       total: allApps.length
//     };
//   };

//   const handleRefresh = () => {
//     loadApplications();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-[1800px] mx-auto">
//         {/* Success Message Banner */}
//         {showSuccessMessage && (
//           <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <CheckCircle className="mr-2" size={20} />
//                 <span className="text-sm md:text-base">{showSuccessMessage}</span>
//               </div>
//               <button
//                 onClick={() => setShowSuccessMessage(null)}
//                 className="text-green-700 hover:text-green-900"
//               >
//                 <XCircle size={18} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
//                 Agent Applications Management
//               </h1>
//               <p className="text-sm md:text-base text-gray-600">
//                 Review and approve agent applications
//               </p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 self-start md:self-auto"
//             >
//               <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
//               <span className="text-sm md:text-base">Refresh</span>
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <div className="lg:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   placeholder="Search by name, ID, product, or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 flex items-center gap-2">
//                 <Filter size={20} className="text-gray-400 flex-shrink-0" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value as any)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 >
//                   <option value="pending">Pending Only</option>
//                   <option value="all">All Applications</option>
//                   <option value="approved">Approved Only</option>
//                   <option value="rejected">Rejected Only</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {statusFilter === 'pending' && (
//             <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
//               <label className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
//                 Default Commission Rate:
//               </label>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="range"
//                   min="0.1"
//                   max="50"
//                   step="0.1"
//                   value={commissionRate}
//                   onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                   className="flex-1"
//                 />
//                 <input
//                   type="number"
//                   min="0.1"
//                   max="50"
//                   step="0.1"
//                   value={commissionRate}
//                   onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                   className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
//                 />
//                 <span className="text-sm md:text-base text-gray-600 whitespace-nowrap">%</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-gray-600">Total</p>
//                 <p className="text-lg md:text-2xl font-bold text-gray-800">{getStatusCounts().total}</p>
//               </div>
//               <FileText className="text-gray-400" size={24} />
//             </div>
//           </div>
//           <div className="bg-yellow-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-yellow-700">Pending</p>
//                 <p className="text-lg md:text-2xl font-bold text-yellow-800">
//                   {getStatusCounts().pending}
//                 </p>
//               </div>
//               <Clock className="text-yellow-600" size={24} />
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-green-700">Approved</p>
//                 <p className="text-lg md:text-2xl font-bold text-green-800">
//                   {getStatusCounts().approved}
//                 </p>
//               </div>
//               <CheckCircle className="text-green-600" size={24} />
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg shadow-sm p-3 md:p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs md:text-sm text-red-700">Rejected</p>
//                 <p className="text-lg md:text-2xl font-bold text-red-800">
//                   {getStatusCounts().rejected}
//                 </p>
//               </div>
//               <XCircle className="text-red-600" size={24} />
//             </div>
//           </div>
//         </div>

//         {/* Quick Filter Buttons */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
//           <div className="text-xs md:text-sm text-gray-600">
//             Showing {filteredApplications.length} of {applications.length} applications
//             {searchTerm && ` for "${searchTerm}"`}
//           </div>
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setStatusFilter('pending')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Pending ({getStatusCounts().pending})
//             </button>
//             <button
//               onClick={() => setStatusFilter('approved')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Approved ({getStatusCounts().approved})
//             </button>
//             <button
//               onClick={() => setStatusFilter('rejected')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               Rejected ({getStatusCounts().rejected})
//             </button>
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-3 py-1.5 text-xs md:text-sm rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//             >
//               All ({getStatusCounts().total})
//             </button>
//           </div>
//         </div>

//         {/* Applications Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//               <div className="text-gray-500">Loading applications...</div>
//             </div>
//           ) : filteredApplications.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-64 p-6">
//               <div className="text-5xl mb-4">📄</div>
//               <p className="text-lg font-medium text-gray-700 mb-2">
//                 {searchTerm ? 'No applications found' : 'No applications yet'}
//               </p>
//               <p className="text-sm text-gray-500 text-center">
//                 {searchTerm 
//                   ? 'Try a different search term or clear the search'
//                   : 'When users apply as agents, they will appear here'
//                 }
//               </p>
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
//                 >
//                   Clear Search
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <div className="min-w-full inline-block align-middle">
//                 <div className="overflow-hidden border-b border-gray-200">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Agent Info
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Product
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           ID Number
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Payment Method
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Contact
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Status
//                         </th>
//                         <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredApplications.map((app) => (
//                         <tr key={app.id} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
//                                 <User className="text-blue-600" size={20} />
//                               </div>
//                               <div className="ml-3">
//                                 <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
//                                   {app.full_name || 'N/A'}
//                                 </div>
//                                 <div className="text-xs text-gray-500 truncate max-w-[150px]">
//                                   {app.users?.email || 'N/A'}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                               {app.products?.name || 'N/A'}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="text-sm font-mono text-gray-900">
//                               {app.national_id || 'N/A'}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                               <div className="min-w-0">
//                                 <div className="text-sm font-medium text-gray-900 capitalize truncate max-w-[100px]">
//                                   {app.payout_method || 'N/A'}
//                                 </div>
//                                 {app.payout_method === 'bank' && app.bank_name && (
//                                   <div className="text-xs text-gray-500 truncate max-w-[100px]">
//                                     {app.bank_name}
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                               <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                                 {app.payout_number || app.bank_account_number || 'N/A'}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap">
//                             <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                               app.status === 'approved'
//                                 ? 'bg-green-100 text-green-800'
//                                 : app.status === 'rejected'
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}>
//                               {app.status}
//                             </span>
//                             {app.status === 'approved' && app.commission_rate && (
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {app.commission_rate}% commission
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-4 py-3 whitespace-nowrap text-sm">
//                             <div className="flex flex-col sm:flex-row gap-2">
//                               {app.status === 'pending' ? (
//                                 <>
//                                   <button
//                                     onClick={() => handleApprove(app)}
//                                     disabled={processing}
//                                     className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                                   >
//                                     <CheckCircle size={14} />
//                                     <span>Approve</span>
//                                   </button>
//                                   <button
//                                     onClick={() => openRejectDialog(app)}
//                                     disabled={processing}
//                                     className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                                   >
//                                     <XCircle size={14} />
//                                     <span>Reject</span>
//                                   </button>
//                                 </>
//                               ) : (
//                                 <button
//                                   onClick={() => openDetailsDialog(app)}
//                                   className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap text-xs md:text-sm"
//                                 >
//                                   <Eye size={14} />
//                                   <span>View</span>
//                                 </button>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Dialog */}
//       {showRejectDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md p-6">
//             <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
//               Reject Application
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Agent: <strong>{selectedApp.full_name}</strong>
//             </p>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Rejection Reason <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               rows={4}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm md:text-base"
//               placeholder="Please provide a reason for rejection (minimum 10 characters)..."
//             />
//             <div className="text-xs text-gray-500 mt-1">
//               Characters: {rejectionReason.length}/10
//             </div>
//             <div className="flex flex-col sm:flex-row gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowRejectDialog(false);
//                   setSelectedApp(null);
//                   setRejectionReason('');
//                 }}
//                 className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReject}
//                 disabled={processing || rejectionReason.length < 10}
//                 className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
//               >
//                 {processing ? 'Rejecting...' : 'Confirm Reject'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Details Dialog */}
//       {showDetailsDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-start mb-6">
//               <h3 className="text-lg md:text-xl font-bold text-gray-800">
//                 Application Details
//               </h3>
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XCircle size={24} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Full Name</p>
//                   <p className="font-medium">{selectedApp.full_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email</p>
//                   <p className="font-medium">{selectedApp.users?.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">National ID</p>
//                   <p className="font-medium">{selectedApp.national_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Product</p>
//                   <p className="font-medium">{selectedApp.products?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Payout Method</p>
//                   <p className="font-medium capitalize">{selectedApp.payout_method}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Status</p>
//                   <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
//                     selectedApp.status === 'approved'
//                       ? 'bg-green-100 text-green-800'
//                       : selectedApp.status === 'rejected'
//                       ? 'bg-red-100 text-red-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {selectedApp.status}
//                   </span>
//                 </div>
//               </div>

//               {selectedApp.status === 'approved' && selectedApp.agent_code && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-green-700 font-medium mb-2">Agent Code</p>
//                   <p className="font-mono text-base md:text-lg bg-white p-2 rounded">{selectedApp.agent_code}</p>
//                   {selectedApp.commission_rate && (
//                     <p className="text-sm text-green-600 mt-2">
//                       Commission Rate: {selectedApp.commission_rate}%
//                     </p>
//                   )}
//                 </div>
//               )}

//               {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-red-700 font-medium mb-2">Rejection Reason</p>
//                   <p className="text-sm text-red-600 bg-white p-2 rounded">{selectedApp.rejection_reason}</p>
//                 </div>
//               )}

//               {selectedApp.reason && (
//                 <div className="mt-4">
//                   <p className="text-sm text-gray-600 mb-2">Application Reason</p>
//                   <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedApp.reason}</p>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6">
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm md:text-base"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminAgentManagement;











// AdminAgentManagement.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, 
//   CheckCircle, 
//   XCircle, 
//   User, 
//   CreditCard, 
//   Phone, 
//   FileText,
//   Clock,
//   Filter,
//   Eye
// } from 'lucide-react';
// import {
//   GetPendingAgentApplications,
//   GetAllAgentApplications,
//   ApproveAgentApplication,
//   RejectAgentApplication
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const AdminAgentManagement = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [filteredApplications, setFilteredApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
//   const [selectedApp, setSelectedApp] = useState<ProductAgent | null>(null);
//   const [showRejectDialog, setShowRejectDialog] = useState(false);
//   const [showDetailsDialog, setShowDetailsDialog] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [commissionRate, setCommissionRate] = useState(10);
//   const [processing, setProcessing] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

//   useEffect(() => {
//     if (showSuccessMessage) {
//       const timer = setTimeout(() => {
//         setShowSuccessMessage(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccessMessage]);

//   useEffect(() => {
//     loadApplications();
//   }, [statusFilter]);

//   useEffect(() => {
//     filterApplications();
//   }, [searchTerm, applications]);

//   const loadApplications = async () => {
//     setLoading(true);
//     try {
//       console.log(`🔄 Loading applications with filter: ${statusFilter}`);
      
//       let data;
//       if (statusFilter === 'pending') {
//         data = await GetPendingAgentApplications();
//       } else if (statusFilter === 'all') {
//         data = await GetAllAgentApplications();
//       } else {
//         data = await GetAllAgentApplications({ status: statusFilter });
//       }
      
//       console.log('📦 Data received from API:', data);
      
//       const applicationsArray = Array.isArray(data) ? data : [];
//       console.log(`✅ Loaded ${applicationsArray.length} applications`);
      
//       setApplications(applicationsArray);
//       setFilteredApplications(applicationsArray);
//     } catch (error: any) {
//       console.error('❌ Failed to load applications:', error);
//       alert(`Error: ${error.message || 'Failed to load applications'}`);
//       setApplications([]);
//       setFilteredApplications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterApplications = () => {
//     if (!searchTerm.trim()) {
//       setFilteredApplications(applications);
//       return;
//     }

//     const filtered = applications.filter(app =>
//       app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.national_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredApplications(filtered);
//   };

//   const handleApprove = async (app: ProductAgent) => {
//     setProcessing(true);
//     try {
//       await ApproveAgentApplication(app.id, commissionRate);
      
//       setShowSuccessMessage(`✅ Agent ${app.full_name} approved with ${commissionRate}% commission!`);
      
//       // Reload to get fresh data with updated status
//       await loadApplications();
      
//     } catch (error: any) {
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const openRejectDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowRejectDialog(true);
//     setRejectionReason('');
//   };

//   const openDetailsDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowDetailsDialog(true);
//   };

//   const handleReject = async () => {
//     if (!selectedApp || !rejectionReason.trim()) {
//       alert('Please provide a rejection reason');
//       return;
//     }

//     setProcessing(true);
//     try {
//       await RejectAgentApplication(selectedApp.id, rejectionReason);
      
//       setShowSuccessMessage(`❌ Agent ${selectedApp.full_name} application rejected`);
      
//       setShowRejectDialog(false);
//       setSelectedApp(null);
      
//       await loadApplications();
      
//     } catch (error: any) {
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Success Message Banner */}
//         {showSuccessMessage && (
//           <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
//             <div className="flex items-center">
//               <CheckCircle className="mr-2" size={20} />
//               {showSuccessMessage}
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">
//             Agent Applications Management
//           </h1>
//           <p className="text-gray-600">
//             Review and approve agent applications
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by name, ID, or product..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter size={20} className="text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="pending">Pending Only</option>
//                 <option value="all">All Applications</option>
//                 <option value="approved">Approved Only</option>
//                 <option value="rejected">Rejected Only</option>
//               </select>
//             </div>
//           </div>

//           {statusFilter === 'pending' && (
//             <div className="mt-4 flex items-center gap-4">
//               <label className="text-sm font-medium text-gray-700">
//                 Default Commission Rate:
//               </label>
//               <input
//                 type="number"
//                 min="0.1"
//                 max="50"
//                 step="0.1"
//                 value={commissionRate}
//                 onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                 className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <span className="text-sm text-gray-600">%</span>
//             </div>
//           )}
//         </div>

//         {/* Quick Filter Buttons */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="text-sm text-gray-600">
//             Showing {filteredApplications.length} of {applications.length} applications
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setStatusFilter('pending')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Pending ({applications.filter(a => a.status === 'pending').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('approved')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Approved ({applications.filter(a => a.status === 'approved').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('rejected')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Rejected ({applications.filter(a => a.status === 'rejected').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               All ({applications.length})
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total</p>
//                 <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
//               </div>
//               <FileText className="text-gray-400" size={32} />
//             </div>
//           </div>
//           <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-yellow-700">Pending</p>
//                 <p className="text-2xl font-bold text-yellow-800">
//                   {applications.filter(a => a.status === 'pending').length}
//                 </p>
//               </div>
//               <Clock className="text-yellow-600" size={32} />
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-700">Approved</p>
//                 <p className="text-2xl font-bold text-green-800">
//                   {applications.filter(a => a.status === 'approved').length}
//                 </p>
//               </div>
//               <CheckCircle className="text-green-600" size={32} />
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-red-700">Rejected</p>
//                 <p className="text-2xl font-bold text-red-800">
//                   {applications.filter(a => a.status === 'rejected').length}
//                 </p>
//               </div>
//               <XCircle className="text-red-600" size={32} />
//             </div>
//           </div>
//         </div>

//         {/* Applications Table - FIXED OVERFLOW */}
//         <div className="bg-white rounded-lg shadow-sm">
//           {loading ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-gray-500">Loading applications...</div>
//             </div>
//           ) : filteredApplications.length === 0 ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-gray-500">
//                 {searchTerm ? 'No applications match your search' : 'No applications found'}
//               </div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-max">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Agent Info
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Product
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       National ID
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Payout Method
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Contact
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredApplications.map((app) => (
//                     <tr key={app.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <User className="text-gray-400 mr-2 flex-shrink-0" size={20} />
//                           <div className="min-w-0">
//                             <div className="text-sm font-medium text-gray-900 truncate">
//                               {app.full_name}
//                             </div>
//                             <div className="text-sm text-gray-500 truncate">
//                               {app.users?.email}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {app.products?.name || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{app.national_id}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="min-w-0">
//                             <div className="text-sm font-medium text-gray-900 capitalize truncate">
//                               {app.payout_method}
//                             </div>
//                             {app.payout_method === 'bank' && app.bank_name && (
//                               <div className="text-xs text-gray-500 truncate">
//                                 {app.bank_name}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="text-sm text-gray-900 truncate">
//                             {app.payout_number || app.bank_account_number || 'N/A'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           app.status === 'approved'
//                             ? 'bg-green-100 text-green-800'
//                             : app.status === 'rejected'
//                             ? 'bg-red-100 text-red-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {app.status}
//                         </span>
//                         {app.status === 'approved' && app.commission_rate && (
//                           <div className="text-xs text-gray-500 mt-1">
//                             {app.commission_rate}% commission
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {app.status === 'pending' ? (
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleApprove(app)}
//                               disabled={processing}
//                               className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap"
//                             >
//                               <CheckCircle size={16} />
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => openRejectDialog(app)}
//                               disabled={processing}
//                               className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap"
//                             >
//                               <XCircle size={16} />
//                               Reject
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => openDetailsDialog(app)}
//                             className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
//                           >
//                             <Eye size={16} />
//                             View
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Dialog */}
//       {showRejectDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               Reject Application
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Agent: <strong>{selectedApp.full_name}</strong>
//             </p>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Rejection Reason <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               rows={4}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
//               placeholder="Please provide a reason for rejection (minimum 10 characters)..."
//             />
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowRejectDialog(false);
//                   setSelectedApp(null);
//                 }}
//                 className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReject}
//                 disabled={processing || rejectionReason.length < 10}
//                 className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {processing ? 'Rejecting...' : 'Confirm Reject'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Details Dialog */}
//       {showDetailsDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-start mb-6">
//               <h3 className="text-xl font-bold text-gray-800">
//                 Application Details
//               </h3>
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XCircle size={24} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Full Name</p>
//                   <p className="font-medium">{selectedApp.full_name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email</p>
//                   <p className="font-medium">{selectedApp.users?.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">National ID</p>
//                   <p className="font-medium">{selectedApp.national_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Product</p>
//                   <p className="font-medium">{selectedApp.products?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Payout Method</p>
//                   <p className="font-medium capitalize">{selectedApp.payout_method}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Status</p>
//                   <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
//                     selectedApp.status === 'approved'
//                       ? 'bg-green-100 text-green-800'
//                       : selectedApp.status === 'rejected'
//                       ? 'bg-red-100 text-red-800'
//                       : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {selectedApp.status}
//                   </span>
//                 </div>
//               </div>

//               {selectedApp.status === 'approved' && selectedApp.agent_code && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-green-700 font-medium mb-2">Agent Code</p>
//                   <p className="font-mono text-lg">{selectedApp.agent_code}</p>
//                   {selectedApp.commission_rate && (
//                     <p className="text-sm text-green-600 mt-2">
//                       Commission Rate: {selectedApp.commission_rate}%
//                     </p>
//                   )}
//                 </div>
//               )}

//               {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
//                   <p className="text-sm text-red-700 font-medium mb-2">Rejection Reason</p>
//                   <p className="text-sm text-red-600">{selectedApp.rejection_reason}</p>
//                 </div>
//               )}

//               {selectedApp.reason && (
//                 <div className="mt-4">
//                   <p className="text-sm text-gray-600 mb-2">Application Reason</p>
//                   <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedApp.reason}</p>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6">
//               <button
//                 onClick={() => setShowDetailsDialog(false)}
//                 className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminAgentManagement;























 // AdminAgentManagement.tsx
// import React, { useState, useEffect } from 'react';
















// import { 
//   Search, 
//   CheckCircle, 
//   XCircle, 
//   User, 
//   CreditCard, 
//   Phone, 
//   FileText,
//   Clock,
//   Filter
// } from 'lucide-react';
// import {
//   GetPendingAgentApplications,
//   GetAllAgentApplications,
//   ApproveAgentApplication,
//   RejectAgentApplication
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const AdminAgentManagement = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [filteredApplications, setFilteredApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
//   const [selectedApp, setSelectedApp] = useState<ProductAgent | null>(null);
//   const [showRejectDialog, setShowRejectDialog] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [commissionRate, setCommissionRate] = useState(10);
//   const [processing, setProcessing] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

//   // Auto-hide success message after 3 seconds
//   useEffect(() => {
//     if (showSuccessMessage) {
//       const timer = setTimeout(() => {
//         setShowSuccessMessage(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [showSuccessMessage]);

//   useEffect(() => {
//     loadApplications();
//   }, [statusFilter]);

//   useEffect(() => {
//     filterApplications();
//   }, [searchTerm, applications]);

//   const loadApplications = async () => {
//     setLoading(true);
//     try {
//       console.log(`🔄 Loading applications with filter: ${statusFilter}`);
      
//       let data;
//       if (statusFilter === 'pending') {
//         data = await GetPendingAgentApplications();
//       } else if (statusFilter === 'all') {
//         data = await GetAllAgentApplications();
//       } else {
//         data = await GetAllAgentApplications({ status: statusFilter });
//       }
      
//       console.log('📦 Data received from API:', data);
      
//       // Ensure data is an array
//       const applicationsArray = Array.isArray(data) ? data : [];
      
//       console.log(`✅ Loaded ${applicationsArray.length} applications`);
      
//       setApplications(applicationsArray);
//       setFilteredApplications(applicationsArray);
//     } catch (error: any) {
//       console.error('❌ Failed to load applications:', error);
//       alert(`Error: ${error.message || 'Failed to load applications'}`);
//       setApplications([]);
//       setFilteredApplications([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterApplications = () => {
//     if (!searchTerm.trim()) {
//       setFilteredApplications(applications);
//       return;
//     }

//     const filtered = applications.filter(app =>
//       app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.national_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredApplications(filtered);
//   };

//   const handleApprove = async (app: ProductAgent) => {
//     setProcessing(true);
//     try {
//       await ApproveAgentApplication(app.id, commissionRate);
      
//       // Show success message
//       setShowSuccessMessage(`✅ Agent ${app.full_name} approved with ${commissionRate}% commission!`);
      
//       // Reload applications to get updated data
//       loadApplications();
      
//       // After approving, show all applications so user can see the change
//       setStatusFilter('all');
      
//     } catch (error: any) {
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const openRejectDialog = (app: ProductAgent) => {
//     setSelectedApp(app);
//     setShowRejectDialog(true);
//     setRejectionReason('');
//   };

//   const handleReject = async () => {
//     if (!selectedApp || !rejectionReason.trim()) {
//       alert('Please provide a rejection reason');
//       return;
//     }

//     setProcessing(true);
//     try {
//       await RejectAgentApplication(selectedApp.id, rejectionReason);
      
//       // Show success message
//       setShowSuccessMessage(`❌ Agent ${selectedApp.full_name} application rejected`);
      
//       setShowRejectDialog(false);
//       setSelectedApp(null);
      
//       // Reload applications to get updated data
//       loadApplications();
      
//     } catch (error: any) {
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Success Message Banner */}
//         {showSuccessMessage && (
//           <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
//             <div className="flex items-center">
//               <CheckCircle className="mr-2" size={20} />
//               {showSuccessMessage}
//             </div>
//           </div>
//         )}

//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">
//             Agent Applications Management
//           </h1>
//           <p className="text-gray-600">
//             Review and approve agent applications
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by name, ID, or product..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Status Filter */}
//             <div className="flex items-center gap-2">
//               <Filter size={20} className="text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="pending">Pending Only</option>
//                 <option value="all">All Applications</option>
//                 <option value="approved">Approved Only</option>
//                 <option value="rejected">Rejected Only</option>
//               </select>
//             </div>
//           </div>

//           {/* Commission Rate Input */}
//           {statusFilter === 'pending' && (
//             <div className="mt-4 flex items-center gap-4">
//               <label className="text-sm font-medium text-gray-700">
//                 Default Commission Rate:
//               </label>
//               <input
//                 type="number"
//                 min="0.1"
//                 max="50"
//                 step="0.1"
//                 value={commissionRate}
//                 onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
//                 className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <span className="text-sm text-gray-600">%</span>
//             </div>
//           )}
//         </div>

//         {/* Quick Filter Buttons */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="text-sm text-gray-600">
//             Showing {filteredApplications.length} of {applications.length} applications
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setStatusFilter('pending')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Pending ({applications.filter(a => a.status === 'pending').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('approved')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Approved ({applications.filter(a => a.status === 'approved').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('rejected')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               Rejected ({applications.filter(a => a.status === 'rejected').length})
//             </button>
//             <button
//               onClick={() => setStatusFilter('all')}
//               className={`px-3 py-1 text-sm rounded-lg ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
//             >
//               All ({applications.length})
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total</p>
//                 <p className="text-2xl font-bold text-gray-800">{applications.length}</p>
//               </div>
//               <FileText className="text-gray-400" size={32} />
//             </div>
//           </div>
//           <div className="bg-yellow-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-yellow-700">Pending</p>
//                 <p className="text-2xl font-bold text-yellow-800">
//                   {applications.filter(a => a.status === 'pending').length}
//                 </p>
//               </div>
//               <Clock className="text-yellow-600" size={32} />
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-700">Approved</p>
//                 <p className="text-2xl font-bold text-green-800">
//                   {applications.filter(a => a.status === 'approved').length}
//                 </p>
//               </div>
//               <CheckCircle className="text-green-600" size={32} />
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-red-700">Rejected</p>
//                 <p className="text-2xl font-bold text-red-800">
//                   {applications.filter(a => a.status === 'rejected').length}
//                 </p>
//               </div>
//               <XCircle className="text-red-600" size={32} />
//             </div>
//           </div>
//         </div>

//         {/* Applications Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-gray-500">Loading applications...</div>
//             </div>
//           ) : filteredApplications.length === 0 ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="text-gray-500">
//                 {searchTerm ? 'No applications match your search' : 'No applications found'}
//               </div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Agent Info
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Product
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       National ID
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Payout Method
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Contact
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredApplications.map((app) => (
//                     <tr key={app.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <User className="text-gray-400 mr-2" size={20} />
//                           <div>
//                             <div className="text-sm font-medium text-gray-900">
//                               {app.full_name}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {app.users?.email}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">
//                           {app.products?.name || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{app.national_id}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CreditCard className="text-gray-400 mr-2" size={16} />
//                           <div>
//                             <div className="text-sm font-medium text-gray-900 capitalize">
//                               {app.payout_method}
//                             </div>
//                             {app.payout_method === 'bank' ? (
//                               <div className="text-xs text-gray-500">
//                                 {app.bank_name}
//                               </div>
//                             ) : null}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <Phone className="text-gray-400 mr-2" size={16} />
//                           <div className="text-sm text-gray-900">
//                             {app.payout_number || app.bank_account_number || 'N/A'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           app.status === 'approved'
//                             ? 'bg-green-100 text-green-800'
//                             : app.status === 'rejected'
//                             ? 'bg-red-100 text-red-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {app.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {app.status === 'pending' ? (
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleApprove(app)}
//                               disabled={processing}
//                               className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
//                             >
//                               <CheckCircle size={16} />
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => openRejectDialog(app)}
//                               disabled={processing}
//                               className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
//                             >
//                               <XCircle size={16} />
//                               Reject
//                             </button>
//                           </div>
//                         ) : (
//                           <span className="text-gray-400">-</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Dialog */}
//       {showRejectDialog && selectedApp && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">
//               Reject Application
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Agent: <strong>{selectedApp.full_name}</strong>
//             </p>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Rejection Reason <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               rows={4}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
//               placeholder="Please provide a reason for rejection (minimum 10 characters)..."
//             />
//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => {
//                   setShowRejectDialog(false);
//                   setSelectedApp(null);
//                 }}
//                 className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReject}
//                 disabled={processing || rejectionReason.length < 10}
//                 className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {processing ? 'Rejecting...' : 'Confirm Reject'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminAgentManagement;








