import React, { useState } from 'react';
import { X, Key, Copy, Check, Share2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  currentToken: string;
  onClose: () => void;
  onUpdateToken: (newToken: string) => void;
  onGenerateToken: () => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  currentToken,
  onClose,
  onUpdateToken,
  onGenerateToken
}) => {
  const [inputToken, setInputToken] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?token=${currentToken}`
    : `https://recipes.app/?token=${currentToken}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentToken);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`הצטרפו לספר המתכונים ורשימת הקניות המשפחתית שלי באפליקציה! 🍕🥗\nקוד טוקן: ${currentToken}\nקישור ישיר: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleJoinToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    const formatted = inputToken.trim().toUpperCase();
    onUpdateToken(formatted);
    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-scaleUp text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-extrabold">טוקן אבטחה וסנכרון משפחתי</h3>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <p className="text-xs text-white/90 font-medium">
                נהלו את קוד הטוקן הייחודי לסנכרון המתכונים ורשימת הקניות
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 space-y-5">
          
          {/* Active Token Card */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>הטוקן הפעיל שלך</span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                סנכרון פעיל 🟢
              </span>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm">
              <span className="font-mono text-base font-extrabold tracking-wider text-slate-800 dark:text-zinc-100" dir="ltr">
                {currentToken}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> הועתק!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> העתק קוד
                  </>
                )}
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'הקישור הועתק!' : 'העתק קישור'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>שתף ב-WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Join existing token */}
          <form onSubmit={handleJoinToken} className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              התחברות לטוקן משפחתי קיים
            </label>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              קיבלתם קוד טוקן מבן/בת משפחה? הדביקו אותו כאן כדי להתחבר לאותה רשימת קניות ומתכונים:
            </p>

            <div className="flex gap-2 items-center pt-1">
              <input
                type="text"
                placeholder="למשל: FAMILY-88291A"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100 text-left"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={!inputToken.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                התחבר
              </button>
            </div>

            {joinSuccess && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ התחברת בהצלחה לטוקן החדש! המידע מסתנכרן...
              </p>
            )}
          </form>

          {/* Generate new Token button */}
          <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">רוצים להתחיל טוקן חדש?</span>
            <button
              type="button"
              onClick={onGenerateToken}
              className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> צור טוקן חדש
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
