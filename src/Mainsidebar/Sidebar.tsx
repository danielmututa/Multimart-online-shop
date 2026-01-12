import { ReactNode, useState } from 'react';
import { Home, Download, FileText, File } from "lucide-react";
import Navbar from "@/pages/Navbar";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import { CiBoxes } from "react-icons/ci";
import { MdOutlineViewComfy } from "react-icons/md";
import { VscFeedback } from "react-icons/vsc";
import { AiOutlineProduct } from "react-icons/ai";
import { FaRegNewspaper } from "react-icons/fa6";
import { useAuthStore } from "@/context/userContext";
import { Button } from '@/components/ui/button';
import { aiReportApi, aiAnalysisApi } from '@/api/aichartApi';

interface AIResponse {
  message: string;
  report_type?: string;
  start_date?: string;
  end_date?: string;
  analysis_type?: 'text' | 'image' | 'audio' | 'multimodal';
}

interface ReportRequest {
  report_type:
    | 'products' 
    | 'product-sales' 
    | 'inventory'
    | 'users' 
    | 'user-activity' 
    | 'customers'
    | 'blogs' 
    | 'content' 
    | 'articles'
    | 'sales' 
    | 'revenue' 
    | 'financial'
    | 'general' 
    | 'overview';
  start_date?: string;
  end_date?: string;
}

// Function to get sidebar items based on user role
const getSidebarItems = (userRole: string) => {
  const allItems = [
    { title: "Home", path: "/", icon: Home },
    { title: "Products", path: "/products", icon: AiOutlineProduct },
    { title: "B & P Approval", path: "/blogandproductsapproval", icon: AiOutlineProduct },
    { title: "AgentApproval", path: "/agentproducts", icon: AiOutlineProduct },
    { title: "Feedback", path: "/feedback", icon: VscFeedback },
    { title: "Blogs", path: "/blogs", icon: FiFileText },
    { title: "Orders", path: "/orders", icon: CiBoxes },
    { title: "Users", path: "/users", icon: LuUsers },
    { title: "BlogShowcase", path: "/blogshowcase", icon: FaRegNewspaper },
    { title: "ProductShowcase", path: "/prodt", icon: MdOutlineViewComfy },
  ];

  // Filter items based on role
  if (userRole === 'client_admin') {
    // Client Admin can ONLY see these:
    return allItems.filter(item => 
      ['Home', 'Products', 'Blogs', 'Feedback', 'Orders', 'BlogShowcase', 'ProductShowcase']
      .includes(item.title)
    );
  }
  
  if (userRole === 'admin') {
    // Regular admin can see most things but NOT User management
    return allItems.filter(item => item.title !== 'Users');
  }

  // super_admin and digital_marketer_admin see everything
  return allItems;
};

type MainSidebarProps = {
  children: ReactNode;
};

