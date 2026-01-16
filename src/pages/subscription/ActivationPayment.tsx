// src/pages/subscription/ActivationPayment.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { submitActivationPayment } from '@/api/subscriptionApi';
// import { SUBSCRIPTION_PLANS } from '@/components/interfaces/subscription';

const ActivationPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    paymentMethod: 'ecocash',
    phoneNumber: '',
    transactionReference: '',
    amount: 1, // Fixed $1 activation fee
  });
  
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      
      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate
      if (!formData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }
      if (!formData.transactionReference.trim()) {
        throw new Error('Transaction reference is required');
      }
      if (!paymentProof) {
        throw new Error('Payment proof screenshot is required');
      }
      
      const paymentData = {
        ...formData,
        paymentProof
      };
      
      await submitActivationPayment(paymentData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/subscription/plans');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your $1 activation payment has been submitted successfully. 
            Please wait for admin approval to start your 1-month free trial.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to subscription plans...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Activation
          </h1>
          <p className="text-gray-600">
            Pay $1 activation fee to start your 1-month free trial
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="ecocash">EcoCash</option>
                <option value="onemoney">OneMoney</option>
                <option value="telecash">Telecash</option>
                <option value="paynow">PayNow</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Transaction Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Reference *
              </label>
              <input
                type="text"
                name="transactionReference"
                value={formData.transactionReference}
                onChange={handleInputChange}
                placeholder="Enter transaction reference"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Amount (Fixed $1) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Activation Fee:</span>
                <span className="text-2xl font-bold text-blue-600">$1.00</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This one-time payment activates your account for a 1-month free trial
              </p>
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Proof Screenshot *
              </label>
              
              {previewUrl && (
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Payment proof preview" 
                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                  />
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="paymentProof"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="paymentProof" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {paymentProof ? paymentProof.name : 'Upload payment screenshot'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Take a screenshot of your payment and upload it here
                  </p>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>

            {/* Note */}
            <div className="text-sm text-gray-500 text-center">
              <p>
                After submission, your payment will be reviewed by admin. 
                You'll receive email notification when approved.
              </p>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-green-500 text-xl font-bold mb-2">1 Month Free</div>
            <p className="text-sm text-gray-600">Free trial after activation</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-blue-500 text-xl font-bold mb-2">Create Products</div>
            <p className="text-sm text-gray-600">Unlimited product creation</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-purple-500 text-xl font-bold mb-2">Create Blogs</div>
            <p className="text-sm text-gray-600">Unlimited blog creation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationPayment;