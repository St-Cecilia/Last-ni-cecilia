/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  UserCheck,
  UserPlus,
  Clock,
  Check,
  X,
  MapPin,
  Building2,
  GraduationCap,
  Filter,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Compass,
  BookOpen,
  Briefcase,
  ChevronRight,
  Award,
  ArrowUpRight,
  CheckCircle2,
  Share2,
  Heart
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { UserProfile } from '../../types';
import { getStatusConfig, QUICK_STATUS_OPTIONS, QuickStatusSelector } from '../dashboard/QuickStatusSelector';

export const NetworkView: React.FC = () => {
  const {
    currentUser,
    users,
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    sendFriendRequest,
    isConnected,
    hasPendingRequestWith,
    connectionIds,
    getOrCreateChat,
    setActiveTab,
    setSelectedUserIdForModal,
  } = useAlumni();

  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'recommended' | 'connections' | 'requests'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Progressive "See More" visibility limits (prevent displaying all at once)
  const [visibleDirectoryCount, setVisibleDirectoryCount] = useState<number>(9);
  const [visibleRecommendedCount, setVisibleRecommendedCount] = useState<number>(6);
  const [visibleConnectionsCount, setVisibleConnectionsCount] = useState<number>(9);

  // Reset directory pagination when any filter changes
  React.useEffect(() => {
    setVisibleDirectoryCount(9);
  }, [searchQuery, selectedBatch, selectedCourse, selectedRole, selectedStatus]);

  // Distinct batches and courses for filter dropdowns
  const allBatches = useMemo(() => {
    const batches = Array.from(new Set(users.map((u) => u.batch).filter(Boolean)));
    return ['all', ...batches.sort().reverse()];
  }, [users]);

  const allCourses = useMemo(() => {
    const courses = Array.from(new Set(users.map((u) => u.course).filter(Boolean)));
    return ['all', ...courses.sort()];
  }, [users]);

  // Received and Sent Requests
  const receivedRequests = useMemo(() => {
    return friendRequests
      .filter((r) => r.toUid === currentUser?.uid && r.status === 'pending')
      .map((r) => ({
        request: r,
        user: users.find((u) => u.uid === r.fromUid)
      }))
      .filter((item): item is { request: typeof item.request; user: UserProfile } => Boolean(item.user));
  }, [friendRequests, currentUser, users]);

  const sentRequests = useMemo(() => {
    return friendRequests
      .filter((r) => r.fromUid === currentUser?.uid && r.status === 'pending')
      .map((r) => ({
        request: r,
        user: users.find((u) => u.uid === r.toUid)
      }))
      .filter((item): item is { request: typeof item.request; user: UserProfile } => Boolean(item.user));
  }, [friendRequests, currentUser, users]);

  // Connections List
  const connectedUsers = useMemo(() => {
    return users.filter((u) => (connectionIds || []).includes(u.uid));
  }, [users, connectionIds]);

  // Recommended Friends / People You May Know
  const recommendedUsers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter((u) => {
      if (u.uid === currentUser.uid) return false;
      if ((connectionIds || []).includes(u.uid)) return false;
      const sameBatch = u.batch && currentUser.batch && u.batch === currentUser.batch;
      const sameCourse = u.course && currentUser.course && (u.course || '').toLowerCase() === (currentUser.course || '').toLowerCase();
      const sameLocation = u.location && currentUser.location && (u.location || '').toLowerCase().includes((currentUser.location || '').toLowerCase());
      return sameBatch || sameCourse || sameLocation;
    });
  }, [users, currentUser, connectionIds]);

  // Spotlight Alumnus / Community Mentor: An inspiring Cecilian
  const spotlightAlumnus = useMemo(() => {
    // Pick an alumnus with rich headline, verified status, or employer/mentor background
    const candidates = users.filter((u) => u.uid !== currentUser?.uid && (u.isVerified || u.company || u.quickStatus === 'Mentoring' || u.quickStatus === 'Hiring'));
    return candidates.length > 0 ? candidates[0] : users.find((u) => u.uid !== currentUser?.uid);
  }, [users, currentUser]);

  // Filtered Directory - findable across all attributes
  const filteredDirectory = useMemo(() => {
    return users.filter((u) => {
      // Exclude self if logged in
      if (currentUser?.uid && u.uid === currentUser.uid) return false;

      const q = searchQuery.toLowerCase().trim();
      const isAllAlumniQuery =
        q === 'all' ||
        q === 'all alumni' ||
        q === 'alumni' ||
        q === 'alumnus' ||
        q === 'all graduates' ||
        q === 'graduates';

      const matchesSearch =
        !q ||
        (isAllAlumniQuery && (u.role === 'alumni' || u.role === 'student' || !u.role)) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.course || '').toLowerCase().includes(q) ||
        (u.headline || '').toLowerCase().includes(q) ||
        (u.location || '').toLowerCase().includes(q) ||
        (u.batch || '').includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.studentId || '').toLowerCase().includes(q) ||
        (u.employeeId || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.about || '').toLowerCase().includes(q) ||
        (u.bio || '').toLowerCase().includes(q) ||
        (u.currentPosition || '').toLowerCase().includes(q) ||
        (u.company || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (u.skills || []).some((s) => s.toLowerCase().includes(q)) ||
        (u.experience || []).some(
          (e) =>
            (e.company || '').toLowerCase().includes(q) ||
            (e.title || '').toLowerCase().includes(q) ||
            (e.description || '').toLowerCase().includes(q)
        ) ||
        (u.education || []).some(
          (ed) =>
            (ed.degree || '').toLowerCase().includes(q) ||
            (ed.fieldOfStudy || '').toLowerCase().includes(q) ||
            (ed.institution || '').toLowerCase().includes(q)
        );

      const matchesBatch = selectedBatch === 'all' || u.batch === selectedBatch;
      const matchesCourse = selectedCourse === 'all' || u.course === selectedCourse;
      const matchesRole =
        selectedRole === 'all' ||
        u.role === selectedRole ||
        (selectedRole === 'alumni' && (u.role === 'alumni' || !u.role));
      const matchesStatus =
        selectedStatus === 'all' ||
        u.quickStatus === selectedStatus;

      return matchesSearch && matchesBatch && matchesCourse && matchesRole && matchesStatus;
    });
  }, [users, currentUser, searchQuery, selectedBatch, selectedCourse, selectedRole, selectedStatus]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Collegiate Institutional Header Banner - Styled identically to Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)]"
      >
        {/* St. Cecilia Deep Crimson Architectural Top Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Header Identity Column */}
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                <span className="text-[#8B181B] font-bold">St. Cecilia's College - Cebu, Inc.</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Office of Alumni Relations</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-400">Verified Registry</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
                    Alumni Directory & Network
                  </h1>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Connect and collaborate with verified graduates of St. Cecilia's College across cohorts, degree programs, and global chapters.
              </p>
            </div>

            {/* Quick Status Bar & Subtab Switcher */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
              {currentUser && (
                <div className="flex items-center gap-2 text-xs text-stone-600 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  <span className="text-[11px] font-semibold text-stone-500">Your Status:</span>
                  <QuickStatusSelector compact />
                </div>
              )}

              {/* Sub-tab switcher with zero-pill discipline */}
              <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('directory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'directory'
                      ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/70'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Directory</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    activeSubTab === 'directory'
                      ? 'bg-red-50 text-[#8B181B] border border-red-200/70'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}>
                    {filteredDirectory.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('recommended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'recommended'
                      ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/70'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    activeSubTab === 'recommended'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200/70'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}>
                    {recommendedUsers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('connections')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'connections'
                      ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/70'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>My Network</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    activeSubTab === 'connections'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/70'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}>
                    {connectedUsers.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('requests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeSubTab === 'requests'
                      ? 'bg-white text-stone-900 shadow-2xs border border-stone-200/70'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Inquiries</span>
                  {receivedRequests.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#8B181B] text-white">
                      {receivedRequests.length}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-medium bg-stone-200/70 text-stone-500">
                      0
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Network Census Bento Strip - With Framer Motion hover lift & soft diffusion shadow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Census Tile 1: Total Registered Alumni */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] relative overflow-hidden group hover:border-[#8B181B]/40 transition-all duration-200"
        >
          <div className="h-0.5 w-full bg-[#8B181B]/40 group-hover:bg-[#8B181B] transition-colors absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Cecilians</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#8B181B] border border-red-100 flex items-center justify-center shrink-0 group-hover:bg-[#8B181B] group-hover:text-white transition-colors duration-200 shadow-2xs">
              <Users className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {users.filter((u) => u.uid !== currentUser?.uid).length}
            </span>
            <span className="text-[10px] font-semibold text-[#8B181B] bg-red-50/90 border border-red-200/60 px-2 py-0.5 rounded-md">
              Verified Roster
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-1">Campus-authenticated graduate accounts</p>
        </motion.div>

        {/* Census Tile 2: Direct Network Links */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] relative overflow-hidden group hover:border-emerald-300 transition-all duration-200"
        >
          <div className="h-0.5 w-full bg-emerald-600/40 group-hover:bg-emerald-600 transition-colors absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Direct Links</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-200 shadow-2xs">
              <UserCheck className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{connectedUsers.length}</span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              Connected
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-1">Direct messaging and profile access</p>
        </motion.div>

        {/* Census Tile 3: Batch & Degree Recommendations */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] relative overflow-hidden group hover:border-amber-300 transition-all duration-200"
        >
          <div className="h-0.5 w-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Batch & Degree</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
              <GraduationCap className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{recommendedUsers.length}</span>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-50/90 border border-amber-200/60 px-2 py-0.5 rounded-md">
              Suggested
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-1">Peers sharing your cohort or discipline</p>
        </motion.div>

        {/* Census Tile 4: Pending Inquiries */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
          onClick={() => setActiveSubTab('requests')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] relative overflow-hidden group hover:border-purple-300 transition-all duration-200 cursor-pointer"
        >
          <div className="h-0.5 w-full bg-purple-500/40 group-hover:bg-purple-500 transition-colors absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Pending Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 border border-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200 shadow-2xs">
              <Clock className="w-4 h-4 stroke-[1.75]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">{receivedRequests.length}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
              receivedRequests.length > 0
                ? 'text-purple-800 bg-purple-50 border-purple-200'
                : 'text-stone-500 bg-stone-100 border-stone-200'
            }`}>
              {receivedRequests.length > 0 ? 'Awaiting Action' : 'All Clear'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-1">Incoming connection requests</p>
        </motion.div>
      </div>

      {/* TAB 1: DIRECTORY SEARCH & BENTO SHOWCASE */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Spotlight Bento Tier: Alumnus Spotlight (Collegiate Lead) + Chapter Hubs */}
          {spotlightAlumnus && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Spotlight Lead Alumnus Card (8 Cols) */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="lg:col-span-8 bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between relative overflow-hidden transition-shadow duration-200"
              >
                <div className="h-1 bg-gradient-to-r from-[#8B181B] via-amber-600 to-[#8B181B] absolute top-0 left-0 right-0" />

                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#8B181B] border border-red-200/70">
                        <Award className="w-3.5 h-3.5 text-[#8B181B]" />
                        Spotlight Cecilian
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500 font-medium">Alumni Community Spotlight</span>
                    </div>

                    {spotlightAlumnus.quickStatus && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        getStatusConfig(spotlightAlumnus.quickStatus).badgeBg
                      } ${getStatusConfig(spotlightAlumnus.quickStatus).badgeBorder} ${
                        getStatusConfig(spotlightAlumnus.quickStatus).badgeText
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusConfig(spotlightAlumnus.quickStatus).dotColor}`} />
                        <span>{spotlightAlumnus.quickStatus}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={spotlightAlumnus.profilePictureUrl}
                        alt={spotlightAlumnus.name}
                        onClick={() => setSelectedUserIdForModal(spotlightAlumnus.uid)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white shadow-sm border border-stone-200/80 cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      {spotlightAlumnus.isVerified && (
                        <span
                          title="Verified Cecilian Graduate"
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-2xs"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          onClick={() => setSelectedUserIdForModal(spotlightAlumnus.uid)}
                          className="text-lg sm:text-xl font-bold text-stone-900 hover:text-[#8B181B] cursor-pointer tracking-tight transition-colors truncate"
                        >
                          {spotlightAlumnus.name}
                        </h3>
                        <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                          Class of {spotlightAlumnus.batch || '2024'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#8B181B] mt-0.5">
                        {spotlightAlumnus.course || 'Bachelor of Science Graduate'}
                      </p>

                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {spotlightAlumnus.headline || spotlightAlumnus.about || spotlightAlumnus.bio || 'Proud graduate of St. Cecilia’s College, contributing to regional enterprise and professional excellence.'}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                        {spotlightAlumnus.company && (
                          <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                            <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            {spotlightAlumnus.company}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          {spotlightAlumnus.location || 'Minglanilla, Cebu'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-stone-500">
                    Recognized for active institutional participation and mentorship
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserIdForModal(spotlightAlumnus.uid)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                    {isConnected(spotlightAlumnus.uid) ? (
                      <button
                        type="button"
                        onClick={() => {
                          getOrCreateChat(spotlightAlumnus.uid);
                          setActiveTab('messages');
                        }}
                        className="px-4 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendFriendRequest(spotlightAlumnus.uid)}
                        className="px-4 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Regional Chapters & Degree Hubs Bento Card (4 Cols) */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-between transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Compass className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 tracking-tight">Academic Hubs</h3>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      Quick Filter
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-2.5">
                    Filter directory by core collegiate faculties:
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {[
                      { name: 'Information Technology', icon: Sparkles, count: users.filter((u) => (u.course || '').includes('Information') || (u.course || '').includes('IT')).length },
                      { name: 'Computer Science', icon: BookOpen, count: users.filter((u) => (u.course || '').includes('Computer')).length },
                      { name: 'Criminology', icon: ShieldCheck, count: users.filter((u) => (u.course || '').includes('Criminology')).length },
                      { name: 'Business Administration', icon: Briefcase, count: users.filter((u) => (u.course || '').includes('Business') || (u.course || '').includes('BSBA')).length },
                    ].map((hub) => (
                      <button
                        key={hub.name}
                        type="button"
                        onClick={() => setSearchQuery(hub.name)}
                        className="w-full p-2 rounded-xl bg-stone-50/70 hover:bg-red-50/60 border border-stone-200/60 hover:border-red-200/80 transition-colors flex items-center justify-between text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <hub.icon className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#8B181B] transition-colors shrink-0" />
                          <span className="text-xs font-medium text-stone-800 group-hover:text-[#8B181B] transition-colors truncate">
                            {hub.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-stone-500 group-hover:text-[#8B181B] bg-white px-2 py-0.5 rounded-md border border-stone-200/70 shrink-0">
                          {hub.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRole('all');
                      setSelectedBatch('all');
                      setSelectedCourse('all');
                      setSelectedStatus('all');
                    }}
                    className="w-full py-1.5 text-center text-xs font-semibold text-[#8B181B] hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All Hub Filters
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Search & Filters Controls Bento Tile */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-shadow duration-200 space-y-3.5"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alumni by name, course, batch, company, or location..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#8B181B]/20 focus:border-[#8B181B] placeholder:text-stone-400 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 text-xs bg-stone-50 border border-stone-200/90 rounded-xl text-stone-700 focus:outline-hidden focus:border-[#8B181B] cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="alumni">Alumni Only</option>
                  <option value="registrar">Registrar / Staff</option>
                  <option value="admin">Administrators</option>
                </select>

                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 text-xs bg-stone-50 border border-stone-200/90 rounded-xl text-stone-700 focus:outline-hidden focus:border-[#8B181B] cursor-pointer"
                >
                  <option value="all">All Batches</option>
                  {allBatches.filter((b) => b !== 'all').map((b) => (
                    <option key={b} value={b}>
                      Batch {b}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 text-xs bg-stone-50 border border-stone-200/90 rounded-xl text-stone-700 focus:outline-hidden focus:border-[#8B181B] md:max-w-[170px] truncate cursor-pointer"
                >
                  <option value="all">All Disciplines</option>
                  {allCourses.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 text-xs bg-stone-50 border border-stone-200/90 rounded-xl text-stone-700 focus:outline-hidden focus:border-[#8B181B] cursor-pointer"
                >
                  <option value="all">Any Status</option>
                  {QUICK_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {(searchQuery || selectedBatch !== 'all' || selectedCourse !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBatch('all');
                      setSelectedCourse('all');
                      setSelectedRole('all');
                      setSelectedStatus('all');
                    }}
                    className="col-span-2 sm:col-span-4 md:col-span-1 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-[#8B181B] bg-stone-100 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-center"
                    title="Reset all filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Tag Directives with zero-pill styling */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1 border-t border-stone-100">
              <span className="text-stone-400 text-[11px] font-semibold shrink-0 flex items-center gap-1 pr-1">
                <Filter className="w-3 h-3 stroke-[1.75]" /> Directives:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRole('all');
                  setSelectedBatch('all');
                  setSelectedCourse('all');
                  setSelectedStatus('all');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  !searchQuery && selectedRole === 'all' && selectedBatch === 'all' && selectedCourse === 'all' && selectedStatus === 'all'
                    ? 'bg-[#8B181B] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                All Alumni ({users.filter((u) => u.uid !== currentUser?.uid).length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Open to Networking')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'Open to Networking'
                    ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Open to Networking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Mentoring')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'Mentoring'
                    ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                    : 'bg-teal-50 text-teal-800 border border-teal-200/70 hover:bg-teal-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Mentors Available</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('Hiring')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === 'Hiring'
                    ? 'bg-purple-700 text-white font-semibold shadow-2xs'
                    : 'bg-purple-50 text-purple-800 border border-purple-200/70 hover:bg-purple-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Actively Hiring</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBatch('2024')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedBatch === '2024'
                    ? 'bg-[#8B181B] text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                Batch 2024
              </button>

              <button
                type="button"
                onClick={() => setSelectedBatch('2023')}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedBatch === '2023'
                    ? 'bg-[#8B181B] text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                Batch 2023
              </button>
            </div>
          </motion.div>

          {/* Directory Cards Bento Grid */}
          {filteredDirectory.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
              <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">No alumni match the specified criteria</p>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                Try searching with different keywords, clear batch selections, or broaden your degree filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBatch('all');
                  setSelectedCourse('all');
                  setSelectedRole('all');
                  setSelectedStatus('all');
                }}
                className="mt-4 px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDirectory.slice(0, visibleDirectoryCount).map((user) => {
                const connected = isConnected(user.uid);
                const reqState = hasPendingRequestWith(user.uid);
                const statusConfig = getStatusConfig(user.quickStatus);

                return (
                  <motion.div
                    key={user.uid}
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-stone-300/90 transition-all duration-200 overflow-hidden flex flex-col justify-between relative group"
                  >
                    {/* Institutional top accent line */}
                    <div className="h-0.5 w-full bg-[#8B181B]/40 group-hover:bg-[#8B181B] transition-colors absolute top-0 left-0 right-0" />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.profilePictureUrl}
                            alt={user.name}
                            onClick={() => setSelectedUserIdForModal(user.uid)}
                            className="w-13 h-13 rounded-xl object-cover ring-1 ring-stone-200 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          {/* Live color-coded availability indicator dot */}
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-2xs">
                            <span className={`block h-2.5 w-2.5 rounded-full ${statusConfig.dotColor}`} />
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-bold text-stone-700 bg-stone-100/90 border border-stone-200/80 px-2 py-0.5 rounded-lg">
                            Class of {user.batch || '2024'}
                          </span>
                          {user.department && (
                            <span className="text-[10px] font-semibold text-[#8B181B] bg-red-50/90 border border-red-200/60 px-2 py-0.5 rounded-md">
                              {user.department}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3
                            onClick={() => setSelectedUserIdForModal(user.uid)}
                            className="font-bold text-sm text-stone-900 hover:text-[#8B181B] cursor-pointer transition-colors truncate"
                          >
                            {user.name}
                          </h3>
                          {user.isVerified && (
                            <span title="Verified Cecilian Record" className="text-emerald-600 shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-[#8B181B] mt-0.5 truncate">
                          {user.course || 'Degree Program Graduate'}
                        </p>

                        <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {user.headline || user.currentPosition || (user.company ? `At ${user.company}` : 'St. Cecilia’s College Alumnus')}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-stone-400">
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{user.location || 'Minglanilla, Cebu'}</span>
                          </div>

                          {user.quickStatus && (
                            <span className={`text-[10px] font-medium px-2 py-0.2 rounded-md border shrink-0 ${statusConfig.badgeBg} ${statusConfig.badgeBorder} ${statusConfig.badgeText}`}>
                              {user.quickStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar Footer */}
                    <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserIdForModal(user.uid)}
                        className="flex-1 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/70 bg-white border border-stone-200/80 rounded-xl text-center transition-colors cursor-pointer"
                      >
                        Profile
                      </button>

                      {connected ? (
                        <button
                          type="button"
                          onClick={() => {
                            getOrCreateChat(user.uid);
                            setActiveTab('messages');
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      ) : reqState === 'sent' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const req = friendRequests.find(
                              (r) => r.fromUid === currentUser?.uid && r.toUid === user.uid && r.status === 'pending'
                            );
                            if (req) cancelFriendRequest(req.id);
                          }}
                          className="flex-1 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-red-50 hover:text-red-700 border border-amber-200/80 hover:border-red-200 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Click to cancel pending request"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending</span>
                        </button>
                      ) : reqState === 'received' ? (
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('requests')}
                          className="flex-1 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Respond</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendFriendRequest(user.uid)}
                          className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#8B181B] hover:bg-[#721316] rounded-xl flex items-center justify-center gap-1 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Progressive "See More" Controls for Students & Alumni */}
          {filteredDirectory.length > visibleDirectoryCount && (
            <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/70 p-4 sm:p-5 rounded-2xl">
              <div className="text-xs text-stone-600 text-center sm:text-left">
                Showing <strong className="text-stone-900 font-bold">{Math.min(visibleDirectoryCount, filteredDirectory.length)}</strong> of{' '}
                <strong className="text-stone-900 font-bold">{filteredDirectory.length}</strong> Cecilians
                <div className="w-48 sm:w-64 bg-stone-200 rounded-full h-1.5 mt-1.5 overflow-hidden mx-auto sm:mx-0">
                  <div
                    className="bg-[#8B181B] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(Math.min(visibleDirectoryCount, filteredDirectory.length) / filteredDirectory.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleDirectoryCount((prev) => prev + 9)}
                  className="px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>See More Students & Alumni</span>
                  <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                    +{Math.min(9, filteredDirectory.length - visibleDirectoryCount)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibleDirectoryCount(filteredDirectory.length)}
                  className="px-3.5 py-2 bg-white border border-stone-200/80 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Show All ({filteredDirectory.length})
                </button>
              </div>
            </div>
          )}

          {visibleDirectoryCount > 9 && filteredDirectory.length > 9 && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleDirectoryCount(9)}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium underline cursor-pointer"
              >
                Show Less (Collapse)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMMENDED BATCHMATES & DEGREE PEERS */}
      {activeSubTab === 'recommended' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Recommended Cohort Batchmates & Degree Peers ({recommendedUsers.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Alumni from your graduation batch, academic discipline, and nearby Cebu chapters
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('directory')}
              className="text-xs font-semibold text-[#8B181B] hover:text-[#721316] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Alumni</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recommendedUsers.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
              <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">No new recommendations available</p>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                You are either linked with all batchmates or need to update your degree in your profile.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="mt-4 px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Browse Full Directory
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {recommendedUsers.slice(0, visibleRecommendedCount).map((user) => {
                const reqState = hasPendingRequestWith(user.uid);
                const isSameBatch = user.batch && currentUser?.batch && user.batch === currentUser.batch;
                const isSameCourse = user.course && currentUser?.course && user.course.toLowerCase() === currentUser.course.toLowerCase();
                const statusConfig = getStatusConfig(user.quickStatus);

                return (
                  <motion.div
                    key={user.uid}
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-stone-300/90 transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
                  >
                    <div className="h-0.5 w-full bg-amber-500/60 group-hover:bg-amber-600 transition-colors absolute top-0 left-0 right-0" />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.profilePictureUrl}
                            alt={user.name}
                            onClick={() => setSelectedUserIdForModal(user.uid)}
                            className="w-13 h-13 rounded-xl object-cover ring-1 ring-stone-200 cursor-pointer hover:opacity-90"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-2xs">
                            <span className={`block h-2.5 w-2.5 rounded-full ${statusConfig.dotColor}`} />
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {isSameBatch && (
                            <span className="text-[10px] font-bold text-[#8B181B] bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md">
                              Batchmate ('{user.batch?.slice(-2) || '24'})
                            </span>
                          )}
                          {isSameCourse && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                              Same Discipline
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <h4
                          onClick={() => setSelectedUserIdForModal(user.uid)}
                          className="text-sm font-bold text-stone-900 hover:text-[#8B181B] cursor-pointer truncate"
                        >
                          {user.name}
                        </h4>
                        <p className="text-xs font-semibold text-[#8B181B] mt-0.5 truncate">
                          {user.course || 'Alumnus'}
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                          {user.headline || user.currentPosition || 'St. Cecilia’s College Alumnus'}
                        </p>
                        {user.location && (
                          <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{user.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserIdForModal(user.uid)}
                        className="flex-1 py-1.5 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200/80 rounded-xl text-center transition-colors cursor-pointer"
                      >
                        Profile
                      </button>

                      {reqState === 'sent' ? (
                        <span className="flex-1 py-1.5 text-xs font-semibold text-stone-500 bg-stone-100 border border-stone-200 rounded-xl text-center">
                          Pending
                        </span>
                      ) : reqState === 'received' ? (
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('requests')}
                          className="flex-1 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl text-center shadow-2xs cursor-pointer"
                        >
                          Respond
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendFriendRequest(user.uid)}
                          className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#8B181B] hover:bg-[#721316] rounded-xl text-center shadow-2xs flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* See More for Recommended */}
          {recommendedUsers.length > visibleRecommendedCount && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleRecommendedCount((prev) => prev + 6)}
                className="px-5 py-2 bg-white border border-stone-200/80 hover:bg-stone-50 text-[#8B181B] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                See More Recommendations (+{Math.min(6, recommendedUsers.length - visibleRecommendedCount)})
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONNECTIONS (MY NETWORK) */}
      {activeSubTab === 'connections' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Your Confirmed Alumni Network ({connectedUsers.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Mutual collegiate connections with direct messaging, profile credentials, and shared updates
              </p>
            </div>
          </div>

          {connectedUsers.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
              <UserCheck className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">No confirmed connections yet</p>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                Explore the alumni directory above and send connection requests to your batchmates and faculty mentors.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="mt-4 px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Browse Alumni Directory
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {connectedUsers.map((user) => {
                const statusConfig = getStatusConfig(user.quickStatus);

                return (
                  <motion.div
                    key={user.uid}
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] hover:border-stone-300/90 transition-all duration-200 p-5 flex flex-col justify-between relative group overflow-hidden"
                  >
                    <div className="h-0.5 w-full bg-emerald-600/60 group-hover:bg-emerald-600 transition-colors absolute top-0 left-0 right-0" />

                    <div>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.profilePictureUrl}
                            alt={user.name}
                            onClick={() => setSelectedUserIdForModal(user.uid)}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-stone-200 cursor-pointer"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-2xs">
                            <span className={`block h-2 w-2 rounded-full ${statusConfig.dotColor}`} />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3
                              onClick={() => setSelectedUserIdForModal(user.uid)}
                              className="font-bold text-sm text-stone-900 hover:text-[#8B181B] cursor-pointer truncate"
                            >
                              {user.name}
                            </h3>
                            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded shrink-0">
                              '{user.batch?.slice(-2) || '24'}
                            </span>
                          </div>
                          <p className="text-xs text-[#8B181B] font-semibold truncate">{user.course}</p>
                          <p className="text-[11px] text-stone-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{user.location || 'Minglanilla, Cebu'}</span>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                        {user.headline || user.currentPosition || 'Verified Cecilian Alumnus'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          getOrCreateChat(user.uid);
                          setActiveTab('messages');
                        }}
                        className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#8B181B] hover:bg-[#721316] rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserIdForModal(user.uid)}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 4: REQUESTS (RECEIVED & SENT) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Requests Bento Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="h-1 bg-amber-500 absolute top-0 left-0 right-0" />
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    Received Connection Inquiries ({receivedRequests.length})
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Graduates requesting to link directly with your alumni registry record
                  </p>
                </div>
              </div>
            </div>

            {receivedRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/60 rounded-xl border border-stone-100">
                No pending requests received at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {receivedRequests.map(({ request, user }) => (
                  <motion.div
                    key={request.id}
                    whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-stone-50/70 hover:bg-stone-50 rounded-xl border border-stone-200/80 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => setSelectedUserIdForModal(user.uid)}
                    >
                      <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 hover:text-[#8B181B] truncate">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          Batch {user.batch || '2024'} · {user.course || 'Graduate'}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate mt-0.5">{user.headline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptFriendRequest(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => declineFriendRequest(request.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests Bento Section */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="h-1 bg-stone-300 absolute top-0 left-0 right-0" />
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    Sent Inquiries Awaiting Response ({sentRequests.length})
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Connection requests you initiated that are pending recipient confirmation
                  </p>
                </div>
              </div>
            </div>

            {sentRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/60 rounded-xl border border-stone-100">
                You have no pending requests sent to other alumni.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sentRequests.map(({ request, user }) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3.5 bg-stone-50/70 rounded-xl border border-stone-200/80"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                      onClick={() => setSelectedUserIdForModal(user.uid)}
                    >
                      <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 hover:text-[#8B181B] truncate">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          Batch {user.batch || '2024'} · {user.course || 'Graduate'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => cancelFriendRequest(request.id)}
                      className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200/80 rounded-lg font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
