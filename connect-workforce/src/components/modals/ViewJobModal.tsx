import React, { useState } from 'react';
import { X, Building2, MapPin, DollarSign, Calendar, Send, CheckCircle2, Clock3, XCircle, ShieldCheck, Briefcase } from 'lucide-react';
import { ApplyJobModal } from './ApplyJobModal';

interface ViewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  proposalStatus?: string;
  onApplySuccess?: () => void;
}

export const ViewJobModal: React.FC<ViewJobModalProps> = ({
  isOpen,
  onClose,
  job,
  proposalStatus,
  onApplySuccess,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);

  if (!isOpen || !job) return null;

  const isAccepted = proposalStatus === 'accepted' || proposalStatus === 'hired';
  const isDeclined = proposalStatus === 'declined' || proposalStatus === 'rejected';
  const isPending = proposalStatus === 'pending' || proposalStatus === 'under_review';

  const companyName = job.companyName || job.clientId?.companyName || job.clientId?.title || 'Verified Employer';
  const location = job.location || 'Site Base (Nigeria)';
  const budget = job.budget || 0;
  const duration = job.duration || 30;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-6 overflow-hidden max-h-[90vh] flex flex-col justify-between">
          
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-primary bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider">
                  {job.category || 'Workforce Role'}
                </span>
                <h2 className="font-extrabold text-lg text-gray-900 leading-snug mt-0.5">{job.title}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MAIN SCROLLABLE DETAILS CONTENT */}
          <div className="overflow-y-auto space-y-5 pr-1 text-xs">
            {/* COMPANY & SALARY BANNER */}
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm">
                  {companyName[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{companyName}</h3>
                  <p className="text-gray-400 flex items-center gap-1 font-medium mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-400" /> {location}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Offered Compensation</span>
                <div className="text-xl font-black text-emerald-600">
                  ₦ {budget.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ mo</span>
                </div>
              </div>
            </div>

            {/* DURATION & DETAILS GRID */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contract Type</span>
                <span className="font-extrabold text-gray-800 capitalize">{job.jobType?.replace('_', ' ') || 'Full-time Contract'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Expected Duration</span>
                <span className="font-extrabold text-gray-800">{duration} Days / Ongoing</span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-gray-900">Job Overview & Requirements</h4>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-700 font-medium leading-relaxed whitespace-pre-line">
                {job.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* SKILLS TAGS */}
            {job.skills && job.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-gray-900">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 font-extrabold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
            >
              Close
            </button>

            {isAccepted ? (
              <span className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-xs inline-flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Hired for this Role
              </span>
            ) : isDeclined ? (
              <span className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-600 font-extrabold text-xs inline-flex items-center gap-1.5 border border-rose-200">
                <XCircle className="w-4 h-4" /> Proposal Declined
              </span>
            ) : isPending ? (
              <span className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-xs inline-flex items-center gap-1.5 border border-amber-200">
                <Clock3 className="w-4 h-4" /> Proposal Submitted & Under Review
              </span>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs shadow-md shadow-primary/20 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Apply Now for ₦{budget.toLocaleString()}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {showApplyModal && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={job}
          onSuccess={() => {
            setShowApplyModal(false);
            if (onApplySuccess) onApplySuccess();
            onClose();
          }}
        />
      )}
    </>
  );
};
