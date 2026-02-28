// src/pages/subscription/SubscriptionPlans.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, Shield, Zap, Clock, AlertCircle, Upload, Award, Download } from 'lucide-react';
import { submitSubscriptionPayment, getMySubscription } from '@/api/subscriptionApi';

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
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'ecocash',
    phoneNumber: '',
    transactionReference: '',
  });

  // Certificate state
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [certificateDataUrl, setCertificateDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Upload state
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
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

  // ── Generate Certificate ────────────────────────────────────────
  const generateCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 900;
    const H = 620;
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

    // Shop name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('— MULTIMART ONLINE SHOP —', W / 2, 80);

    // Trophy
    ctx.font = '50px Arial';
    ctx.fillText('🏆', W / 2, 148);

    // Main heading
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('CONGRATULATIONS!', W / 2, 208);

    // Subtitle
    ctx.fillStyle = '#bfdbfe';
    ctx.font = '19px Georgia, serif';
    ctx.fillText('on successfully making a subscription payment on', W / 2, 250);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('Multimart Online Shop', W / 2, 288);

    // Divider
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 312);
    ctx.lineTo(W - 120, 312);
    ctx.stroke();

    // Plan badge
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    (ctx as any).roundRect(W / 2 - 100, 322, 200, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📅  ${currentPlan.name} Plan  (${currentPlan.duration})`, W / 2, 345);

    // Details grid
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const col1 = 130;
    const col2 = 500;

    ctx.textAlign = 'left';

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Payment Method:', col1, 386);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(paymentData.paymentMethod.toUpperCase(), col1, 408);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Phone Number:', col2, 386);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(paymentData.phoneNumber || '—', col2, 408);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Transaction Ref:', col1, 440);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(paymentData.transactionReference || '—', col1, 462);

    ctx.fillStyle = '#93c5fd';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillText('Date & Time:', col2, 440);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillText(`${dateStr}  ${timeStr}`, col2, 462);

    // Green status badge
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    (ctx as any).roundRect(W / 2 - 130, 488, 260, 42, 21);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓  PAYMENT SUBMITTED', W / 2, 514);

    // Footer
    ctx.fillStyle = '#93c5fd';
    ctx.font = '13px Arial, sans-serif';
    ctx.fillText(
      'Your subscription will be activated after admin approval  •  multimartonlineshop.com',
      W / 2,
      568
    );

    const dataUrl = canvas.toDataURL('image/png');
    setCertificateDataUrl(dataUrl);
    setCertificateGenerated(true);
  };

  const downloadCertificate = () => {
    if (!certificateDataUrl) return;
    const a = document.createElement('a');
    a.href = certificateDataUrl;
    a.download = `multimart_subscription_${selectedPlan}.png`;
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ── Form submit ─────────────────────────────────────────────────
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!paymentData.phoneNumber.trim()) throw new Error('Phone number is required');
      if (!paymentData.transactionReference.trim()) throw new Error('Transaction reference is required');
      if (!paymentProof) throw new Error('Please upload your downloaded payment certificate');

      await submitSubscriptionPayment({
        planType: selectedPlan,
        paymentMethod: paymentData.paymentMethod,
        phoneNumber: paymentData.phoneNumber,
        transactionReference: paymentData.transactionReference,
        paymentProof,
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
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
          <Check className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your subscription payment has been submitted.
            Please wait for admin approval to activate your plan.
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

        {/* ── Plan Cards ─────────────────────────────────────────── */}
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

        {/* ── Payment Form ───────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              Complete Payment for {currentPlan.name} Plan
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">

              {/* Plan summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Selected Plan:</span>
                  <span className="font-bold">{currentPlan.name} ({currentPlan.duration})</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700 font-medium">Amount:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-sm">${currentPlan.originalPrice}</span>
                    <span className="text-2xl font-bold text-green-600">FREE</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Send payment to <strong>0775306263</strong> via EcoCash or your chosen method.
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
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
                  value={paymentData.phoneNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
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
                  value={paymentData.transactionReference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, transactionReference: e.target.value }))}
                  placeholder="Enter transaction reference"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Hidden canvas for certificate */}
              <canvas ref={canvasRef} className="hidden" />

              {/* ── STEP 1 — Generate & Download Certificate ────── */}
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2 text-lg">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  Generate Your Payment Certificate
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Fill in your details above, then click <strong>Generate Certificate</strong> to create your
                  personalised proof of payment. Download it and then upload it in Step 2.
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
                      ✓ Certificate generated — download it, then upload it in Step 2 below
                    </p>
                  </div>
                )}
              </div>

              {/* ── STEP 2 — Upload Certificate ──────────────────── */}
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
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? 'Processing...' : `Submit Payment for ${currentPlan.name}`}
              </button>

              <p className="text-sm text-gray-500 text-center">
                After submission, your payment will be reviewed by admin.
                You'll receive an email notification when approved.
              </p>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-sm text-gray-600">All payments are secure and verified</p>
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