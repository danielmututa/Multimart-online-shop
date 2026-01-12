// src/Auth/Register.tsx - COMPLETE VERSION WITH CLIENT, CLIENT_ADMIN, AND AGENT SUPPORT
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/context/userContext"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"
import { Eye, EyeOff, MapPin } from "lucide-react"

interface RegisterFormData {
  username: string
  email: string
  phone: string
  physicalAddress?: string // For client_admin only
  latitude?: number // For client_admin only
  longitude?: number // For client_admin only
  commissionRate?: number // For agent only
  payoutMethod?: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash' // For agent only
  payoutNumber?: string // For agent only
  payoutName?: string // For agent only
  minPayoutAmount?: number // For agent only
  password: string
  confirmPassword: string
}

interface RegisterProps {
  role?: 'client' | 'client_admin' | 'agent';
}

const Register = ({ role }: RegisterProps = {}) => {
  const navigate = useNavigate()
  const { register: authRegister, user } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // Initialize with the prop value if provided, otherwise default to 'client'
  const [registerType, setRegisterType] = useState<'client' | 'client_admin' | 'agent'>(role || 'client')
  const [gettingLocation, setGettingLocation] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegisterFormData>()

  useEffect(() => {
    console.log("Register - Current user:", user)
  }, [user])

  // Update registerType when role prop changes
  useEffect(() => {
    if (role) {
      setRegisterType(role)
    }
  }, [role])

  const handleLoginRedirect = () => {
    navigate("/login")
  }

  // Get current location for client_admin
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude)
        setValue('longitude', position.coords.longitude)
        toast.success("✅ Location captured!")
        setGettingLocation(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        toast.error("❌ Could not get location. Please enter manually.")
        setGettingLocation(false)
      }
    )
  }

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Registering with role:", registerType)
    let loadingToastId: string | number | undefined

    try {
      loadingToastId = toast.loading("Creating your account...")

      const registerData: any = {
        username: data.username,
        name: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmpassword: data.confirmPassword,
        role: registerType,
      }

      // Add merchant-specific fields for client_admin
      if (registerType === 'client_admin') {
        if (!data.physicalAddress) {
          toast.dismiss(loadingToastId)
          toast.error("Physical address is required for merchants")
          return
        }
        if (!data.latitude || !data.longitude) {
          toast.dismiss(loadingToastId)
          toast.error("Geographic location is required for merchants")
          return
        }

        registerData.physicalAddress = data.physicalAddress
        registerData.geoLocation = {
          latitude: data.latitude,
          longitude: data.longitude
        }
      }

      // Add agent-specific fields for agent
      if (registerType === 'agent') {
        if (!data.commissionRate || data.commissionRate <= 0) {
          toast.dismiss(loadingToastId)
          toast.error("Commission rate is required for agents")
          return
        }
        if (!data.payoutMethod) {
          toast.dismiss(loadingToastId)
          toast.error("Payout method is required for agents")
          return
        }
        if (!data.payoutNumber) {
          toast.dismiss(loadingToastId)
          toast.error("Payout number is required for agents")
          return
        }

        registerData.commissionRate = data.commissionRate
        registerData.payoutMethod = data.payoutMethod
        registerData.payoutNumber = data.payoutNumber
        registerData.payoutName = data.payoutName || data.username
        registerData.minPayoutAmount = data.minPayoutAmount || 10
      }

      await authRegister(registerData)

      toast.dismiss(loadingToastId)
      toast.success("✅ Account created successfully!")
      
      setTimeout(() => {
        navigate("/")
      }, 300)
    } catch (error: unknown) {
      console.log("Registration error:", error)

      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId)
      }

      toast.error("❌ Registration Failed!")
      const errorMessage = error instanceof Error ? error.message : "Something went wrong"
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="w-full flex justify-center items-center min-h-screen p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Register as a customer, merchant, or agent</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Registration Type Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Register As</label>
                <Select 
                  value={registerType} 
                  onValueChange={(value: 'client' | 'client_admin' | 'agent') => setRegisterType(value)}
                  disabled={!!role} // Disable if role is provided via prop
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client (Customer)</SelectItem>
                    <SelectItem value="client_admin">Client Admin (Merchant)</SelectItem>
                    <SelectItem value="agent">Agent (Sales Representative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Username/Business Name/Agent Name Field */}
              <div className="flex items-start flex-col gap-1">
                <label className="text-sm font-medium">
                  {registerType === 'client_admin' ? 'Business Name' : 
                   registerType === 'agent' ? 'Agent Name' : 'Full Name'}
                </label>
                <Input
                  {...register("username", {
                    required: registerType === 'client_admin' ? "Business name is required" : 
                              registerType === 'agent' ? "Agent name is required" : "Name is required",
                    minLength: {
                      value: 2,
                      message: "Must be at least 2 characters",
                    },
                    maxLength: {
                      value: 200,
                      message: "Too long",
                    },
                  })}
                  className="italic"
                  placeholder={registerType === 'client_admin' ? "Dan's Dental Clinic" : 
                               registerType === 'agent' ? "John Sales Agent" : "Peter Parker"}
                />
                {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
              </div>

              {/* Email Field */}
              <div className="flex items-start flex-col gap-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="italic"
                  placeholder="parkerpeter@gmail.com"
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
              </div>

              {/* Phone Field */}
              <div className="flex items-start flex-col gap-1">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  {...register("phone", {
                    required: "Phone number is required",
                    minLength: {
                      value: 9,
                      message: "Phone number too short",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone number too long",
                    },
                    pattern: {
                      value: /^(\+?263|0)?[1-9]\d{6,9}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  className="italic"
                  placeholder="+263771234567 or 0771234567"
                />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
              </div>

              {/* ========================================== */}
              {/* CLIENT_ADMIN ONLY FIELDS - Physical Address & Location */}
              {/* ========================================== */}
              {registerType === 'client_admin' && (
                <>
                  {/* Physical Address */}
                  <div className="flex items-start flex-col gap-1">
                    <label className="text-sm font-medium">Physical Address</label>
                    <Input
                      {...register("physicalAddress", {
                        required: registerType === 'client_admin' ? "Physical address is required" : false,
                        minLength: {
                          value: 5,
                          message: "Address must be at least 5 characters",
                        },
                      })}
                      className="italic"
                      placeholder="123 Main St, Harare"
                    />
                    {errors.physicalAddress && <span className="text-red-500 text-xs">{errors.physicalAddress.message}</span>}
                  </div>

                  {/* Geographic Location */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Geographic Location</label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      className="w-full"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {gettingLocation ? "Getting location..." : "Get Current Location"}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Latitude */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Latitude</label>
                        <Input
                          {...register("latitude", {
                            required: registerType === 'client_admin' ? "Latitude is required" : false,
                            valueAsNumber: true,
                            validate: (value) => {
                              if (registerType === 'client_admin') {
                                if (!value) return "Latitude is required"
                                if (value < -90 || value > 90) return "Invalid latitude"
                              }
                              return true
                            }
                          })}
                          type="number"
                          step="any"
                          placeholder="-17.8252"
                          className="text-sm"
                        />
                        {errors.latitude && <span className="text-red-500 text-xs">{errors.latitude.message}</span>}
                      </div>

                      {/* Longitude */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground">Longitude</label>
                        <Input
                          {...register("longitude", {
                            required: registerType === 'client_admin' ? "Longitude is required" : false,
                            valueAsNumber: true,
                            validate: (value) => {
                              if (registerType === 'client_admin') {
                                if (!value) return "Longitude is required"
                                if (value < -180 || value > 180) return "Invalid longitude"
                              }
                              return true
                            }
                          })}
                          type="number"
                          step="any"
                          placeholder="31.0335"
                          className="text-sm"
                        />
                        {errors.longitude && <span className="text-red-500 text-xs">{errors.longitude.message}</span>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click "Get Current Location" or enter coordinates manually
                    </p>
                  </div>
                </>
              )}

              {/* ========================================== */}
              {/* AGENT ONLY FIELDS - Commission & Payout Info */}
              {/* ========================================== */}
              {registerType === 'agent' && (
                <>
                  {/* Commission Rate */}
                  <div className="flex items-start flex-col gap-1">
                    <label className="text-sm font-medium">Commission Rate (%)</label>
                    <Input
                      {...register("commissionRate", {
                        required: registerType === 'agent' ? "Commission rate is required" : false,
                        valueAsNumber: true,
                        min: {
                          value: 0.1,
                          message: "Commission must be at least 0.1%"
                        },
                        max: {
                          value: 50,
                          message: "Commission cannot exceed 50%"
                        }
                      })}
                      type="number"
                      step="0.1"
                      className="italic"
                      placeholder="5.0"
                    />
                    {errors.commissionRate && <span className="text-red-500 text-xs">{errors.commissionRate.message}</span>}
                    <p className="text-xs text-muted-foreground">
                      Your commission percentage per sale
                    </p>
                  </div>

                  {/* Payout Method */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Payout Method</label>
                    <Select 
                      value={watch("payoutMethod")} 
                      onValueChange={(value: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash') => setValue("payoutMethod", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecocash">EcoCash</SelectItem>
                        <SelectItem value="onemoney">OneMoney</SelectItem>
                        <SelectItem value="telecash">Telecash</SelectItem>
                        <SelectItem value="paynow">PayNow</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payoutMethod && <span className="text-red-500 text-xs">{errors.payoutMethod.message}</span>}
                  </div>

                  {/* Payout Number */}
                  <div className="flex items-start flex-col gap-1">
                    <label className="text-sm font-medium">Payout Number/Account</label>
                    <Input
                      {...register("payoutNumber", {
                        required: registerType === 'agent' ? "Payout number is required" : false,
                        minLength: {
                          value: 9,
                          message: "Invalid payout number"
                        }
                      })}
                      className="italic"
                      placeholder="+263771234567"
                    />
                    {errors.payoutNumber && <span className="text-red-500 text-xs">{errors.payoutNumber.message}</span>}
                    <p className="text-xs text-muted-foreground">
                      Mobile money number or bank account for receiving payments
                    </p>
                  </div>

                  {/* Payout Name */}
                  <div className="flex items-start flex-col gap-1">
                    <label className="text-sm font-medium">Payout Account Name (Optional)</label>
                    <Input
                      {...register("payoutName")}
                      className="italic"
                      placeholder="Account holder name"
                    />
                    <p className="text-xs text-muted-foreground">
                      Name registered on the payout account
                    </p>
                  </div>

                  {/* Minimum Payout Amount */}
                  <div className="flex items-start flex-col gap-1">
                    <label className="text-sm font-medium">Minimum Payout Amount (USD)</label>
                    <Input
                      {...register("minPayoutAmount", {
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "Minimum must be at least $1"
                        }
                      })}
                      type="number"
                      step="1"
                      className="italic"
                      placeholder="10"
                      defaultValue={10}
                    />
                    {errors.minPayoutAmount && <span className="text-red-500 text-xs">{errors.minPayoutAmount.message}</span>}
                    <p className="text-xs text-muted-foreground">
                      You'll receive payouts when your commission reaches this amount
                    </p>
                  </div>
                </>
              )}

              {/* Password Field */}
              <div className="flex items-start flex-col gap-1">
                <label className="text-sm font-medium">Password</label>
                <div className="relative w-full">
                  <Input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      pattern: {
                        value: /^(?=.*\d).{6,}$/,
                        message: "Password must contain at least 1 number",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className="italic pr-10"
                    placeholder="e.g., mypass123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                <p className="text-xs text-muted-foreground">At least 6 characters with 1 number</p>
              </div>

              {/* Confirm Password Field */}
              <div className="flex items-start flex-col gap-1">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative w-full">
                  <Input
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === watch("password") || "Passwords do not match",
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    className="italic pr-10"
                    placeholder="Retype your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Registering..." : `Register as ${
                  registerType === 'client' ? 'Client' : 
                  registerType === 'client_admin' ? 'Merchant' : 'Agent'
                }`}
              </Button>
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Have an account?</p>
                <Button onClick={handleLoginRedirect} variant="ghost" type="button" size="sm">
                  Login
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  )
}

export default Register

















// // src/Auth/Register.tsx - COMPLETE FINAL VERSION WITH ROLE PROP
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useNavigate } from "react-router-dom"
// import { useForm } from "react-hook-form"
// import { useAuthStore } from "@/context/userContext"
// import { useEffect, useState } from "react"
// import { toast, Toaster } from "sonner"
// import { Eye, EyeOff, MapPin } from "lucide-react"

// interface RegisterFormData {
//   username: string
//   email: string
//   phone: string
//   physicalAddress?: string // For client_admin only
//   latitude?: number // For client_admin only
//   longitude?: number // For client_admin only
//   password: string
//   confirmPassword: string
// }

// interface RegisterProps {
//   role?: 'client' | 'client_admin';
// }

// const Register = ({ role }: RegisterProps = {}) => {
//   const navigate = useNavigate()
//   const { register: authRegister, user } = useAuthStore()
  
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   // Initialize with the prop value if provided, otherwise default to 'client'
//   const [registerType, setRegisterType] = useState<'client' | 'client_admin'>(role || 'client')
//   const [gettingLocation, setGettingLocation] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//   } = useForm<RegisterFormData>()

//   useEffect(() => {
//     console.log("Register - Current user:", user)
//   }, [user])

//   // Update registerType when role prop changes
//   useEffect(() => {
//     if (role) {
//       setRegisterType(role)
//     }
//   }, [role])

//   const handleLoginRedirect = () => {
//     navigate("/login")
//   }

//   // Get current location for client_admin
//   const handleGetLocation = () => {
//     if (!navigator.geolocation) {
//       toast.error("Geolocation is not supported by your browser")
//       return
//     }

//     setGettingLocation(true)
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setValue('latitude', position.coords.latitude)
//         setValue('longitude', position.coords.longitude)
//         toast.success("✅ Location captured!")
//         setGettingLocation(false)
//       },
//       (error) => {
//         console.error("Geolocation error:", error)
//         toast.error("❌ Could not get location. Please enter manually.")
//         setGettingLocation(false)
//       }
//     )
//   }

//   const onSubmit = async (data: RegisterFormData) => {
//     console.log("Registering with role:", registerType)
//     let loadingToastId: string | number | undefined

//     try {
//       loadingToastId = toast.loading("Creating your account...")

//       const registerData: any = {
//         username: data.username,
//         name: data.username,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//         confirmpassword: data.confirmPassword,
//         role: registerType,
//       }

//       // Add merchant-specific fields for client_admin
//       if (registerType === 'client_admin') {
//         if (!data.physicalAddress) {
//           toast.dismiss(loadingToastId)
//           toast.error("Physical address is required for merchants")
//           return
//         }
//         if (!data.latitude || !data.longitude) {
//           toast.dismiss(loadingToastId)
//           toast.error("Geographic location is required for merchants")
//           return
//         }

//         registerData.physicalAddress = data.physicalAddress
//         registerData.geoLocation = {
//           latitude: data.latitude,
//           longitude: data.longitude
//         }
//       }

//       await authRegister(registerData)

//       toast.dismiss(loadingToastId)
//       toast.success("✅ Account created successfully!")
      
//       setTimeout(() => {
//         navigate("/")
//       }, 300)
//     } catch (error: unknown) {
//       console.log("Registration error:", error)

//       if (loadingToastId !== undefined) {
//         toast.dismiss(loadingToastId)
//       }

//       toast.error("❌ Registration Failed!")
//       const errorMessage = error instanceof Error ? error.message : "Something went wrong"
//       toast.error(errorMessage)
//     }
//   }

//   return (
//     <>
//       <Toaster position="top-right" richColors closeButton />

//       <div className="w-full flex justify-center items-center min-h-screen p-4">
//         <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
//           <Card className="w-full">
//             <CardHeader>
//               <CardTitle>Create Account</CardTitle>
//               <CardDescription>Register as a customer or merchant</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               {/* Registration Type Selection */}
//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium">Register As</label>
//                 <Select value={registerType} onValueChange={(value: 'client' | 'client_admin') => setRegisterType(value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select account type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="client">Client (Customer)</SelectItem>
//                     <SelectItem value="client_admin">Client Admin (Merchant)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Username/Business Name Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">
//                   {registerType === 'client_admin' ? 'Business Name' : 'Full Name'}
//                 </label>
//                 <Input
//                   {...register("username", {
//                     required: registerType === 'client_admin' ? "Business name is required" : "Name is required",
//                     minLength: {
//                       value: 2,
//                       message: "Must be at least 2 characters",
//                     },
//                     maxLength: {
//                       value: 200,
//                       message: "Too long",
//                     },
//                   })}
//                   className="italic"
//                   placeholder={registerType === 'client_admin' ? "Dan's Dental Clinic" : "Peter Parker"}
//                 />
//                 {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
//               </div>

//               {/* Email Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Email</label>
//                 <Input
//                   {...register("email", {
//                     required: "Email is required",
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: "Invalid email address",
//                     },
//                   })}
//                   type="email"
//                   className="italic"
//                   placeholder="parkerpeter@gmail.com"
//                 />
//                 {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
//               </div>

//               {/* Phone Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Phone Number</label>
//                 <Input
//                   {...register("phone", {
//                     required: "Phone number is required",
//                     minLength: {
//                       value: 9,
//                       message: "Phone number too short",
//                     },
//                     maxLength: {
//                       value: 15,
//                       message: "Phone number too long",
//                     },
//                     pattern: {
//                       value: /^(\+?263|0)?[1-9]\d{6,9}$/,
//                       message: "Please enter a valid phone number",
//                     },
//                   })}
//                   className="italic"
//                   placeholder="+263771234567 or 0771234567"
//                 />
//                 {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
//               </div>

//               {/* ========================================== */}
//               {/* CLIENT_ADMIN ONLY FIELDS - Physical Address & Location */}
//               {/* ========================================== */}
//               {registerType === 'client_admin' && (
//                 <>
//                   {/* Physical Address */}
//                   <div className="flex items-start flex-col gap-1">
//                     <label className="text-sm font-medium">Physical Address</label>
//                     <Input
//                       {...register("physicalAddress", {
//                         required: registerType === 'client_admin' ? "Physical address is required" : false,
//                         minLength: {
//                           value: 5,
//                           message: "Address must be at least 5 characters",
//                         },
//                       })}
//                       className="italic"
//                       placeholder="123 Main St, Harare"
//                     />
//                     {errors.physicalAddress && <span className="text-red-500 text-xs">{errors.physicalAddress.message}</span>}
//                   </div>

//                   {/* Geographic Location */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium">Geographic Location</label>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={handleGetLocation}
//                       disabled={gettingLocation}
//                       className="w-full"
//                     >
//                       <MapPin className="mr-2 h-4 w-4" />
//                       {gettingLocation ? "Getting location..." : "Get Current Location"}
//                     </Button>
                    
//                     <div className="grid grid-cols-2 gap-2">
//                       {/* Latitude */}
//                       <div className="flex flex-col gap-1">
//                         <label className="text-xs text-muted-foreground">Latitude</label>
//                         <Input
//                           {...register("latitude", {
//                             required: registerType === 'client_admin' ? "Latitude is required" : false,
//                             valueAsNumber: true,
//                             validate: (value) => {
//                               if (registerType === 'client_admin') {
//                                 if (!value) return "Latitude is required"
//                                 if (value < -90 || value > 90) return "Invalid latitude"
//                               }
//                               return true
//                             }
//                           })}
//                           type="number"
//                           step="any"
//                           placeholder="-17.8252"
//                           className="text-sm"
//                         />
//                         {errors.latitude && <span className="text-red-500 text-xs">{errors.latitude.message}</span>}
//                       </div>

//                       {/* Longitude */}
//                       <div className="flex flex-col gap-1">
//                         <label className="text-xs text-muted-foreground">Longitude</label>
//                         <Input
//                           {...register("longitude", {
//                             required: registerType === 'client_admin' ? "Longitude is required" : false,
//                             valueAsNumber: true,
//                             validate: (value) => {
//                               if (registerType === 'client_admin') {
//                                 if (!value) return "Longitude is required"
//                                 if (value < -180 || value > 180) return "Invalid longitude"
//                               }
//                               return true
//                             }
//                           })}
//                           type="number"
//                           step="any"
//                           placeholder="31.0335"
//                           className="text-sm"
//                         />
//                         {errors.longitude && <span className="text-red-500 text-xs">{errors.longitude.message}</span>}
//                       </div>
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       Click "Get Current Location" or enter coordinates manually
//                     </p>
//                   </div>
//                 </>
//               )}

//               {/* Password Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("password", {
//                       required: "Password is required",
//                       minLength: {
//                         value: 6,
//                         message: "Password must be at least 6 characters",
//                       },
//                       pattern: {
//                         value: /^(?=.*\d).{6,}$/,
//                         message: "Password must contain at least 1 number",
//                       },
//                     })}
//                     type={showPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="e.g., mypass123"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
//                 <p className="text-xs text-muted-foreground">At least 6 characters with 1 number</p>
//               </div>

//               {/* Confirm Password Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Confirm Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("confirmPassword", {
//                       required: "Please confirm your password",
//                       validate: (value) => value === watch("password") || "Passwords do not match",
//                     })}
//                     type={showConfirmPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="Retype your password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
//                 )}
//               </div>
//             </CardContent>

//             <CardFooter className="flex flex-col gap-4">
//               <Button type="submit" disabled={isSubmitting} className="w-full">
//                 {isSubmitting ? "Registering..." : `Register as ${registerType === 'client' ? 'Client' : 'Client Admin'}`}
//               </Button>
//               <div className="w-full flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Have an account?</p>
//                 <Button onClick={handleLoginRedirect} variant="ghost" type="button" size="sm">
//                   Login
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         </form>
//       </div>
//     </>
//   )
// }

// export default Register













// // src/Auth/Register.tsx - COMPLETE FINAL VERSION
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useNavigate } from "react-router-dom"
// import { useForm } from "react-hook-form"
// import { useAuthStore } from "@/context/userContext"
// import { useEffect, useState } from "react"
// import { toast, Toaster } from "sonner"
// import { Eye, EyeOff, MapPin } from "lucide-react"

// interface RegisterFormData {
//   username: string
//   email: string
//   phone: string
//   physicalAddress?: string // For client_admin only
//   latitude?: number // For client_admin only
//   longitude?: number // For client_admin only
//   password: string
//   confirmPassword: string
// }

// const Register = () => {
//   const navigate = useNavigate()
//   const { register: authRegister, user } = useAuthStore()
  
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [registerType, setRegisterType] = useState<'client' | 'client_admin'>('client')
//   const [gettingLocation, setGettingLocation] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//     setValue,
//   } = useForm<RegisterFormData>()

//   useEffect(() => {
//     console.log("Register - Current user:", user)
//   }, [user])

//   const handleLoginRedirect = () => {
//     navigate("/login")
//   }

//   // Get current location for client_admin
//   const handleGetLocation = () => {
//     if (!navigator.geolocation) {
//       toast.error("Geolocation is not supported by your browser")
//       return
//     }

//     setGettingLocation(true)
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setValue('latitude', position.coords.latitude)
//         setValue('longitude', position.coords.longitude)
//         toast.success("✅ Location captured!")
//         setGettingLocation(false)
//       },
//       (error) => {
//         console.error("Geolocation error:", error)
//         toast.error("❌ Could not get location. Please enter manually.")
//         setGettingLocation(false)
//       }
//     )
//   }

//   const onSubmit = async (data: RegisterFormData) => {
//     console.log("Registering with role:", registerType)
//     let loadingToastId: string | number | undefined

//     try {
//       loadingToastId = toast.loading("Creating your account...")

//       const registerData: any = {
//         username: data.username,
//         name: data.username,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//         confirmpassword: data.confirmPassword,
//         role: registerType,
//       }

//       // Add merchant-specific fields for client_admin
//       if (registerType === 'client_admin') {
//         if (!data.physicalAddress) {
//           toast.dismiss(loadingToastId)
//           toast.error("Physical address is required for merchants")
//           return
//         }
//         if (!data.latitude || !data.longitude) {
//           toast.dismiss(loadingToastId)
//           toast.error("Geographic location is required for merchants")
//           return
//         }

//         registerData.physicalAddress = data.physicalAddress
//         registerData.geoLocation = {
//           latitude: data.latitude,
//           longitude: data.longitude
//         }
//       }

//       await authRegister(registerData)

//       toast.dismiss(loadingToastId)
//       toast.success("✅ Account created successfully!")
      
//       setTimeout(() => {
//         navigate("/")
//       }, 300)
//     } catch (error: unknown) {
//       console.log("Registration error:", error)

//       if (loadingToastId !== undefined) {
//         toast.dismiss(loadingToastId)
//       }

//       toast.error("❌ Registration Failed!")
//       const errorMessage = error instanceof Error ? error.message : "Something went wrong"
//       toast.error(errorMessage)
//     }
//   }

//   return (
//     <>
//       <Toaster position="top-right" richColors closeButton />

//       <div className="w-full flex justify-center items-center min-h-screen p-4">
//         <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
//           <Card className="w-full">
//             <CardHeader>
//               <CardTitle>Create Account</CardTitle>
//               <CardDescription>Register as a customer or merchant</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               {/* Registration Type Selection */}
//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium">Register As</label>
//                 <Select value={registerType} onValueChange={(value: 'client' | 'client_admin') => setRegisterType(value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select account type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="client">Client (Customer)</SelectItem>
//                     <SelectItem value="client_admin">Client Admin (Merchant)</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Username/Business Name Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">
//                   {registerType === 'client_admin' ? 'Business Name' : 'Full Name'}
//                 </label>
//                 <Input
//                   {...register("username", {
//                     required: registerType === 'client_admin' ? "Business name is required" : "Name is required",
//                     minLength: {
//                       value: 2,
//                       message: "Must be at least 2 characters",
//                     },
//                     maxLength: {
//                       value: 200,
//                       message: "Too long",
//                     },
//                   })}
//                   className="italic"
//                   placeholder={registerType === 'client_admin' ? "Dan's Dental Clinic" : "Peter Parker"}
//                 />
//                 {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
//               </div>

//               {/* Email Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Email</label>
//                 <Input
//                   {...register("email", {
//                     required: "Email is required",
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: "Invalid email address",
//                     },
//                   })}
//                   type="email"
//                   className="italic"
//                   placeholder="parkerpeter@gmail.com"
//                 />
//                 {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
//               </div>

//               {/* Phone Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Phone Number</label>
//                 <Input
//                   {...register("phone", {
//                     required: "Phone number is required",
//                     minLength: {
//                       value: 9,
//                       message: "Phone number too short",
//                     },
//                     maxLength: {
//                       value: 15,
//                       message: "Phone number too long",
//                     },
//                     pattern: {
//                       value: /^(\+?263|0)?[1-9]\d{6,9}$/,
//                       message: "Please enter a valid phone number",
//                     },
//                   })}
//                   className="italic"
//                   placeholder="+263771234567 or 0771234567"
//                 />
//                 {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
//               </div>

//               {/* ========================================== */}
//               {/* CLIENT_ADMIN ONLY FIELDS - Physical Address & Location */}
//               {/* ========================================== */}
//               {registerType === 'client_admin' && (
//                 <>
//                   {/* Physical Address */}
//                   <div className="flex items-start flex-col gap-1">
//                     <label className="text-sm font-medium">Physical Address</label>
//                     <Input
//                       {...register("physicalAddress", {
//                         required: registerType === 'client_admin' ? "Physical address is required" : false,
//                         minLength: {
//                           value: 5,
//                           message: "Address must be at least 5 characters",
//                         },
//                       })}
//                       className="italic"
//                       placeholder="123 Main St, Harare"
//                     />
//                     {errors.physicalAddress && <span className="text-red-500 text-xs">{errors.physicalAddress.message}</span>}
//                   </div>

//                   {/* Geographic Location */}
//                   <div className="flex flex-col gap-2">
//                     <label className="text-sm font-medium">Geographic Location</label>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={handleGetLocation}
//                       disabled={gettingLocation}
//                       className="w-full"
//                     >
//                       <MapPin className="mr-2 h-4 w-4" />
//                       {gettingLocation ? "Getting location..." : "Get Current Location"}
//                     </Button>
                    
//                     <div className="grid grid-cols-2 gap-2">
//                       {/* Latitude */}
//                       <div className="flex flex-col gap-1">
//                         <label className="text-xs text-muted-foreground">Latitude</label>
//                         <Input
//                           {...register("latitude", {
//                             required: registerType === 'client_admin' ? "Latitude is required" : false,
//                             valueAsNumber: true,
//                             validate: (value) => {
//                               if (registerType === 'client_admin') {
//                                 if (!value) return "Latitude is required"
//                                 if (value < -90 || value > 90) return "Invalid latitude"
//                               }
//                               return true
//                             }
//                           })}
//                           type="number"
//                           step="any"
//                           placeholder="-17.8252"
//                           className="text-sm"
//                         />
//                         {errors.latitude && <span className="text-red-500 text-xs">{errors.latitude.message}</span>}
//                       </div>

//                       {/* Longitude */}
//                       <div className="flex flex-col gap-1">
//                         <label className="text-xs text-muted-foreground">Longitude</label>
//                         <Input
//                           {...register("longitude", {
//                             required: registerType === 'client_admin' ? "Longitude is required" : false,
//                             valueAsNumber: true,
//                             validate: (value) => {
//                               if (registerType === 'client_admin') {
//                                 if (!value) return "Longitude is required"
//                                 if (value < -180 || value > 180) return "Invalid longitude"
//                               }
//                               return true
//                             }
//                           })}
//                           type="number"
//                           step="any"
//                           placeholder="31.0335"
//                           className="text-sm"
//                         />
//                         {errors.longitude && <span className="text-red-500 text-xs">{errors.longitude.message}</span>}
//                       </div>
//                     </div>
//                     <p className="text-xs text-muted-foreground">
//                       Click "Get Current Location" or enter coordinates manually
//                     </p>
//                   </div>
//                 </>
//               )}

//               {/* Password Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("password", {
//                       required: "Password is required",
//                       minLength: {
//                         value: 6,
//                         message: "Password must be at least 6 characters",
//                       },
//                       pattern: {
//                         value: /^(?=.*\d).{6,}$/,
//                         message: "Password must contain at least 1 number",
//                       },
//                     })}
//                     type={showPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="e.g., mypass123"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
//                 <p className="text-xs text-muted-foreground">At least 6 characters with 1 number</p>
//               </div>

//               {/* Confirm Password Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Confirm Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("confirmPassword", {
//                       required: "Please confirm your password",
//                       validate: (value) => value === watch("password") || "Passwords do not match",
//                     })}
//                     type={showConfirmPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="Retype your password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
//                 )}
//               </div>
//             </CardContent>

//             <CardFooter className="flex flex-col gap-4">
//               <Button type="submit" disabled={isSubmitting} className="w-full">
//                 {isSubmitting ? "Registering..." : `Register as ${registerType === 'client' ? 'Client' : 'Client Admin'}`}
//               </Button>
//               <div className="w-full flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Have an account?</p>
//                 <Button onClick={handleLoginRedirect} variant="ghost" type="button" size="sm">
//                   Login
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         </form>
//       </div>
//     </>
//   )
// }

// export default Register


















// // src/Auth/Register.tsx (with password visibility toggle)
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { useNavigate, useParams } from "react-router-dom"
// import { useForm } from "react-hook-form"
// import { useAuthStore } from "@/context/userContext"
// import { useEffect, useState } from "react"
// import { toast, Toaster } from "sonner"
// import { Eye, EyeOff } from "lucide-react"

// // Define the form data type
// interface RegisterFormData {
//   username: string
//   email: string
//   phone: string
//   password: string
//   confirmPassword: string
// }

// interface RegisterProps {
//   role?: "user" | "admin";
// }

// const Register = ({ role }: RegisterProps) => {
//   const navigate = useNavigate()
//   const { register: authRegister, user } = useAuthStore()
//   const { role: urlRole } = useParams<{ role: string }>()

//   // Password visibility states
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)

//   // Use prop first, then URL parameter, default to "user"
//   const finalRole = role || (urlRole as "user" | "admin") || "user"

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     watch,
//   } = useForm<RegisterFormData>()

//   useEffect(() => {
//     console.log("Register - Current user:", user)
//   }, [user])

//   const handleLoginRedirect = () => {
//     navigate("/login")
//   }

//   const onSubmit = async (data: RegisterFormData) => {
//     console.log("Registering with role:", finalRole)
//     console.log("Form submitted!")
    
//     let loadingToastId: string | number | undefined

//     try {
//       loadingToastId = toast.loading("Creating your account...")

//       await authRegister({
//         username: data.username,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//         confirmpassword: data.confirmPassword,
//         role: finalRole,
//       })

//       toast.dismiss(loadingToastId)
//       toast.success("✅ Account created successfully!")
      
//       // Redirect based on role
//       if (finalRole === "admin") {
//         navigate("/")
//       } else {
//         navigate("/home")
//       }
//     } catch (error: unknown) {
//       console.log("Registration error:", error)

//       if (loadingToastId !== undefined) {
//         toast.dismiss(loadingToastId)
//       }

//       toast.error("❌ Registration Failed!")
//       const errorMessage = error instanceof Error ? error.message : "Something went wrong"
//       toast.error(errorMessage)
//     }
//   }

//   return (
//     <>
//       <Toaster position="top-right" richColors closeButton />

//       <div className="w-full flex justify-center items-center min-h-screen p-4">
//         <form onSubmit={handleSubmit(onSubmit)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
//           <Card className="w-full">
//             <CardHeader>
//               <CardTitle>Register as {finalRole.toUpperCase()}</CardTitle>
//               <CardDescription>Create your {finalRole} account</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               {/* Username Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Username</label>
//                 <Input
//                   {...register("username", {
//                     required: "Username is required",
//                     minLength: {
//                       value: 3,
//                       message: "Username must be at least 3 characters",
//                     },
//                     maxLength: {
//                       value: 100,
//                       message: "Username is too long",
//                     },
//                   })}
//                   className="italic"
//                   placeholder="example Peter Parker"
//                 />
//                 {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
//               </div>

//               {/* Email Field */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Email</label>
//                 <Input
//                   {...register("email", {
//                     required: "Email is required",
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: "Invalid email address",
//                     },
//                   })}
//                   type="email"
//                   className="italic"
//                   placeholder="example parkerpeter@gmail.com"
//                 />
//                 {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
//               </div>

//               {/* Phone Field - SIMPLIFIED */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Phone Number</label>
//                 <Input
//                   {...register("phone", {
//                     required: "Phone number is required",
//                     minLength: {
//                       value: 9,
//                       message: "Phone number too short",
//                     },
//                     maxLength: {
//                       value: 15,
//                       message: "Phone number too long",
//                     },
//                     pattern: {
//                       value: /^(\+?263|0)?[1-9]\d{6,9}$/,
//                       message: "Please enter a valid phone number",
//                     },
//                   })}
//                   className="italic"
//                   placeholder="+263771234567 or 0771234567"
//                 />
//                 {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
//               </div>

//               {/* Password Field - WITH EYE ICON */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("password", {
//                       required: "Password is required",
//                       minLength: {
//                         value: 6,
//                         message: "Password must be at least 6 characters",
//                       },
//                       pattern: {
//                         value: /^(?=.*\d).{6,}$/,
//                         message: "Password must contain at least 1 number",
//                       },
//                     })}
//                     type={showPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="e.g., mypass123 or dann9od"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
//                 <p className="text-xs text-muted-foreground">At least 6 characters with 1 number</p>
//               </div>

//               {/* Confirm Password Field - WITH EYE ICON */}
//               <div className="flex items-start flex-col gap-1">
//                 <label className="text-sm font-medium">Confirm Password</label>
//                 <div className="relative w-full">
//                   <Input
//                     {...register("confirmPassword", {
//                       required: "Please confirm your password",
//                       validate: (value) => value === watch("password") || "Passwords do not match",
//                     })}
//                     type={showConfirmPassword ? "text" : "password"}
//                     className="italic pr-10"
//                     placeholder="Retype your password"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
//                   >
//                     {showConfirmPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
//                 )}
//               </div>
//             </CardContent>

//             <CardFooter className="flex flex-col gap-4">
//               <Button type="submit" disabled={isSubmitting} className="w-full">
//                 {isSubmitting ? "Registering..." : `Register as ${finalRole}`}
//               </Button>
//               <div className="w-full flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Have an account?</p>
//                 <Button onClick={handleLoginRedirect} variant="ghost" type="button" size="sm">
//                   Login
//                 </Button>
//               </div>
//             </CardFooter>
//           </Card>
//         </form>
//       </div>
//     </>
//   )
// }

// export default Register