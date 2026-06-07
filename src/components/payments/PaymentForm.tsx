

// import { useState } from "react"
// import { Check, CreditCard } from "lucide-react"
// import ZimbabweCitySelector from "./ZimbabweCitySelector"
// import { useNavigate } from "react-router-dom"

// export default function PaymentForm() {
//     const navigate = useNavigate()
//   const [selectedCity, setSelectedCity] = useState("")
  
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ecocash")
//   const [formData, setFormData] = useState({
//     firstName: "",
//     street: "",
//     aptSuite: "",
//     postcode: "",
//     phone: "",
//     zipCode: "",
//     email: "",
//     nameOnCard: "",
//     cardNumber: "",
//     expMonth: "",
//     expYear: "",
//     cvv: "",
//   })

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

// //   const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
// //   const years = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i))

//   return (
//     <div className="min-h-screen bg-gray-50 py-14 px-5 sm:py-14 sm:px-5 md:px-10 md:py-16 lg:p-20 xl:p-20">
//       <div className="max-w-7xl mx-auto">
//         {/* Payment Method Selection */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
//           <p className="text-gray-600 mb-6">Choose payment method below</p>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//             <div
//               className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
//                 selectedPaymentMethod === "ecocash"
//                   ? "border-blue-500 bg-blue-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedPaymentMethod("ecocash")}
//             >
//               <div className="flex flex-col items-center text-center">
//                 <CreditCard className="w-8 h-8 text-gray-600 mb-2" />
//                 <span className="text-sm font-medium text-gray-900">EcoCash</span>
//               </div>
//               {selectedPaymentMethod === "ecocash" && (
//                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                   <Check className="w-4 h-4 text-white" />
//                 </div>
//               )}
//             </div>

//             <div
//               className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
//                 selectedPaymentMethod === "paynow"
//                   ? "border-blue-500 bg-blue-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedPaymentMethod("paynow")}
//             >
//               <div className="flex flex-col items-center text-center">
//                 <div className="text-2xl font-bold text-blue-600 mb-2">OneMoney</div>
//                 <span className="text-xs text-gray-600">Netone</span>
//               </div>
//               {selectedPaymentMethod === "paynow" && (
//                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                   <Check className="w-4 h-4 text-white" />
//                 </div>
//               )}
//             </div>

//             <div
//               className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
//                 selectedPaymentMethod === "paypay"
//                   ? "border-blue-500 bg-blue-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedPaymentMethod("paypay")}
//             >
//               <div className="flex flex-col items-center text-center">
//                 <div className="text-xl font-bold text-purple-600 mb-2">PayPal</div>
//                 <span className="text-xs text-gray-600">Zimbabwe</span>
//               </div>
//               {selectedPaymentMethod === "paypay" && (
//                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
//                   <Check className="w-4 h-4 text-white" />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Billing and Payment Forms */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//           {/* Billing Address */}
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center mb-6">
//               <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
//                 1
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Billing Info</h3>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">First Name*</label>
//                 <input
//                   type="text"
//                   value={formData.firstName}
//                   onChange={(e) => handleInputChange("firstName", e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="John Doe"
//                 />
//               </div>

//               <ZimbabweCitySelector
//                 selectedCity={selectedCity}
//                 onCityChange={setSelectedCity}
//               />

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
//                 <input
//                   type="text"
//                   value={formData.street}
//                   onChange={(e) => handleInputChange("street", e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Fyrverkarbacken"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
//                   <input
//                     type="text"
//                     value={formData.zipCode}
//                     onChange={(e) => handleInputChange("zipCode", e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="12304"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => handleInputChange("phone", e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="+263 (77)"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Payment Info */}
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center mb-6">
//               <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
//                 2
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900">Payment Info</h3>
//             </div>

