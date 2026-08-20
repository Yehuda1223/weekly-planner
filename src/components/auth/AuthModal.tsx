import React, { useState } from 'react';
import { X, Lock, Mail, User, LogIn, UserPlus, ChefHat, KeyRound, CheckCircle2, RotateCw, Key, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string } | boolean>;
  onRegister: (displayName: string, email: string, pass: string) => Promise<{ success: boolean; message?: string } | boolean>;
  onVerifyCode?: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  onResendVerification?: (email: string) => Promise<{ success: boolean; message: string }>;
  onResetPassword?: (email: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  onContinueAsGuest: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onVerifyCode,
  onResendVerification,
  onResetPassword,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationInputCode, setVerificationInputCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);

  // 🔄 Reset modal state whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setMode('login');
      setVerificationPendingEmail(null);
      setVerificationInputCode('');
      setErrorMsg('');
      setSuccessMsg('');
      setResendStatusMsg(null);
      setIsLoading(false);
      setIsVerifyingCode(false);
      setIsResending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setResendStatusMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await onLogin(email, password, rememberMe);
        const isSuccess = typeof res === 'object' ? res.success : !!res;
        if (isSuccess) {
          setVerificationPendingEmail(null);
          setVerificationInputCode('');
          setErrorMsg('');
          onClose();
        } else {
          const customError = typeof res === 'object' && res.error ? res.error : 'דוא״ל או סיסמה שגויים. אנא נסה שנית.';
          setErrorMsg(customError);
        }
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          setErrorMsg('אנא הזן שם מלא');
          setIsLoading(false);
          return;
        }
        const res = await onRegister(displayName.trim(), email, password);
        const isSuccess = typeof res === 'object' ? res.success : !!res;
        if (isSuccess) {
          setVerificationPendingEmail(email.trim());
          setVerificationInputCode('');
          if (typeof res === 'object' && res.message) {
            setResendStatusMsg(res.message);
          }
        } else {
          const customError = typeof res === 'object' && res.message ? res.message : 'הרשמה נכשלה. ייתכן וכתובת הדוא״ל כבר רשומה במערכת.';
          setErrorMsg(customError);
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('אנא הזן את כתובת הדוא״ל שלך');
          setIsLoading(false);
          return;
        }
        if (onResetPassword) {
          const res = await onResetPassword(email.trim(), password ? password.trim() : undefined);
          if (res.success) {
            setSuccessMsg(res.message);
          } else {
            setErrorMsg(res.message);
          }
        } else {
          setSuccessMsg(`הוראות לאיפוס סיסמה נשלחו לכתובת ${email.trim()}! אנא בדוק את תיבת הדואר הנכנס.`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'אירעה שגיאה. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit 6-Digit Code
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInputCode.trim() || !verificationPendingEmail || !onVerifyCode) return;

    setIsVerifyingCode(true);
    setErrorMsg('');
    try {
      const res = await onVerifyCode(verificationPendingEmail, verificationInputCode.trim());
      if (res.success) {
        setVerificationPendingEmail(null);
        setVerificationInputCode('');
        alert(res.message);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'שגיאה באימות הקוד');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendClick = async () => {
    const targetEmail = verificationPendingEmail || email.trim();
    if (!targetEmail || !onResendVerification) return;
    
    setIsResending(true);
    setResendStatusMsg(null);
    try {
      const res = await onResendVerification(targetEmail);
      setResendStatusMsg(res.message);
    } catch (e: any) {
      setResendStatusMsg(e?.message || 'שגיאה בשליחה חוזרת');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              {verificationPendingEmail ? <ShieldCheck className="w-6 h-6" /> : mode === 'forgot' ? <KeyRound className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-zinc-100">
                {verificationPendingEmail ? 'אימות חשבון עם קוד' : mode === 'login' ? 'התחברות למתכנן השבועי' : mode === 'register' ? 'הרשמה למשתמש חדש' : 'שחזור ואיפוס סיסמה'}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                {verificationPendingEmail ? 'הזן את קוד 6 הספרות שנשלח למייל' : mode === 'forgot' ? 'נשלח אליך קישור לאיפוס הסיסמה בדוא״ל' : 'סנכרון ענן, מתכונים, תכנון ארוחות ואימונים'}
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

        {/* 🔢 6-Digit Code Verification Screen (Strict Requirement) */}
        {verificationPendingEmail ? (
          <form onSubmit={handleVerifyCodeSubmit} className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Key className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-800 dark:text-zinc-100">
                קוד אימות נשלח למייל שלך! ✉️
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300">
                שלחנו קוד בן 6 ספרות לכתובת:
                <br />
                <strong className="text-orange-600 dark:text-orange-400 text-sm dir-ltr inline-block my-1 font-bold">
                  {verificationPendingEmail}
                </strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {resendStatusMsg && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                ℹ️ {resendStatusMsg}
              </div>
            )}

            {/* 6-Digit Code Input Field */}
            <div className="space-y-1.5 py-1">
              <label className="text-xs font-extrabold text-slate-700 dark:text-zinc-300 block">
                הזן את 6 הספרות מהמייל:
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={verificationInputCode}
                onChange={e => setVerificationInputCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[10px] font-mono text-2xl font-black py-3 bg-slate-50 dark:bg-zinc-800/80 border-2 border-orange-400/60 dark:border-orange-500/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:text-zinc-100 placeholder:text-slate-300 dark:placeholder:text-zinc-600"
              />
            </div>

            {/* Submit Verification Code Button */}
            <button
              type="submit"
              disabled={isVerifyingCode || verificationInputCode.length < 6}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifyingCode ? (
                <span>מאמת קוד...</span>
              ) : (
                <span>אמת והפעל חשבון 🚀</span>
              )}
            </button>

            {/* Resend Code Option */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                disabled={isResending}
                onClick={handleResendClick}
                className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'שולח שוב...' : 'שלח קוד חדש 🔄'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationPendingEmail(null);
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:underline cursor-pointer"
              >
                חזרה להתחברות
              </button>
            </div>
          </form>
        ) : (
          /* Auth Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs text-rose-700 dark:text-rose-300 font-bold leading-relaxed space-y-2">
                <div>⚠️ {errorMsg}</div>
                {errorMsg.includes('אינו מאומת') && email.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPendingEmail(email.trim());
                      setErrorMsg('');
                      setVerificationInputCode('');
                    }}
                    className="w-full py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer hover:bg-rose-200"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>הזן קוד אימות להפעלת החשבון 🔢</span>
                  </button>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Display Name Input (Register Mode Only) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                  שם מלא / שם תצוגה *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="לדוגמה: יהודה כהן"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            )}

            {/* Email / Username Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                כתובת דוא״ל *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  name="email"
                  id="user-email-input"
                  autoComplete="username email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Password Input (Login and Register modes) */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
                    סיסמה *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                    >
                      שכחת סיסמה?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    name="password"
                    id="user-password-input"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>
            )}

            {/* Registration Notice */}
            {mode === 'register' && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                ✉️ בהרשמה יישלח קוד אימות בן 6 ספרות למייל שלך להפעלת החשבון.
              </div>
            )}

            {/* Remember Me Checkbox */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 dark:border-zinc-700"
                  />
                  <span>זכור אותי במכשיר זה</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>טוען...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>התחברות</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>הרשמה ושליחת קוד אימות</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>שלח קישור לאיפוס סיסמה</span>
                </>
              )}
            </button>

            {/* Toggle Modes */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-center space-y-2">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  אין לך חשבון עדיין?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-orange-600 dark:text-orange-400 font-extrabold hover:underline cursor-pointer"
                  >
                    הרשמה מהירה
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  כבר יש לך חשבון?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-orange-600 dark:text-orange-400 font-extrabold hover:underline cursor-pointer"
                  >
                    חזרה להתחברות
                  </button>
                </p>
              )}

              {/* Guest option */}
              <button
                type="button"
                onClick={() => {
                  onContinueAsGuest();
                  onClose();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-medium hover:underline cursor-pointer"
              >
                המשך כאורח במצב לא מקוון
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
