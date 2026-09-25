import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  Building,
  Upload,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Server,
  Activity,
  ShieldAlert,
  Code
} from 'lucide-react';
import { useAlumni } from '../../context/AlumniContext';
import { AuditLogEntry } from '../../types';
import { GooeyBackground } from '../common/GooeyBackground';

interface ServerAuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: string;
  ip: string;
  details: Record<string, any>;
}

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser, showToast } = useAlumni();

  // Strict RBAC: Merged Audit section is strictly restricted to Administrators
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // Top-Level Unified Audit Tab: 'module' (Application/Module Audit) or 'system' (System Audit Logs)
  const [activeAuditType, setActiveAuditType] = useState<'module' | 'system'>('module');

  // --- Module Audit State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // --- System Audit State ---
  const [serverLogs, setServerLogs] = useState<ServerAuditLogItem[]>([]);
  const [isLoadingServerLogs, setIsLoadingServerLogs] = useState(false);
  const [systemSearchQuery, setSystemSearchQuery] = useState('');
  const [systemActionFilter, setSystemActionFilter] = useState<string>('all');
  const [selectedServerLog, setSelectedServerLog] = useState<ServerAuditLogItem | null>(null);

  // Fetch Server-Authoritative Audit Logs
  const fetchServerAuditLogs = async () => {
    setIsLoadingServerLogs(true);
    try {
      const token = localStorage.getItem('alumni_auth_token') || sessionStorage.getItem('alumni_auth_token');
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setServerLogs(data.logs || []);
      } else {
        // Fallback demo records if server endpoint requires fresh session
        console.warn('System audit fetch returned status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch system audit logs:', err);
    } finally {
      setIsLoadingServerLogs(false);
    }
  };

  const [isTriggeringProbe, setIsTriggeringProbe] = useState(false);

  // Trigger a Diagnostic System Audit Log on the Backend Server
  const handleTriggerSecurityProbe = async () => {
    setIsTriggeringProbe(true);
    try {
      const token = localStorage.getItem('alumni_auth_token') || sessionStorage.getItem('alumni_auth_token');
      const res = await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'MANUAL_SECURITY_PROBE_TRIGGERED',
          details: {
            reason: 'Administrator triggered manual system integrity test probe',
            triggeredBy: currentUser?.email || 'admin@scc.edu.ph',
            clientTimestamp: new Date().toISOString(),
            status: 'VERIFIED_ACTIVE'
          }
        })
      });

      if (res.ok) {
        showToast('System audit log triggered and recorded by backend server.', 'success');
        await fetchServerAuditLogs();
      } else {
        showToast('Server returned an error triggering system audit log.', 'error');
      }
    } catch (err) {
      console.error('Failed to trigger system audit log probe:', err);
      showToast('Error connecting to backend server audit service.', 'error');
    } finally {
      setIsTriggeringProbe(false);
    }
  };

  useEffect(() => {
    if (activeAuditType === 'system' && serverLogs.length === 0) {
      fetchServerAuditLogs();
    }
  }, [activeAuditType]);

  // Filtered & Sorted Module Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter((log) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (log.action || '').toLowerCase().includes(q) ||
          (log.actorName || '').toLowerCase().includes(q) ||
          (log.details || '').toLowerCase().includes(q) ||
          Boolean(log.targetRecordId && log.targetRecordId.toLowerCase().includes(q)) ||
          Boolean(log.ipAddress && log.ipAddress.toLowerCase().includes(q));

        const matchesCategory =
          categoryFilter === 'all' || log.category === categoryFilter;

        const matchesRole =
          roleFilter === 'all' || log.actorRole === roleFilter;

        const matchesSeverity =
          severityFilter === 'all' || log.severity === severityFilter;

        return matchesSearch && matchesCategory && matchesRole && matchesSeverity;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [auditLogs, searchQuery, categoryFilter, roleFilter, severityFilter, sortOrder]);

  // Filtered System Audit Logs
  const filteredSystemLogs = useMemo(() => {
    return serverLogs.filter((log) => {
      const q = systemSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.ip || '').toLowerCase().includes(q) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(q);

      const matchesAction =
        systemActionFilter === 'all' || log.action === systemActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [serverLogs, systemSearchQuery, systemActionFilter]);

  // Unique actions in system logs for dropdown filter
  const uniqueSystemActions = useMemo(() => {
    const set = new Set<string>();
    serverLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set);
  }, [serverLogs]);

  // Counts for KPI summary
  const masterlistOpsCount = auditLogs.filter(
    (l) => l.category === 'registry_masterlist'
  ).length;
  const securityOpsCount = auditLogs.filter(
    (l) => l.category === 'security' || l.severity === 'alert'
  ).length;

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Category',
      'Action',
      'Actor Name',
      'Actor Role',
      'Target Record',
      'IP Address',
      'Severity',
      'Details'
    ];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toISOString()}"`,
      `"${l.category || ''}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      `"${l.actorRole || ''}"`,
      `"${l.targetRecordId || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.severity || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `cecilian_module_audit_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Module audit log exported to CSV.', 'success');
  };

  const handleExportSystemJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredSystemLogs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute(
      'download',
      `cecilian_system_audit_logs_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('System audit logs exported to JSON.', 'success');
  };

  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Alert
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Warning
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Success
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Info className="w-3 h-3 text-stone-500" />
            Info
          </span>
        );
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-lg mx-auto shadow-2xs space-y-3 my-8">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto border border-stone-200">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-stone-900 font-serif">Access Restricted</h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Institutional Audit & System Logs are restricted to System Administrators only.
        </p>
      </div>
    );
  }

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
              <span>Compliance & Security Bureau</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>Governance Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
              Institutional Audit Trail & Governance Compliance
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Unified compliance suite logging application-level alumni actions, registrar reconciliations, and server-authoritative security events.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 flex-wrap shrink-0">
            {activeAuditType === 'module' ? (
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_2px_8px_rgba(139,24,27,0.25)] active:scale-95"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Export Module CSV</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchServerAuditLogs}
                  disabled={isLoadingServerLogs}
                  className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServerLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportSystemJson}
                  className="px-4 py-2.5 bg-[#8B181B] hover:bg-[#721316] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_2px_8px_rgba(139,24,27,0.25)] active:scale-95"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Export System JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bento 4-Tile Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-stone-200/70">
          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-[#8B181B]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Module Logs</span>
              <Layers className="w-3.5 h-3.5 text-[#8B181B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900">{auditLogs.length}</span>
              <span className="text-[10px] text-stone-500 font-semibold">Events</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Application recorded actions</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Registry Operations</span>
              <Upload className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-blue-900">{masterlistOpsCount}</span>
              <span className="text-[10px] text-blue-600 font-semibold">Updates</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Masterlist roster mutations</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Security Events</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-amber-800">{securityOpsCount}</span>
              <span className="text-[10px] text-amber-600 font-semibold">Audited</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Alerts, overrides & logins</p>
          </div>

          <div className="bg-stone-50/90 p-4 rounded-xl border border-stone-200/80 shadow-2xs hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">System Logs</span>
              <Server className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-800">{serverLogs.length}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Server-side</span>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Cloud backend verification</p>
          </div>
        </div>

        {/* Logical Sub-Tab Switcher between Application/Module Audit and System Audit Logs */}
        <div className="relative z-10 flex items-center gap-2 border-b border-stone-200/80 pt-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveAuditType('module')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeAuditType === 'module'
                ? 'border-[#8B181B] text-[#8B181B]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Application / Module Audit</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeAuditType === 'module' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {auditLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveAuditType('system')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeAuditType === 'system'
                ? 'border-[#8B181B] text-[#8B181B]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>System Server Logs</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeAuditType === 'system' ? 'bg-[#8B181B] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {serverLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: APPLICATION / MODULE AUDIT                                     */}
      {/* ========================================================================= */}
      {activeAuditType === 'module' && (
        <div className="space-y-6">

          {/* Module Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search module action, actor, target student ID, or details..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8B181B]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="registry_masterlist">Registry Masterlist</option>
                  <option value="alumni_registration">Alumni Registration</option>
                  <option value="career">Career Tracer & Jobs</option>
                  <option value="security">Security & Roles</option>
                  <option value="communication">Announcements & Social</option>
                  <option value="events">Events & RSVPs</option>
                  <option value="admin">System Administration</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="registrar">Registrar</option>
                  <option value="staff">Staff</option>
                  <option value="alumni">Alumni</option>
                  <option value="system">System / Automated</option>
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 font-medium cursor-pointer transition-colors"
                  title="Toggle Chronological Sort"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                  <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Module Audit Records Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Target Record</th>
                    <th className="py-3 px-4">Origin IP</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 italic">
                        No application/module audit records match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-stone-600 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderSeverityBadge(log.severity)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs truncate">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-stone-800">{log.actorName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 rounded text-stone-600 uppercase font-semibold">
                              {log.actorRole}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-600">
                          {log.targetRecordId ? (
                            <span className="text-[#8B181B] font-semibold">{log.targetRecordId}</span>
                          ) : (
                            <span className="text-stone-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-500 text-[11px]">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SYSTEM AUDIT LOGS (SERVER-AUTHORITATIVE)                       */}
      {/* ========================================================================= */}
      {activeAuditType === 'system' && (
        <div className="space-y-6">
          {/* System Security Banner */}
          <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-tight">
                Server-Authoritative Tamper-Proof Audit Trail
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
              Backend event registry recording server authentication events, API role verifications, resume export integrity checks, file upload security evaluations, and unauthorized access attempts.
            </p>
          </div>

          {/* System Audit Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={systemSearchQuery}
                  onChange={(e) => setSystemSearchQuery(e.target.value)}
                  placeholder="Search system event, actor, IP address, or payload..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#8B181B]"
                />
              </div>

              {/* Action Filter & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={systemActionFilter}
                  onChange={(e) => setSystemActionFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Server Actions ({uniqueSystemActions.length})</option>
                  {uniqueSystemActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={fetchServerAuditLogs}
                  disabled={isLoadingServerLogs}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Refresh Server Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingServerLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerSecurityProbe}
                  disabled={isTriggeringProbe}
                  className="px-3 py-2 bg-[#8B181B] hover:bg-[#701316] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTriggeringProbe ? 'animate-pulse' : ''}`} />
                  <span>{isTriggeringProbe ? 'Triggering...' : 'Trigger Audit Probe'}</span>
                </button>
              </div>
            </div>

            {/* How System Audit Logs are Triggered Helper Box */}
            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  <strong>Triggered automatically by:</strong> Password Changes, Role Modifications, Student Record Verifications, Governance Resolutions, and Security Violations (e.g. ID tampering blocks).
                </span>
              </div>
              <span className="text-stone-400 shrink-0">Server Endpoint: /api/admin/audit-logs</span>
            </div>
          </div>

          {/* System Audit Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">System Event</th>
                    <th className="py-3 px-4">Actor Email / ID</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Client IP</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {isLoadingServerLogs ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8B181B]" />
                        <span>Querying server audit registry...</span>
                      </td>
                    </tr>
                  ) : filteredSystemLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400 italic">
                        No system audit records match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSystemLogs.map((log) => {
                      const isAlert =
                        log.action.includes('BLOCKED') ||
                        log.action.includes('REJECTED') ||
                        log.action.includes('UNAUTHORIZED');

                      return (
                        <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap text-stone-600 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                                isAlert
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-stone-100 text-stone-800 border-stone-200'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-800">
                            {log.actor}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 rounded text-stone-700 uppercase font-semibold">
                              {log.actorRole}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-500 text-[11px]">
                            {log.ip}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedServerLog(log)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="Inspect Payload"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MODULE AUDIT DETAIL                                                */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8B181B]" />
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Module Audit Event Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Record ID:</span>
                  <span className="font-mono text-stone-800">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Category:</span>
                  <span className="uppercase font-semibold text-stone-800">{selectedLog.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Severity:</span>
                  <span>{renderSeverityBadge(selectedLog.severity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Audit Timestamp:</span>
                  <span className="font-mono text-stone-800">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Accountability & Actor Info
                </span>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Reviewing Officer / Actor:</span>
                    <span className="font-bold text-stone-900">{selectedLog.actorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Actor System ID:</span>
                    <span className="font-mono text-stone-700">{selectedLog.actorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Assigned Role:</span>
                    <span className="uppercase font-semibold text-stone-800">{selectedLog.actorRole}</span>
                  </div>
                  {selectedLog.ipAddress && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Origin IP Address:</span>
                      <span className="font-mono text-stone-700">{selectedLog.ipAddress}</span>
                    </div>
                  )}
                  {selectedLog.targetRecordId && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Target Student Record:</span>
                      <span className="font-mono font-bold text-rose-700">{selectedLog.targetRecordId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Narrative Details & Compliance Justification
                </span>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SYSTEM AUDIT LOG PAYLOAD INSPECTION                                */}
      {/* ========================================================================= */}
      {selectedServerLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-stone-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#8B181B]" />
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Server Audit Event Payload
                </h3>
              </div>
              <button
                onClick={() => setSelectedServerLog(null)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Log Entry ID:</span>
                  <span className="font-mono text-stone-800">{selectedServerLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Action:</span>
                  <span className="font-mono font-bold text-stone-900">{selectedServerLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Actor:</span>
                  <span className="font-medium text-stone-800">{selectedServerLog.actor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Role:</span>
                  <span className="uppercase font-semibold text-stone-800">{selectedServerLog.actorRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Origin IP:</span>
                  <span className="font-mono text-stone-700">{selectedServerLog.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Timestamp:</span>
                  <span className="font-mono text-stone-800">{new Date(selectedServerLog.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Scrubbed Server Payload Data
                </span>
                <pre className="p-3 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-stone-800">
                  {JSON.stringify(selectedServerLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedServerLog(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
