import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/src/lib/supabaseClient';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPassword: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('הסיסמאות אינן תואמות. אנא הקלד שוב.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth session update
      let supabaseUpdated = false;
      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (!error) {
            supabaseUpdated = true;
          }
        }
      } catch (e) {}

      // 2. Always update in local registered users & current session
      const registeredUsersList = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (registeredUsersList.length > 0) {
        // Update all matching accounts or the primary admin
        const updated = registeredUsersList.map((u: any) => ({
          ...u,
          password: newPassword
        }));
        localStorage.setItem('registered_users', JSON.stringify(updated));
      }

      // If there's an active saved user session, update its password too
      const savedUserStr = localStorage.getItem('app_current_user') || sessionStorage.getItem('app_current_user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          parsed.password = newPassword;
          localStorage.setItem('app_current_user', JSON.stringify(parsed));
        } catch (e) {}
      }

      setSuccessMsg('🎉 הסיסמה עודכנה בהצלחה! מתחבר למערכת...');
      setTimeout(() => {
        onSuccess(newPassword);
        onClose();
        // Remove hash from URL
        if (typeof window !== 'undefined' && window.history) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'אירעה שגיאה בעדכון הסיסמה. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-zinc-100">
                הגדרת סיסמה חדשה
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                הזן סיסמה חדשה וחזור עליה לאימות
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. New Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              סיסמה חדשה *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                name="new-password"
                autoComplete="new-password"
                placeholder="לפחות 6 תווים"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* 2. Confirm New Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              אימות סיסמה חדשה *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                name="confirm-password"
                autoComplete="new-password"
                placeholder="הקלד שוב את הסיסמה החדשה"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            {confirmPassword && newPassword === confirmPassword && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> הסיסמאות תואמות!
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span>מעדכן סיסמה...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>שמור סיסמה חדשה והתחבר</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
