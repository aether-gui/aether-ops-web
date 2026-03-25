import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Server,
  Monitor,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { runPreflightChecks, applyFix } from '../../api/preflight';
import { syncInventory, executeAction, getTask } from '../../api/onramp';
import type { WizardData } from '../../hooks/useWizardState';
import type { CheckResult, ManagedNode, NodePreflightSummary } from '../../types/api';

interface PreflightChecksProps {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

interface FixMsg {
  applied: boolean;
  message: string;
  warning?: string;
}

function parseAnsibleRecap(
  output: string,
  nodes: ManagedNode[]
): Record<string, 'verified' | 'failed'> {
  const results: Record<string, 'verified' | 'failed'> = {};
  const recapSection = output.match(/PLAY RECAP[^\n]*\n([\s\S]+?)(?:\n\n|$)/);
  if (!recapSection) return results;

  const lines = recapSection[1].split('\n').filter((l) => l.trim());
  for (const line of lines) {
    const match = line.match(
      /^(\S+)\s+:\s+ok=(\d+)\s+changed=\d+\s+unreachable=(\d+)\s+failed=(\d+)/
    );
    if (!match) continue;
    const [, hostname, , unreachable, failed] = match;
    const node = nodes.find((n) => n.name === hostname || n.ansible_host === hostname);
    if (node) {
      results[node.id] =
        parseInt(unreachable) === 0 && parseInt(failed) === 0 ? 'verified' : 'failed';
    }
  }
  return results;
}

function severityIcon(severity: string, passed: boolean) {
  if (passed) return <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />;
  if (severity === 'required') return <XCircle size={18} className="text-red-500 flex-shrink-0" />;
  if (severity === 'warning') return <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />;
  return <Info size={18} className="text-sky-500 flex-shrink-0" />;
}

function severityBg(severity: string, passed: boolean) {
  if (passed) return 'border-emerald-100 bg-emerald-50/30';
  if (severity === 'required') return 'border-red-100 bg-red-50/30';
  if (severity === 'warning') return 'border-amber-100 bg-amber-50/30';
  return 'border-sky-100 bg-sky-50/30';
}

interface CheckRowProps {
  check: CheckResult;
  expandKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  fixingKey: string | null;
  fixMsg?: FixMsg;
  onFix: (check: CheckResult) => void;
}

function CheckRow({ check, expandKey, expanded, onToggle, fixingKey, fixMsg, onFix }: CheckRowProps) {
  return (
    <div className={`rounded-lg border transition-colors ${severityBg(check.severity, check.passed)}`}>
      <button
        onClick={() => onToggle(expandKey)}
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
          <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100/60 pt-3 ml-9">
          {check.message && (
            <p className="text-sm text-gray-700 mb-2">{check.message}</p>
          )}
          {check.details && (
            <div className="bg-white/70 rounded-md p-3 text-xs text-gray-600 font-mono mb-3 whitespace-pre-wrap">
              {check.details}
            </div>
          )}
          {check.notes && (
            <p className="text-xs text-gray-500 italic mb-2">{check.notes}</p>
          )}
          {check.error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-mono">
              {check.error}
            </div>
          )}

          {!check.passed && check.can_fix && (
            <div className="flex items-start gap-3 mt-2">
              <button
                onClick={() => onFix(check)}
                disabled={fixingKey === expandKey}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 disabled:opacity-40 transition-colors"
              >
                {fixingKey === expandKey ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Wrench size={12} />
                )}
                Auto-fix
              </button>
              {check.fix_warning && (
                <p className="text-xs text-amber-600 leading-relaxed">{check.fix_warning}</p>
              )}
            </div>
          )}

