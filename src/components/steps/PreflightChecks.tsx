import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Wrench,
  RefreshCw,
  Loader2,
  Shield,
} from 'lucide-react';
import { runPreflightChecks, applyFix } from '../../api/preflight';
import type { WizardData } from '../../hooks/useWizardState';
import type { CheckResult } from '../../types/api';

interface PreflightChecksProps {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

function severityIcon(severity: string, passed: boolean) {
  if (passed) return <CheckCircle size={18} className="text-emerald-500" />;
  if (severity === 'required') return <XCircle size={18} className="text-red-500" />;
  if (severity === 'warning') return <AlertTriangle size={18} className="text-amber-500" />;
  return <Info size={18} className="text-sky-500" />;
}

function severityBg(severity: string, passed: boolean) {
  if (passed) return 'border-emerald-100 bg-emerald-50/30';
  if (severity === 'required') return 'border-red-100 bg-red-50/30';
  if (severity === 'warning') return 'border-amber-100 bg-amber-50/30';
  return 'border-sky-100 bg-sky-50/30';
}

export default function PreflightChecks({ data, update }: PreflightChecksProps) {
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixMessages, setFixMessages] = useState<Record<string, { success: boolean; message: string }>>({});

  const runChecks = useCallback(async () => {
    setLoading(true);
    setFixMessages({});
    update({ preflightPassed: false });
    try {
      const summary = await runPreflightChecks();
      const allRequiredPassed = summary.results.every(
        (r) => r.passed || r.severity !== 'required'
      );
      update({
        preflightResults: summary.results,
        preflightPassed: allRequiredPassed,
      });

      const failedIds = new Set(summary.results.filter((r) => !r.passed).map((r) => r.id));
      setExpandedIds(failedIds);
    } catch {
      update({ preflightResults: [], preflightPassed: false });
    } finally {
      setLoading(false);
    }
  }, [update]);

  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFix = useCallback(
    async (check: CheckResult) => {
      setFixingId(check.id);
      try {
        const result = await applyFix(check.id);
        setFixMessages((prev) => ({
          ...prev,
          [check.id]: { success: result.success, message: result.message },
        }));
      } catch (err) {
        setFixMessages((prev) => ({
          ...prev,
          [check.id]: { success: false, message: err instanceof Error ? err.message : 'Fix failed' },
        }));
      } finally {
        setFixingId(null);
      }
    },
    []
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const results = data.preflightResults;
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const requiredFailed = results.filter((r) => !r.passed && r.severity === 'required').length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Preflight Checks</h2>
          <p className="text-sm text-gray-500 mt-1">
            Verifying that all nodes meet the requirements for deployment.
          </p>
        </div>
        <button
          onClick={runChecks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Re-check All
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="text-intel-600 animate-spin" />
          <p className="text-sm text-gray-500">Running preflight checks...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-5 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Shield size={20} className="text-gray-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      passed === total ? 'bg-emerald-500' : 'bg-intel-500'
                    }`}
                    style={{ width: total > 0 ? `${(passed / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 tabular-nums">
                  {passed}/{total}
                </span>
              </div>
              {requiredFailed > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {requiredFailed} required check{requiredFailed > 1 ? 's' : ''} failing
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {results.map((check) => {
              const expanded = expandedIds.has(check.id);
              const fixMsg = fixMessages[check.id];
              return (
                <div
                  key={check.id}
                  className={`rounded-lg border transition-colors ${severityBg(check.severity, check.passed)}`}
                >
                  <button
                    onClick={() => toggleExpand(check.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    {severityIcon(check.severity, check.passed)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{check.name}</p>
                      <p className="text-xs text-gray-500 truncate">{check.description}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase mr-2">
                      {check.category}
                    </span>
                    {expanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>

                  {expanded && !check.passed && (
                    <div className="px-4 pb-4 border-t border-gray-100/60 pt-3 ml-9">
                      {check.message && (
                        <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                      )}
                      {check.details && (
                        <div className="bg-white/70 rounded-md p-3 text-xs text-gray-600 font-mono mb-3 whitespace-pre-wrap">
                          {check.details}
                        </div>
                      )}

                      {check.can_fix && (
                        <div className="flex items-start gap-3 mt-2">
                          <button
                            onClick={() => handleFix(check)}
                            disabled={fixingId === check.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 disabled:opacity-40 transition-colors"
                          >
                            {fixingId === check.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Wrench size={12} />
                            )}
                            Auto-fix
                          </button>
                          {check.fix_warning && (
                            <p className="text-xs text-amber-600 leading-relaxed">
                              {check.fix_warning}
                            </p>
                          )}
                        </div>
                      )}

                      {fixMsg && (
                        <div
                          className={`mt-3 text-xs rounded-md px-3 py-2 ${
                            fixMsg.success
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {fixMsg.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
