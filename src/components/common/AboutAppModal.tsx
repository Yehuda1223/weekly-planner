import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  ShoppingBag, 
  Dumbbell, 
  Heart, 
  CheckSquare, 
  Users, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Code2, 
  Lock, 
  Zap, 
  Layers,
  FileText,
  Info
} from 'lucide-react';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'modules' | 'groups_moderation' | 'architecture' | 'security'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-zinc-100">
                מדריך המערכת והסבר טכנולוגי 👨‍🍳✨
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                הסבר מפורט על יכולות האפליקציה, הארכיטקטורה והמודלים ההנדסיים
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 px-3 pt-2 gap-1 overflow-x-auto scrollbar-none text-right">
          {[
            { id: 'overview', label: 'סקירה כללית 🌟', icon: Sparkles },
            { id: 'modules', label: 'מודולים ויכולות 📦', icon: Layers },
            { id: 'groups_moderation', label: 'קבוצות ואישורים 👥', icon: ShieldCheck },
            { id: 'architecture', label: 'ארכיטקטורה וקוד 💻', icon: Code2 },
            { id: 'security', label: 'אבטחה ופרטיות 🔒', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-2 text-xs font-black rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 border-orange-500 shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 border-transparent hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-right text-xs space-y-4 text-slate-700 dark:text-zinc-300 leading-relaxed">
          
          {/* 🌟 Tab 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-200 dark:border-orange-900/40 space-y-2">
                <h4 className="text-sm font-black text-orange-900 dark:text-orange-200">
                  מהי מערכת "תכנון שבועי"?
                </h4>
                <p>
                  <strong>Weekly Planner & Lifestyle Hub</strong> היא אפליקציית Web מתקדמת ברמת Enterprise המשלבת תחת קורת גג אחת את כל מרחבי החיים האישיים, הזוגיים והמשפחתיים: ניהול ובישול מתכונים, תכנון תפריט שבועי חכם, הפקת רשימת קניות אוטומטית ומצטברת, מעקב אימונים וכושר, תכנון דייטים ובילויים, וניהול פתקים ומטלות יומיומיות.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>⚡</span> <span>ביצועים וחוויית משתמש</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    תגובתיות מיידית, עיצוב מודרני מרהיב, תמיכה מלאה במצב כהה (Dark Mode), התאמה מושלמת למובייל ולמסכי מחשב, ועדכונים חיים.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-1.5">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>🛡️</span> <span>בידוד נתונים והרשאות</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    הפרדה מוחלטת ומאובטחת בין פריטים פרטיים (שלי בלבד), פריטים משותפים לקבוצה ספציפית, ומתכונים ציבוריים לקהילה.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 📦 Tab 2: Modules & Capabilities */}
          {activeSection === 'modules' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="space-y-2">
                {[
                  {
                    title: '🍲 מתכונים (Recipes Hub)',
                    desc: 'ספר מתכונים עשיר עם קטגוריות (בוקר, צהריים, ערב, קינוח), זמני הכנה, רשימת רכיבים מדויקת עם יחידות מידה, אופן הכנה שלב-אחר-שלב, תמונות מותאמות אישית עם דחיסה אוטומטית, דירוג כוכבים, ותגובות ושאלות ליוצר.'
                  },
                  {
                    title: '📅 מתכנן שבועי (Meal & Activity Planner)',
                    desc: 'לוח תכנון שבועי גמיש המאפשר שיבוץ מנות רב-שלביות (עיקרית, תוספת, סלט, מרק, קינוח), שיבוץ אימוני כושר, שיבוץ דייטים ושיבוץ מטלות יומיומיות, עם סימון ביצוע V, ניווט בין שבועות והעתקת תפריט משבוע קודם.'
                  },
                  {
                    title: '🛒 רשימת קניות חכמה (Smart Shopping List)',
                    desc: 'אלגוריתם שקלול חכם הצובר רכיבים מכל המתכונים המשובצים לשבוע הנוכחי, מאחד כמויות לפי יחידות מידה תואמות (גרם, ק"ג, כפות, כוסות), תמיכה בהוספת פריטים חופשיים, סימון קניות שנרכשו, שמירת רשימות קבועות ושיתוף WhatsApp.'
                  },
                  {
                    title: '🏋️‍♂️ כושר ואימונים (Fitness Tracker)',
                    desc: 'בניית תוכניות אימון לפי חלוקות (אימון A/B/C, אירובי, גוף מלא), הגדרת קבוצות שרירי יעד, מעקב משקלים וחזרות לכל תרגיל, תיעוד היסטוריית ביצועים ומעקב אחר יעד אימונים שבועי.'
                  },
                  {
                    title: '🥂 דייטים ובילויים (Date Spots)',
                    desc: 'מאגר רעיונות ומקומות לדייטים ובילויים זוגיים ומשפחתיים (מסעדות, טבע, סרטים, פעילויות), קישור ישיר לניווט ב-Waze, דירוגים, מונה ביקורים ותמונות.'
                  },
                  {
                    title: '📝 פתקים ומטלות (Tasks & Sticky Notes)',
                    desc: 'חלוקה בין פתקים מהירים צבעוניים (Sticky Notes) לבין מטלות מפורטות עם תאריכי יעד, שעות, ספירה לאחור, עדיפויות (דחוף/רגיל) ואפשרות שיבוץ למתכנן השבועי.'
                  }
                ].map((mod, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 space-y-1">
                    <h5 className="font-black text-slate-800 dark:text-zinc-100 text-xs">{mod.title}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 👥 Tab 3: Groups, Roles & Moderation */}
          {activeSection === 'groups_moderation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-1.5">
                <h5 className="font-black text-sky-900 dark:text-sky-200 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>מערכת קבוצות ושיתוף רב-משתמשים (Family & Multi-Group System)</span>
                </h5>
                <p className="text-[11px] text-sky-800/80 dark:text-sky-300">
                  האפליקציה תומכת בחברות במספר קבוצות במקביל (משפחה, שותפים, חברים). מנהל הקבוצה יכול להזמין חברים באמצעות מייל (עם קוד אימות והתראה מיידית), לקבוע אילו לשוניות פתוחות לצפייה לכל חבר, ולמחוק או להסיר חברים.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <h5 className="font-black text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>צינור אישורי פרסום ומודרציה (Moderation Workflow)</span>
                </h5>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300">
                  כדי לשמור על איכות התוכן ופרטיות המשתמשים:
                </p>
                <ul className="list-disc list-inside text-[11px] text-amber-800/90 dark:text-amber-300/90 space-y-1 mr-2">
                  <li><strong>פרסום כללי לקהילה (🌐):</strong> נשלח לבדיקת מנהל בכיר (Super Admin) ומאושר רק לאחר בדיקתו.</li>
                  <li><strong>פרסום קבוצתי (👥):</strong> נשלח לאישור מנהל הקבוצה לפני שמשותף לשאר החברים.</li>
                  <li><strong>פרסום אישי (🔒):</strong> מאושר מיידית עבור היוצר בלבד.</li>
                  <li><strong>מתן הרשאות ישירות:</strong> מנהל בכיר ומנהל קבוצה יכולים להעניק למשתמשים ספציפיים הרשאת פרסום ישיר ללא צורך באישור מקדים.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 💻 Tab 4: Architecture & Engineering */}
          {activeSection === 'architecture' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 space-y-2">
                <h5 className="font-black text-slate-800 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-orange-500" />
                  <span>ארכיטקטורת תוכנה (Software Architecture)</span>
                </h5>
                <ul className="space-y-1.5 text-[11px]">
                  <li><strong>Framework:</strong> Next.js 16 (App Router) עם React 19 ו-Turbopack.</li>
                  <li><strong>Language:</strong> TypeScript מלא עם Static Type Checking קפדני.</li>
                  <li><strong>Backend & Database:</strong> Supabase PostgreSQL עם Row-Level Security (RLS) ו-Supabase Storage לתמונות.</li>
                  <li><strong>Local-First Synchronization:</strong> מנגנון Optimistic UI עם גיבוי LocalStorage מלא, המאפשר לאפליקציה לפעול בצורה חלקה גם במצב Offline / Guest.</li>
                  <li><strong>Mailing & Auth:</strong> שרת SMTP מאובטח לשליחת קודי אימות, שחזור סיסמאות והזמנות לקבוצות.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 🔒 Tab 5: Security & Privacy */}
          {activeSection === 'security' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <h5 className="font-black text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>אבטחת מידע ובידוד מוחלט (Security & Privacy Model)</span>
                </h5>
                <ul className="space-y-1.5 text-[11px] text-emerald-800/90 dark:text-emerald-300">
                  <li><strong>אימות דו-שלבי (Email Verification):</strong> מניעת בוטים וחשבונות מזויפים ע"י אימות קוד חד-פעמי במייל.</li>
                  <li><strong>בידוד נתונים מוחלט:</strong> משתמש שאינו חבר בקבוצה אינו יכול לצפות במידע, במתכונים, במטלות או בתוכניות של חברי הקבוצה.</li>
                  <li><strong>הרשאות מבוססות תפקיד (RBAC):</strong> הפרדה חדה בין Super Admin, Group Admin ו-Member רגיל.</li>
                  <li><strong>מניעת הזרקות ו-XSS:</strong> סינון ועיבוד קלט מאובטח בכל טפסי המערכת וה-API Routes.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex justify-between items-center text-xs">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold">
            Weekly Planner Hub • גרסה 1.2.0 Enterprise
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
          >
            הבנתי, תודה! 👍
          </button>
        </div>

      </div>
    </div>
  );
};