          {fixMsg && (
            <div
              className={`mt-3 text-xs rounded-md px-3 py-2 ${
                fixMsg.applied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {fixMsg.message}
              {fixMsg.warning && (
                <p className="mt-1 text-amber-600">{fixMsg.warning}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PreflightChecks({ data, update }: PreflightChecksProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [allNodesLoading, setAllNodesLoading] = useState(false);
  const [allNodesError, setAllNodesError] = useState<string | null>(null);
  const [nodeCheckResults, setNodeCheckResults] = useState<NodePreflightSummary[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [fixingKey, setFixingKey] = useState<string | null>(null);
  const [fixMessages, setFixMessages] = useState<Record<string, FixMsg>>({});
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const excluded = useMemo(() => new Set(data.excludedNodeIds), [data.excludedNodeIds]);
  const includedNodes = useMemo(
    () => data.nodes.filter((n) => !excluded.has(n.id)),
    [data.nodes, excluded]
  );

  const allIncludedVerified = useMemo(
    () => includedNodes.length > 0 && includedNodes.every((n) => data.nodeVerification[n.id] === 'verified'),
    [includedNodes, data.nodeVerification]
  );

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleFix = useCallback(async (check: CheckResult, nodeId?: string) => {
    const key = nodeId ? `${nodeId}:${check.id}` : `local:${check.id}`;
    setFixingKey(key);
    try {
      const result = await applyFix(check.id, nodeId);
      setFixMessages((prev) => ({
        ...prev,
        [key]: {
          applied: result.applied,
          message: result.message || (result.error ? result.error : 'Fix applied'),
          warning: result.warning || undefined,
        },
      }));
    } catch (err) {
      setFixMessages((prev) => ({
        ...prev,
        [key]: { applied: false, message: err instanceof Error ? err.message : 'Fix failed' },
      }));
    } finally {
      setFixingKey(null);
    }
  }, []);

  const verifyNodes = useCallback(async () => {
    if (includedNodes.length === 0) return;
    setVerifyingAll(true);
    setVerifyError(null);

    const markAllPending: Record<string, 'pending' | 'verified' | 'failed'> = {};
    data.nodes.forEach((n) => { markAllPending[n.id] = 'pending'; });
    update({ nodeVerification: markAllPending });

    try {
      await syncInventory();
      const task = await executeAction('cluster', 'pingall');

      let finished = false;
      let attempts = 0;
      const maxAttempts = 240;

      while (!finished && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1500));
        attempts++;
        const result = await getTask(task.id);

        if (result.status !== 'running' && result.status !== 'pending') {
          finished = true;
          const perNode = parseAnsibleRecap(result.output ?? '', data.nodes);
          const verification: Record<string, 'pending' | 'verified' | 'failed'> = {};
          data.nodes.forEach((n) => {
            if (perNode[n.id] !== undefined) {
              verification[n.id] = perNode[n.id];
            } else {
              verification[n.id] = result.exit_code === 0 ? 'verified' : 'failed';
            }
          });
          update({ nodeVerification: verification });

          if (Object.values(verification).some((s) => s === 'failed')) {
            setVerifyError('One or more nodes failed connectivity checks. Verify SSH credentials and network access.');
          }
        }
      }

      if (!finished) {
        const verification: Record<string, 'pending' | 'verified' | 'failed'> = {};
        data.nodes.forEach((n) => { verification[n.id] = 'failed'; });
        update({ nodeVerification: verification });
        setVerifyError('Verification timed out. The backend may be unresponsive.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setVerifyError(msg);
      const verification: Record<string, 'pending' | 'verified' | 'failed'> = {};
      data.nodes.forEach((n) => { verification[n.id] = 'failed'; });
      update({ nodeVerification: verification });
    } finally {
      setVerifyingAll(false);
    }
  }, [data.nodes, includedNodes.length, update]);

  const runLocalChecks = useCallback(async () => {
    setLocalLoading(true);
    try {
      const summary = await runPreflightChecks();
      update({ preflightResults: summary.results });
      const failedKeys = new Set(
        summary.results.filter((r) => !r.passed).map((r) => `local:${r.id}`)
      );
      setExpandedIds((prev) => new Set([...prev, ...failedKeys]));
    } catch {
      update({ preflightResults: [] });
    } finally {
      setLocalLoading(false);
    }
  }, [update]);

  const runAllNodeChecks = useCallback(async () => {
    setAllNodesLoading(true);
    setAllNodesError(null);
    try {
      const summary = await runPreflightChecks({ scope: 'all-nodes' });
      const nodes = summary.nodes ?? [];
      setNodeCheckResults(nodes);

      const failedCheckKeys = new Set<string>();
      const failedNodeIds = new Set<string>();
      nodes.forEach((node) => {
        if (node.error || node.failed > 0) failedNodeIds.add(node.node_id);
        node.results.filter((r) => !r.passed).forEach((r) => {
          failedCheckKeys.add(`${node.node_id}:${r.id}`);
        });
      });
      setExpandedIds((prev) => new Set([...prev, ...failedCheckKeys]));
      setExpandedNodeIds(failedNodeIds);
    } catch (err) {
      setAllNodesError(err instanceof Error ? err.message : 'Failed to run remote node checks');
      setNodeCheckResults([]);
    } finally {
      setAllNodesLoading(false);
    }
  }, []);

  const runAllChecks = useCallback(() => {
    setExpandedIds(new Set());
    setExpandedNodeIds(new Set());
    setFixMessages({});
    runLocalChecks();
    runAllNodeChecks();
    verifyNodes();
  }, [runLocalChecks, runAllNodeChecks, verifyNodes]);

  useEffect(() => {
    runAllChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localLoading || allNodesLoading) return;

    const localRequiredPassed = data.preflightResults.every(
      (r) => r.passed || r.severity !== 'required'
    );

    const remoteRequiredPassed =
      !allNodesError &&
      nodeCheckResults.every((node) => {
        if (node.error) return false;
        return node.results.every((r) => r.passed || r.severity !== 'required');
      });

    const shouldPass = localRequiredPassed && remoteRequiredPassed && allIncludedVerified;
    if (data.preflightPassed !== shouldPass) {
      update({ preflightPassed: shouldPass });
    }
  }, [
    localLoading,
    allNodesLoading,
    allNodesError,
    data.preflightResults,
    nodeCheckResults,
    allIncludedVerified,
    data.preflightPassed,
    update,
  ]);

  const isLocalhost = (n: ManagedNode) =>
    n.ansible_host === '127.0.0.1' || n.ansible_host === 'localhost';

  const isAnythingLoading = localLoading || allNodesLoading || verifyingAll;

  const getNodeData = (node: ManagedNode) => {
    if (isLocalhost(node)) {
      const results = data.preflightResults;
      const passed = results.filter((r) => r.passed).length;
      const requiredFailed = results.filter((r) => !r.passed && r.severity === 'required').length;
      return {
        results,
        loading: localLoading,
        error: null as string | null,
        passed,
        total: results.length,
        requiredFailed,
        checkIdPrefix: 'local' as string,
        fixNodeId: undefined as string | undefined,
      };
    }
    const summary = nodeCheckResults.find((n) => n.node_id === node.id);
    if (!summary) {
      return {
        results: [] as CheckResult[],
        loading: allNodesLoading,
        error: null as string | null,
        passed: 0,
        total: 0,
        requiredFailed: 0,
        checkIdPrefix: node.id,
        fixNodeId: node.id,
      };
    }
    return {
      results: summary.results,
      loading: false,
      error: summary.error ?? null,
      passed: summary.results.filter((r) => r.passed).length,
      total: summary.results.length,
      requiredFailed: summary.results.filter((r) => !r.passed && r.severity === 'required').length,
      checkIdPrefix: node.id,
      fixNodeId: node.id,
    };
  };

  const sshStatus = (nodeId: string) => {
    const s = data.nodeVerification[nodeId];
    if (s === 'verified') return 'verified';
    if (s === 'failed') return 'failed';
    if (verifyingAll) return 'checking';
    return 'pending';
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Preflight Checks</h2>
          <p className="text-sm text-gray-500 mt-1">
            Verifying system readiness and connectivity across all nodes.
          </p>
        </div>
        <button
          onClick={runAllChecks}
          disabled={isAnythingLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw size={14} className={isAnythingLoading ? 'animate-spin' : ''} />
          Re-check All
        </button>
      </div>

      {verifyError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{verifyError}</p>
        </div>
      )}

      {allNodesError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{allNodesError}</p>
        </div>
      )}

      {!allIncludedVerified && !verifyingAll && includedNodes.length > 0 && (
        <p className="text-xs text-amber-600 mb-4">
          All included nodes must pass SSH connectivity verification to continue.
        </p>
      )}

      <div className="space-y-3">
        {includedNodes.map((node) => {
          const nd = getNodeData(node);
          const ssh = sshStatus(node.id);
          const nodeExpanded = expandedNodeIds.has(node.id);
          const localhost = isLocalhost(node);

          const hasIssue = nd.error || nd.requiredFailed > 0 || ssh === 'failed';
          const hasWarning = !hasIssue && (nd.total > nd.passed);
          const allGood = !hasIssue && !hasWarning && ssh === 'verified' && nd.total > 0 && nd.passed === nd.total;

          const borderColor = hasIssue
            ? 'border-red-200'
            : hasWarning
              ? 'border-amber-200'
              : allGood
                ? 'border-emerald-200'
                : 'border-gray-200';

          const headerIcon = hasIssue
            ? <XCircle size={16} className="text-red-500 flex-shrink-0" />
            : hasWarning
              ? <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
              : allGood
                ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                : nd.loading || ssh === 'checking'
                  ? <Loader2 size={16} className="text-sky-500 animate-spin flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />;

          return (
            <div key={node.id} className={`rounded-lg border ${borderColor}`}>
              <button
                onClick={() => toggleNodeExpand(node.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                {headerIcon}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {localhost ? (
                    <Monitor size={14} className="text-gray-400" />
                  ) : (
                    <Server size={14} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{node.name}</p>
                  <p className="text-xs text-gray-400">{node.ansible_host}</p>
                </div>

                <div className="flex items-center gap-3 mr-2">
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    ssh === 'verified' ? 'text-emerald-600' :
                    ssh === 'failed' ? 'text-red-600' :
                    ssh === 'checking' ? 'text-sky-500' :
                    'text-gray-400'
                  }`}>
                    {ssh === 'checking' ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Wifi size={11} />
                    )}
                    {ssh === 'verified' ? 'SSH OK' : ssh === 'failed' ? 'SSH Failed' : ssh === 'checking' ? 'Checking...' : 'SSH Pending'}
                  </span>

                  {nd.total > 0 && (
                    <span className={`text-xs font-medium tabular-nums ${
                      nd.requiredFailed > 0 ? 'text-red-500' :
                      nd.passed < nd.total ? 'text-amber-500' :
                      'text-emerald-600'
                    }`}>
                      <Shield size={11} className="inline mr-0.5 -mt-0.5" />
                      {nd.passed}/{nd.total}
                    </span>
                  )}
                  {nd.loading && nd.total === 0 && (
                    <span className="text-xs text-sky-500 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" />
                      Checking...
                    </span>
                  )}
                </div>

                {nodeExpanded ? (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {nodeExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                  {/* SSH connectivity row */}
                  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                    ssh === 'verified' ? 'border-emerald-100 bg-emerald-50/40' :
                    ssh === 'failed' ? 'border-red-100 bg-red-50/40' :
                    'border-gray-100 bg-gray-50/40'
                  }`}>
                    {ssh === 'verified' ? (
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                    ) : ssh === 'failed' ? (
                      <XCircle size={15} className="text-red-500 flex-shrink-0" />
                    ) : ssh === 'checking' ? (
                      <Loader2 size={15} className="text-sky-500 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <Wifi size={13} className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">SSH Connectivity</p>
                      <p className="text-xs text-gray-500">OnRamp ping verification via Ansible</p>
                    </div>
                    <span className={`text-xs font-medium ${
                      ssh === 'verified' ? 'text-emerald-600' :
                      ssh === 'failed' ? 'text-red-600' :
                      ssh === 'checking' ? 'text-sky-500' :
                      'text-gray-400'
                    }`}>
                      {ssh === 'verified' ? 'Verified' : ssh === 'failed' ? 'Failed' : ssh === 'checking' ? 'Running...' : 'Pending'}
                    </span>
                  </div>

                  {/* Preflight checks */}
                  {nd.loading && nd.total === 0 ? (
                    <div className="flex items-center justify-center py-6 gap-3">
                      <Loader2 size={20} className="text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">Running preflight checks...</p>
                    </div>
                  ) : nd.error ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-mono">{nd.error}</p>
                    </div>
                  ) : nd.results.length > 0 ? (
                    <div className="space-y-2">
                      {nd.results.map((check) => {
                        const expandKey = `${nd.checkIdPrefix}:${check.id}`;
                        return (
                          <CheckRow
                            key={check.id}
                            check={check}
                            expandKey={expandKey}
                            expanded={expandedIds.has(expandKey)}
                            onToggle={toggleExpand}
                            fixingKey={fixingKey}
                            fixMsg={fixMessages[expandKey]}
                            onFix={(c) => handleFix(c, nd.fixNodeId)}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
