import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Inbox,
  AlertTriangle,
  Building2,
  Briefcase,
  CheckCircle2,
  Database,
  Lock,
  FileCheck2,
  Scale
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { getRegistrationConflicts } from '../../services/studentVerificationService';
import {
  calculateGovernanceIntegrityMetrics,
  getGovernancePolicies
} from '../../services/governanceLogicService';
import { AdminRequestsInbox } from './AdminRequestsInbox';
import { AdminConflictResolutionView } from './AdminConflictResolutionView';
import { GooeyBackground } from '../common/GooeyBackground';

interface AdminGovernanceViewProps {
  initialSubTab?: 'alumni' | 'conflicts' | 'employers' | 'jobs' | 'requests' | 'identity';
}

/**
 * Unified Verification & Identity Management Module
 * Consolidates Alumni Identity Verification, Registrar Discrepancy Intelligence,
 * Duplicate Student ID Conflict Resolution, and Partner Moderation into a single workspace.
 */
export const AdminGovernanceView: React.FC<AdminGovernanceViewProps> = ({
  initialSubTab = 'identity'
}) => {
  const { users, opportunities, currentUser } = useAlumni();

  // Determine top-level module tab and sub-mode
  const isConflictInit = initialSubTab === 'conflicts';
  const defaultTab =
    initialSubTab === 'employers'
      ? 'employers'
      : initialSubTab === 'jobs'
      ? 'jobs'
      : 'identity';

  const [subTab, setSubTab] = useState<'identity' | 'employers' | 'jobs'>(defaultTab);
  const [identityViewMode, setIdentityViewMode] = useState<'verification' | 'conflicts'>(
    isConflictInit ? 'conflicts' : 'verification'
  );

  // Compute pending items for verification
  const pendingUsers = useMemo(() => users.filter((u) => !u.isVerified && u.role === 'alumni'), [users]);
  const pendingEmployers = useMemo(
    () => users.filter((u) => u.role === 'employer' && u.employerVerificationStatus === 'pending_verification'),
    [users]
  );
  const pendingJobs = useMemo(
    () => (opportunities || []).filter((o) => o.approvalStatus === 'pending_approval'),
    [opportunities]
  );
  const totalRequests = pendingUsers.length + pendingEmployers.length + pendingJobs.length;

  // Compute pending conflicts
  const conflicts = useMemo(() => {
    try {
      return getRegistrationConflicts();
    } catch {
      return [];
    }
  }, []);

  const pendingConflictsCount = useMemo(
    () => conflicts.filter((c) => c.status === 'pending').length,
    [conflicts]
  );

  // High-Logic Governance Metrics
  const integrityMetrics = useMemo(() => {
    return calculateGovernanceIntegrityMetrics(users, conflicts);
  }, [users, conflicts]);

  // Background security rules & policies remain active and enforced
  const activePolicies = useMemo(() => getGovernancePolicies(), []);

  // Strict RBAC: Verification & Identity Management is restricted to Administrators
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-lg mx-auto shadow-2xs space-y-3 my-8">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto border border-stone-200">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-stone-900 font-serif">Access Restricted</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Verification & Identity Management is restricted to System Administrators and Registrar Officers only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bento Header & Executive Health Strip */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)] space-y-6">
        {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        <GooeyBackground variant="crimson" intensity="subtle" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span className="text-[#8B181B] font-bold">St. Cecilia's College</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Governance & Compliance</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Verification Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              Verification & Identity Management
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Unified portal for alumni identity verification, registrar cross-validation, duplicate ID conflict resolution, and partner accreditation moderation.
            </p>
          </div>

          {/* Real-Time Security Status Badges */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
              Identity Screen: Active
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                pendingConflictsCount > 0
                  ? 'bg-rose-50 text-rose-900 border-rose-200/80'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200/80'
              }`}
            >
              Conflict Desk: Online
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-900 text-white flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Gate Enforced</span>
            </span>
          </div>
        </div>

        {/* High-Logic Executive Integrity Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-stone-200/70">
          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-[#8B181B]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Registry Purity
              </span>
              <Database className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900">
                {integrityMetrics.purityScore}%
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Matched</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Official Registrar Alignment</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Perfect Matches
              </span>
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-700">
                {integrityMetrics.perfectMatchesCount}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% ID+Name</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Ready for 1-Click Auto-Reconcile</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Discrepancies
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-amber-700">
                {integrityMetrics.discrepanciesCount}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Quarantined</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Name/Degree variances flagged</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                ID Collisions
              </span>
              <Scale className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${pendingConflictsCount > 0 ? 'text-rose-600' : 'text-stone-900'}`}>
                {pendingConflictsCount}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">Disputes</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Duplicate ID registrations</p>
          </div>
        </div>

        {/* Unified Tab Navigation Bar */}
        <div className="relative z-10 flex items-center gap-2 border-b border-stone-200/80 pt-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSubTab('identity')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subTab === 'identity'
                ? 'border-[#8B181B] text-[#8B181B]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification & Identity</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subTab === 'identity' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {pendingUsers.length + pendingConflictsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('employers')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subTab === 'employers'
                ? 'border-[#8B181B] text-[#8B181B]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Employer Accreditations</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subTab === 'employers' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {pendingEmployers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('jobs')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subTab === 'jobs'
                ? 'border-[#8B181B] text-[#8B181B]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Postings</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subTab === 'jobs' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {pendingJobs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {subTab === 'identity' && (
        <div className="space-y-4">
          {/* Sub-selector for Verification Queue vs Conflicts & Overrides */}
          <div className="bg-stone-100/90 p-1.5 rounded-xl flex items-center gap-1.5 w-fit border border-stone-200/80">
            <button
              type="button"
              onClick={() => setIdentityViewMode('verification')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                identityViewMode === 'verification'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-[#8B181B]" />
              <span>Verification & Discrepancies</span>
            </button>
            <button
              type="button"
              onClick={() => setIdentityViewMode('conflicts')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                identityViewMode === 'conflicts'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Identity Conflicts & Overrides</span>
            </button>
          </div>

          {identityViewMode === 'verification' ? (
            <AdminRequestsInbox
              viewMode="alumni"
              onSwitchToConflicts={() => setIdentityViewMode('conflicts')}
            />
          ) : (
            <AdminConflictResolutionView />
          )}
        </div>
      )}

      {subTab === 'employers' && (
        <div>
          <AdminRequestsInbox
            viewMode="employers"
          />
        </div>
      )}

      {subTab === 'jobs' && (
        <div>
          <AdminRequestsInbox
            viewMode="jobs"
          />
        </div>
      )}
    </div>
  );
};

// Aliases for full backward compatibility across routing
export const AdminVerificationAndIdentityView = AdminGovernanceView;
export const AdminRequestsAndConflictsView = AdminGovernanceView;
