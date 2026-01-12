// MyAgentApplications.tsx - Updated with URL transformation
import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Share2,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  GetMyAgentApplications,
  GenerateReferralLink
} from '@/api/productAgentsApi';
import { ProductAgent } from '@/components/interfaces/productAgents';

const MyAgentApplications = () => {
  const [applications, setApplications] = useState<ProductAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralLinks, setReferralLinks] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Function to transform the URL from Vercel to your custom domain
  const transformReferralUrl = (vercelUrl: string): string => {
    try {
      // Replace the Vercel URL with your custom domain
      const url = new URL(vercelUrl);
      
      // Replace the hostname with your custom domain
      // Keep the same path and query parameters
      const newUrl = `https://mmshop.co.zw${url.pathname}${url.search}`;
      
      return newUrl;
    } catch (error) {
      console.error('Error transforming URL:', error);
      return vercelUrl; // Return original if transformation fails
    }
  };

  // Alternative simpler function if above doesn't work
  const transformReferralUrlSimple = (vercelUrl: string): string => {
    // Replace the Vercel URL part with your custom domain
    return vercelUrl.replace(
      'https://dimbop-digital-marketing-dashboard.vercel.app',
      'https://mmshop.co.zw'
    );
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await GetMyAgentApplications();
      console.log('Applications loaded:', data);
      setApplications(Array.isArray(data) ? data : []);
      
      // Generate referral links for approved agents
      if (Array.isArray(data)) {
        for (const app of data) {
          if (app.status === 'approved' && app.product_id) {
            try {
              console.log('Generating link for product:', app.product_id);
              const linkData = await GenerateReferralLink(app.product_id);
              console.log('Link generated:', linkData);
              
              // Get the original referral link
              const originalLink = linkData.referralLink || linkData.data?.referralLink || '';
              
              // Transform the URL to use your custom domain
              const transformedLink = transformReferralUrlSimple(originalLink);
              
              console.log('Original link:', originalLink);
              console.log('Transformed link:', transformedLink);
              
              setReferralLinks(prev => ({
                ...prev,
                [app.id]: transformedLink
              }));
            } catch (error) {
              console.error('Failed to generate referral link for product', app.product_id, error);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      alert(`Error loading applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Loading your applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-2 text-lg font-semibold">You haven't applied as an agent yet</p>
            <p className="text-sm text-gray-400">
              Browse products and click "Become an Agent" to start earning commissions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {app.products?.image_url && (
                        <img
                          src={app.products.image_url}
                          alt={app.products.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {app.products?.name || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                        {app.agent_code && (
                          <p className="text-xs text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded inline-block mt-1">
                            Code: {app.agent_code}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-medium capitalize">{app.status}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium text-sm">{app.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">National ID</p>
                      <p className="font-medium text-sm">{app.national_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                      <p className="font-medium text-sm capitalize">{app.payout_method}</p>
                    </div>
                    {app.status === 'approved' && app.commission_rate && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
                        <p className="font-medium text-sm text-green-600">{app.commission_rate}%</p>
                      </div>
                    )}
                  </div>

                  {/* Stats for Approved Agents */}
                  {app.status === 'approved' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp size={16} className="text-blue-600" />
                          <p className="text-xs text-blue-600 font-medium">Total Sales</p>
                        </div>
                        <p className="text-lg font-bold text-blue-700">{app.total_sales || 0}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign size={16} className="text-green-600" />
                          <p className="text-xs text-green-600 font-medium">Total Commission</p>
                        </div>
                        <p className="text-lg font-bold text-green-700">${app.total_commission || '0.00'}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Share2 size={16} className="text-purple-600" />
                          <p className="text-xs text-purple-600 font-medium">Commission Rate</p>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{app.commission_rate}%</p>
                      </div>
                    </div>
                  )}

                  {/* Approved - Show Referral Link */}
                  {app.status === 'approved' && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-green-800 flex items-center gap-2">
                          <Share2 size={18} />
                          Your Referral Link
                        </p>
                      </div>
                      
                      {referralLinks[app.id] ? (
                        <>
                          <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300 mb-3">
                            <input
                              type="text"
                              value={referralLinks[app.id]}
                              readOnly
                              className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none"
                            />
                            <button
                              onClick={() => copyToClipboard(referralLinks[app.id], app.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              {copiedId === app.id ? (
                                <>
                                  <CheckCircle size={16} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={16} />
                                  Copy
                                </>
                              )}
                            </button>
                            <a
                              href={referralLinks[app.id]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              title="Open link in new tab"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-green-700 bg-green-100 p-3 rounded">
                            <Share2 size={16} className="mt-0.5 flex-shrink-0" />
                            <span>Share this link with customers to earn {app.commission_rate}% commission on every sale!</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                          <Clock size={16} />
                          <span>Generating your referral link...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejected - Show Reason */}
                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                      <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <XCircle size={18} />
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-600">{app.rejection_reason}</p>
                    </div>
                  )}

                  {/* Pending */}
                  {app.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <Clock size={16} />
                        Your application is under review. You'll be notified once it's processed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgentApplications;























// // MyAgentApplications.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Copy, 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   ExternalLink,
//   Share2,
//   TrendingUp,
//   DollarSign
// } from 'lucide-react';
// import {
//   GetMyAgentApplications,
//   GenerateReferralLink
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const MyAgentApplications = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [referralLinks, setReferralLinks] = useState<Record<number, string>>({});
//   const [copiedId, setCopiedId] = useState<number | null>(null);

//   useEffect(() => {
//     loadApplications();
//   }, []);

//   const loadApplications = async () => {
//     setLoading(true);
//     try {
//       const data = await GetMyAgentApplications();
//       console.log('Applications loaded:', data);
//       setApplications(Array.isArray(data) ? data : []);
      
//       // Generate referral links for approved agents
//       if (Array.isArray(data)) {
//         for (const app of data) {
//           if (app.status === 'approved' && app.product_id) {
//             try {
//               console.log('Generating link for product:', app.product_id);
//               const linkData = await GenerateReferralLink(app.product_id);
//               console.log('Link generated:', linkData);
              
//               setReferralLinks(prev => ({
//                 ...prev,
//                 [app.id]: linkData.referralLink || linkData.data?.referralLink || ''
//               }));
//             } catch (error) {
//               console.error('Failed to generate referral link for product', app.product_id, error);
//             }
//           }
//         }
//       }
//     } catch (error: any) {
//       console.error('Failed to load applications:', error);
//       alert(`Error loading applications: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text: string, id: number) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(id);
//     setTimeout(() => setCopiedId(null), 2000);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'rejected':
//         return 'bg-red-100 text-red-800 border-red-200';
//       default:
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return <CheckCircle className="text-green-600" size={20} />;
//       case 'rejected':
//         return <XCircle className="text-red-600" size={20} />;
//       default:
//         return <Clock className="text-yellow-600" size={20} />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <div className="text-gray-500">Loading your applications...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {applications.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//             <div className="text-6xl mb-4">📦</div>
//             <p className="text-gray-500 mb-2 text-lg font-semibold">You haven't applied as an agent yet</p>
//             <p className="text-sm text-gray-400">
//               Browse products and click "Become an Agent" to start earning commissions
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6">
//             {applications.map((app) => (
//               <div key={app.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
//                 <div className="p-6">
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       {app.products?.image_url && (
//                         <img
//                           src={app.products.image_url}
//                           alt={app.products.name}
//                           className="w-16 h-16 object-cover rounded-lg border border-gray-200"
//                         />
//                       )}
//                       <div>
//                         <h3 className="font-bold text-lg text-gray-800">
//                           {app.products?.name || 'Product'}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Applied: {new Date(app.applied_at).toLocaleDateString()}
//                         </p>
//                         {app.agent_code && (
//                           <p className="text-xs text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded inline-block mt-1">
//                             Code: {app.agent_code}
//                           </p>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(app.status)}`}>
//                       {getStatusIcon(app.status)}
//                       <span className="text-sm font-medium capitalize">{app.status}</span>
//                     </div>
//                   </div>

//                   {/* Details Grid */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
//                     <div>
//                       <p className="text-xs text-gray-500 mb-1">Full Name</p>
//                       <p className="font-medium text-sm">{app.full_name}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500 mb-1">National ID</p>
//                       <p className="font-medium text-sm">{app.national_id}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500 mb-1">Payout Method</p>
//                       <p className="font-medium text-sm capitalize">{app.payout_method}</p>
//                     </div>
//                     {app.status === 'approved' && app.commission_rate && (
//                       <div>
//                         <p className="text-xs text-gray-500 mb-1">Commission Rate</p>
//                         <p className="font-medium text-sm text-green-600">{app.commission_rate}%</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Stats for Approved Agents */}
//                   {app.status === 'approved' && (
//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                         <div className="flex items-center gap-2 mb-1">
//                           <TrendingUp size={16} className="text-blue-600" />
//                           <p className="text-xs text-blue-600 font-medium">Total Sales</p>
//                         </div>
//                         <p className="text-lg font-bold text-blue-700">{app.total_sales || 0}</p>
//                       </div>
//                       <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                         <div className="flex items-center gap-2 mb-1">
//                           <DollarSign size={16} className="text-green-600" />
//                           <p className="text-xs text-green-600 font-medium">Total Commission</p>
//                         </div>
//                         <p className="text-lg font-bold text-green-700">${app.total_commission || '0.00'}</p>
//                       </div>
//                       <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
//                         <div className="flex items-center gap-2 mb-1">
//                           <Share2 size={16} className="text-purple-600" />
//                           <p className="text-xs text-purple-600 font-medium">Commission Rate</p>
//                         </div>
//                         <p className="text-lg font-bold text-purple-700">{app.commission_rate}%</p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Approved - Show Referral Link */}
//                   {app.status === 'approved' && (
//                     <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
//                       <div className="flex items-center justify-between mb-3">
//                         <p className="font-semibold text-green-800 flex items-center gap-2">
//                           <Share2 size={18} />
//                           Your Referral Link
//                         </p>
//                       </div>
                      
//                       {referralLinks[app.id] ? (
//                         <>
//                           <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300 mb-3">
//                             <input
//                               type="text"
//                               value={referralLinks[app.id]}
//                               readOnly
//                               className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none"
//                             />
//                             <button
//                               onClick={() => copyToClipboard(referralLinks[app.id], app.id)}
//                               className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
//                             >
//                               {copiedId === app.id ? (
//                                 <>
//                                   <CheckCircle size={16} />
//                                   Copied!
//                                 </>
//                               ) : (
//                                 <>
//                                   <Copy size={16} />
//                                   Copy
//                                 </>
//                               )}
//                             </button>
//                             <a
//                               href={referralLinks[app.id]}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                               title="Open link in new tab"
//                             >
//                               <ExternalLink size={16} />
//                             </a>
//                           </div>
//                           <div className="flex items-start gap-2 text-sm text-green-700 bg-green-100 p-3 rounded">
//                             <Share2 size={16} className="mt-0.5 flex-shrink-0" />
//                             <span>Share this link with customers to earn {app.commission_rate}% commission on every sale!</span>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">
//                           <Clock size={16} />
//                           <span>Generating your referral link...</span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Rejected - Show Reason */}
//                   {app.status === 'rejected' && app.rejection_reason && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
//                       <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
//                         <XCircle size={18} />
//                         Rejection Reason
//                       </p>
//                       <p className="text-sm text-red-600">{app.rejection_reason}</p>
//                     </div>
//                   )}

//                   {/* Pending */}
//                   {app.status === 'pending' && (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
//                       <p className="text-sm text-yellow-800 flex items-center gap-2">
//                         <Clock size={16} />
//                         Your application is under review. You'll be notified once it's processed.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyAgentApplications;




















// // MyAgentApplications.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Copy, 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   ExternalLink,
//   Share2
// } from 'lucide-react';
// import {
//   GetMyAgentApplications,
//   GenerateReferralLink
// } from '@/api/productAgentsApi';
// import { ProductAgent } from '@/components/interfaces/productAgents';

// const MyAgentApplications = () => {
//   const [applications, setApplications] = useState<ProductAgent[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [referralLinks, setReferralLinks] = useState<Record<number, string>>({});
//   const [copiedId, setCopiedId] = useState<number | null>(null);

//   useEffect(() => {
//     loadApplications();
//   }, []);

//   const loadApplications = async () => {
//     setLoading(true);
//     try {
//       const data = await GetMyAgentApplications();
//       setApplications(Array.isArray(data) ? data : []);
      
//       // Generate referral links for approved agents
//       for (const app of data) {
//         if (app.status === 'approved' && app.product_id) {
//           try {
//             const linkData = await GenerateReferralLink(app.product_id);
//             setReferralLinks(prev => ({
//               ...prev,
//               [app.id]: linkData.referralLink
//             }));
//           } catch (error) {
//             console.error('Failed to generate referral link:', error);
//           }
//         }
//       }
//     } catch (error: any) {
//       console.error('Failed to load applications:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text: string, id: number) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(id);
//     setTimeout(() => setCopiedId(null), 2000);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return 'bg-green-100 text-green-800 border-green-200';
//       case 'rejected':
//         return 'bg-red-100 text-red-800 border-red-200';
//       default:
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return <CheckCircle className="text-green-600" size={20} />;
//       case 'rejected':
//         return <XCircle className="text-red-600" size={20} />;
//       default:
//         return <Clock className="text-yellow-600" size={20} />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-gray-500">Loading your applications...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">
//             My Agent Applications
//           </h1>
//           <p className="text-gray-600">
//             Manage your product agent applications and referral links
//           </p>
//         </div>

//         {applications.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//             <p className="text-gray-500 mb-4">You haven't applied as an agent yet</p>
//             <p className="text-sm text-gray-400">
//               Browse products and click "Become an Agent" to start earning commissions
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6">
//             {applications.map((app) => (
//               <div key={app.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       {app.products?.image_url && (
//                         <img
//                           src={app.products.image_url}
//                           alt={app.products.name}
//                           className="w-16 h-16 object-cover rounded-lg"
//                         />
//                       )}
//                       <div>
//                         <h3 className="font-bold text-lg text-gray-800">
//                           {app.products?.name || 'Product'}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Applied: {new Date(app.applied_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
                    
//                     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(app.status)}`}>
//                       {getStatusIcon(app.status)}
//                       <span className="text-sm font-medium capitalize">{app.status}</span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                     <div>
//                       <p className="text-xs text-gray-500">Full Name</p>
//                       <p className="font-medium">{app.full_name}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">National ID</p>
//                       <p className="font-medium">{app.national_id}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Payout Method</p>
//                       <p className="font-medium capitalize">{app.payout_method}</p>
//                     </div>
//                     {app.status === 'approved' && app.commission_rate && (
//                       <div>
//                         <p className="text-xs text-gray-500">Commission Rate</p>
//                         <p className="font-medium text-green-600">{app.commission_rate}%</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Approved - Show Referral Link */}
//                   {app.status === 'approved' && referralLinks[app.id] && (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <p className="font-semibold text-green-800">Your Referral Link</p>
//                         <div className="flex items-center gap-2">
//                           {app.agent_code && (
//                             <span className="text-xs bg-white px-2 py-1 rounded border border-green-300 font-mono">
//                               {app.agent_code}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
//                         <input
//                           type="text"
//                           value={referralLinks[app.id]}
//                           readOnly
//                           className="flex-1 text-sm text-gray-700 bg-transparent border-none focus:outline-none"
//                         />
//                         <button
//                           onClick={() => copyToClipboard(referralLinks[app.id], app.id)}
//                           className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
//                         >
//                           {copiedId === app.id ? (
//                             <>
//                               <CheckCircle size={16} />
//                               Copied!
//                             </>
//                           ) : (
//                             <>
//                               <Copy size={16} />
//                               Copy
//                             </>
//                           )}
//                         </button>
//                         <a
//                           href={referralLinks[app.id]}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                         >
//                           <ExternalLink size={16} />
//                         </a>
//                       </div>
//                       <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
//                         <Share2 size={16} />
//                         <span>Share this link to earn {app.commission_rate}% commission on sales</span>
//                       </div>
//                     </div>
//                   )}

//                   {/* Rejected - Show Reason */}
//                   {app.status === 'rejected' && app.rejection_reason && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
//                       <p className="font-semibold text-red-800 mb-2">Rejection Reason</p>
//                       <p className="text-sm text-red-600">{app.rejection_reason}</p>
//                     </div>
//                   )}

//                   {/* Pending */}
//                   {app.status === 'pending' && (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
//                       <p className="text-sm text-yellow-800">
//                         Your application is under review. You'll be notified once it's processed.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyAgentApplications;