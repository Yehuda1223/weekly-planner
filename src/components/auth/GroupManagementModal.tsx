import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Shield, 
  Crown, 
  Check, 
  Trash2, 
  Plus, 
  Send, 
  Bell, 
  Calendar, 
  ShoppingBag, 
  Dumbbell, 
  Heart, 
  Search,
  CheckCircle2, 
  Clock,
  XCircle,
  FolderLock,
  Layers
} from 'lucide-react';
import { FamilyGroup, GroupInvitation, UserProfile, CategoryPermissions } from '@/src/types';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  groups: FamilyGroup[];
  activeGroup: FamilyGroup | null;
  invitations: GroupInvitation[];
  pendingInvitations: GroupInvitation[];
  onCreateGroup: (name: string, inviteEmails?: string[]) => void;
  onSwitchGroup: (groupId: string) => void;
  onInviteToGroup: (groupId: string, email: string) => void;
  onRespondInvitation: (invitationId: string, accept: boolean) => void;
  onRemoveMember: (groupId: string, memberUserId: string) => void;
  onUpdatePermissions: (groupId: string, memberUserId: string, permissions: CategoryPermissions) => void;
  onDeleteGroup: (groupId: string) => void;
  onCancelInvitation: (invitationId: string) => void;
  onDeleteUserAccount?: (userId: string) => void;
  onToggleUserPublicPublishPermission?: (userId: string) => void;
}

