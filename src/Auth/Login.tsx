import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuthStore } from "@/context/userContext"
import { useEffect } from "react"
import { toast, Toaster } from "sonner"

interface LoginInput {
  username: string
  email: string
  phone: string
  password: string
}

const Login = () => {
  const navigate = useNavigate()
  const { login, user } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>()

  useEffect(() => {
    console.log("Login - Current user:", user)
  }, [user])

  const handleSubmitForm = async (data: LoginInput) => {
    console.log("Attempting admin login with:", data)
    let loadingToastId: string | number | undefined

    try {
      loadingToastId = toast.loading("Logging you in...")

      // Always send admin-style login
      await login(data.email, data.password, undefined, true, data.username, data.phone)

      toast.dismiss(loadingToastId)
      toast.success("✅ Login successful!")

      setTimeout(() => {
        navigate("/")
      }, 300)
    } catch (error: unknown) {
      console.error("Login error:", error)

      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId)
      }

      toast.error("❌ Login Failed!")
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
      toast.error(errorMessage)
    }
  }

  const handleRegisterRedirect = () => {
    console.log("Redirecting to register...")
    navigate("/register")
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="w-full flex justify-center items-center min-h-screen p-4">
        <form onSubmit={handleSubmit(handleSubmitForm)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Login to access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Username Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  {...register("username", {
                    required: "Username is required",
                  })}
                  placeholder="Enter your username"
                  type="text"
                />
                {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="example@email.com"
                  type="email"
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
              </div>

              {/* Phone Number Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^(\+?263|0)?[1-9]\d{6,9}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  placeholder="+263771234567 or 0771234567"
                  type="text"
                />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
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
              
              <div className="w-full flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Need a merchant account?</p>
                <Button onClick={handleRegisterRedirect} variant="ghost" type="button" size="sm">
                  Register
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  )
}

export default Login

















// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { useNavigate } from "react-router-dom"
// import { useForm } from "react-hook-form"
// import { useAuthStore } from "@/context/userContext"
// import { useEffect } from "react"
// import {GoogleSignIn} from "@/Auth/GoogleSignIn";
// import { toast, Toaster } from "sonner"
// // import GoogleSignIn from "@/Auth/Googlesignin"
// interface LoginInput {
//   email: string
//   password: string
// }

// const Login = () => {
//   const navigate = useNavigate()
//   const { login, user } = useAuthStore()

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginInput>()

//   // Debug user state changes
//   useEffect(() => {
//     console.log("Login - Current user:", user)
//   }, [user])

//   // TEST TOAST FUNCTION

//   // const handleGoogleSignIn = async () => {
//   //   console.log("Google Sign-In initiated")

//   //   try {
//   //     // TODO: Implement actual Google OAuth here
//   //     // For now, simulate successful Google login
//   //     await new Promise((resolve) => setTimeout(resolve, 1500))

//   //     // Mock user data from Google
//   //     const mockGoogleUser = {
//   //       id: "google_123",
//   //       username: "Google User",
//   //       email: "user@gmail.com",
//   //       provider: "google",
//   //     }

//   //     // You can call your login function or set user directly
//   //     // await login(mockGoogleUser.email, "google_auth")

//   //     toast.success("✅ Signed in with Google!")
//   //     navigate("/")
//   //   } catch (error) {
//   //     console.error("Google sign-in error:", error)
//   //     toast.error("❌ Google sign-in failed!")
//   //   }
//   // }
  


//   const handleSubmitForm = async (data: LoginInput) => {
//     console.log("Attempting login with:", data)

//     // Initialize the loading toast ID as undefined
//     let loadingToastId: string | number | undefined

//     try {
//       // Show loading toast
//       loadingToastId = toast.loading("Logging you in...")

//       await login(data.email, data.password)

//       // Dismiss loading toast
//       toast.dismiss(loadingToastId)

//       // Show success toast
//       toast.success("✅ Login successful!")

//       // Delay to ensure state propagation
//       setTimeout(() => {
//         navigate("/")
//       }, 300)
//     } catch (error: unknown) {
//       console.error("Login error:", error)

//       // Dismiss loading toast if it exists
//       if (loadingToastId !== undefined) {
//         toast.dismiss(loadingToastId)
//       }

//       // Show error toast
//       toast.error("❌ Login Failed!")

//       // Show the actual error message
//       const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again."
//       toast.error(errorMessage)
//     }
//   }

//   const handleRegisterRedirect = () => {
//     console.log("Redirecting to register...")
//     navigate("/register")
//   }

//   return (
//     <>
//       {/* ADD TOASTER HERE - This makes toasts show up! */}
//       <Toaster position="top-right" richColors closeButton />

//       <div className="w-full flex justify-center items-center min-h-screen p-4">
//         <form onSubmit={handleSubmit(handleSubmitForm)} className="w-full md:w-[60%] xl:w-[40%] max-w-md">
//           <Card className="w-full">
//             <CardHeader>
//               <CardTitle>Welcome to Admin</CardTitle>
//               <CardDescription>Please login to continue</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col gap-4">
//               {/* BIG TEST BUTTON */}
             

//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium">Email</label>
//                 <Input
//                   {...register("email", {
//                     required: "Email is required",
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: "Invalid email address",
//                     },
//                   })}
//                   placeholder="example@email.com"
//                   type="email"
//                 />
//                 {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
//               </div>

//               <div className="flex flex-col gap-2">
//                 <label className="text-sm font-medium">Password</label>
//                 <Input
//                   {...register("password", {
//                     required: "Password is required",
//                     minLength: {
//                       value: 6,
//                       message: "Password must be at least 6 characters",
//                     },
//                   })}
//                   placeholder="Enter your password"
//                   type="password"
//                 />
//                 {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
//               </div>
//             </CardContent>

//             {/* <CardFooter className="flex flex-col gap-4">
//               <Button type="submit" disabled={isSubmitting} className="w-full">
//                 {isSubmitting ? "Logging in..." : "Login"}
//               </Button>
//               <div className="w-full flex justify-between items-center">
//                 <p className="text-sm text-muted-foreground">Don't have an account?</p>
//                 <Button onClick={handleRegisterRedirect} variant="ghost" type="button" size="sm">
//                   Register
//                 </Button>
//               </div>
//               {/* <GoogleSignIn onGoogleSignIn={handleGoogleSignIn} disabled={isSubmitting} /> */}
//             {/* </CardFooter> */} 




// <CardFooter className="flex flex-col gap-4">
//   <Button type="submit" disabled={isSubmitting} className="w-full">
//     {isSubmitting ? "Logging in..." : "Login"}
//   </Button>
  
//   <div className="relative w-full">
//     <div className="absolute inset-0 flex items-center">
//       <span className="w-full border-t" />
//     </div>
//     <div className="relative flex justify-center text-xs uppercase">
//       <span className="bg-background px-2 text-muted-foreground">
//         Or continue with
//       </span>
//     </div>
//   </div>
  
//   <GoogleSignIn disabled={isSubmitting} />
  
//   <div className="w-full flex justify-between items-center">
//     <p className="text-sm text-muted-foreground">Don't have an account?</p>
//     <Button onClick={handleRegisterRedirect} variant="ghost" type="button" size="sm">
//       Register
//     </Button>
//   </div>
// </CardFooter>
//           </Card>
//         </form>
//       </div>
//     </>
//   )
// }

// export default Login
