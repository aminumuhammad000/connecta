import React, { useState } from 'react';
import { X, CreditCard, Loader2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';
import { workforceAPI } from '../../api/workforce';
import { useToast } from '../../contexts/ToastContext';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
}

export const FundWalletModal: React.FC<FundWalletModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('500000');

  if (!isOpen) return null;

  const presets = [250000, 500000, 1000000, 2500000];

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 5000) {
      showToast('Minimum funding amount is ₦5,000', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const ref = `FLW-PAYROLL-${Date.now()}`;
      const res = await workforceAPI.fundWallet({
        amount: numAmount,
        reference: ref,
        paymentMethod: 'flutterwave_inline',
      });

      if (res.success || res.data) {
        const newBal = res.data?.payrollWalletBalance || numAmount;
        showToast(res.message || `Payroll wallet funded with ₦${numAmount.toLocaleString()} via Flutterwave!`, 'success');
        if (onSuccess) onSuccess(newBal);
        onClose();
      } else {
        showToast(res.message || 'Funding failed', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fund payroll wallet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100 relative">
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-primary font-black flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base leading-tight">Fund Payroll Wallet</h3>
            <p className="text-xs text-gray-400 font-medium">Instant funding via Flutterwave Checkout</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleFundWallet} className="space-y-4">
          {/* QUICK PRESETS */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Select Quick Amount</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition-all ${
                    amount === String(p)
                      ? 'bg-orange-50 text-primary border-orange-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₦ {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM INPUT */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Enter Funding Amount (₦) *</label>
            <input
              type="number"
              required
              min="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500000"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-base font-black text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* FLUTTERWAVE BADGE NOTICE */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-[11px]">
                <strong className="text-gray-900 block leading-tight">Secured by Flutterwave</strong>
                <span className="text-gray-400">256-bit SSL encrypted payment gateway</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              NGN ₦
            </span>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Pay ₦ {Number(amount || 0).toLocaleString()} via Flutterwave</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
