// AdminAgentManagement.tsx - FIXED VERSION
import  { useState, useEffect } from 'react';
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
  RefreshCw
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
    <div className="min-h-screen overflow-hidden bg-gray-50">
      <div className="max-w-[100%] ">
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
        <div className="bg-white rounded-lg shadow-sm">
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
              <table className="w-full divide-y divide-gray-200">
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
























// // AdminAgentManagement.tsx - FIXED VERSION
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
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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
//     // Filter applications when search term changes
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
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-[90%]  p-4 md:p-6">
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
//         <div className="bg-white rounded-lg shadow-sm">
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
//               <table className="w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Agent Info
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Product
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       ID Number
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Payment Method
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Contact
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Status
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredApplications.map((app) => (
//                     <tr key={app.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
//                             <User className="text-blue-600" size={20} />
//                           </div>
//                           <div className="ml-3">
//                             <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
//                               {app.full_name || 'N/A'}
//                             </div>
//                             <div className="text-xs text-gray-500 truncate max-w-[150px]">
//                               {app.users?.email || 'N/A'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                           {app.products?.name || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm font-mono text-gray-900">
//                           {app.national_id || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="min-w-0">
//                             <div className="text-sm font-medium text-gray-900 capitalize truncate max-w-[100px]">
//                               {app.payout_method || 'N/A'}
//                             </div>
//                             {app.payout_method === 'bank' && app.bank_name && (
//                               <div className="text-xs text-gray-500 truncate max-w-[100px]">
//                                 {app.bank_name}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                             {app.payout_number || app.bank_account_number || 'N/A'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
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
//                       <td className="px-4 py-3 whitespace-nowrap text-sm">
//                         <div className="flex flex-col sm:flex-row gap-2">
//                           {app.status === 'pending' ? (
//                             <>
//                               <button
//                                 onClick={() => handleApprove(app)}
//                                 disabled={processing}
//                                 className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                               >
//                                 <CheckCircle size={14} />
//                                 <span>Approve</span>
//                               </button>
//                               <button
//                                 onClick={() => openRejectDialog(app)}
//                                 disabled={processing}
//                                 className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                               >
//                                 <XCircle size={14} />
//                                 <span>Reject</span>
//                               </button>
//                             </>
//                           ) : (
//                             <button
//                               onClick={() => openDetailsDialog(app)}
//                               className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap text-xs md:text-sm"
//                             >
//                               <Eye size={14} />
//                               <span>View</span>
//                             </button>
//                           )}
//                         </div>
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



















// // AdminAgentManagement.tsx - FIXED VERSION
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
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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
//     // Filter applications when search term changes
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
//       <div className="">
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
//             <div className="w-full overflow-x-auto">
//               <table className="w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Agent Info
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Product
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       ID Number
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Payment Method
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Contact
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Status
//                     </th>
//                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredApplications.map((app) => (
//                     <tr key={app.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
//                             <User className="text-blue-600" size={20} />
//                           </div>
//                           <div className="ml-3">
//                             <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
//                               {app.full_name || 'N/A'}
//                             </div>
//                             <div className="text-xs text-gray-500 truncate max-w-[150px]">
//                               {app.users?.email || 'N/A'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                           {app.products?.name || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm font-mono text-gray-900">
//                           {app.national_id || 'N/A'}
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <CreditCard className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="min-w-0">
//                             <div className="text-sm font-medium text-gray-900 capitalize truncate max-w-[100px]">
//                               {app.payout_method || 'N/A'}
//                             </div>
//                             {app.payout_method === 'bank' && app.bank_name && (
//                               <div className="text-xs text-gray-500 truncate max-w-[100px]">
//                                 {app.bank_name}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <Phone className="text-gray-400 mr-2 flex-shrink-0" size={16} />
//                           <div className="text-sm text-gray-900 truncate max-w-[120px]">
//                             {app.payout_number || app.bank_account_number || 'N/A'}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap">
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
//                       <td className="px-4 py-3 whitespace-nowrap text-sm">
//                         <div className="flex flex-col sm:flex-row gap-2">
//                           {app.status === 'pending' ? (
//                             <>
//                               <button
//                                 onClick={() => handleApprove(app)}
//                                 disabled={processing}
//                                 className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                               >
//                                 <CheckCircle size={14} />
//                                 <span>Approve</span>
//                               </button>
//                               <button
//                                 onClick={() => openRejectDialog(app)}
//                                 disabled={processing}
//                                 className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 whitespace-nowrap text-xs md:text-sm"
//                               >
//                                 <XCircle size={14} />
//                                 <span>Reject</span>
//                               </button>
//                             </>
//                           ) : (
//                             <button
//                               onClick={() => openDetailsDialog(app)}
//                               className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap text-xs md:text-sm"
//                             >
//                               <Eye size={14} />
//                               <span>View</span>
//                             </button>
//                           )}
//                         </div>
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
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
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
//     // Filter applications when search term changes
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



