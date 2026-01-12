import React, { useState } from 'react';
import { X, User, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { ApplyAsProductAgent } from '@/api/productAgentsApi';
import { useAuthStore } from '@/context/userContext';

interface AgentApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  onSuccess?: () => void;
}

const AgentApplicationDialog: React.FC<AgentApplicationDialogProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    payoutMethod: 'ecocash' as 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash',
    payoutNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    reason: '',
    acceptedTerms: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    if (!user?.id) {
      setError('You must be logged in to apply as an agent');
      return;
    }

    if (!formData.acceptedTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await ApplyAsProductAgent({
        productId,
        fullName: formData.fullName,
        nationalId: formData.nationalId,
        payoutMethod: formData.payoutMethod,
        payoutNumber: formData.payoutNumber,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName,
        reason: formData.reason,
        acceptedTerms: formData.acceptedTerms,
      });

      setSuccess(true);
      if (response.warning) {
        setWarning(response.warning);
      }
      
      if (onSuccess) {
        onSuccess();
      }

      // Close dialog after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setWarning(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg w-full max-w-md mx-4 p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Your application to become an agent for <strong>{productName}</strong> has been submitted
            successfully.
          </p>
          {warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">{warning}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">Admin will review within 7 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Become an Agent</h3>
            <p className="text-sm text-gray-600 mt-1">Apply to promote {productName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <User size={20} />
              <h4>Personal Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                minLength={2}
                maxLength={100}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
                minLength={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 63-123456-X-21"
              />
            </div>
          </div>

          {/* Payout Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <CreditCard size={20} />
              <h4>Payout Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Method <span className="text-red-500">*</span>
              </label>
              <select
                name="payoutMethod"
                value={formData.payoutMethod}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ecocash">EcoCash</option>
                <option value="onemoney">OneMoney</option>
                <option value="telecash">TeleCash</option>
                <option value="paynow">Paynow</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {formData.payoutMethod !== 'bank' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="payoutNumber"
                  value={formData.payoutNumber}
                  onChange={handleInputChange}
                  required={formData.payoutMethod !== 'bank'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+263774123456"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required={formData.payoutMethod === 'bank'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ZB Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    required={formData.payoutMethod === 'bank'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleInputChange}
                    required={formData.payoutMethod === 'bank'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Account holder name"
                  />
                </div>
              </>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <FileText size={20} />
              <h4>Why do you want to be an agent?</h4>
            </div>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tell us why you'd like to promote this product..."
            />
            <p className="text-xs text-gray-500">{formData.reason.length}/500 characters</p>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
            <label className="text-sm text-gray-600">
              I accept the terms and conditions and agree to promote this product ethically and honestly.{' '}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.acceptedTerms}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                loading || !formData.acceptedTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentApplicationDialog;