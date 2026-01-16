// src/pages/subscription/SubscriptionPlans.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Shield, Zap, Clock, AlertCircle } from 'lucide-react';
import { submitSubscriptionPayment, getMySubscription } from '@/api/subscriptionApi';
// import { SUBSCRIPTION_PLANS } from '@/components/interfaces/subscription';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'3_months' | '6_months' | '1_year'>('3_months');
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'ecocash',
    phoneNumber: '',
    transactionReference: '',
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getMySubscription();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate
      if (!paymentData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }
      if (!paymentData.transactionReference.trim()) {
        throw new Error('Transaction reference is required');
      }
      if (!paymentProof) {
        throw new Error('Payment proof screenshot is required');
      }
      
      const paymentRequest = {
        planType: selectedPlan,
        paymentMethod: paymentData.paymentMethod,
        phoneNumber: paymentData.phoneNumber,
        transactionReference: paymentData.transactionReference,
        paymentProof
      };
      
      await submitSubscriptionPayment(paymentRequest);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: '3_months',
      name: '3 Months',
      price: 50,
      duration: '90 days',
      popular: false,
      features: ['Unlimited Products', 'Unlimited Blogs', 'Basic Support']
    },
    {
      id: '6_months',
      name: '6 Months',
      price: 90,
      duration: '180 days',
      popular: true,
      features: ['Unlimited Products', 'Unlimited Blogs', 'Priority Support', 'Analytics Dashboard']
    },
    {
      id: '1_year',
      name: '1 Year',
      price: 150,
      duration: '365 days',
      popular: false,
      features: ['Unlimited Products', 'Unlimited Blogs', '24/7 Support', 'Advanced Analytics', 'Custom Domain']
    }
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your subscription payment has been submitted. 
            Please wait for admin approval to activate your plan.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a subscription plan that fits your needs. All plans include unlimited products and blogs.
          </p>
        </div>

        {/* Current Status */}
        {subscriptionStatus && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className={`p-4 rounded-lg ${subscriptionStatus.subscription_status === 'trial' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center">
                <Clock className={`w-5 h-5 mr-2 ${subscriptionStatus.subscription_status === 'trial' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="font-medium">
                  Current Status: <span className="capitalize">{subscriptionStatus.subscription_status}</span>
                </span>
              </div>
              {subscriptionStatus.trial_ends_at && (
                <p className="text-sm text-gray-600 mt-1">
                  Free trial ends: {new Date(subscriptionStatus.trial_ends_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                selectedPlan === plan.id 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : plan.popular 
                    ? 'border-purple-500' 
                    : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-center py-2 font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.duration}</span>
                </div>
                
                <button
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`w-full py-3 rounded-lg font-medium mb-6 ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Complete Payment for {plans.find(p => p.id === selectedPlan)?.name} Plan
            </h3>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Selected Plan:</span>
                  <span className="font-bold">{plans.find(p => p.id === selectedPlan)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${plans.find(p => p.id === selectedPlan)?.price}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
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
                  value={paymentData.phoneNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transactionReference: e.target.value }))}
                  placeholder="Enter transaction reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Take a screenshot of your payment and upload it here
                </p>
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
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Processing...' : `Pay $${plans.find(p => p.id === selectedPlan)?.price}`}
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">All payments are secure and encrypted</p>
            </div>
            <div className="text-center p-4">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Instant Activation</h4>
              <p className="text-sm text-gray-600">Activated immediately after approval</p>
            </div>
            <div className="text-center p-4">
              <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Flexible Plans</h4>
              <p className="text-sm text-gray-600">Choose what works best for your business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;