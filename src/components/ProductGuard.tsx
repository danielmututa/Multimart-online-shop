// src/components/ProductGuard.tsx
// ✅ Subscription check removed — merchants get free access for 3 months
// Products can be created without any subscription barrier
import React from 'react';

interface ProductGuardProps {
  children: React.ReactNode;
}

const ProductGuard: React.FC<ProductGuardProps> = ({ children }) => {
  // ✅ Always allow access — no subscription check needed
  return <>{children}</>;
};

export default ProductGuard;












