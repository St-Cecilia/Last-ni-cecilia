/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  Megaphone,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  ArrowRight,
  Eye,
  Check,
  X,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  TrendingUp,
  FileText,
  ChevronRight,
  Layers,
  MapPin,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAlumni } from '../../context/AlumniContext';
import { getRegistrationConflicts, resolveConflictRecord } from '../../services/studentVerificationService';
import { GooeyBackground } from '../common/GooeyBackground';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateUser: () => void;
  onOpenCreateEvent: () => void;
  onOpenCreateAnnouncement: () => void;
  onOpenGalleryUpload: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  onNavigateTab,
  onOpenCreateUser,
  onOpenCreateEvent,
  onOpenCreateAnnouncement,
  onOpenGalleryUpload
}) => {
  const {
    users,
    events,
    announcements,
    opportunities,
    chapters,
    milestones,
    auditLogs,
    setUserVerified,
    approveOpportunity,
    rejectOpportunity,
    verifyEmployer,
    setSelectedUserIdForModal,
    syncAllDataToCloud,
    isFirestoreSyncing,
    showToast,
    permissions
  } = useAlumni();

  const [moderationFilter, setModerationFilter] = useState<'all' | 'users' | 'employers' | 'jobs' | 'conflicts'>('all');
  const [visiblePendingUsersCount, setVisiblePendingUsersCount] = useState<number>(4);
  const [visibleRecentUsersCount, setVisibleRecentUsersCount] = useState<number>(5);

  // 1. Pending Items Aggregation
  const pendingUsers = useMemo(() => users.filter((u) => !u.isVerified), [users]);
  const pendingEmployers = useMemo(
    () => users.filter((u) => u.role === 'employer' && u.employerVerificationStatus === 'pending_verification'),
    [users]
  );
  const pendingJobs = useMemo(
    () => (opportunities || []).filter((o) => o.approvalStatus === 'pending_approval'),
    [opportunities]
  );
  const pendingConflicts = useMemo(() => {
    try {
      return getRegistrationConflicts().filter((c) => c.status === 'pending');
    } catch {
      return [];
    }
  }, []);

  const totalPendingCount =
    pendingUsers.length + pendingEmployers.length + pendingJobs.length + pendingConflicts.length;

  // 2. Key Metrics
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const verifiedRate = users.length > 0 ? Math.round((verifiedCount / users.length) * 100) : 0;
  const totalRsvps = events.reduce((acc, ev) => acc + (ev.attendeesCount || 0), 0);
  const employerCount = users.filter((u) => u.role === 'employer').length;

  // 3. Recent signups with progressive expansion
  const recentUsers = useMemo(() => {
    return [...users].slice(-visibleRecentUsersCount).reverse();
  }, [users, visibleRecentUsersCount]);

  // 4. Upcoming 3 events
  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.startDate || e.date || Date.now()) >= new Date(Date.now() - 86400000))
      .slice(0, 3);
  }, [events]);

  // 5. Recent 4 audit logs
  const recentLogs = useMemo(() => {
    return (auditLogs || []).slice(0, 4);
  }, [auditLogs]);

  // 6. Analytics Visualizations Data
  const cohortData = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      const year = u.batch || 'Unknown';
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([cohort, count]) => ({ cohort, count }))
      .sort((a, b) => (a.cohort > b.cohort ? 1 : -1))
      .slice(-8);
  }, [users]);

  const verificationRatio = useMemo(() => {
    const verified = users.filter((u) => u.isVerified).length;
    const unverified = users.length - verified;
    return [
      { name: 'Verified', value: verified, color: '#8B181B' },
      { name: 'Pending', value: unverified, color: '#E7E5E4' }
    ];
  }, [users]);

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      const dept = u.department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([dept, count]) => ({
        dept,
        count,
        percentage: users.length > 0 ? Math.round((count / users.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [users]);

  // Filtered pending queue items
  const showUsers = moderationFilter === 'all' || moderationFilter === 'users';
  const showEmployers = moderationFilter === 'all' || moderationFilter === 'employers';
  const showJobs = moderationFilter === 'all' || moderationFilter === 'jobs';
  const showConflicts = moderationFilter === 'all' || moderationFilter === 'conflicts';

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Institutional Command Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] border border-stone-200/90 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)]">
        {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        {/* Ambient Gooey Liquid Effect */}
        <GooeyBackground variant="crimson" intensity="subtle" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span className="text-[#8B181B] font-bold">St. Cecilia's College</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Institutional Governance Console</span>
              <span aria-hidden="true" className="text-stone-300 hidden sm:inline">·</span>
              <span className="text-stone-400 hidden sm:inline">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-tight">
              Administrative Command Center
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Directly verify alumni records, accredit industry employers, review curated career postings, coordinate campus events, and broadcast notices with minimum clicks.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
            {permissions.canAssignRoles && (
              <button
                type="button"
                onClick={onOpenCreateUser}
                id="admin-quick-add-user-btn"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ User</span>
              </button>
            )}

              {permissions.canCreateEvents && (
                <button
                  type="button"
                  onClick={onOpenCreateEvent}
                  id="admin-quick-add-event-btn"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-stone-300" />
                  <span>+ Event</span>
                </button>
              )}

              {permissions.canPostAnnouncements && (
                <button
                  type="button"
                  onClick={onOpenCreateAnnouncement}
                  id="admin-quick-add-announcement-btn"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Megaphone className="w-3.5 h-3.5 text-stone-300" />
                  <span>+ Notice</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => syncAllDataToCloud()}
                disabled={isFirestoreSyncing}
                id="admin-quick-sync-btn"
                title="Push local data changes directly to Firestore"
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFirestoreSyncing ? 'animate-spin' : ''}`} />
                <span>{isFirestoreSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>
          </div>
        </div>

      {/* Top 5 Bento Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Members */}
        <div
          onClick={() => onNavigateTab('users')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-[#8B181B]/40 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Members</span>
              <span className="p-2 bg-red-50 text-[#8B181B] rounded-xl group-hover:scale-105 transition-transform border border-red-100">
                <Users className="w-4 h-4 stroke-[1.75]" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-2.5">
              {users.length}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">{verifiedCount} verified</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {verifiedRate}% Official
            </span>
          </div>
        </div>

        {/* Card 2: Pending Governance Actions */}
        <div
          onClick={() => onNavigateTab('governance')}
          className={`p-4 sm:p-5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden ${
            totalPendingCount > 0
              ? 'bg-amber-50/70 border-amber-300/90 hover:border-amber-400'
              : 'bg-white border-stone-200/90 hover:border-stone-300'
          }`}
        >
          {totalPendingCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">Pending Review</span>
              <span
                className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${
                  totalPendingCount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-stone-100 text-stone-500'
                }`}
              >
                <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
              </span>
            </div>
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5 ${totalPendingCount > 0 ? 'text-amber-950' : 'text-stone-900'}`}>
              {totalPendingCount}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
            <span className="text-stone-600 font-medium">
              {totalPendingCount > 0 ? 'Needs Review' : 'All Clear'}
            </span>
            {totalPendingCount > 0 && (
              <span className="text-amber-900 font-bold bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300/80 text-[10px]">
                1-Click Desk
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Campus Events */}
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Campus Events</span>
              <span className="p-2 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform border border-blue-100">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-2.5">{events.length}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Total RSVPs</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              {totalRsvps} Attendees
            </span>
          </div>
        </div>

        {/* Card 4: Corporate Jobs */}
        <div
          onClick={() => onNavigateTab('jobs')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Career Placements</span>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform border border-emerald-100">
                <Briefcase className="w-4 h-4 stroke-[1.75]" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-2.5">{opportunities.length}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Partners: {employerCount}</span>
            {pendingJobs.length > 0 ? (
              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                {pendingJobs.length} new
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold text-[10px]">Active</span>
            )}
          </div>
        </div>

        {/* Card 5: Chapters & Milestones */}
        <div
          onClick={() => onNavigateTab('chapters')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between col-span-2 sm:col-span-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Regional Chapters</span>
              <span className="p-2 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-105 transition-transform border border-purple-100">
                <MapPin className="w-4 h-4 stroke-[1.75]" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-2.5">{chapters.length}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Honors</span>
            <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
              {milestones.length} Milestones
            </span>
          </div>
        </div>
      </div>

      {/* Main Collegiate Bento Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Bento Tile 1 (col-span-12 lg:col-span-8): Immediate Governance Review Inbox & Action Desk */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative overflow-hidden transition-shadow duration-200">
          <GooeyBackground variant="amber" intensity="subtle" />
          
          <div className="relative z-10">
            {/* Header with Title and Batch Action */}
            <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">
                      Governance Moderation Desk
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
                      {totalPendingCount} Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Approve alumni registrations, verify employer partnerships, and clear masterlist claims
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                {pendingUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      pendingUsers.forEach((u) => setUserVerified(u.uid, true));
                      showToast(`Verified all ${pendingUsers.length} pending alumni!`, 'success');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify All ({pendingUsers.length})</span>
                  </button>
                )}

                {totalPendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('governance')}
                    className="text-xs font-bold text-[#8B181B] hover:text-[#721316] flex items-center gap-1 cursor-pointer ml-1"
                  >
                    <span>Full Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Moderation Filter Tabs (Zero-Pill discipline) */}
            <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto text-xs bg-stone-50/20 scrollbar-none">
              <button
                type="button"
                onClick={() => setModerationFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  moderationFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <span>All Items</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  moderationFilter === 'all' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {totalPendingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModerationFilter('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  moderationFilter === 'users'
                    ? 'bg-[#8B181B] text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-[#8B181B] hover:bg-red-50/60'
                }`}
              >
                <span>Alumni</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  moderationFilter === 'users' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {pendingUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModerationFilter('employers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  moderationFilter === 'employers'
                    ? 'bg-purple-700 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-purple-700 hover:bg-purple-50/60'
                }`}
              >
                <span>Employers</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  moderationFilter === 'employers' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {pendingEmployers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModerationFilter('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  moderationFilter === 'jobs'
                    ? 'bg-blue-700 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-blue-700 hover:bg-blue-50/60'
                }`}
              >
                <span>Jobs</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  moderationFilter === 'jobs' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {pendingJobs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModerationFilter('conflicts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  moderationFilter === 'conflicts'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-amber-700 hover:bg-amber-50/60'
                }`}
              >
                <span>Conflicts</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  moderationFilter === 'conflicts' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {pendingConflicts.length}
                </span>
              </button>
            </div>

            {/* Queue Item List */}
            {totalPendingCount === 0 ? (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">All Queue Items Cleared</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  No pending user verifications, employer accreditations, or job listings require administrative review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto scrollbar-thin">
                {/* 1. Pending Users */}
                {showUsers && pendingUsers.slice(0, visiblePendingUsersCount).map((u) => (
                  <div key={u.uid} className="p-3.5 sm:p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 shrink-0 border border-stone-200">
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-stone-900 truncate">{u.name || 'Alumni Member'}</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/70">
                            Alumni Verification
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {u.email} • {u.course || 'Degree Program Pending'} {u.batch ? `(Class of ${u.batch})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedUserIdForModal(u.uid)}
                        className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-stone-500" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserVerified(u.uid, true)}
                        className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify (1-Click)</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Progressive See More for Pending Alumni */}
                {showUsers && pendingUsers.length > visiblePendingUsersCount && (
                  <div className="p-3 bg-stone-50/90 flex items-center justify-between gap-2 text-xs">
                    <span className="text-stone-500 font-medium">
                      Showing {Math.min(visiblePendingUsersCount, pendingUsers.length)} of {pendingUsers.length} pending alumni
                    </span>
                    <button
                      type="button"
                      onClick={() => setVisiblePendingUsersCount((prev) => prev + 4)}
                      className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      See More Pending (+{Math.min(4, pendingUsers.length - visiblePendingUsersCount)})
                    </button>
                  </div>
                )}
                {showUsers && visiblePendingUsersCount > 4 && pendingUsers.length > 4 && (
                  <div className="p-2 bg-stone-50 text-center">
                    <button
                      type="button"
                      onClick={() => setVisiblePendingUsersCount(4)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Show Less
                    </button>
                  </div>
                )}

                {/* 2. Pending Employers */}
                {showEmployers && pendingEmployers.slice(0, 3).map((emp) => (
                  <div key={emp.uid} className="p-3.5 sm:p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-stone-900 truncate">{emp.companyName || emp.name}</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200/70">
                            Employer Partner
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {emp.companyIndustry || 'Industry unspecified'} • {emp.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => verifyEmployer(emp.uid, 'rejected')}
                        className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => verifyEmployer(emp.uid, 'verified')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accredit Partner</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* 3. Pending Jobs */}
                {showJobs && pendingJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3.5 sm:p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-stone-900 truncate">{job.title}</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/70">
                            Career Opening
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {job.company} • {job.location} • {job.employmentType || job.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => rejectOpportunity(job.id, 'Moderated by admin')}
                        className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => approveOpportunity(job.id)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Posting</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* 4. Pending Registry Conflicts */}
                {showConflicts && pendingConflicts.slice(0, 2).map((conflict) => (
                  <div key={conflict.id} className="p-3.5 sm:p-4 hover:bg-stone-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            ID Conflict: {conflict.targetRegistryStudentId}
                          </p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            Registry Conflict
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          Claimed by {conflict.applicantName} ({conflict.applicantEmail})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          resolveConflictRecord(conflict.id, 'resolved_rejected', 'Admin');
                          showToast('Conflict record dismissed.', 'info');
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resolveConflictRecord(conflict.id, 'resolved_verified', 'Admin');
                          showToast('Conflict resolved and student verified!', 'success');
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Alumnus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 relative z-10">
            <span>Showing moderation queue with immediate 1-click execution</span>
            <button
              type="button"
              onClick={() => onNavigateTab('governance')}
              className="font-semibold text-[#8B181B] hover:text-[#721316] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Identity Policies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Tile 2 (col-span-12 lg:col-span-4): Recent User Signups & Quick Verifications */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative overflow-hidden transition-shadow duration-200">
          <GooeyBackground variant="multi" intensity="subtle" />
          
          <div className="relative z-10">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">Recent Signups</h3>
                  <p className="text-[11px] text-stone-500">Newly onboarded Cecilian members</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('users')}
                className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>All Users</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 p-2 sm:p-3">
              {recentUsers.map((u) => (
                <div key={u.uid} className="p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:bg-stone-50/70 rounded-xl transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 shrink-0 border border-stone-200">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{u.name || 'Alumni Member'}</p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {(u.role || 'alumni').toUpperCase()} • {u.course || 'General'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {u.isVerified ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                        Verified ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUserVerified(u.uid, true)}
                        className="px-2.5 py-1 rounded-lg bg-[#8B181B] hover:bg-[#721316] text-white text-[10px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedUserIdForModal(u.uid)}
                      title="View user details"
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Progressive See More for Recent Signups */}
            {users.length > visibleRecentUsersCount && (
              <div className="px-3 pb-3 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleRecentUsersCount((prev) => prev + 5)}
                  className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  See More Recent Signups (+{Math.min(5, users.length - visibleRecentUsersCount)})
                </button>
              </div>
            )}
            {visibleRecentUsersCount > 5 && users.length > 5 && (
              <div className="text-center pb-2">
                <button
                  type="button"
                  onClick={() => setVisibleRecentUsersCount(5)}
                  className="text-[10px] text-stone-400 hover:text-stone-600 underline cursor-pointer"
                >
                  Reset to 5
                </button>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t border-stone-100 relative z-10">
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Browse Full Member Directory ({users.length} Total)
            </button>
          </div>
        </div>

        {/* Bento Tile 3 (col-span-12 lg:col-span-7): Graduation Cohorts Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-shadow duration-200">
          <GooeyBackground variant="crimson" intensity="subtle" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    Graduation Cohorts Distribution
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Alumni headcount across official St. Cecilia graduation batches
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#8B181B] bg-red-50 px-2.5 py-1 rounded-lg border border-red-200/60">
                {cohortData.length} Batches
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="cohort" stroke="#78716C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E4',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Bar dataKey="count" fill="#8B181B" radius={[6, 6, 0, 0]} name="Graduates" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 relative z-10">
            <span>Primary Cohort: Class of {cohortData[cohortData.length - 1]?.cohort || '2026'}</span>
            <button
              type="button"
              onClick={() => onNavigateTab('registry')}
              className="font-semibold text-[#8B181B] hover:text-[#721316] flex items-center gap-1 cursor-pointer"
            >
              <span>View Registrar Records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Tile 4 (col-span-12 lg:col-span-5): Official Registry Verification Standing */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-shadow duration-200">
          <GooeyBackground variant="emerald" intensity="subtle" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    Verification Standing
                  </h3>
                  <p className="text-[11px] text-stone-500">Registry matched vs pending review</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                {verifiedRate}% Official
              </span>
            </div>

            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {verificationRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5E4',
                      borderRadius: '0.75rem',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-extrabold text-stone-900 leading-none">{verifiedRate}%</span>
                <span className="text-[10px] font-semibold text-stone-500 uppercase mt-0.5">Verified</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-3 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#8B181B]" />
                <span className="text-stone-700 font-medium">
                  Verified ({verifiedCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-stone-300" />
                <span className="text-stone-700 font-medium">
                  Pending ({users.length - verifiedCount})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 relative z-10">
            <button
              type="button"
              onClick={() => onNavigateTab('governance')}
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Configure Accreditation Rules
            </button>
          </div>
        </div>

        {/* Bento Tile 5 (col-span-12 lg:col-span-6): Top Academic Programs */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] p-5 sm:p-6 flex flex-col justify-between transition-shadow duration-200 relative overflow-hidden">
          <GooeyBackground variant="amber" intensity="subtle" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    Academic Degree Programs
                  </h3>
                  <p className="text-[11px] text-stone-500">Distribution of Cecilian alumni by academic discipline</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                {departmentData.length} Colleges
              </span>
            </div>

            <div className="space-y-3">
              {departmentData.map((d) => (
                <div key={d.dept} className="p-3 bg-stone-50/70 hover:bg-stone-50 rounded-xl border border-stone-200/70 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-stone-900 truncate max-w-[240px]">{d.dept}</span>
                    <span className="font-mono font-bold text-[#8B181B]">{d.count} ({d.percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#8B181B] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 relative z-10">
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Filter Members by Academic Discipline
            </button>
          </div>
        </div>

        {/* Bento Tile 6 (col-span-12 lg:col-span-6): Live Governance Audit Trail */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-shadow duration-200">
          <GooeyBackground variant="crimson" intensity="subtle" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">
                    Governance Audit Trail
                  </h3>
                  <p className="text-[11px] text-stone-500">Real-time tamper-evident system compliance log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('audit')}
                className="text-xs text-[#8B181B] hover:text-[#721316] font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {recentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 text-xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">{log.details || log.action}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      By <strong className="text-stone-600 font-medium">{log.actorName}</strong> • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700 shrink-0 border border-stone-200/70">
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 relative z-10">
            <button
              type="button"
              onClick={() => onNavigateTab('audit')}
              className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/80 rounded-xl text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Export System Audit Logs (CSV / Compliance)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
