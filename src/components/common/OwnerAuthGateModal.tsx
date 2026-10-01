import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X,
  LogIn,
  Scissors,
  ArrowRight,
} from 'lucide-react';

interface OwnerAuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerAuthGateModal: React.FC<OwnerAuthGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAdmin, signInWithGoogle, loading: authLoading } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Master passcode for Sadika Karbary's atelier (established 1999)
    if (passcode.trim() === '1999' || passcode.trim().toLowerCase() === 'sadika') {
      localStorage.setItem('sadika_owner_passcode_auth', 'true');
      onSuccess();
    } else {
      setErrorMsg('Incorrect atelier passcode. Access is restricted to Sadika Karbary.');
    }
  };

  const handleGoogleSignInClick = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      // Auth state will update; if email matches daneen4tune2@gmail.com, auth context marks isAdmin
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in could not be completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-[#E8DFD8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F7E7E6] border border-[#D4C5B9] text-[#9E616B] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#2D2424]">
                Sadika's Atelier Access
              </h3>
              <p className="text-[11px] text-[#6B5E59]">
                Restricted to Studio Personnel Only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Privacy Protection Notice:</strong> Sadika's Atelier Dashboard contains private customer body measurements, fitting diaries, cutting calendars, and financial invoices. Customers must use the Customer Boutique Portal.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Option 1: Google Sign-in */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Method 1: Owner Google Account
            </label>
            <button
              onClick={handleGoogleSignInClick}
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF8F5] text-[#2D2424] border border-[#E8DFD8] hover:border-[#D4C5B9] rounded-xl text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#9E616B]" />
              <span>Sign in with Owner Google Account</span>
            </button>
            <span className="block text-[10px] text-stone-400 mt-1 text-center">
              Authorized admin: daneen4tune2@gmail.com
            </span>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E8DFD8]" />
            <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-stone-400">
              Or Master Passcode
            </span>
            <div className="flex-grow border-t border-[#E8DFD8]" />
          </div>

          {/* Option 2: Atelier Passcode */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Method 2: Atelier Security PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter master passcode (e.g. 1999)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8DFD8] rounded-xl text-xs text-[#2D2424] focus:outline-none focus:border-[#9E616B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#2D2424] hover:bg-[#4A3E3D] text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-[#9E616B]" />
              <span>Unlock Sadika's Atelier Dashboard</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-t border-[#E8DFD8] text-center">
          <button
            onClick={onClose}
            className="text-xs text-stone-500 hover:text-stone-800 hover:underline cursor-pointer"
          >
            ← Return to Customer Boutique Portal
          </button>
        </div>
      </div>
    </div>
  );
};
