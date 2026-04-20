import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Mail, Crown, Shield, User, X, Trash2, FolderOpen, Share2, Loader2 } from 'lucide-react';
import { getTeams, createTeam, deleteTeam, inviteTeamMember, getTeamMembers, removeTeamMember, getTeamCollections, shareCollectionWithTeam, getCollections } from '../lib/api';

const C = {
  accent: '#8B5CF6', secondary: '#F472B6', tertiary: '#FBBF24',
  quaternary: '#34D399', foreground: '#1E293B', cream: '#FFFDF5', muted: '#64748B',
};
const hardShadow = (c = C.foreground, x = 4, y = 4) => `${x}px ${y}px 0px 0px ${c}`;
const CARD_COLORS = [C.accent, C.secondary, C.tertiary, C.quaternary];
const popSpring = { type: 'spring', stiffness: 300, damping: 20 };

const ROLE_ICONS = { owner: Crown, admin: Shield, member: User };
const ROLE_COLORS = { owner: C.tertiary, admin: C.accent, member: C.quaternary };

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamCollections, setTeamCollections] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userCollections, setUserCollections] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (team) => {
    setSelectedTeam(team);
    try {
      const [members, collections] = await Promise.all([
        getTeamMembers(team.id),
        getTeamCollections(team.id),
      ]);
      setTeamMembers(members);
      setTeamCollections(collections);
    } catch (err) {
      console.error('Failed to load team details:', err);
    }
  };

  const handleCreateTeam = async (name) => {
    try {
      const newTeam = await createTeam({ name });
      setTeams(prev => [newTeam, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      alert(err.error || 'Failed to create team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Delete this team? All shared collections will be unlinked.')) return;
    try {
      await deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      if (selectedTeam?.id === teamId) setSelectedTeam(null);
    } catch (err) {
      alert(err.error || 'Failed to delete team');
    }
  };

  const handleInvite = async (email, role) => {
    try {
      await inviteTeamMember(selectedTeam.id, { email, role });
      const members = await getTeamMembers(selectedTeam.id);
      setTeamMembers(members);
      setShowInviteModal(false);
    } catch (err) {
      alert(err.error || 'Failed to invite member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await removeTeamMember(selectedTeam.id, userId);
      setTeamMembers(prev => prev.filter(m => m.users.id !== userId));
    } catch (err) {
      alert(err.error || 'Failed to remove member');
    }
  };

  const handleShareCollection = async (collectionId) => {
    try {
      await shareCollectionWithTeam(selectedTeam.id, collectionId);
      const collections = await getTeamCollections(selectedTeam.id);
      setTeamCollections(collections);
      setShowShareModal(false);
    } catch (err) {
      alert(err.error || 'Failed to share collection');
    }
  };

  const openShareModal = async () => {
    try {
      const cols = await getCollections();
      setUserCollections(cols);
      setShowShareModal(true);
    } catch (err) {
      alert('Failed to load collections');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: C.accent }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
            style={{ background: C.quaternary, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}>Teams</span>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>
            Your Teams
          </h1>
        </div>
        <motion.button onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={popSpring}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold"
          style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow() }}>
          <Plus size={16} /> New Team
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1 space-y-3">
          {teams.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ border: `3px dashed ${C.foreground}15`, background: '#fff' }}>
              <Users size={40} className="mx-auto mb-3" style={{ color: C.muted, opacity: 0.3 }} />
              <p className="font-bold text-sm" style={{ color: C.foreground }}>No teams yet</p>
              <p className="text-xs mt-1" style={{ color: C.muted }}>Create a team to start collaborating</p>
            </div>
          ) : (
            teams.map((team, i) => (
              <motion.div key={team.id}
                onClick={() => loadTeamDetails(team)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...popSpring, delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white cursor-pointer transition-all"
                style={{
                  border: selectedTeam?.id === team.id ? `2px solid ${C.accent}` : `2px solid ${C.foreground}15`,
                  boxShadow: selectedTeam?.id === team.id ? hardShadow(CARD_COLORS[i % 4]) : 'none',
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${CARD_COLORS[i % 4]}15`, border: `2px solid ${CARD_COLORS[i % 4]}30` }}>
                      <Users size={18} style={{ color: CARD_COLORS[i % 4] }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.foreground }}>{team.name}</p>
                      <p className="text-xs" style={{ color: C.muted }}>
                        {team.member_count} member{team.member_count !== 1 ? 's' : ''} · {team.shared_collections} collection{team.shared_collections !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                    style={{ background: `${ROLE_COLORS[team.role]}15`, color: ROLE_COLORS[team.role], border: `1px solid ${ROLE_COLORS[team.role]}30` }}>
                    {team.role}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Team Detail Panel */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Team header */}
              <div className="bg-white rounded-2xl p-6" style={{ border: `2px solid ${C.foreground}15` }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>{selectedTeam.name}</h2>
                  {selectedTeam.role === 'owner' && (
                    <button onClick={() => handleDeleteTeam(selectedTeam.id)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{ color: '#EF4444', border: '2px solid #EF444430' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      Delete Team
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {['owner', 'admin'].includes(selectedTeam.role) && (
                    <>
                      <motion.button onClick={() => setShowInviteModal(true)}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
                        style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }}>
                        <Mail size={14} /> Invite Member
                      </motion.button>
                      <motion.button onClick={openShareModal}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                        style={{ background: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2), color: C.foreground }}>
                        <Share2 size={14} /> Share Collection
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="bg-white rounded-2xl p-6" style={{ border: `2px solid ${C.foreground}15` }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>Members ({teamMembers.length})</h3>
                <div className="space-y-2">
                  {teamMembers.map((m) => {
                    const RoleIcon = ROLE_ICONS[m.role] || User;
                    return (
                      <div key={m.users.id} className="flex items-center justify-between p-3 rounded-xl transition-all"
                        style={{ border: `2px solid ${C.foreground}08` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${C.tertiary}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <div className="flex items-center gap-3">
                          <img src={m.users.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.users.id}`}
                            className="w-8 h-8 rounded-full" style={{ border: `2px solid ${C.foreground}15` }}
                            alt={m.users.display_name} />
                          <div>
                            <p className="text-sm font-bold" style={{ color: C.foreground }}>{m.users.display_name || m.users.email}</p>
                            <p className="text-xs" style={{ color: C.muted }}>{m.users.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                            style={{ background: `${ROLE_COLORS[m.role]}10`, color: ROLE_COLORS[m.role] }}>
                            <RoleIcon size={10} /> {m.role}
                          </span>
                          {selectedTeam.role === 'owner' && m.role !== 'owner' && (
                            <button onClick={() => handleRemoveMember(m.users.id)}
                              className="p-1 rounded-lg transition-colors hover:bg-red-50"
                              style={{ color: '#EF4444' }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shared Collections */}
              <div className="bg-white rounded-2xl p-6" style={{ border: `2px solid ${C.foreground}15` }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: C.muted }}>
                  Shared Collections ({teamCollections.length})
                </h3>
                {teamCollections.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: C.muted }}>No shared collections yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamCollections.map((col, i) => (
                      <div key={col.id} className="p-4 rounded-xl bg-white transition-all"
                        style={{ border: `2px solid ${C.foreground}15` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = CARD_COLORS[i % 4]; e.currentTarget.style.boxShadow = `3px 3px 0px 0px ${CARD_COLORS[i % 4]}40`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}15`; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div className="flex items-center gap-2 mb-1">
                          <FolderOpen size={14} style={{ color: CARD_COLORS[i % 4] }} />
                          <p className="font-bold text-sm" style={{ color: C.foreground }}>{col.name}</p>
                        </div>
                        <p className="text-xs" style={{ color: C.muted }}>
                          {col.links?.[0]?.count || 0} links · by {col.users?.display_name || 'Unknown'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-2xl" style={{ border: `3px dashed ${C.foreground}10`, background: '#fff' }}>
              <div className="text-center">
                <Users size={40} className="mx-auto mb-3" style={{ color: C.muted, opacity: 0.2 }} />
                <p className="font-bold text-sm" style={{ color: C.foreground }}>Select a team</p>
                <p className="text-xs mt-1" style={{ color: C.muted }}>or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateTeam} />}
        {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} onInvite={handleInvite} />}
        {showShareModal && <ShareCollectionModal collections={userCollections} teamCollections={teamCollections} onClose={() => setShowShareModal(false)} onShare={handleShareCollection} />}
      </AnimatePresence>
    </div>
  );
}

function CreateTeamModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-2xl p-6" style={{ background: C.cream, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.accent, 6, 6) }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Create Team</h3>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ color: C.muted }}><X size={18} /></button>
        </div>
        <input type="text" placeholder="Team name" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all mb-4"
          style={{ border: `2px solid ${C.foreground}15`, background: '#fff', color: C.foreground }}
          onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}20`; }}
          onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; e.target.style.boxShadow = 'none'; }} />
        <button onClick={() => name.trim() && onCreate(name.trim())}
          className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: C.accent, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 3, 3) }}>
          Create Team
        </button>
      </motion.div>
    </motion.div>
  );
}

function InviteModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-2xl p-6" style={{ background: C.cream, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.secondary, 6, 6) }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Invite Member</h3>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ color: C.muted }}><X size={18} /></button>
        </div>
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all mb-3"
          style={{ border: `2px solid ${C.foreground}15`, background: '#fff', color: C.foreground }}
          onFocus={e => { e.target.style.borderColor = C.secondary; e.target.style.boxShadow = `0 0 0 3px ${C.secondary}20`; }}
          onBlur={e => { e.target.style.borderColor = `${C.foreground}15`; e.target.style.boxShadow = 'none'; }} />
        <div className="flex gap-2 mb-4">
          {['member', 'admin'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all capitalize"
              style={role === r ? { background: C.accent, color: '#fff', border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 2, 2) }
                : { background: '#fff', color: C.muted, border: `2px solid ${C.foreground}15` }}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={() => email.trim() && onInvite(email.trim(), role)}
          className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: C.secondary, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.foreground, 3, 3) }}>
          Send Invite
        </button>
      </motion.div>
    </motion.div>
  );
}

function ShareCollectionModal({ collections, teamCollections, onClose, onShare }) {
  const sharedIds = teamCollections.map(c => c.id);
  const unshared = collections.filter(c => !sharedIds.includes(c.id));
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md rounded-2xl p-6" style={{ background: C.cream, border: `2px solid ${C.foreground}`, boxShadow: hardShadow(C.quaternary, 6, 6) }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold" style={{ fontFamily: '"Outfit", system-ui, sans-serif', color: C.foreground }}>Share Collection</h3>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ color: C.muted }}><X size={18} /></button>
        </div>
        {unshared.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: C.muted }}>All collections are already shared!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {unshared.map(col => (
              <button key={col.id} onClick={() => onShare(col.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all"
                style={{ border: `2px solid ${C.foreground}10`, background: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.quaternary; e.currentTarget.style.background = `${C.quaternary}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.foreground}10`; e.currentTarget.style.background = '#fff'; }}>
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} style={{ color: C.quaternary }} />
                  <span className="text-sm font-bold" style={{ color: C.foreground }}>{col.name}</span>
                </div>
                <Share2 size={14} style={{ color: C.muted }} />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
