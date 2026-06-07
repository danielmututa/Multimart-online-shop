import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Award } from 'lucide-react';

const ActivationPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Free activation timeout
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => navigate('/subscription/plans'), 2000);
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
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Activated!</h2>
          <p className="text-gray-600 mb-6">
            Your free merchant account has been activated successfully.
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to subscription plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Free Merchant Activation</h1>
          <p className="text-gray-600">
            Activate your merchant account for free to start selling immediately.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">
                Standard merchant activation is currently completely free!
              </p>
            </div>

            <button
              type="submit"
               disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? 'Activating Account...' : 'Activate Free Account'}
            </button>
          </form>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-green-500 text-xl font-bold mb-2">100% Free</div>
            <p className="text-sm text-gray-600">No activation fees</p>
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