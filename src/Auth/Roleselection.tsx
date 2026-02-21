// src/components/RoleSelection.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/register/admin");
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register as Merchant</CardTitle>
          <CardDescription>Create your business account to manage products and sales</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4">
            <Card 
              className="cursor-pointer p-4 text-center border-2 border-blue-500 bg-blue-50 transition-all"
              onClick={handleContinue}
            >
              <h3 className="font-semibold mb-2">🏢 Client Admin (Merchant)</h3>
              <p className="text-sm text-gray-600">
                Manage your business products, blogs, and sales
              </p>
            </Card>
          </div>

          <Button 
            onClick={handleContinue} 
            className="w-full"
          >
            Continue to Registration
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => navigate("/login")}
              >
                Login here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSelection;












// // src/components/RoleSelection.tsx
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useNavigate } from "react-router-dom"; // FIXED: Changed "farom" to "from"

// const RoleSelection = () => {
//   const [selectedRole, setSelectedRole] = useState<"user" | "admin" | "agent" | null>(null);
//   const navigate = useNavigate();

//   const handleRoleSelect = (role: "user" | "admin" | "agent") => {
//     setSelectedRole(role);
//   };

//   const handleContinue = () => {
//     if (selectedRole === "user") {
//       navigate("/register/user"); // This will go to register with user role
//     } else if (selectedRole === "admin") {
//       navigate("/register/admin"); // This will go to register with admin role
//     } else if (selectedRole === "agent") {
//       navigate("/register/agent"); // New: register with agent role
//     }
//   };

//   return (
//     <div className="w-full flex justify-center items-center min-h-screen p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Select Your Role</CardTitle>
//           <CardDescription>Choose how you want to use our platform</CardDescription>
//         </CardHeader>
//         <CardContent className="flex flex-col gap-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Card 
//               className={`cursor-pointer p-4 text-center border-2 transition-all ${
//                 selectedRole === "user" 
//                   ? "border-blue-500 bg-blue-50" 
//                   : "border-gray-200 hover:border-blue-300"
//               }`}
//               onClick={() => handleRoleSelect("user")}
//             >
//               <h3 className="font-semibold mb-2">👤 User</h3>
//               <p className="text-sm text-gray-600">
//                 Shop, browse products, and make purchases
//               </p>
//             </Card>

//             <Card 
//               className={`cursor-pointer p-4 text-center border-2 transition-all ${
//                 selectedRole === "admin" 
//                   ? "border-blue-500 bg-blue-50" 
//                   : "border-gray-200 hover:border-blue-300"
//               }`}
//               onClick={() => handleRoleSelect("admin")}
//             >
//               <h3 className="font-semibold mb-2">⚙️ Admin</h3>
//               <p className="text-sm text-gray-600">
//                 Manage products, users, and website content
//               </p>
//             </Card>

//             <Card 
//               className={`cursor-pointer p-4 text-center border-2 transition-all ${
//                 selectedRole === "agent" 
//                   ? "border-blue-500 bg-blue-50" 
//                   : "border-gray-200 hover:border-blue-300"
//               }`}
//               onClick={() => handleRoleSelect("agent")}
//             >
//               <h3 className="font-semibold mb-2">🕵️ Agent</h3>
//               <p className="text-sm text-gray-600">
//                 Handle agent-specific tasks and client interactions
//               </p>
//             </Card>
//           </div>

//           <Button 
//             onClick={handleContinue} 
//             disabled={!selectedRole}
//             className="w-full"
//           >
//             Continue to {selectedRole ? selectedRole + " registration" : "Registration"}
//           </Button>

//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <Button 
//                 variant="link" 
//                 className="p-0 h-auto" 
//                 onClick={() => navigate("/login")}
//               >
//                 Login here
//               </Button>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default RoleSelection;















