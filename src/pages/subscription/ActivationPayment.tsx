// src/pages/subscription/ActivationPayment.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Upload, CheckCircle, AlertCircle, Download, Award } from 'lucide-react';
import { submitActivationPayment } from '@/api/subscriptionApi';

const ActivationPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    paymentMethod: 'ecocash',
    phoneNumber: '',
    transactionReference: '',
    amount: 1, // Fixed $1 activation fee — sent to backend only
  });

  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [certificateDataUrl, setCertificateDataUrl] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generate a congratulations certificate on canvas
  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 900;
    const H = 600;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background gradient — deep blue
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1e3a8a');
    bg.addColorStop(1, '#1e40af');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Gold outer border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // Gold inner border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Corner stars
    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.save();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawStar(60, 60, 18);
    drawStar(W - 60, 60, 18);
    drawStar(60, H - 60, 18);
    drawStar(W - 60, H - 60, 18);

    // Shop name top
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('— MULTIMART ONLINE SHOP —', W / 2, 80);

    // Trophy
    ctx.font = '50px Arial';
    ctx.fillText('🏆', W / 2, 148);

    // Main heading
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText('CONGRATULATIONS!', W / 2, 210);

    // Sub text
    ctx.fillStyle = '#bfdbfe';
    ctx.font = '19px Georgia, serif';
    ctx.fillText('on successfully making an activation payment on', W / 2, 252);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('Multimart Online Shop', W / 2, 292);

    // Divider
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 316);
    ctx.lineTo(W - 120, 316);
    ctx.stroke();

    // Payment details
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const col1 = 130;
    const col2 = 500;

    ctx.textAlign = 'left';

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Payment Method:', col1, 358);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(formData.paymentMethod.toUpperCase(), col1, 380);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Phone Number:', col2, 358);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(formData.phoneNumber || '—', col2, 380);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Transaction Ref:', col1, 415);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(formData.transactionReference || '—', col1, 437);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Date & Time:', col2, 415);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`${dateStr}  ${timeStr}`, col2, 437);

    // Green status badge
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    (ctx as any).roundRect(W / 2 - 130, 465, 260, 42, 21);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓  PAYMENT SUBMITTED', W / 2, 491);

    // Footer note
    ctx.fillStyle = '#93c5fd';
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(
      'Your account will be activated after admin approval  •  multimartonlineshop.com',
      W / 2,
      548
    );

    const dataUrl = canvas.toDataURL('image/png');
    setCertificateDataUrl(dataUrl);
    setCertificateGenerated(true);
  };

  const downloadCertificate = () => {
    if (!certificateDataUrl) return;
    const a = document.createElement('a');
    a.href = certificateDataUrl;
    a.download = 'multimart_activation_payment.png';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.phoneNumber.trim()) throw new Error('Phone number is required');
      if (!formData.transactionReference.trim()) throw new Error('Transaction reference is required');
      if (!paymentProof) throw new Error('Please upload your downloaded payment certificate');

      await submitActivationPayment({ ...formData, paymentProof });

      setSuccess(true);
      setTimeout(() => navigate('/subscription/plans'), 3000);
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
            Your activation payment has been submitted successfully.
            Please wait for admin approval to start your 1-month free trial.
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to subscription plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Activation</h1>
          <p className="text-gray-600">
            Pay the activation fee to <strong>0775306263</strong> with EcoCash to start your 1-month free trial
          </p>
        </div>

        {/* Hidden canvas — used to draw the certificate */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Payment Method — Telecash removed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="ecocash">EcoCash</option>
                <option value="onemoney">OneMoney</option>
                <option value="paynow">PayNow</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Reference *</label>
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

            {/* Activation note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This one-time payment activates your account for a 1-month free trial
              </p>
            </div>

            {/* ── STEP 1 — Generate & Download Certificate ─────────────── */}
            <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50">
              <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2 text-lg">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Generate Your Payment Certificate
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                After filling your details above, click <strong>Generate Certificate</strong> to create your
                personalised proof of payment, then download it.
              </p>

              <button
                type="button"
                onClick={generateCertificate}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Generate Certificate
              </button>

              {/* Preview + Download */}
              {certificateGenerated && certificateDataUrl && (
                <div className="mt-4">
                  <img
                    src={certificateDataUrl}
                    alt="Payment certificate"
                    className="w-full rounded-lg border border-blue-300 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={downloadCertificate}
                    className="mt-3 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Certificate
                  </button>
                  <p className="text-xs text-green-700 text-center mt-2">
                    ✓ Certificate generated — download it then upload it in Step 2 below
                  </p>
                </div>
              )}
            </div>

            {/* ── STEP 2 — Upload the Downloaded Certificate ────────────── */}
            <div className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50">
              <h3 className="font-semibold text-purple-900 mb-1 flex items-center gap-2 text-lg">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                Upload Your Downloaded Certificate
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Once downloaded, come back and upload the certificate image here as your payment proof.
              </p>

              {previewUrl && (
                <div className="mb-4">
                  <img
                    src={previewUrl}
                    alt="Uploaded proof preview"
                    className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300"
                  />
                </div>
              )}

              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors bg-white">
                <input
                  type="file"
                  id="paymentProof"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="paymentProof" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium">
                    {paymentProof ? `✓  ${paymentProof.name}` : 'Click to upload your certificate'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">PNG or JPG accepted</p>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              After submission, your payment will be reviewed by admin.
              You'll receive an email notification when approved.
            </p>
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