export const GroupManagementModal: React.FC<GroupManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registeredUsers,
  groups,
  activeGroup,
  invitations,
  pendingInvitations,
  onCreateGroup,
  onSwitchGroup,
  onInviteToGroup,
  onRespondInvitation,
  onRemoveMember,
  onUpdatePermissions,
  onDeleteGroup,
  onCancelInvitation,
  onDeleteUserAccount,
  onToggleUserPublicPublishPermission
}) => {
  // 1. All hooks must run unconditionally before any early returns!
  const [activeTab, setActiveTab] = useState<'my_group' | 'members' | 'invite' | 'status' | 'invitations' | 'super_admin'>('my_group');
  
  // Create Group State
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedInviteEmails, setSelectedInviteEmails] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Direct Invite State
  const [inviteEmail, setInviteEmail] = useState('');

  // Selected Group for Super Admin Inspection
  const [selectedAdminGroupId, setSelectedAdminGroupId] = useState<string | null>(null);

  // Filter registered users for group creation invite selection
  const availableUsersToInvite = useMemo(() => {
    if (!currentUser) return [];
    return registeredUsers.filter(u => {
      if (u.email?.toLowerCase() === currentUser.email?.toLowerCase()) return false;
      if (!userSearchQuery.trim()) return true;
      const query = userSearchQuery.trim().toLowerCase();
      return (
        u.displayName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    });
  }, [registeredUsers, currentUser, userSearchQuery]);

  // Sent invitations tracking for active group or created by current user
  const sentInvitations = useMemo(() => {
    if (!currentUser) return [];
    return invitations.filter(inv => 
      (activeGroup && inv.groupId === activeGroup.id) || 
      inv.invitedByUserId === currentUser.id
    );
  }, [invitations, activeGroup, currentUser]);

  // 2. Early return only AFTER all hooks are called
  if (!isOpen || !currentUser) return null;

  const isGroupAdmin = activeGroup?.createdBy === currentUser.id || currentUser.isSuperAdmin;
  const isSuperAdmin = !!currentUser.isSuperAdmin;

  const toggleSelectUserForCreation = (email: string) => {
    setSelectedInviteEmails(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName.trim(), selectedInviteEmails);
    setNewGroupName('');
    setSelectedInviteEmails([]);
    setUserSearchQuery('');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !inviteEmail.trim()) return;
    onInviteToGroup(activeGroup.id, inviteEmail.trim());
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <span>ניהול קבוצות שיתוף</span>
                {activeGroup && (
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-extrabold px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/50">
                    {activeGroup.name}
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                שיתוף תכנון ארוחות, מתכונים, קניות ואימונים
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

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('my_group')}
            className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'my_group'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>הקבוצות שלי</span>
          </button>

          {activeGroup && (
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>חברים ({activeGroup.members?.length || 0})</span>
            </button>
          )}

          {activeGroup && isGroupAdmin && (
            <button
              onClick={() => setActiveTab('invite')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'invite'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הזמן חברים</span>
            </button>
          )}

          {/* Sent Invitations Tracking Tab */}
          {sentInvitations.length > 0 && (
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>סטטוס הזמנות ({sentInvitations.length})</span>
            </button>
          )}

          {/* Received Pending Invitations Tab */}
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap relative ${
              activeTab === 'invitations'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>הזמנות</span>
            {pendingInvitations.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {pendingInvitations.length}
              </span>
            )}
          </button>

          {/* 👑 Super Admin System Groups Control Tab */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('super_admin')}
              className={`px-3 py-2 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap bg-amber-50/50 dark:bg-amber-950/20 ${
                activeTab === 'super_admin'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900'
                  : 'border-transparent text-amber-700/70 hover:text-amber-700 dark:text-amber-400/70'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>ניהול כללי 👑</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">

          {/* 👥 TAB 1: My Groups & Group Creation with User Search */}
          {activeTab === 'my_group' && (
            <div className="space-y-4">
              
              {/* Active Group Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 dark:text-zinc-300 block">
                  קבוצה פעילה כרגע:
                </label>
                {groups.length === 0 ? (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-2xl text-xs text-orange-800 dark:text-orange-300">
                    עדיין אין לך קבוצה. צור קבוצה חדשה כדי לשתף מתכונים ותוכניות עם בני המשפחה או החברים!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groups.map(grp => {
                      const isSelected = activeGroup?.id === grp.id;
                      const isCreator = grp.createdBy === currentUser.id;
                      return (
                        <div
                          key={grp.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 shadow-sm'
                              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                          }`}
                          onClick={() => onSwitchGroup(grp.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                            }`}>
                              {grp.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">
                                  {grp.name}
                                </span>
                                {isCreator && (
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-amber-200 dark:border-amber-900/50">
                                    <Crown className="w-3 h-3 text-amber-500" /> מנהל הקבוצה
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                                {grp.members?.length || 1} חברים בקבוצה
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {(isCreator || isSuperAdmin) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteGroup(grp.id);
                                }}
                                className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors"
                                title="מחיקת קבוצה"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ➕ Create New Group Form with User Selection & Live Search */}
              <form onSubmit={handleCreateSubmit} className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300">
                    ➕ יצירת קבוצה חדשה והזמנת חברים:
                  </label>
                  {selectedInviteEmails.length > 0 && (
                    <span className="text-[11px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-black px-2 py-0.5 rounded-full">
                      {selectedInviteEmails.length} חברים נבחרו
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  required
                  placeholder="שם הקבוצה (למשל: משפחת כהן, שותפים לדירה)..."
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                />

                {/* Search Registered Users to Invite */}
                {registeredUsers.length > 0 && (
                  <div className="space-y-2 bg-slate-50/70 dark:bg-zinc-800/30 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="חיפוש חברים להוספה לפי שם או מייל..."
                        value={userSearchQuery}
                        onChange={e => setUserSearchQuery(e.target.value)}
                        className="w-full pr-8 pl-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
                      {availableUsersToInvite.length === 0 ? (
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center py-2">
                          לא נמצאו משתמשים נוספים במערכת
                        </p>
                      ) : (
                        availableUsersToInvite.map(u => {
                          const isSelected = selectedInviteEmails.includes(u.email);
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleSelectUserForCreation(u.email)}
                              className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-200 font-extrabold'
                                  : 'bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                  isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-600'
                                }`}>
                                  {u.displayName?.charAt(0) || '👤'}
                                </div>
                                <div>
                                  <span className="block text-xs leading-none">{u.displayName}</span>
                                  <span className="text-[10px] text-slate-400">{u.email}</span>
                                </div>
                              </div>

                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 dark:border-zinc-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold py-3 px-4 rounded-xl shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {selectedInviteEmails.length > 0
                      ? `צור קבוצה ושלח ${selectedInviteEmails.length} הזמנות 🚀`
                      : 'צור קבוצה חדשה 🚀'}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* 🛡️ TAB 2: Members & Permissions */}
          {activeTab === 'members' && activeGroup && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  חברים בקבוצת "{activeGroup.name}":
                </h4>
                {isGroupAdmin && (
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-extrabold">
                    👑 כמנהל, באפשרותך לקבוע הרשאות לכל חבר
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {activeGroup.members?.map(member => {
                  const isMemberAdmin = member.role === 'admin';
                  const isSelf = member.userId === currentUser.id;
                  const perms = member.permissions || { planner: true, shopping: true, fitness: true, dates: true };

                  return (
                    <div
                      key={member.userId}
                      className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold flex items-center justify-center text-xs">
                            {member.displayName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                                {member.displayName} {isSelf && '(אתה)'}
                              </span>
                              {isMemberAdmin ? (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 text-amber-500" /> מנהל
                                </span>
                              ) : (
                                <span className="text-[9px] bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded">
                                  חבר
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                              {member.email}
                            </span>
                          </div>
                        </div>

                        {/* Remove Member Button */}
                        {isGroupAdmin && !isMemberAdmin && !isSelf && (
                          <button
                            onClick={() => onRemoveMember(activeGroup.id, member.userId)}
                            className="text-xs text-red-500 hover:text-red-700 font-bold bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200/60 dark:border-red-900/40 cursor-pointer"
                          >
                            הסר מהקבוצה
                          </button>
                        )}
                      </div>

                      {/* Category Permission Toggles (Admin Controlled) */}
                      {isGroupAdmin && !isSelf && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block">
                            הרשאות צפייה בקטגוריות:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { key: 'planner', label: 'תכנון ארוחות', icon: Calendar },
                              { key: 'shopping', label: 'רשימת קניות', icon: ShoppingBag },
                              { key: 'fitness', label: 'כושר ואימונים', icon: Dumbbell },
                              { key: 'dates', label: 'דייטים ובילויים', icon: Heart },
                              { key: 'tasks', label: 'פתקים ומטלות', icon: CheckSquare }
                            ].map(item => {
                              const isChecked = perms[item.key as keyof CategoryPermissions];
                              const Icon = item.icon;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => {
                                    const updated = {
                                      ...perms,
                                      [item.key]: !isChecked
                                    };
                                    onUpdatePermissions(activeGroup.id, member.userId, updated);
                                  }}
                                  className={`p-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-orange-500 text-white border-orange-500'
                                      : 'bg-white dark:bg-zinc-800 text-slate-400 border-slate-200 dark:border-zinc-700'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <Icon className="w-3 h-3" />
                                    <span>{item.label}</span>
                                  </span>
                                  <span className="text-[9px]">{isChecked ? '✓' : '✗'}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* 🔓 Direct Recipe Publishing Permission for Group */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...perms,
                                canPublishWithoutApproval: !perms.canPublishWithoutApproval
                              };
                              onUpdatePermissions(activeGroup.id, member.userId, updated);
                            }}
                            className={`w-full p-2 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer mt-2 ${
                              perms.canPublishWithoutApproval
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>✨</span>
                              <span>פרסום מתכונים ישיר לקבוצה (ללא אישור)</span>
                            </span>
                            <span className="text-[10px] font-black">{perms.canPublishWithoutApproval ? 'מורשה ✓' : 'דורש אישור 🔒'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✉️ TAB 3: Direct Invite Users */}
          {activeTab === 'invite' && activeGroup && isGroupAdmin && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                📩 הזמן משתמש קיים לקבוצת <strong>"{activeGroup.name}"</strong>. המשתמש יקבל התראה מיידית באפליקציה ויוכל להצטרף בלחיצה.
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-zinc-300 block">
                    הזן כתובת דוא״ל להזמנה:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>שלח הזמנה לקבוצה</span>
                </button>
              </form>

              {/* Registered Users Quick Select */}
              {registeredUsers.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                    או בחר משתמש רשום מהמערכת:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {registeredUsers
                      .filter(u => u.email !== currentUser.email && !activeGroup.members?.some(m => m.email?.toLowerCase() === u.email?.toLowerCase()))
                      .map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setInviteEmail(u.email)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer flex items-center gap-1"
                        >
                          <span>{u.displayName}</span>
                          <span className="text-[10px] text-slate-400">({u.email})</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🕒 TAB 4: Sent Invitations Status Tracking */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  מעקב אחר סטטוס הזמנות שנשלחו:
                </h4>
                <span className="text-[10px] text-slate-400">
                  {sentInvitations.length} הזמנות
                </span>
              </div>

              {sentInvitations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  לא נשלחו הזמנות עדיין
                </div>
              ) : (
                <div className="space-y-2">
                  {sentInvitations.map(inv => {
                    const isPending = inv.status === 'pending';
                    const isAccepted = inv.status === 'accepted';
                    const isDeclined = inv.status === 'declined';

                    return (
                      <div
                        key={inv.id}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800 dark:text-zinc-100">
                              {inv.invitedUserEmail}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({inv.groupName})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            נשלח על ידי {inv.invitedByName} • {new Date(inv.createdAt).toLocaleDateString('he-IL')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-900">
                              <Clock className="w-3 h-3 text-amber-500 animate-spin" /> ממתין לאישור
                            </span>
                          )}
                          {isAccepted && (
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> אושר והצטרף
                            </span>
                          )}
                          {isDeclined && (
                            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                              <XCircle className="w-3 h-3 text-rose-500" /> נדחה
                            </span>
                          )}

                          <button
                            onClick={() => onCancelInvitation(inv.id)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-700 text-slate-400 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                            title="ביטול/מחיקת הזמנה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 🔔 TAB 5: Received Pending Invitations */}
          {activeTab === 'invitations' && (
            <div className="space-y-3">
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-10 space-y-2 bg-slate-50 dark:bg-zinc-800/20 border border-slate-100 dark:border-zinc-800 rounded-2xl">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                    אין הזמנות חדשות הממתינות לאישורך
                  </p>
                </div>
              ) : (
                pendingInvitations.map(inv => (
                  <div
                    key={inv.id}
                    className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border border-orange-200 dark:border-orange-900/50 rounded-2xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                        👥
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-800 dark:text-zinc-100">
                          הזמנה להצטרף לקבוצת "{inv.groupName}"
                        </h5>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                          הוזמנת על ידי: <strong>{inv.invitedByName}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onRespondInvitation(inv.id, true)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>אישור והצטרפות</span>
                      </button>

                      <button
                        onClick={() => onRespondInvitation(inv.id, false)}
                        className="px-3 py-2 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                      >
                        דחייה
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 👑 TAB 6: Super Admin Global Control (All Groups & All Accounts) */}
          {activeTab === 'super_admin' && isSuperAdmin && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-300 dark:border-amber-700/50 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-black">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>לוח בקרה של מנהל בכיר (יהודה זילבר)</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                  שליטה מלאה בכל הקבוצות, מחיקת קבוצות, הסרת חברים, ניהול הרשאות קטגוריות ומחיקת משתמשים מהמערכת.
                </p>
              </div>

              {/* All Groups List */}
              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-700 dark:text-zinc-300">
                  כל הקבוצות במערכת ({groups.length}):
                </h5>

                {groups.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">אין קבוצות במערכת כרגע</p>
                ) : (
                  <div className="space-y-2">
                    {groups.map(grp => (
                      <div
                        key={grp.id}
                        className="p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 font-black text-xs flex items-center justify-center">
                              {grp.name.slice(0, 1)}
                            </div>
                            <div>
                              <span className="font-extrabold text-xs text-slate-800 dark:text-zinc-100">
                                {grp.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                נוצר על ידי: {grp.createdByName || grp.createdBy} • {grp.members?.length || 0} חברים
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedAdminGroupId(selectedAdminGroupId === grp.id ? null : grp.id)}
                              className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg hover:bg-slate-200 cursor-pointer"
                            >
                              {selectedAdminGroupId === grp.id ? 'סגור פרטים' : 'נהל חברים ⚙️'}
                            </button>

                            <button
                              onClick={() => onDeleteGroup(grp.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 flex items-center justify-center cursor-pointer"
                              title="מחיקת קבוצה זו מהמערכת"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Group Members & Permissions Control */}
                        {selectedAdminGroupId === grp.id && (
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-700 space-y-2">
                            <span className="text-[10px] font-bold text-slate-500 block">
                              חברי הקבוצה והרשאותיהם:
                            </span>
                            {grp.members?.map(m => {
                              const perms = m.permissions || { planner: true, shopping: true, fitness: true, dates: true };
                              return (
                                <div key={m.userId} className="p-2 bg-slate-50 dark:bg-zinc-900 rounded-xl space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-bold text-slate-700 dark:text-zinc-200">{m.displayName}</span>
                                      <span className="text-[10px] text-slate-400 mr-1">({m.email})</span>
                                    </div>
                                    <button
                                      onClick={() => onRemoveMember(grp.id, m.userId)}
                                      className="text-[10px] text-red-500 hover:underline font-bold"
                                    >
                                      הסר מקבוצה
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-4 gap-1">
                                    {[
                                      { key: 'planner', label: 'תכנון' },
                                      { key: 'shopping', label: 'קניות' },
                                      { key: 'fitness', label: 'כושר' },
                                      { key: 'dates', label: 'דייטים' }
                                    ].map(cat => {
                                      const isChecked = perms[cat.key as keyof CategoryPermissions];
                                      return (
                                        <button
                                          key={cat.key}
                                          type="button"
                                          onClick={() => {
                                            const updated = { ...perms, [cat.key]: !isChecked };
                                            onUpdatePermissions(grp.id, m.userId, updated);
                                          }}
                                          className={`py-1 rounded-lg text-[9px] font-bold border ${
                                            isChecked 
                                              ? 'bg-amber-500 text-white border-amber-500' 
                                              : 'bg-white dark:bg-zinc-800 text-slate-400 border-slate-200'
                                          }`}
                                        >
                                          {cat.label} {isChecked ? '✓' : '✗'}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* All System Users List */}
              {onDeleteUserAccount && (
                <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                  <h5 className="text-xs font-black text-slate-700 dark:text-zinc-300">
                    חשבונות משתמשים במערכת ({registeredUsers.length}):
                  </h5>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {registeredUsers.map(u => (
                      <div
                        key={u.id}
                        className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          {onToggleUserPublicPublishPermission && (
                            <button
                              type="button"
                              onClick={() => onToggleUserPublicPublishPermission(u.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                                u.canPublishPublicWithoutApproval
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 border-slate-200'
                              }`}
                              title="הרשאת פרסום מתכונים כלליים ישירות לקהילה ללא צורך באישור מנהל בכיר"
                            >
                              {u.canPublishPublicWithoutApproval ? '🔓 פרסום כללי ישיר' : '🔒 דורש אישור לפרסום'}
                            </button>
                          )}

                          {u.email !== currentUser.email && onDeleteUserAccount && (
                            <button
                              onClick={() => onDeleteUserAccount(u.id)}
                              className="px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              מחק חשבון 🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
