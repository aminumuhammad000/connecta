import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceAPI } from '../api/workforce';
import { useToast } from '../contexts/ToastContext';
import { ArrowRight, Check, Sparkles, Users, UserPlus, Briefcase, CreditCard } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [objectives, setObjectives] = useState<string[]>(['manage_existing', 'pay_workers']);
  const [workerCountRange, setWorkerCountRange] = useState('1-10');
  const [hasExistingWorkers, setHasExistingWorkers] = useState(true);

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await workforceAPI.saveSettings({
        onboardingCompleted: true,
        objectives,
        workerCountRange,
        hasExistingWorkers,
      });
      showToast('Onboarding complete! Welcome to your Workforce Dashboard.', 'success');
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-gray-100 pb-4">
          <span>Step {step} of 4</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  step >= s ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to Connecta Workforce</h1>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                Manage your workers, track job attendance, issue digital contracts, and pay your team in one simple place.
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 2: Objectives */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What do you want to do with Workforce?</h2>
              <p className="text-xs text-gray-500 mt-1">Select all that apply to personalize your workspace.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'manage_existing', label: 'Manage my existing workers', icon: Users },
                { id: 'hire_new', label: 'Hire new workers', icon: UserPlus },
                { id: 'manage_job', label: 'Manage jobs & projects', icon: Briefcase },
                { id: 'pay_workers', label: 'Pay my workers & payroll', icon: CreditCard },
              ].map((obj) => {
                const Icon = obj.icon;
                const isSelected = objectives.includes(obj.id);
                return (
                  <div
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 relative ${
                      isSelected
                        ? 'border-primary bg-orange-50/50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs">{obj.label}</span>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(1)} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Worker Count Range */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">How many workers do you currently manage?</h2>
              <p className="text-xs text-gray-500 mt-1">This helps us format your dashboard tables appropriately.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['1–10', '11–50', '51–100', '100+'].map((range) => (
                <div
                  key={range}
                  onClick={() => setWorkerCountRange(range)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                    workerCountRange === range
                      ? 'border-primary bg-orange-50/50 font-black text-primary text-lg'
                      : 'border-gray-200 hover:border-gray-300 font-bold text-gray-700 text-base'
                  }`}
                >
                  {range} Workers
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(2)} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 4: Existing vs Marketplace */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Do you already have workers ready to add?</h2>
              <p className="text-xs text-gray-500 mt-1">Select your primary hiring setup.</p>
            </div>

            <div className="space-y-3">
              {[
                { val: true, title: 'Yes, I already have workers hired manually', desc: 'Add or bulk-import your team into Connecta Workforce.' },
                { val: false, title: 'No, I want to hire through Connecta Marketplace', desc: 'Post jobs and recruit top tech talent.' },
              ].map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => setHasExistingWorkers(opt.val)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    hasExistingWorkers === opt.val
                      ? 'border-primary bg-orange-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900">{opt.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button onClick={() => setStep(3)} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