//             <div className="space-y-4">
//               {selectedPaymentMethod === "ecocash" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">EcoCash Phone Number</label>
//                   <input
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => handleInputChange("phone", e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="0777777777"
//                   />
//                 </div>
//               )}

//               {selectedPaymentMethod === "paynow" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">PayNow ID (Mobile/NRIC/UEN)</label>
//                   <input
//                     type="text"
//                     value={formData.cardNumber}
//                     onChange={(e) => handleInputChange("cardNumber", e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Mobile Number or NRIC"
//                   />
//                 </div>
//               )}

//               {selectedPaymentMethod === "paypay" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">PayPay Account ID</label>
//                   <input
//                     type="text"
//                     value={formData.cardNumber}
//                     onChange={(e) => handleInputChange("cardNumber", e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="PayPay ID or Mobile Number"
//                   />
//                 </div>
//               )}

//               <div className="flex items-center space-x-2 mt-4">
//                 <input
//                   type="checkbox"
//                   id="savePayment"
//                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//                 <label htmlFor="savePayment" className="text-sm text-gray-700">
//                   Set as default payment method
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
//           <button 
//             onClick={() => navigate("/shop")}
//           className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
//             RETURN TO STORE
//           </button>

//           <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
//             <button className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
//               BACK TO SHIPPING
//             </button>
//             <button className="w-full sm:w-auto px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
//               PROCEED
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }





import { useState, useCallback } from "react";
import { Check, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

interface FormData {
  firstName: string;
  street: string;
  phone: string;
  latitude: string;
  longitude: string;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; 
  return distance; 
}

const STORE_LOCATION = { lat: -17.824858, lng: 31.053028 }; // Default store location (e.g. Harare CBD)

export default function PaymentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    street: "",
    phone: "",
    latitude: "",
    longitude: "",
  });
  
  const [distance, setDistance] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateUserDistance = useCallback((lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const dist = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, latNum, lngNum);
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        handleInputChange("latitude", lat);
        handleInputChange("longitude", lng);
        calculateUserDistance(lat, lng);
        
        toast.success("✅ Location captured!");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("❌ Could not get location. Please enter manually.");
        setGettingLocation(false);
      }
    );
  };

  const handleManualCoordChange = (field: 'latitude' | 'longitude', value: string) => {
    handleInputChange(field, value);
    if (field === 'latitude') {
      calculateUserDistance(value, formData.longitude);
    } else {
      calculateUserDistance(formData.latitude, value);
    }
  };

  const handleCheckout = () => {
    if (!formData.firstName || !formData.street || !formData.phone) {
      toast.error("Please fill in all required delivery details");
      return;
    }
    
    // Simulating free checkout processing
    const toastId = toast.loading("Processing your order...");
    
    setTimeout(() => {
      toast.success("Order Placed Successfully! (Free Checkout)", { id: toastId });
      setTimeout(() => navigate('/shop'), 1500);
    }, 1500);
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen bg-gray-50 py-14 px-5 sm:py-14 sm:px-5 md:px-10 md:py-16 lg:p-20 xl:p-20">
        <div className="max-w-4xl mx-auto">
          {/* Form Description */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout</h2>
            <p className="text-gray-600 mb-2">Complete your free checkout by adding your delivery address.</p>
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded flex items-center">
              <Check className="w-5 h-5 mr-2" />
              <span>Your cart items will be processed without requiring a payment gateway.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name*</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address*</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 123 Main St, Harare"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+263 77 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Coordinates & Distance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delivery Location Coordinates</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">Provide your location to calculate distance for delivery tracking.</p>
                
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="flex items-center justify-center w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {gettingLocation ? "Detecting location..." : "Generate Coordinates (Use GPS)"}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleManualCoordChange("latitude", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="-17.824858"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleManualCoordChange("longitude", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="31.053028"
                    />
                  </div>
                </div>

                {distance !== null && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-800 font-medium">Distance from Store: {distance.toFixed(1)} km</p>
                    <p className="text-blue-600 text-sm mt-1">This helps us estimate delivery time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate("/cart")}
              className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              RETURN TO CART
            </button>

            <button 
              onClick={handleCheckout}
              className="w-full sm:w-auto px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              COMPLETE ORDER
            </button>
          </div>
        </div>
      </div>
    </>
  );
}