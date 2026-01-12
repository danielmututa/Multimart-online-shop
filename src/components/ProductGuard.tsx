// src/components/ProductGuard.tsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMySubscription } from '@/api/subscriptionApi';
import { MerchantSubscription } from '@/components/interfaces/subscription';

interface ProductGuardProps {
  children: React.ReactNode;
}

const ProductGuard: React.FC<ProductGuardProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<MerchantSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const data = await getMySubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If no subscription or inactive
  if (!subscription || subscription.subscription_status === 'inactive') {
    return <Navigate to="/subscription/activation" state={{ from: location }} replace />;
  }

  // If suspended
  if (subscription.subscription_status === 'suspended') {
    return <Navigate to="/subscription/renew" state={{ from: location }} replace />;
  }

  // If trial or active, allow access
  return <>{children}</>;
};

export default ProductGuard;