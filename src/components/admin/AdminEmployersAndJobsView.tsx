import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Users,
  Award
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { JobModerationQueue } from '../opportunities/JobModerationQueue';
import { EmployerManagementModule } from './EmployerManagementModule';
import { GooeyBackground } from '../common/GooeyBackground';

interface AdminEmployersAndJobsViewProps {
  initialSubTab?: 'jobs' | 'employers';
}

export const AdminEmployersAndJobsView: React.FC<AdminEmployersAndJobsViewProps> = ({
  initialSubTab = 'jobs'
}) => {
  const { opportunities, users, permissions } = useAlumni();
  const [subTab, setSubTab] = useState<'jobs' | 'employers'>(initialSubTab);

  // Job metrics
  const pendingJobs = useMemo(
    () => (opportunities || []).filter((o) => o.approvalStatus === 'pending_approval'),
    [opportunities]
  );
  const approvedJobs = useMemo(
    () => (opportunities || []).filter((o) => o.approvalStatus === 'approved' || !o.approvalStatus),
    [opportunities]
  );

  // Employer metrics
  const allEmployers = useMemo(
    () => (users || []).filter((u) => u.role === 'employer'),
    [users]
  );
  const pendingEmployers = useMemo(
    () =>
      allEmployers.filter(
        (u) => (u.employerVerificationStatus || 'pending_verification') === 'pending_verification'
      ),
    [allEmployers]
  );
  const verifiedEmployers = useMemo(
    () => allEmployers.filter((u) => u.employerVerificationStatus === 'verified'),
    [allEmployers]
  );

  const totalPending = pendingJobs.length + pendingEmployers.length;

  return (
    <div className="space-y-6">
      {/* Bento Hero Header Tile */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF9F5] to-[#F5F2EA] p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.03)] space-y-6">
        {/* Institutional St. Cecilia Crimson Architectural Top Trim */}
        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8B181B] via-[#991B1B] to-[#B45309]" />

        <GooeyBackground variant="crimson" intensity="subtle" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
              <span className="text-[#8B181B] font-bold">St. Cecilia's College</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Career Services & Placement</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Corporate Accreditation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              Employers & Corporate Career Placements
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Unified management hub for corporate employer accreditations, job posting moderation, career fairs, and graduate career trajectory alignment.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="relative z-10 flex items-center gap-2 flex-wrap shrink-0">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
              {opportunities.length} Active Positions
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
              {allEmployers.length} Partner Companies
            </span>
            {totalPending > 0 && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {totalPending} Review Required
              </span>
            )}
          </div>
        </div>

        {/* Bento 4-Tile Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-stone-200/70">
          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-[#8B181B]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Corporate Jobs</span>
              <Briefcase className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900">{opportunities.length}</span>
              <span className="text-[10px] text-stone-500 font-semibold">{approvedJobs.length} active</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Verified career opportunities</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Accredited Partners</span>
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-900">{verifiedEmployers.length}</span>
              <span className="text-[10px] text-blue-600 font-semibold">of {allEmployers.length}</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">MoU signed & accredited</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Pending Moderation</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${pendingJobs.length > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
                {pendingJobs.length}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Awaiting review</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Job posting quality check</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Partner Requests</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${pendingEmployers.length > 0 ? 'text-emerald-800' : 'text-stone-900'}`}>
                {pendingEmployers.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Unvetted</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Company accreditation queue</p>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="relative z-10 flex items-center gap-2 border-b border-stone-200/80 pt-2 overflow-x-auto scrollbar-none">
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
            <span>Job Opportunities & Moderation</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subTab === 'jobs' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {pendingJobs.length > 0 ? `${pendingJobs.length} pending` : opportunities.length}
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
            <span>Employer Partners & Accreditation</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                subTab === 'employers' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {pendingEmployers.length > 0 ? `${pendingEmployers.length} pending` : allEmployers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {subTab === 'jobs' && (
        <div>
          <JobModerationQueue />
        </div>
      )}

      {subTab === 'employers' && (
        <div>
          <EmployerManagementModule />
        </div>
      )}
    </div>
  );
};
