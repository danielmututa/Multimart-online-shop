import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUserCircle } from "react-icons/fa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/context/userContext";
import { ChangePasswordApi } from "@/api/authApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Temporary useFetch hook (replace with actual import once fixed)
const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (apiCall: () => Promise<any>) => {
    setLoading(true);
    try {
      const response = await apiCall();
      setLoading(false);
      return response;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setLoading(false);
      throw err;
    }
  };

  return { fetchData, loading, error };
};

const Account = () => {
  const { user, logout } = useAuthStore();
  const { fetchData, loading } = useFetch();
  const navigate = useNavigate();

  // Debug: Log user object to confirm structure
  console.log("User object:", user);

  // State for Change Password form
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Handle input changes for Change Password
  const handleChangePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangePasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Change Password submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
        toast.error("New passwords do not match");
        return;
      }
      await fetchData(() => ChangePasswordApi(changePasswordData));
      toast.success("Password changed successfully");
      setChangePasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err: unknown) {
      console.error("Change password error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      toast.error(errorMessage);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user?.email);
      logout(); // Clear auth state
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err: unknown) {
      console.error("Logout error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to logout";
      toast.error(errorMessage);
    }
  };

  // Guard against missing user - Render Login button instead of redirecting
  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="bg-transparent border-white text-white hover:bg-white hover:text-navbar"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
    );
  }

  return (
    <div>
      <Sheet>
        <SheetTrigger>
          <Avatar>
            <AvatarImage src={user.username || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user.username?.charAt(0) || user.email?.charAt(0) || "DM"}</AvatarFallback>
          </Avatar>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="flex mt-10 w-full flex-col items-center">
            <SheetTitle className="flex w-full flex-col items-center">
              <FaUserCircle className="h-[40px] w-[40px]" />
              <p className="text-sm md:text-lg">{user.username || user.email?.split('@')[0] || "User Name"}</p>
              <p className="text-sm md:text-[16px] font-light">{user.email || "user@example.com"}</p>
            </SheetTitle>

            <SheetDescription asChild>
              <div className="flex pt-3 justify-between w-full">
                <span className="text-sm md:text-[16px]">Role</span>
                <span className="text-sm md:text-[16px]">{user.role || "Admin"}</span>
              </div>
            </SheetDescription>

              
            <SheetDescription asChild>
              <div className="flex pt-3 justify-between w-full">
                <span className="text-sm md:text-[16px]">Phone</span>
                <span className="text-sm md:text-[16px]">{user.phone || "Not provided"}</span>
              </div>
            </SheetDescription>


            <div className="w-full border"></div>

            <form className="pt-2 w-full">
              {/* Change Password Accordion */}
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <h2 className="text-xl">Change Password</h2>
                  </AccordionTrigger>
                  <AccordionContent>
                    <SheetDescription asChild>
                      <div className="flex gap-2 flex-col justify-between w-full">
                        <Input
                          name="currentPassword"
                          placeholder="Current Password"
                          type="password"
                          className="py-2"
                          value={changePasswordData.currentPassword}
                          onChange={handleChangePasswordInput}
                        />
                        <Input
                          name="newPassword"
                          placeholder="New Password"
                          type="password"
                          className="py-2"
                          value={changePasswordData.newPassword}
                          onChange={handleChangePasswordInput}
                        />
                        <Input
                          name="confirmNewPassword"
                          placeholder="Confirm Password"
                          type="password"
                          className="py-2"
                          value={changePasswordData.confirmNewPassword}
                          onChange={handleChangePasswordInput}
                        />

                        <div className="w-full flex justify-between">
                          <Button
                            className="mt-4"
                            onClick={handleChangePassword}
                            disabled={loading}
                          >
                            {loading ? "Changing..." : "Change Password"}
                          </Button>
                          <Button
                            type="button"
                            className="mt-4"
                            variant="outline"
                            onClick={() =>
                              setChangePasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmNewPassword: "",
                              })
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </SheetDescription>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Logout Button */}
              <Button className="w-full mt-3" onClick={handleLogout} disabled={loading}>
                {loading ? "Logging out..." : "Logout"}
              </Button>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Account;