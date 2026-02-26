import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/context/userContext"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"

interface LoginInput {
  role?: string
  email: string
  password: string
  loginType: 'customer' | 'merchant'
}

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'customer' | 'merchant'>('customer')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    defaultValues: {
      email: localStorage.getItem("login_email") || "",
      loginType: 'customer'
    }
  })

  useEffect(() => {
    const email = watch("email")
    if (email) localStorage.setItem("login_email", email)
  }, [watch("email")])

  const handleSubmitForm = async (data: LoginInput) => {
    console.log(`Attempting ${activeTab} login with:`, data)
    let loadingToastId: string | number | undefined

    try {
      loadingToastId = toast.loading("Logging you in...")

      if (activeTab === 'customer') {
        // Regular user login
        await login(data.email, data.password, 'client', false)
      } else {
        // Merchant/Admin login
        if (!data.role) {
          toast.dismiss(loadingToastId)
          toast.error("Please select a merchant role")
          return
        }
        await login(data.email, data.password, data.role, true)
      }

      toast.dismiss(loadingToastId)
      toast.success("✅ Login successful!")

      localStorage.removeItem("login_email")

      setTimeout(() => {
        if (activeTab === 'merchant') {
          if (data.role === 'agent') {
            navigate("/agent-dashboard")
          } else {
            navigate("/admin-dashboard")
          }
        } else {
          navigate("/")
        }
      }, 300)
    } catch (error: unknown) {
      console.error("Login error:", error)
      if (loadingToastId !== undefined) toast.dismiss(loadingToastId)
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="w-full flex justify-center items-center min-h-screen p-4">
        <div className="w-full md:w-[60%] xl:w-[40%] max-w-md">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="merchant">Merchant</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(handleSubmitForm)}>
              <TabsContent value="customer">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Login</CardTitle>
                    <CardDescription>Login to your shopping account</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        {...register("email", {
                          required: activeTab === 'customer' ? "Email is required" : false,
                          pattern: activeTab === 'customer' ? {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          } : undefined,
                        })}
                        placeholder="example@email.com"
                        type="email"
                      />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "At least 6 characters" },
                        })}
                        placeholder="Enter your password"
                        type="password"
                      />
                      {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                    <div className="w-full flex justify-between items-center px-1">
                      <p className="text-sm text-muted-foreground">New here?</p>
                      <Button onClick={() => navigate("/register/client")} variant="link" type="button" size="sm">
                        Create Account
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="merchant">
                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Login</CardTitle>
                    <CardDescription>Access your business dashboard</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Select Role</label>
                      <Select onValueChange={(v) => setValue("role", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="client_admin">Client Admin (Merchant)</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="digital_marketer_admin">Digital Marketer</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <span className="text-red-500 text-xs">{errors.role.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {watch("role") === 'super_admin' || watch("role") === 'digital_marketer_admin' ? 'Username' : 'Email'}
                      </label>
                      <Input
                        {...register("email", { 
                          required: activeTab === 'merchant' ? (watch("role") === 'super_admin' || watch("role") === 'digital_marketer_admin' ? "Username is required" : "Email is required") : false,
                          pattern: activeTab === 'merchant' && !(watch("role") === 'super_admin' || watch("role") === 'digital_marketer_admin') ? {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          } : undefined
                        })}
                        placeholder={watch("role") === 'super_admin' || watch("role") === 'digital_marketer_admin' ? "Enter username" : "business@email.com"}
                        type={watch("role") === 'super_admin' || watch("role") === 'digital_marketer_admin' ? "text" : "email"}
                      />
                      {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        {...register("password", { required: "Password is required" })}
                        placeholder="Enter password"
                        type="password"
                      />
                      {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Logging in..." : "Merchant Login"}
                    </Button>
                    <div className="w-full flex justify-between items-center px-1">
                      <p className="text-sm text-muted-foreground">Manage a business?</p>
                      <Button onClick={() => navigate("/register/admin")} variant="link" type="button" size="sm">
                        Register Business
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </div>
    </>
  )
}

export default Login