const MainSidebar = ({ children }: MainSidebarProps) => {
  const { user } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);

  // Get filtered items based on user role
  const items = user ? getSidebarItems(user.role) : [];
  
  // Check if user can see Users report
  const canSeeUsersReport = user?.role === 'super_admin' || user?.role === 'digital_marketer_admin';

  // Simple HTML wrapper for the backend report (no additional formatting)
  const generateHTMLReport = (backendReport: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Dimbop Business Report</title>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          margin: 40px; 
          color: #333;
          font-size: 12px;
        }
        pre { 
          white-space: pre-wrap; 
          font-family: inherit; 
          font-size: 11px;
        }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <pre>${backendReport}</pre>
    </body>
    </html>`;
  };

  // Download as Word document (RTF format)
  const downloadAsWord = (content: string, filename: string) => {
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}
    \\f0\\fs20 ${content.replace(/\n/g, '\\par ')}}`;
    
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.rtf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Download as PDF using HTML conversion
  const downloadAsPDF = async (content: string, filename: string) => {
    const htmlContent = generateHTMLReport(content);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    // Open in new window for printing to PDF
    const printWindow = window.open(url);
    setTimeout(() => {
      if (printWindow) {
        printWindow.print();
      }
    }, 1000);
  };

  // Handle report download - just pass backend report through
  const handleReportDownload = async (
    reportType: ReportRequest['report_type'], 
    format: 'pdf' | 'docx'
  ) => {
    setIsDownloading(true);
    try {
      console.log(`Generating ${reportType} report in ${format} format...`);
      
      const reportData: ReportRequest = {
        report_type: reportType,
      };
      
      const response: AIResponse = await aiReportApi(reportData);
      
      // Use the backend report directly - no additional formatting
      const backendReport = response.message;
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'pdf') {
        await downloadAsPDF(backendReport, filename);
      } else {
        downloadAsWord(backendReport, filename);
      }
      
      console.log(`${reportType.toUpperCase()} report generated successfully!`);
    } catch (error: any) {
      console.error(`Error generating ${reportType.toUpperCase()} report:`, error);
      alert(`Failed to generate ${reportType.toUpperCase()} report: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle bulk analysis download
  const handleAnalysisDownload = async (format: 'pdf' | 'docx') => {
    setIsDownloading(true);
    try {
      console.log(`Generating comprehensive business analysis in ${format} format...`);
      
      const response: AIResponse = await aiAnalysisApi();
      
      // Use the backend analysis directly - no additional formatting
      const backendAnalysis = response.message;
      const filename = `comprehensive_business_analysis_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'pdf') {
        await downloadAsPDF(backendAnalysis, filename);
      } else {
        downloadAsWord(backendAnalysis, filename);
      }
      
      console.log('Comprehensive business analysis generated successfully!');
    } catch (error: any) {
      console.error('Error generating business analysis:', error);
      alert(`Failed to generate business analysis: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SidebarProvider className="flex flex-col h-screen">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className='pt-5 md:pt-10'>
                <p className='text-2xl'>Dimbo P</p>
              </SidebarGroupLabel>
              <SidebarGroupContent className="pt-10 flex gap-2">
                <SidebarMenu className="flex gap-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title} className='flex gap-4'>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} className="flex gap-2">
                          <item.icon className="w-4 h-4" />
                          <span className="text-[16px]">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex flex-start mt-5 px-5 md:mt-10 md:px-8 lg:px-10 flex-col w-full">
          <div className="flex justify-between w-full">
            <SidebarTrigger>
              <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
                Toggle Sidebar
              </button>
            </SidebarTrigger>
            <div className="w-full flex justify-between">
              <Navbar />
            </div>
          </div>

          <div className="flex items-start flex-col pt-4 lg:pt-8">
            <div className="flex justify-between items-center w-full pb-2 md:pb-4">
              <p className='text-sm md:text-lg lg:text-2xl xl:text-3xl'>
          Welcome, {user?.username || user?.name || user?.merchant_name}!
              </p>
              
              {/* Generate Report Button with Dropdown - Only show for admin roles */}
              {(user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'digital_marketer_admin') && (
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="text-[12px] md:text-sm" 
                        variant="outline"
                        disabled={isDownloading}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isDownloading ? 'Generating Report...' : 'Generate Business Report'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                        Professional Business Reports
                      </div>
                      
                      {/* General Report */}
                      <div className="px-2 py-1 text-xs text-gray-500">Executive Overview</div>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('general', 'pdf')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('general', 'docx')}
                        disabled={isDownloading}
                        className="ml-2 mb-2"
                      >
                        <File className="w-4 h-4 mr-2" />
                        Download as Word Document
                      </DropdownMenuItem>
                      
                      {/* Sales Report */}
                      <div className="px-2 py-1 text-xs text-gray-500">Sales & Revenue Analysis</div>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('sales', 'pdf')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('sales', 'docx')}
                        disabled={isDownloading}
                        className="ml-2 mb-2"
                      >
                        <File className="w-4 h-4 mr-2" />
                        Download as Word Document
                      </DropdownMenuItem>
                      
                      {/* Products Report */}
                      <div className="px-2 py-1 text-xs text-gray-500">Product Performance Report</div>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('products', 'pdf')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('products', 'docx')}
                        disabled={isDownloading}
                        className="ml-2 mb-2"
                      >
                        <File className="w-4 h-4 mr-2" />
                        Download as Word Document
                      </DropdownMenuItem>
                      
                      {/* Users Report - Only show for super_admin and digital_marketer_admin */}
                      {canSeeUsersReport && (
                        <>
                          <div className="px-2 py-1 text-xs text-gray-500">Customer Analytics Report</div>
                          <DropdownMenuItem
                            onClick={() => handleReportDownload('users', 'pdf')}
                            disabled={isDownloading}
                            className="ml-2"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReportDownload('users', 'docx')}
                            disabled={isDownloading}
                            className="ml-2 mb-2"
                          >
                            <File className="w-4 h-4 mr-2" />
                            Download as Word Document
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Inventory Report */}
                      <div className="px-2 py-1 text-xs text-gray-500">Inventory Management Report</div>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('inventory', 'pdf')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReportDownload('inventory', 'docx')}
                        disabled={isDownloading}
                        className="ml-2 mb-2"
                      >
                        <File className="w-4 h-4 mr-2" />
                        Download as Word Document
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {/* Comprehensive Analysis */}
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
                        Comprehensive Business Analysis
                      </div>
                      <DropdownMenuItem
                        onClick={() => handleAnalysisDownload('pdf')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download Complete Analysis as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAnalysisDownload('docx')}
                        disabled={isDownloading}
                        className="ml-2"
                      >
                        <File className="w-4 h-4 mr-2" />
                        Download Complete Analysis as Word
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            <div className="border w-full"></div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainSidebar;




























// import { ReactNode, useState } from 'react';
// import { Home, Download, FileText, File } from "lucide-react";
// import Navbar from "@/pages/Navbar";
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";
// import { Link } from "react-router-dom";
// import { FiFileText } from "react-icons/fi";
// import { LuUsers } from "react-icons/lu";
// import { CiBoxes } from "react-icons/ci";
// import { MdOutlineViewComfy } from "react-icons/md";
// import { VscFeedback } from "react-icons/vsc";
// import { AiOutlineProduct } from "react-icons/ai";
// import { FaRegNewspaper } from "react-icons/fa6";
// import { useAuthStore } from "@/context/userContext";
// import { Button } from '@/components/ui/button';
// import { aiReportApi, aiAnalysisApi } from '@/api/aichartApi';

// interface AIResponse {
//   message: string;
//   report_type?: string;
//   start_date?: string;
//   end_date?: string;
//   analysis_type?: 'text' | 'image' | 'audio' | 'multimodal';
// }

// interface ReportRequest {
//   report_type:
//     | 'products' 
//     | 'product-sales' 
//     | 'inventory'
//     | 'users' 
//     | 'user-activity' 
//     | 'customers'
//     | 'blogs' 
//     | 'content' 
//     | 'articles'
//     | 'sales' 
//     | 'revenue' 
//     | 'financial'
//     | 'general' 
//     | 'overview';
//   start_date?: string;
//   end_date?: string;
// }

// // Function to get sidebar items based on user role
// const getSidebarItems = (userRole: string) => {
//   const allItems = [
//     { title: "Home", path: "/", icon: Home },
//     { title: "Products", path: "/products", icon: AiOutlineProduct },
//     { title: "B & P Approval", path: "/blogandproductsapproval", icon: AiOutlineProduct },
//     { title: "AgentApproval", path: "/agentproducts", icon: AiOutlineProduct },
//     { title: "Feedback", path: "/feedback", icon: VscFeedback },
//     { title: "Blogs", path: "/blogs", icon: FiFileText },
//     { title: "Orders", path: "/orders", icon: CiBoxes },
//     { title: "Users", path: "/users", icon: LuUsers }, // Only for super_admin and digital_marketer_admin
//     { title: "BlogShowcase", path: "/blogshowcase", icon: FaRegNewspaper },
//     { title: "ProductShowcase", path: "/prodt", icon: MdOutlineViewComfy },
//   ];

//   // Filter items based on role
//   if (userRole === 'client_admin' || userRole === 'admin') {
//     // Remove Users route for client_admin and regular admin
//     return allItems.filter(item => item.title !== 'Users');
//   }

//   // super_admin and digital_marketer_admin see everything
//   return allItems;
// };

// type MainSidebarProps = {
//   children: ReactNode;
// };

// const MainSidebar = ({ children }: MainSidebarProps) => {
//   const { user } = useAuthStore();
//   const [isDownloading, setIsDownloading] = useState(false);

//   // Get filtered items based on user role
//   const items = user ? getSidebarItems(user.role) : [];

//   // Simple HTML wrapper for the backend report (no additional formatting)
//   const generateHTMLReport = (backendReport: string): string => {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>Dimbop Business Report</title>
//       <style>
//         body { 
//           font-family: 'Arial', sans-serif; 
//           line-height: 1.6; 
//           margin: 40px; 
//           color: #333;
//           font-size: 12px;
//         }
//         pre { 
//           white-space: pre-wrap; 
//           font-family: inherit; 
//           font-size: 11px;
//         }
//         @media print {
//           body { margin: 20px; }
//         }
//       </style>
//     </head>
//     <body>
//       <pre>${backendReport}</pre>
//     </body>
//     </html>`;
//   };

//   // Download as Word document (RTF format)
//   const downloadAsWord = (content: string, filename: string) => {
//     const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}
//     \\f0\\fs20 ${content.replace(/\n/g, '\\par ')}}`;
    
//     const blob = new Blob([rtfContent], { type: 'application/rtf' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${filename}.rtf`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   // Download as PDF using HTML conversion
//   const downloadAsPDF = async (content: string, filename: string) => {
//     const htmlContent = generateHTMLReport(content);
    
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${filename}.html`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
    
//     // Open in new window for printing to PDF
//     const printWindow = window.open(url);
//     setTimeout(() => {
//       if (printWindow) {
//         printWindow.print();
//       }
//     }, 1000);
//   };

//   // Handle report download - just pass backend report through
//   const handleReportDownload = async (
//     reportType: ReportRequest['report_type'], 
//     format: 'pdf' | 'docx'
//   ) => {
//     setIsDownloading(true);
//     try {
//       console.log(`Generating ${reportType} report in ${format} format...`);
      
//       const reportData: ReportRequest = {
//         report_type: reportType,
//       };
      
//       const response: AIResponse = await aiReportApi(reportData);
      
//       // Use the backend report directly - no additional formatting
//       const backendReport = response.message;
//       const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
      
//       if (format === 'pdf') {
//         await downloadAsPDF(backendReport, filename);
//       } else {
//         downloadAsWord(backendReport, filename);
//       }
      
//       console.log(`${reportType.toUpperCase()} report generated successfully!`);
//     } catch (error: any) {
//       console.error(`Error generating ${reportType.toUpperCase()} report:`, error);
//       alert(`Failed to generate ${reportType.toUpperCase()} report: ${error.message}`);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   // Handle bulk analysis download
//   const handleAnalysisDownload = async (format: 'pdf' | 'docx') => {
//     setIsDownloading(true);
//     try {
//       console.log(`Generating comprehensive business analysis in ${format} format...`);
      
//       const response: AIResponse = await aiAnalysisApi();
      
//       // Use the backend analysis directly - no additional formatting
//       const backendAnalysis = response.message;
//       const filename = `comprehensive_business_analysis_${new Date().toISOString().split('T')[0]}`;
      
//       if (format === 'pdf') {
//         await downloadAsPDF(backendAnalysis, filename);
//       } else {
//         downloadAsWord(backendAnalysis, filename);
//       }
      
//       console.log('Comprehensive business analysis generated successfully!');
//     } catch (error: any) {
//       console.error('Error generating business analysis:', error);
//       alert(`Failed to generate business analysis: ${error.message}`);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   return (
//     <SidebarProvider className="flex flex-col h-screen">
//       <div className="flex min-h-screen">
//         {/* Sidebar */}
//         <Sidebar>
//           <SidebarContent>
//             <SidebarGroup>
//               <SidebarGroupLabel className='pt-5 md:pt-10'>
//                 <p className='text-2xl'>Dimbo P</p>
//               </SidebarGroupLabel>
//               <SidebarGroupContent className="pt-10 flex gap-2">
//                 <SidebarMenu className="flex gap-2">
//                   {items.map((item) => (
//                     <SidebarMenuItem key={item.title} className='flex gap-4'>
//                       <SidebarMenuButton asChild>
//                         <Link to={item.path} className="flex gap-2">
//                           <item.icon className="w-4 h-4" />
//                           <span className="text-[16px]">{item.title}</span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </SidebarContent>
//         </Sidebar>

//         {/* Main Content */}
//         <main className="flex flex-start mt-5 px-5 md:mt-10 md:px-8 lg:px-10 flex-col w-full">
//           <div className="flex justify-between w-full">
//             <SidebarTrigger>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
//                 Toggle Sidebar
//               </button>
//             </SidebarTrigger>
//             <div className="w-full flex justify-between">
//               <Navbar />
//             </div>
//           </div>

//           <div className="flex items-start flex-col pt-4 lg:pt-8">
//             <div className="flex justify-between items-center w-full pb-2 md:pb-4">
//               <p className='text-sm md:text-lg lg:text-2xl xl:text-3xl'>
//           Welcome, {user?.username || user?.name || user?.merchant_name}!
//               </p>
              
//               {/* Generate Report Button with Dropdown */}
//               <div className="flex gap-2">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button 
//                       className="text-[12px] md:text-sm" 
//                       variant="outline"
//                       disabled={isDownloading}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       {isDownloading ? 'Generating Report...' : 'Generate Business Report'}
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-64">
//                     <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
//                       Professional Business Reports
//                     </div>
                    
//                     {/* General Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Executive Overview</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('general', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('general', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Sales Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Sales & Revenue Analysis</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('sales', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('sales', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Products Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Product Performance Report</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('products', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('products', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Users Report - Only show for super_admin and digital_marketer_admin */}
//                     {(user?.role === 'super_admin' || user?.role === 'digital_marketer_admin') && (
//                       <>
//                         <div className="px-2 py-1 text-xs text-gray-500">Customer Analytics Report</div>
//                         <DropdownMenuItem
//                           onClick={() => handleReportDownload('users', 'pdf')}
//                           disabled={isDownloading}
//                           className="ml-2"
//                         >
//                           <FileText className="w-4 h-4 mr-2" />
//                           Download as PDF
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => handleReportDownload('users', 'docx')}
//                           disabled={isDownloading}
//                           className="ml-2 mb-2"
//                         >
//                           <File className="w-4 h-4 mr-2" />
//                           Download as Word Document
//                         </DropdownMenuItem>
//                       </>
//                     )}

//                     {/* Inventory Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Inventory Management Report</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('inventory', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('inventory', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     <DropdownMenuSeparator />
                    
//                     {/* Comprehensive Analysis */}
//                     <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
//                       Comprehensive Business Analysis
//                     </div>
//                     <DropdownMenuItem
//                       onClick={() => handleAnalysisDownload('pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download Complete Analysis as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleAnalysisDownload('docx')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download Complete Analysis as Word
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//             <div className="border w-full"></div>
//             {children}
//           </div>
//         </main>
//       </div>
//     </SidebarProvider>
//   );
// };

// export default MainSidebar;

















// import { ReactNode, useState } from 'react';
// import { Home, Download, FileText, File } from "lucide-react";
// import Navbar from "@/pages/Navbar";
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";
// import { Link } from "react-router-dom";
// import { FiFileText } from "react-icons/fi";
// import { LuUsers } from "react-icons/lu";
// import { CiBoxes } from "react-icons/ci";
// import { MdOutlineViewComfy } from "react-icons/md";
// import { VscFeedback } from "react-icons/vsc";
// import { AiOutlineProduct } from "react-icons/ai";
// import { FaRegNewspaper } from "react-icons/fa6";
// import { useAuthStore } from "@/context/userContext";
// import { Button } from '@/components/ui/button';
// import { aiReportApi, aiAnalysisApi } from '@/api/aichartApi';

// interface AIResponse {
//   message: string;
//   report_type?: string;
//   start_date?: string;
//   end_date?: string;
//   analysis_type?: 'text' | 'image' | 'audio' | 'multimodal';
// }

// interface ReportRequest {
//   report_type:
//     | 'products' 
//     | 'product-sales' 
//     | 'inventory'
//     | 'users' 
//     | 'user-activity' 
//     | 'customers'
//     | 'blogs' 
//     | 'content' 
//     | 'articles'
//     | 'sales' 
//     | 'revenue' 
//     | 'financial'
//     | 'general' 
//     | 'overview';
//   start_date?: string;
//   end_date?: string;
// }

// const items = [
//   { title: "Home", path: "/", icon: Home },
//   { title: "Products", path: "/products", icon: AiOutlineProduct },
//   { title: "Feedback", path: "/feedback", icon: VscFeedback },
//   { title: "Blogs", path: "/blogs", icon: FiFileText },
//   { title: "Orders", path: "/orders", icon: CiBoxes },
//   { title: "Users", path: "/users", icon: LuUsers },
//   { title: "BlogShowcase", path: "/blogshowcase", icon: FaRegNewspaper },
//   { title: "ProductShowcase", path: "/prodt", icon: MdOutlineViewComfy },
// ];

// type MainSidebarProps = {
//   children: ReactNode;
// };

// const MainSidebar = ({ children }: MainSidebarProps) => {
//   const { user } = useAuthStore();
//   const [isDownloading, setIsDownloading] = useState(false);

//   // Simple HTML wrapper for the backend report (no additional formatting)
//   const generateHTMLReport = (backendReport: string): string => {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>Dimbop Business Report</title>
//       <style>
//         body { 
//           font-family: 'Arial', sans-serif; 
//           line-height: 1.6; 
//           margin: 40px; 
//           color: #333;
//           font-size: 12px;
//         }
//         pre { 
//           white-space: pre-wrap; 
//           font-family: inherit; 
//           font-size: 11px;
//         }
//         @media print {
//           body { margin: 20px; }
//         }
//       </style>
//     </head>
//     <body>
//       <pre>${backendReport}</pre>
//     </body>
//     </html>`;
//   };

//   // Download as Word document (RTF format)
//   const downloadAsWord = (content: string, filename: string) => {
//     const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}
//     \\f0\\fs20 ${content.replace(/\n/g, '\\par ')}}`;
    
//     const blob = new Blob([rtfContent], { type: 'application/rtf' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${filename}.rtf`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   // Download as PDF using HTML conversion
//   const downloadAsPDF = async (content: string, filename: string) => {
//     const htmlContent = generateHTMLReport(content);
    
//     const blob = new Blob([htmlContent], { type: 'text/html' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${filename}.html`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
    
//     // Open in new window for printing to PDF
//     const printWindow = window.open(url);
//     setTimeout(() => {
//       if (printWindow) {
//         printWindow.print();
//       }
//     }, 1000);
//   };

//   // Handle report download - just pass backend report through
//   const handleReportDownload = async (
//     reportType: ReportRequest['report_type'], 
//     format: 'pdf' | 'docx'
//   ) => {
//     setIsDownloading(true);
//     try {
//       console.log(`Generating ${reportType} report in ${format} format...`);
      
//       const reportData: ReportRequest = {
//         report_type: reportType,
//       };
      
//       const response: AIResponse = await aiReportApi(reportData);
      
//       // Use the backend report directly - no additional formatting
//       const backendReport = response.message;
//       const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}`;
      
//       if (format === 'pdf') {
//         await downloadAsPDF(backendReport, filename);
//       } else {
//         downloadAsWord(backendReport, filename);
//       }
      
//       console.log(`${reportType.toUpperCase()} report generated successfully!`);
//     } catch (error: any) {
//       console.error(`Error generating ${reportType.toUpperCase()} report:`, error);
//       alert(`Failed to generate ${reportType.toUpperCase()} report: ${error.message}`);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   // Handle bulk analysis download
//   const handleAnalysisDownload = async (format: 'pdf' | 'docx') => {
//     setIsDownloading(true);
//     try {
//       console.log(`Generating comprehensive business analysis in ${format} format...`);
      
//       const response: AIResponse = await aiAnalysisApi();
      
//       // Use the backend analysis directly - no additional formatting
//       const backendAnalysis = response.message;
//       const filename = `comprehensive_business_analysis_${new Date().toISOString().split('T')[0]}`;
      
//       if (format === 'pdf') {
//         await downloadAsPDF(backendAnalysis, filename);
//       } else {
//         downloadAsWord(backendAnalysis, filename);
//       }
      
//       console.log('Comprehensive business analysis generated successfully!');
//     } catch (error: any) {
//       console.error('Error generating business analysis:', error);
//       alert(`Failed to generate business analysis: ${error.message}`);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   return (
//     <SidebarProvider className="flex flex-col h-screen">
//       <div className="flex min-h-screen">
//         {/* Sidebar */}
//         <Sidebar>
//           <SidebarContent>
//             <SidebarGroup>
//               <SidebarGroupLabel className='pt-5 md:pt-10'>
//                 <p className='text-2xl'>Dimbo P</p>
//               </SidebarGroupLabel>
//               <SidebarGroupContent className="pt-10 flex gap-2">
//                 <SidebarMenu className="flex gap-2">
//                   {items.map((item) => (
//                     <SidebarMenuItem key={item.title} className='flex gap-4'>
//                       <SidebarMenuButton asChild>
//                         <Link to={item.path} className="flex gap-2">
//                           <item.icon className="w-4 h-4" />
//                           <span className="text-[16px]">{item.title}</span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </SidebarGroup>
//           </SidebarContent>
//         </Sidebar>

//         {/* Main Content */}
//         <main className="flex flex-start mt-5 px-5 md:mt-10 md:px-8 lg:px-10 flex-col w-full">
//           <div className="flex justify-between w-full">
//             <SidebarTrigger>
//               <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4">
//                 Toggle Sidebar
//               </button>
//             </SidebarTrigger>
//             <div className="w-full flex justify-between">
//               <Navbar />
//             </div>
//           </div>

//           <div className="flex items-start flex-col pt-4 lg:pt-8">
//             <div className="flex justify-between items-center w-full pb-2 md:pb-4">
//               <p className='text-sm md:text-lg lg:text-2xl xl:text-3xl'>Welcome, {user?.username}!</p>
              
//               {/* Generate Report Button with Dropdown */}
//               <div className="flex gap-2">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button 
//                       className="text-[12px] md:text-sm" 
//                       variant="outline"
//                       disabled={isDownloading}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       {isDownloading ? 'Generating Report...' : 'Generate Business Report'}
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end" className="w-64">
//                     <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
//                       Professional Business Reports
//                     </div>
                    
//                     {/* General Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Executive Overview</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('general', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('general', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Sales Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Sales & Revenue Analysis</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('sales', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('sales', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Products Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Product Performance Report</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('products', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('products', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     {/* Users Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Customer Analytics Report</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('users', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('users', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>

//                     {/* Inventory Report */}
//                     <div className="px-2 py-1 text-xs text-gray-500">Inventory Management Report</div>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('inventory', 'pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleReportDownload('inventory', 'docx')}
//                       disabled={isDownloading}
//                       className="ml-2 mb-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download as Word Document
//                     </DropdownMenuItem>
                    
//                     <DropdownMenuSeparator />
                    
//                     {/* Comprehensive Analysis */}
//                     <div className="px-2 py-1.5 text-sm font-semibold text-gray-700">
//                       Comprehensive Business Analysis
//                     </div>
//                     <DropdownMenuItem
//                       onClick={() => handleAnalysisDownload('pdf')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <FileText className="w-4 h-4 mr-2" />
//                       Download Complete Analysis as PDF
//                     </DropdownMenuItem>
//                     <DropdownMenuItem
//                       onClick={() => handleAnalysisDownload('docx')}
//                       disabled={isDownloading}
//                       className="ml-2"
//                     >
//                       <File className="w-4 h-4 mr-2" />
//                       Download Complete Analysis as Word
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             </div>
//             <div className="border w-full"></div>
//             {children}
//           </div>
//         </main>
//       </div>
//     </SidebarProvider>

// // fixed the indentation here ^

//   );
// };

// export default MainSidebar;