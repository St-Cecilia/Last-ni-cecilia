import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  Users,
  Building2,
  Briefcase,
  Check,
  X,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import {
  analyzeUserRegistryIntegrity,
  RegistryDiscrepancyAnalysis
} from '../../services/governanceLogicService';
import { Skiper23MinimalCardExpand } from '../ui/skiper-ui/skiper23';

interface AdminRequestsInboxProps {
  onSwitchToConflicts?: () => void;
  viewMode?: 'alumni' | 'employers' | 'jobs' | 'all';
  showHeader?: boolean;
}

export const AdminRequestsInbox: React.FC<AdminRequestsInboxProps> = ({
  onSwitchToConflicts,
  viewMode = 'all',
  showHeader = false
}) => {
  const {
    users,
    opportunities,
    setUserVerified,
    updateAlumniProfile,
    approveOpportunity,
    rejectOpportunity,
    verifyEmployer,
    setSelectedUserIdForModal,
    showToast,
    addAuditLog
  } = useAlumni();

  const [activeFilter, setActiveFilter] = useState<'all' | 'perfect' | 'discrepancies' | 'employers' | 'jobs'>('all');
  const [reconciling, setReconciling] = useState(false);
  // Progressive pagination for student verification requests
  const [visibleAlumniCount, setVisibleAlumniCount] = useState<number>(6);

  // Sync activeFilter with viewMode prop when viewMode changes
  useEffect(() => {
    setVisibleAlumniCount(6);
    if (viewMode === 'alumni') setActiveFilter('all');
    else if (viewMode === 'employers') setActiveFilter('employers');
    else if (viewMode === 'jobs') setActiveFilter('jobs');
    else setActiveFilter('all');
  }, [viewMode]);

  // Compute pending items
  const pendingUsers = useMemo(() => users.filter((u) => !u.isVerified && u.role === 'alumni'), [users]);
  const pendingEmployers = useMemo(
    () => users.filter((u) => u.role === 'employer' && u.employerVerificationStatus === 'pending_verification'),
    [users]
  );
  const pendingJobs = useMemo(
    () => (opportunities || []).filter((o) => o.approvalStatus === 'pending_approval'),
    [opportunities]
  );

  // Run high-logic registry analysis across all pending alumni
  const userAnalyses: RegistryDiscrepancyAnalysis[] = useMemo(() => {
    return pendingUsers.map((u) => analyzeUserRegistryIntegrity(u, users));
  }, [pendingUsers, users]);

  const perfectMatchAnalyses = useMemo(
    () => userAnalyses.filter((a) => a.status === 'PERFECT_MATCH'),
    [userAnalyses]
  );

  const discrepancyAnalyses = useMemo(
    () => userAnalyses.filter((a) => a.status !== 'PERFECT_MATCH'),
    [userAnalyses]
  );

  const totalPending = pendingUsers.length + pendingEmployers.length + pendingJobs.length;

  // High-Logic Smart Auto-Reconciliation Engine
  const handleSmartAutoReconcile = async () => {
    if (perfectMatchAnalyses.length === 0) {
      showToast('No 100% Registrar-matched records found for auto-reconciliation.', 'info');
      return;
    }

    setReconciling(true);
    const approvedCount = perfectMatchAnalyses.length;
    const quarantinedCount = discrepancyAnalyses.length;

    try {
      // Reconcile and verify only genuine 100% matched alumni
      for (const item of perfectMatchAnalyses) {
        setUserVerified(item.userId, true);
      }

      addAuditLog({
        action: 'SMART_GOVERNANCE_AUTO_RECONCILE',
        actorId: 'governance_intelligence_engine',
        actorName: 'Registrar Governance Engine',
        actorRole: 'admin',
        category: 'alumni_verification',
        details: `Smart Governance Auto-Reconciliation executed: Verified ${approvedCount} alumni with 100% Registrar archive alignment. Quarantined ${quarantinedCount} discrepancies for manual inspection.`,
        severity: 'success'
      });

      showToast(
        `Auto-reconciled ${approvedCount} verified graduates! ${quarantinedCount} accounts with discrepancies kept in quarantine.`,
        'success'
      );
    } finally {
      setReconciling(false);
    }
  };

  // 1-Click Sync to Registrar Transcript & Verify
  const handleSyncToRegistrarAndVerify = (analysis: RegistryDiscrepancyAnalysis) => {
    const reg = analysis.registryRecord;
    if (!reg) {
      setUserVerified(analysis.userId, true);
      return;
    }

    // Synchronize degree & batch to official registrar records
    updateAlumniProfile(analysis.userId, {
      course: reg.course,
      batch: reg.batchYear || analysis.user.batch
    });

    setUserVerified(analysis.userId, true);

    addAuditLog({
      action: 'REGISTRAR_TRANSCRIPT_SYNC_VERIFY',
      actorId: 'governance_officer',
      actorName: 'Registrar Governance Officer',
      actorRole: 'admin',
      category: 'alumni_verification',
      details: `Corrected declared course for ${analysis.user.name} to official Registrar record (${reg.course}, Batch ${reg.batchYear}) and granted verified status.`,
      severity: 'info'
    });

    showToast(`Synced ${analysis.user.name}'s records with Registrar archive and verified!`, 'success');
  };

  const showAlumniList = viewMode === 'all' || viewMode === 'alumni';
  const showEmployerList = viewMode === 'all' || viewMode === 'employers';
  const showJobList = viewMode === 'all' || viewMode === 'jobs';

  return (
    <div className="space-y-4">
      {/* Sub-Header & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">
                {viewMode === 'alumni'
                  ? 'Alumni Identity Verification & Discrepancies'
                  : viewMode === 'employers'
                  ? 'Employer Accreditation Requests'
                  : viewMode === 'jobs'
                  ? 'Career Opportunity Moderation'
                  : 'Intake & Moderation Queue'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {viewMode === 'alumni'
                  ? `${pendingUsers.length} Pending`
                  : viewMode === 'employers'
                  ? `${pendingEmployers.length} Pending`
                  : viewMode === 'jobs'
                  ? `${pendingJobs.length} Pending`
                  : `${totalPending} Pending`}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {viewMode === 'alumni'
                ? 'Real-time cross-validation against official St. Cecilia\'s College Registrar archives. Highlights name, degree, and ID variances.'
                : viewMode === 'employers'
                ? 'Review corporate partner registrations, official liaison details, and industry accreditations.'
                : viewMode === 'jobs'
                ? 'Moderate student and alumni job postings before publication to the career exchange.'
                : 'Centralized intake queue for alumni, corporate partners, and career opportunities.'}
            </p>
          </div>

          {/* High-Logic Auto-Reconcile Action (When viewing alumni) */}
          {showAlumniList && perfectMatchAnalyses.length > 0 && (
            <button
              onClick={handleSmartAutoReconcile}
              disabled={reconciling}
              title="Only verifies records that match the official Registrar archives with 100% certainty"
              className="px-4 py-2 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {reconciling
                  ? 'Reconciling...'
                  : `Smart Auto-Reconcile (${perfectMatchAnalyses.length} Perfect Matches)`}
              </span>
            </button>
          )}
        </div>

        {/* Filter Navigation Tabs (Only when in alumni or all mode) */}
        {showAlumniList && viewMode === 'alumni' && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-stone-100 pt-2.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>All Alumni</span>
            </button>

            <button
              onClick={() => setActiveFilter('perfect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'perfect'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Perfect Matches</span>
            </button>

            <button
              onClick={() => setActiveFilter('discrepancies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'discrepancies'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Quarantined Discrepancies</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {((viewMode === 'alumni' && pendingUsers.length === 0) ||
          (viewMode === 'employers' && pendingEmployers.length === 0) ||
          (viewMode === 'jobs' && pendingJobs.length === 0) ||
          (viewMode === 'all' && totalPending === 0)) ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">Queue Cleared</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              No items currently require administrator review in this section.
            </p>
          </div>
        ) : (
          <div className="p-3 sm:p-4 space-y-3">
            {/* 1. Alumni Registrations with High-Logic Discrepancy Cards */}
            {showAlumniList && (() => {
              const filteredList = userAnalyses.filter((analysis) => {
                if (activeFilter === 'perfect') return analysis.status === 'PERFECT_MATCH';
                if (activeFilter === 'discrepancies') return analysis.status !== 'PERFECT_MATCH';
                return true;
              });

              return (
                <>
                  {filteredList.slice(0, visibleAlumniCount).map((analysis) => {
                  const u = analysis.user;
                  const reg = analysis.registryRecord;
                  const isPerfect = analysis.status === 'PERFECT_MATCH';
                  const isDegreeDiscrepancy = analysis.status === 'DEGREE_DISCREPANCY';
                  const isCollision = analysis.status === 'COLLISION_RISK';

                  return (
                    <Skiper23MinimalCardExpand
                      key={u.uid}
                      title={u.name}
                      subtitle={u.email}
                      category="Alumni Identity Verification"
                      badge={
                        isPerfect
                          ? '100% Registrar Match'
                          : isDegreeDiscrepancy
                          ? 'Degree Discrepancy'
                          : isCollision
                          ? 'Collision Alert'
                          : analysis.status === 'NAME_DISCREPANCY'
                          ? 'Name Mismatch'
                          : 'Unregistered ID'
                      }
                      badgeColor={
                        isPerfect
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isCollision
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }
                      icon={isPerfect ? FileCheck2 : AlertTriangle}
                      iconBg={
                        isPerfect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCollision
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }
                      summary={
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-stone-800">{u.course || 'Degree Program Pending'}</span>
                            {u.studentId && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                ID: {u.studentId}
                              </span>
                            )}
                            <span className="text-[11px] text-stone-500">
                              Batch: {u.batch || 'Pending'}
                            </span>
                          </div>

                          {/* High Logic Discrepancy Notice in Summary */}
                          {!isPerfect && analysis.discrepancyDetails.length > 0 && (
                            <p className="text-[11px] text-amber-800 font-medium">
                              ⚠️ {analysis.discrepancyDetails[0]}
                            </p>
                          )}
                        </div>
                      }
                      expandedContent={
                        <div className="space-y-3 text-xs text-stone-600">
                          {/* Side-by-Side Registrar Discrepancy Inspector */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Left Box: Declared by Applicant */}
                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                                <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">
                                  Applicant Submission
                                </span>
                                <span className="text-[10px] text-stone-500">Registered</span>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-stone-400 font-semibold">Claimed Student ID</p>
                                <p className="font-mono font-bold text-stone-800">{u.studentId || 'None'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-stone-400 font-semibold">Submitted Name</p>
                                <p className="font-medium text-stone-800">{u.name}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-stone-400 font-semibold">Declared Degree</p>
                                <p className={`font-medium ${isDegreeDiscrepancy ? 'text-amber-800 font-bold' : 'text-stone-800'}`}>
                                  {u.course || 'Unspecified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-stone-400 font-semibold">Graduation Batch</p>
                                <p className="font-medium text-stone-800">{u.batch || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Right Box: Official Registrar Archive Record */}
                            <div className={`p-3 rounded-xl border space-y-1.5 ${
                              isPerfect
                                ? 'bg-emerald-50/60 border-emerald-200'
                                : reg
                                ? 'bg-amber-50/60 border-amber-200'
                                : 'bg-red-50/60 border-red-200'
                            }`}>
                              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/60">
                                <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">
                                  Registrar Master Archive
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">Official Diploma Roll</span>
                              </div>

                              {reg ? (
                                <>
                                  <div>
                                    <p className="text-[10px] uppercase text-stone-400 font-semibold">Official Student ID</p>
                                    <p className="font-mono font-bold text-emerald-800">{reg.studentId}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-stone-400 font-semibold">Recorded Full Name</p>
                                    <p className="font-medium text-stone-900">{reg.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-stone-400 font-semibold">Accredited Degree</p>
                                    <p className="font-medium text-emerald-900 font-semibold">{reg.course}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase text-stone-400 font-semibold">Official Graduation Year</p>
                                    <p className="font-medium text-stone-800">{reg.batchYear || 'N/A'}</p>
                                  </div>
                                </>
                              ) : (
                                <div className="py-4 text-center">
                                  <ShieldAlert className="w-6 h-6 text-red-600 mx-auto mb-1" />
                                  <p className="font-bold text-red-900 text-xs">No Registrar Record Exists</p>
                                  <p className="text-[11px] text-red-700 mt-0.5">
                                    Student ID '{u.studentId}' was not found in institutional archives.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Full Discrepancy Diagnostics */}
                          {analysis.discrepancyDetails.length > 0 && (
                            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-xs space-y-1">
                              <p className="font-bold text-amber-900 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Discrepancy Diagnostics</span>
                              </p>
                              {analysis.discrepancyDetails.map((detail, idx) => (
                                <p key={idx} className="text-amber-800 text-[11px] pl-4">
                                  • {detail}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedUserIdForModal(u.uid)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-500" />
                            <span>Dossier</span>
                          </button>

                          {/* Collision Action */}
                          {isCollision && onSwitchToConflicts && (
                            <button
                              type="button"
                              onClick={onSwitchToConflicts}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <span>Open Conflict Desk</span>
                            </button>
                          )}

                          {/* Degree Discrepancy: 1-Click Sync to Registrar Transcript & Verify */}
                          {isDegreeDiscrepancy && (
                            <button
                              type="button"
                              onClick={() => handleSyncToRegistrarAndVerify(analysis)}
                              title="Updates user's declared degree to match official registrar transcript and verifies them"
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Sync to Registrar & Verify</span>
                            </button>
                          )}

                          {/* Standard Approve & Verify */}
                          <button
                            type="button"
                            onClick={() => setUserVerified(u.uid, true)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Verify</span>
                          </button>
                        </>
                      }
                    />
                  );
                })}

                {/* Progressive See More Controls for Pending Alumni Students */}
                {filteredList.length > visibleAlumniCount && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                    <span className="text-stone-600 font-medium">
                      Showing <strong className="text-stone-900">{Math.min(visibleAlumniCount, filteredList.length)}</strong> of <strong className="text-stone-900">{filteredList.length}</strong> student verification requests
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleAlumniCount((prev) => prev + 6)}
                        className="px-3 py-1.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-lg font-bold shadow-2xs transition-all cursor-pointer text-xs active:scale-95"
                      >
                        See More Requests (+{Math.min(6, filteredList.length - visibleAlumniCount)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleAlumniCount(filteredList.length)}
                        className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 rounded-lg font-medium transition-colors cursor-pointer text-xs"
                      >
                        Show All ({filteredList.length})
                      </button>
                    </div>
                  </div>
                )}

                {visibleAlumniCount > 6 && filteredList.length > 6 && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setVisibleAlumniCount(6)}
                      className="text-xs text-stone-500 hover:text-stone-800 font-medium underline cursor-pointer"
                    >
                      Show Less (Reset to 6)
                    </button>
                  </div>
                )}
              </>
            );
          })()}

            {/* 2. Employer Accreditations */}
            {showEmployerList &&
              pendingEmployers.map((emp) => (
                <Skiper23MinimalCardExpand
                  key={emp.uid}
                  title={emp.companyName || emp.name}
                  subtitle={emp.email}
                  category="Employer Partner Accreditation"
                  badge={emp.companyIndustry || 'Corporate Partner'}
                  badgeColor="bg-purple-100 text-purple-800 border-purple-200"
                  icon={Building2}
                  iconBg="bg-purple-50 text-purple-700 border border-purple-200"
                  summary={
                    <div className="text-xs text-stone-600">
                      <span>Industry: </span>
                      <span className="font-semibold text-stone-800">{emp.companyIndustry || 'Corporate Partner'}</span>
                      {emp.companyWebsite && (
                        <span className="ml-2 text-stone-400">• {emp.companyWebsite}</span>
                      )}
                    </div>
                  }
                  expandedContent={
                    <div className="space-y-2.5 text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400">Official Representative</p>
                          <p className="font-semibold text-stone-900">{emp.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400">Corporate Email</p>
                          <p className="font-medium text-stone-800">{emp.email}</p>
                        </div>
                      </div>
                      {emp.about && (
                        <p className="text-stone-600 pt-1 border-t border-stone-100">{emp.about}</p>
                      )}
                    </div>
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedUserIdForModal(emp.uid)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Company Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => verifyEmployer(emp.uid, false)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => verifyEmployer(emp.uid, true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accredit Partner</span>
                      </button>
                    </>
                  }
                />
              ))}

            {/* 3. Job Postings Moderation */}
            {showJobList &&
              pendingJobs.map((job) => (
                <Skiper23MinimalCardExpand
                  key={job.id}
                  title={job.title}
                  subtitle={`${job.company} • ${job.location}`}
                  category="Career Opportunity Moderation"
                  badge={job.type || 'Full-time'}
                  badgeColor="bg-blue-100 text-blue-800 border-blue-200"
                  icon={Briefcase}
                  iconBg="bg-blue-50 text-blue-700 border border-blue-200"
                  summary={
                    <div className="text-xs text-stone-600 line-clamp-2">
                      {job.description}
                    </div>
                  }
                  expandedContent={
                    <div className="space-y-2.5 text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400">Employer Entity</p>
                          <p className="font-semibold text-stone-900">{job.company}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-stone-400">Location / Mode</p>
                          <p className="font-medium text-stone-800">{job.location}</p>
                        </div>
                      </div>
                      {job.salaryOrStipend && (
                        <p className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">
                          Compensation: {job.salaryOrStipend}
                        </p>
                      )}
                      <p className="text-stone-700 leading-relaxed">{job.description}</p>
                    </div>
                  }
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => rejectOpportunity(job.id, 'Moderated by admin')}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => approveOpportunity(job.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>
                    </>
                  }
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
