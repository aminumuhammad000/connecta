import React from 'react';
import { X, Download, Printer, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import connectaLogo from '../../assets/connecta_logo.png';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  workerName: string;
  employerName: string;
  workerRole?: string;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  payment,
  workerName,
  employerName,
  workerRole,
}) => {
  if (!isOpen || !payment) return null;

  const dateStr = new Date(payment.paymentDate || payment.createdAt || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refCode = payment.reference || `WF-${payment._id?.substring(0, 10).toUpperCase()}`;
  const baseSalary = payment.amount || 0;
  const netPay = baseSalary;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
===================================================
               CONNECTA WORKFORCE PAYSLIP
===================================================
Disbursement Date: ${dateStr}
Worker Name:       ${workerName}
Employer Company:  ${employerName || 'Workforce Employer'}
Role / Title:      ${workerRole || 'Staff Member'}
Reference Code:    ${refCode}
---------------------------------------------------
PAYMENT BREAKDOWN:
Base Salary Amount: ₦ ${baseSalary.toLocaleString()}
Net Earnings Paid:  ₦ ${netPay.toLocaleString()}
Status:             ${(payment.status || 'completed').toUpperCase()}
Disbursement Mode:  Direct Bank Payout via Flutterwave
---------------------------------------------------
Verified & Authenticated by Connecta Workforce Engine.
===================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip-${refCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6 overflow-hidden">
        
        {/* HEADER MODAL ACTIONS */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Official Payslip
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
              title="Print Payslip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadText}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
              title="Download Payslip"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ELEGANT PAYSLIP CARD CONTAINER */}
        <div id="printable-payslip" className="bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/80 space-y-6 shadow-inner">
          
          {/* BRAND LOGO & COMPANY HEADER */}
          <div className="flex items-start justify-between border-b border-gray-200/80 pb-5">
            <div className="flex items-center gap-3">
              <img src={connectaLogo} alt="Connecta" className="h-9 object-contain" />
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">PAYROLL DISBURSEMENT</span>
              <h3 className="font-extrabold text-sm text-gray-900">{employerName || 'Workforce Employer'}</h3>
              <p className="text-[11px] text-gray-500 font-medium">{dateStr}</p>
            </div>
          </div>

          {/* WORKER & REFERENCE INFO GRID */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Employee Name</span>
              <h4 className="font-black text-gray-900 text-sm">{workerName}</h4>
              <p className="text-[11px] text-primary font-bold mt-0.5">{workerRole || 'Staff Member'}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reference / Trans ID</span>
              <p className="font-mono font-bold text-gray-800 text-xs mt-1 truncate">{refCode}</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Paid via Flutterwave Payout
              </span>
            </div>
          </div>

          {/* FINANCIAL BREAKDOWN TABLE */}
          <div className="space-y-3">
            <h5 className="font-black text-xs text-gray-900 uppercase tracking-wider">Earnings Breakdown</h5>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden text-xs">
              <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                <span className="font-bold text-gray-600">Base Salary / Hourly Payout</span>
                <span className="font-mono font-extrabold text-gray-900">₦ {baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Allowances / Bonus</span>
                <span className="font-mono font-semibold text-gray-500">₦ 0</span>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <span className="font-semibold text-gray-500">Deductions / Tax</span>
                <span className="font-mono font-semibold text-gray-500">₦ 0</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50/60 text-emerald-900 font-extrabold text-sm">
                <span>NET AMOUNT PAID</span>
                <span className="font-black text-emerald-600 text-base">₦ {netPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VERIFICATION STAMP */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Proof of Payment</span>
            </div>
            <span className="font-mono text-[10px]">Connecta Payout Engine</span>
          </div>

        </div>

        {/* MODAL FOOTER BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
          >
            Close
          </button>
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Payslip</span>
          </button>
        </div>

      </div>
    </div>
  );
};
