import React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { GroupInvitation } from '@/src/types';

interface InvitationsBannerProps {
  invitations: GroupInvitation[];
  onRespond: (invitationId: string, accept: boolean) => void;
}

export const InvitationsBanner: React.FC<InvitationsBannerProps> = ({
  invitations,
  onRespond
}) => {
  if (!invitations || invitations.length === 0) return null;

  const current = invitations[0];

  return (
    <div className="mx-4 mt-2 p-3 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white rounded-2xl shadow-lg shadow-orange-500/20 animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-2.5 z-20">
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 font-bold">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div className="text-right">
          <p className="text-xs font-black leading-tight">
            הוזמנת להצטרף לקבוצה "{current.groupName}"!
          </p>
          <span className="text-[10px] text-white/90 font-medium">
            נשלח על ידי {current.invitedByName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
        <button
          onClick={() => onRespond(current.id, true)}
          className="flex-1 sm:flex-none px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>אישור</span>
        </button>

        <button
          onClick={() => onRespond(current.id, false)}
          className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
