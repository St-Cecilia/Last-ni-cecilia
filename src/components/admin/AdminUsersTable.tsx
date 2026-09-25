import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  UserPlus,
  Lock,
  Check,
  X,
  Shield,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Briefcase,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Mail,
  Building2
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { UserRole } from '../../types';
import { GooeyBackground } from '../common/GooeyBackground';

interface AdminUsersTableProps {
  onOpenCreateUser: () => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({ onOpenCreateUser }) => {
  const {
    users,
    currentUser,
    setUserVerified,
    deleteAlumni,
    setSelectedUserIdForModal,
    permissions,
    showToast
  } = useAlumni();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<{ uid: string; name: string } | null>(null);
  const [visibleUserCount, setVisibleUserCount] = useState<number>(12);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  React.useEffect(() => {
    setVisibleUserCount(12);
  }, [searchQuery, roleFilter, statusFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.course || '').toLowerCase().includes(q) ||
        (u.batch || '').includes(q) ||
        (u.studentId || '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'verified'
          ? u.isVerified
          : !u.isVerified;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Stats calculation
  const totalVerified = useMemo(() => users.filter((u) => u.isVerified).length, [users]);
  const totalPending = useMemo(() => users.filter((u) => !u.isVerified).length, [users]);
  const verifiedRate = users.length > 0 ? Math.round((totalVerified / users.length) * 100) : 0;
  const roleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedUids.length === filteredUsers.length) {
      setSelectedUids([]);
    } else {
      setSelectedUids(filteredUsers.map((u) => u.uid));
    }
  };

  const handleToggleSelect = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleBulkVerify = () => {
    if (selectedUids.length === 0) return;
    selectedUids.forEach((uid) => {
      setUserVerified(uid, true);
    });
    showToast(`Successfully verified ${selectedUids.length} selected users!`, 'success');
    setSelectedUids([]);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteAlumni(userToDelete.uid);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Bento Header Tile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)]">
        {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        <GooeyBackground variant="crimson" intensity="subtle" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span className="text-[#8B181B] font-bold">St. Cecilia's College</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Institutional Member Roster</span>
              <span aria-hidden="true" className="text-stone-300 hidden sm:inline">·</span>
              <span className="text-stone-400 hidden sm:inline">Identity Clearance & Roles</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              All Members Directory & Identity Clearance
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Manage graduate accounts, cross-reference student identities against registrar databases, assign institutional administrative credentials, and grant single-click verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {permissions.canAssignRoles && (
              <button
                onClick={onOpenCreateUser}
                id="admin-users-add-user-btn"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-[0_2px_8px_rgba(139,24,27,0.25)] cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add User Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Bento Metrics 4-Tile Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-stone-100">
          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Enrolled</span>
              <Users className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-stone-900">{users.length}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Active accounts</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Verified Clearance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-emerald-700">{totalVerified}</span>
                <span className="text-xs font-semibold text-emerald-600">({verifiedRate}%)</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${verifiedRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Pending Identity</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-amber-800">{totalPending}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Requires audit clearance</span>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Staff & Roles</span>
              <Building2 className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#8B181B]">
                {(roleBreakdown['admin'] || 0) + (roleBreakdown['registrar'] || 0) + (roleBreakdown['moderator'] || 0)}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Officers & staff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID number, email, course program, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] transition-all"
            />
          </div>

          {/* Filters & View Switcher */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] cursor-pointer"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="alumni">Alumni ({roleBreakdown['alumni'] || 0})</option>
              <option value="admin">Administrator ({roleBreakdown['admin'] || 0})</option>
              <option value="registrar">Registrar ({roleBreakdown['registrar'] || 0})</option>
              <option value="staff">Staff ({roleBreakdown['staff'] || 0})</option>
              <option value="moderator">Moderator ({roleBreakdown['moderator'] || 0})</option>
              <option value="employer">Employer ({roleBreakdown['employer'] || 0})</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] cursor-pointer"
            >
              <option value="all">All Clearances</option>
              <option value="verified">Verified Only ({totalVerified})</option>
              <option value="pending">Pending Approval ({totalPending})</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Bento Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Structured Roster Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedUids.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B181B] animate-pulse" />
              <p className="text-xs font-bold text-rose-950">
                {selectedUids.length} member{selectedUids.length > 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkVerify}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Verify Selected (1-Click)</span>
              </button>
              <button
                onClick={() => setSelectedUids([])}
                className="px-2.5 py-1.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Bento Cards View or Dense Table View */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center shadow-2xs">
              <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">No Members Found</h3>
              <p className="text-xs text-stone-500 mt-1">No alumni or faculty match your current filter parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.slice(0, visibleUserCount).map((u) => {
                const isSelected = selectedUids.includes(u.uid);
                return (
                  <div
                    key={u.uid}
                    className={`relative overflow-hidden bg-white rounded-2xl border transition-all duration-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between ${
                      isSelected ? 'border-[#8B181B] bg-rose-50/20 ring-1 ring-[#8B181B]' : 'border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Top Action & Selection */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={
                                u.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=8B181B&color=fff`
                              }
                              alt={u.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs"
                            />
                            {u.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 border-2 border-white" title="Verified Graduate">
                                <ShieldCheck className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-stone-900 tracking-tight truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                            </h3>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">{u.email}</p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(u.uid)}
                          className="rounded border-stone-300 text-[#8B181B] focus:ring-[#8B181B] cursor-pointer mt-1"
                        />
                      </div>

                      {/* Credentials & Program Details */}
                      <div className="mt-3.5 space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                        <div className="flex items-center justify-between text-stone-600">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Institutional Role</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin' || u.role === 'superadmin'
                              ? 'bg-rose-50 text-[#8B181B] border-rose-200/80'
                              : u.role === 'registrar'
                              ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                              : u.role === 'employer'
                              ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}>
                            {u.role}
                          </span>
                        </div>

                        {u.studentId && (
                          <div className="flex items-center justify-between text-stone-600">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Student ID</span>
                            <span className="font-mono text-xs text-stone-800 font-semibold">{u.studentId}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-stone-600">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Program / Batch</span>
                          <span className="font-semibold text-stone-800 text-right truncate max-w-[170px]">
                            {u.course ? `${u.course} • ` : ''}Class {u.batch || '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      {/* Fast Verify Toggle */}
                      <button
                        onClick={() => {
                          setUserVerified(u.uid, !u.isVerified);
                          showToast(
                            `${u.name} is now ${!u.isVerified ? 'verified' : 'pending verification'}`,
                            'info'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          u.isVerified
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        {u.isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Verify Clearance</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedUserIdForModal(u.uid)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="View complete graduate profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {permissions.canAccessAdminPanel && u.uid !== currentUser?.uid && (
                          <button
                            onClick={() => setUserToDelete({ uid: u.uid, name: u.name })}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Structured Table View */
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUids.length === filteredUsers.length}
                      onChange={handleSelectAll}
                      className="rounded border-stone-300 text-[#8B181B] focus:ring-[#8B181B] cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Program & Batch</th>
                  <th className="p-3.5">Clearance Status</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-stone-500">
                      No users found matching your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice(0, visibleUserCount).map((u) => {
                    const isSelected = selectedUids.includes(u.uid);
                    return (
                      <tr
                        key={u.uid}
                        className={`hover:bg-stone-50/70 transition-colors ${
                          isSelected ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(u.uid)}
                            className="rounded border-stone-300 text-[#8B181B] focus:ring-[#8B181B] cursor-pointer"
                          />
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=8B181B&color=fff`
                              }
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isVerified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500">{u.email}</div>
                              {u.studentId && (
                                <div className="text-[10px] font-mono text-stone-400">ID: {u.studentId}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-stone-800">{u.course || '—'}</div>
                          <div className="text-[11px] text-stone-500">Batch of {u.batch || '—'}</div>
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => {
                              setUserVerified(u.uid, !u.isVerified);
                              showToast(
                                `${u.name} is now ${!u.isVerified ? 'verified' : 'pending verification'}`,
                                'info'
                              );
                            }}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 w-fit ${
                              u.isVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {u.isVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUserIdForModal(u.uid)}
                              title="View Profile"
                              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {permissions.canAccessAdminPanel && u.uid !== currentUser?.uid && (
                              <button
                                onClick={() => setUserToDelete({ uid: u.uid, name: u.name })}
                                title="Delete member record"
                                className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progressive See More Controls */}
      {filteredUsers.length > visibleUserCount && (
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-600 font-medium">
            Showing <strong className="text-stone-900">{Math.min(visibleUserCount, filteredUsers.length)}</strong> of <strong className="text-stone-900">{filteredUsers.length}</strong> accounts
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleUserCount((prev) => prev + 12)}
              className="px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl font-bold shadow-2xs transition-all cursor-pointer text-xs active:scale-95"
            >
              See More Accounts (+{Math.min(12, filteredUsers.length - visibleUserCount)})
            </button>
            <button
              type="button"
              onClick={() => setVisibleUserCount(filteredUsers.length)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Show All ({filteredUsers.length})
            </button>
          </div>
        </div>
      )}

      {visibleUserCount > 12 && filteredUsers.length > 12 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setVisibleUserCount(12)}
            className="text-xs text-stone-500 hover:text-stone-800 font-semibold underline cursor-pointer"
          >
            Show Less (Reset to 12)
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-[#8B181B]">
              <div className="p-2 bg-rose-50 rounded-xl">
                <Trash2 className="w-5 h-5 text-[#8B181B]" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-serif">Delete Member Record</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently remove <span className="font-bold text-stone-900">{userToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
