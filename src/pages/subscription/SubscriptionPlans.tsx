// src/pages/subscription/SubscriptionPlans.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, Shield, Zap, Calendar } from 'lucide-react';
import { getMySubscription } from '@/api/subscriptionApi';

const plans = [
  {
    id: '3_months',
    name: '3 Months',
    originalPrice: 50,
    duration: '90 days',
    popular: false,
    features: ['Unlimited Products', 'Unlimited Blogs', 'Basic Support'],
  },
  {
    id: '6_months',
    name: '6 Months',
    originalPrice: 90,
    duration: '180 days',
    popular: true,
    features: ['Unlimited Products', 'Unlimited Blogs', 'Priority Support', 'Analytics Dashboard'],
  },
  {
    id: '1_year',
    name: '1 Year',
    originalPrice: 150,
    duration: '365 days',
    popular: false,
    features: ['Unlimited Products', 'Unlimited Blogs', '24/7 Support', 'Advanced Analytics', 'Custom Domain'],
  },
];

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'3_months' | '6_months' | '1_year'>('3_months');
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await getMySubscription();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  const currentPlan = plans.find(p => p.id === selectedPlan)!;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate free plan activation
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }, 1000);
    } catch (err: any) {
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Plan Activated!</h2>
          <p className="text-gray-600 mb-6">
            Your free subscription plan has been activated successfully.
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a subscription plan that fits your needs. All plans include unlimited products and blogs.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-green-100 border border-green-300 text-green-800 px-5 py-2 rounded-full font-semibold text-sm">
            🎉 All plans are currently FREE — Pay nothing to get started!
          </div>
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

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedPlan === plan.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : plan.popular
                    ? 'border-purple-500'
                    : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="bg-purple-600 text-white text-center py-2 font-bold text-sm">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-4xl font-extrabold text-green-600">FREE</span>
                    <span className="text-lg text-gray-400 line-through">${plan.originalPrice}</span>
                  </div>
                  <span className="text-sm text-gray-500">/ {plan.duration}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`w-full py-3 rounded-lg font-medium mb-6 transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
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

        {/* Activation Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Activate {currentPlan.name} Plan
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Selected Plan:</span>
                  <span className="font-bold">{currentPlan.name} ({currentPlan.duration})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Amount:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-sm">${currentPlan.originalPrice}</span>
                    <span className="text-2xl font-bold text-green-600">FREE</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? 'Processing...' : `Activate ${currentPlan.name} Plan Free`}
              </button>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Secure</h4>
              <p className="text-sm text-gray-600">No payment details required</p>
            </div>
            <div className="text-center p-4">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Instant Activation</h4>
              <p className="text-sm text-gray-600">Activated immediately</p>
            </div>
            <div className="text-center p-4">
              <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Flexible Plans</h4>
              <p className="text-sm text-gray-600">Switch plans anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;