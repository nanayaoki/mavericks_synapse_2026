import React, { useState } from 'react';
import {
  Network,
  LayoutGrid,
  Terminal,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Play,
  UserCheck,
  Info,
  ArrowRight,
} from 'lucide-react';
import {
  CANDIDATE_PROFILE,
  GRAPH_NODES,
  GraphSubNode,
} from '../../data/skillTwinData';

interface SkillGraphTabProps {
  remediatedIds: string[];
  onTriggerRemediation: (gapId: string) => void;
  onNavigateTab: (tab: string) => void;
}

const DOMAINS = [
  {
    id: 'jvm' as const,
    title: '1. Core JVM & Language Execution',
    avg: '86.0%',
    avgStatus: 'strong',
  },
  {
    id: 'distributed' as const,
    title: '2. Distributed Architecture',
    avg: '69.3%',
    avgStatus: 'moderate',
  },
  {
    id: 'data' as const,
    title: '3. Data Systems & Storage',
    avg: '86.6%',
    avgStatus: 'strong',
  },
  {
    id: 'cloud' as const,
    title: '4. Cloud & Deployment Systems',
    avg: '51.6%',
    avgStatus: 'gap',
  },
];

export const SkillGraphTab: React.FC<SkillGraphTabProps> = ({
  remediatedIds,
  onTriggerRemediation,
  onNavigateTab,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'L4' | 'L5' | 'L6'>('L5');
  const [domainFilter, setDomainFilter] = useState<'all' | 'jvm' | 'distributed' | 'data' | 'cloud'>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('tree');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('caching');
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});
  const [copiedUri, setCopiedUri] = useState(false);

  const getNodeScore = (node: GraphSubNode) => {
    if (manualOverrides[node.id]) return manualOverrides[node.id];
    if (node.id === 'docker' && remediatedIds.includes('docker')) return 81;
    if (node.id === 'aws_tf' && remediatedIds.includes('aws')) return 78;
    if (node.id === 'caching' && remediatedIds.includes('system-design')) return 84;
    return node.score;
  };

  const getNodeTarget = (node: GraphSubNode) => {
    if (selectedLevel === 'L4') return node.targetL4;
    if (selectedLevel === 'L6') return node.targetL6;
    return node.targetL5;
  };

  const activeNode =
    GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[5];
  const activeScore = getNodeScore(activeNode);
  const activeTarget = getNodeTarget(activeNode);
  const activeSpread = activeScore - activeTarget;
  const isActiveGap = activeScore < activeTarget;

  const visibleDomains = DOMAINS.filter(
    (d) => domainFilter === 'all' || d.id === domainFilter
  );

  const handleManualOverride = () => {
    setManualOverrides((prev) => ({
      ...prev,
      [activeNode.id]: Math.max(activeScore, activeTarget + 4),
    }));
  };

  const handleCopyNodeUri = () => {
    navigator.clipboard?.writeText(`skilltwin://ontology/${selectedLevel}/${activeNode.nodeRef}`);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const mapNodeToGapId = (nodeId: string) => {
    if (nodeId === 'docker') return 'docker';
    if (nodeId === 'aws_tf') return 'aws';
    return 'system-design';
  };

  return (
    <div className="space-y-6">
      {/* Sub-header / Context & Level Bar */}
      <div className="card-surface p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center gap-1.5 text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]"
            >
              <span>Candidates</span>
              <span>/</span>
              <span>{CANDIDATE_PROFILE.name}</span>
              <span>/</span>
              <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                Skill Graph
              </span>
              <span>·</span>
              <span>ID: {CANDIDATE_PROFILE.id}</span>
            </nav>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-[24px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Competency &amp; Ontology Skill Graph
              </h1>
              <span className="font-mono text-[12px] text-[#1D4ED8] dark:text-[#3B82F6]">
                12 Evaluated Nodes · {selectedLevel} Ontology
              </span>
            </div>
          </div>

          {/* Actionable Level & Mode Controllers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Benchmark Seniority Selector */}
            <div
              role="group"
              aria-label="Target Seniority Level"
              className="inline-flex p-0.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]"
            >
              {(['L4', 'L5', 'L6'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-[4px] text-[12px] font-medium transition-colors whitespace-nowrap ${
                    selectedLevel === lvl
                      ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  {lvl === 'L4'
                    ? 'L4 Senior'
                    : lvl === 'L5'
                    ? 'L5 Benchmark'
                    : 'L6 Staff'}
                </button>
              ))}
            </div>

            {/* Domain Filter */}
            <select
              value={domainFilter}
              onChange={(e) =>
                setDomainFilter(
                  e.target.value as 'all' | 'jvm' | 'distributed' | 'data' | 'cloud'
                )
              }
              aria-label="Filter by domain"
              className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value="all">All Domains (4/4 Visible)</option>
              <option value="jvm">1. Core JVM &amp; Execution</option>
              <option value="distributed">2. Distributed Architecture</option>
              <option value="data">3. Data Systems &amp; Storage</option>
              <option value="cloud">4. Cloud &amp; Deployment</option>
            </select>

            {/* View Switcher */}
            <div className="inline-flex p-0.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  viewMode === 'tree'
                    ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                    : 'text-[#475569] dark:text-[#CBD5E1]'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Hierarchical Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  viewMode === 'matrix'
                    ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                    : 'text-[#475569] dark:text-[#CBD5E1]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metric Strip */}
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[12px] tabular-nums">
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8]">VERIFIED SKILLS: </span>
            <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
              {
                GRAPH_NODES.filter((n) => getNodeScore(n) >= getNodeTarget(n)).length
              }
              /12
            </span>
          </div>
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8]">ACTIVE DEFICITS: </span>
            <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
              {
                GRAPH_NODES.filter((n) => getNodeScore(n) < getNodeTarget(n)).length
              }{' '}
              Gaps Flagged
            </span>
          </div>
          <div>
            <span className="text-[#64748B] dark:text-[#94A3B8]">EVIDENCE DEPTH: </span>
            <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              1,420 Commits
            </span>
          </div>
          <div className="md:text-right">
            <span className="text-[#64748B] dark:text-[#94A3B8]">GRAPH RE-INDEX: </span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC]">14m ago (SHA: 4a9f20)</span>
          </div>
        </div>
      </div>

      {/* Main Canvas: Graph + Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Hierarchical Graph Workspace (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="card-surface p-5 overflow-x-auto">
            {/* Legend Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div className="font-mono text-[12px] text-[#475569] dark:text-[#CBD5E1] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                <span>{selectedLevel} SWE BENCHMARK ONTOLOGY · DAG VIEW</span>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-[2px] bg-[#15803D]" /> Verified (≥ Target)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-[2px] bg-[#B91C1C]" /> Gap (&lt; Target)
                </span>
              </div>
            </div>

            {viewMode === 'tree' ? (
              <div className="min-w-[640px] py-1">
                {/* LEVEL 0: ROOT NODE */}
                <div className="flex items-center mb-8">
                  <div className="w-full max-w-sm rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border-2 border-[#1D4ED8] dark:border-[#3B82F6] p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] dark:text-[#3B82F6]">
                        Root Competency Target
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                        {selectedLevel} BENCHMARK
                      </span>
                    </div>
                    <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Backend Software Engineering
                    </h2>
                    <div className="mt-2 flex items-center justify-between font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      <span>
                        Aggregate Match:{' '}
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">76.4%</strong>
                      </span>
                      <span>
                        Requirement: {selectedLevel === 'L4' ? '72%' : selectedLevel === 'L6' ? '85%' : '80%'}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-1.5 rounded-full"
                        style={{ width: '76.4%' }}
                      />
                    </div>
                  </div>
                  <div className="h-[1.5px] bg-[#CBD5E1] dark:bg-[#334155] flex-1 ml-4 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  </div>
                </div>

                {/* LEVEL 1 & 2: BRANCHES & SUBNODES */}
                <div className="space-y-7 pl-4 border-l-[1.5px] border-[#CBD5E1] dark:border-[#334155] ml-6 relative">
                  {visibleDomains.map((domain) => {
                    const domainNodes = GRAPH_NODES.filter(
                      (n) => n.domainId === domain.id
                    );
                    const hasSelectedNode = domainNodes.some(
                      (n) => n.id === selectedNodeId
                    );

                    return (
                      <div key={domain.id} className="relative pl-6">
                        {/* Orthogonal horizontal branch connector */}
                        <div
                          className={`absolute -left-[16px] top-5 w-6 h-[1.5px] ${
                            hasSelectedNode
                              ? 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                              : 'bg-[#CBD5E1] dark:bg-[#334155]'
                          }`}
                        />

                        {/* Domain Header Card */}
                        <div className="flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-[6px] px-3.5 py-2 max-w-md mb-3">
                          <div className="flex items-center gap-2">
                            {domain.id === 'jvm' ? (
                              <Terminal className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                            ) : domain.id === 'distributed' ? (
                              <Network className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                            ) : domain.id === 'data' ? (
                              <Database className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                            ) : (
                              <Cloud className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                            )}
                            <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {domain.title}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[11px] font-semibold tabular-nums ${
                              domain.avgStatus === 'strong'
                                ? 'text-[#15803D] dark:text-[#4ADE80]'
                                : domain.avgStatus === 'gap'
                                ? 'text-[#B91C1C] dark:text-[#F87171]'
                                : 'text-[#475569] dark:text-[#CBD5E1]'
                            }`}
                          >
                            {domain.avg} AVG
                          </span>
                        </div>

                        {/* Subnodes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {domainNodes.map((node) => {
                            const score = getNodeScore(node);
                            const target = getNodeTarget(node);
                            const isSelected = node.id === selectedNodeId;
                            const isVerified = score >= target;

                            return (
                              <button
                                key={node.id}
                                type="button"
                                onClick={() => setSelectedNodeId(node.id)}
                                className={`text-left rounded-[6px] p-3 transition-all relative ${
                                  isSelected
                                    ? 'bg-[#FFFFFF] dark:bg-[#111827] border-2 border-[#1D4ED8] dark:border-[#3B82F6] ring-2 ring-[#1D4ED8]/10'
                                    : 'bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] hover:border-[#1D4ED8]'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`font-mono text-[11px] ${
                                      isVerified
                                        ? 'text-[#64748B] dark:text-[#94A3B8]'
                                        : 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
                                    }`}
                                  >
                                    {node.nodeRef}
                                  </span>
                                  <span
                                    className={`text-[11px] font-medium flex items-center gap-1 ${
                                      isVerified
                                        ? 'text-[#15803D] dark:text-[#4ADE80]'
                                        : 'text-[#B91C1C] dark:text-[#F87171]'
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isVerified ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
                                      }`}
                                    />
                                    {isVerified ? 'Verified' : 'Gap Flagged'}
                                  </span>
                                </div>
                                <h3 className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                  {node.title}
                                </h3>
                                <div className="mt-2 flex items-baseline justify-between font-mono text-[12px] tabular-nums">
                                  <span
                                    className={
                                      isVerified
                                        ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                                        : 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
                                    }
                                  >
                                    Score: <strong>{score}%</strong>
                                  </span>
                                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                                    Target: {target}%
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Matrix View */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {GRAPH_NODES.filter(
                  (n) => domainFilter === 'all' || n.domainId === domainFilter
                ).map((node) => {
                  const score = getNodeScore(node);
                  const target = getNodeTarget(node);
                  const isVerified = score >= target;
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-[6px] text-left border transition-all ${
                        isSelected
                          ? 'border-2 border-[#1D4ED8] bg-[#F8FAFC] dark:bg-[#1E293B]'
                          : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] hover:border-[#1D4ED8]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        <span>{node.nodeRef}</span>
                        <span>Weight: {node.weight}</span>
                      </div>
                      <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                        {node.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between font-mono text-[12px] tabular-nums">
                        <span
                          className={
                            isVerified
                              ? 'text-[#15803D] dark:text-[#4ADE80] font-semibold'
                              : 'text-[#B91C1C] dark:text-[#F87171] font-semibold'
                          }
                        >
                          {score}% vs {target}%
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {isVerified ? 'Pass' : 'Deficit'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Graph Semantic Note */}
          <div className="card-surface px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
              <span>
                Nodes display validated Bayesian skill estimates across 3 telemetry ingest engines.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('documentation')}
              className="text-[#1D4ED8] dark:text-[#3B82F6] hover:underline font-sans font-medium inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>View DAG Verification Spec</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT: Selected Node Inspector (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="card-surface overflow-hidden">
            {/* Inspector Header */}
            <div className="px-4 py-3 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                Node Inspector
              </span>
              <span
                className={`font-mono text-[11px] font-semibold ${
                  isActiveGap
                    ? 'text-[#B91C1C] dark:text-[#F87171]'
                    : 'text-[#15803D] dark:text-[#4ADE80]'
                }`}
              >
                {isActiveGap ? 'GAP DEFICIT' : 'VERIFIED NODE'}
              </span>
            </div>

            {/* Node Title & Score vs Target */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    NODE_REF: {activeNode.nodeRef}
                  </span>
                  <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {activeNode.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNodeUri}
                  className="p-1.5 rounded-[4px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                  title="Copy Node URI"
                >
                  {copiedUri ? (
                    <Check className="w-4 h-4 text-[#15803D]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between tabular-nums">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                    Measured Evidence
                  </div>
                  <div
                    className={`text-[18px] font-bold font-mono ${
                      isActiveGap
                        ? 'text-[#B91C1C] dark:text-[#F87171]'
                        : 'text-[#15803D] dark:text-[#4ADE80]'
                    }`}
                  >
                    {activeScore}%
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-[#E2E8F0] dark:bg-[#334155]" />
                <div>
                  <div className="text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                    {selectedLevel} Threshold
                  </div>
                  <div className="text-[18px] font-semibold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                    {activeTarget}%
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-[#E2E8F0] dark:bg-[#334155]" />
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                    Spread
                  </div>
                  <div
                    className={`text-[18px] font-bold font-mono ${
                      activeSpread < 0
                        ? 'text-[#B91C1C] dark:text-[#F87171]'
                        : 'text-[#15803D] dark:text-[#4ADE80]'
                    }`}
                  >
                    {activeSpread >= 0 ? `+${activeSpread}%` : `${activeSpread}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetric Signal Breakdown */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Telemetric Signal Breakdown
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    isActiveGap
                      ? 'text-[#B91C1C] dark:text-[#F87171]'
                      : 'text-[#15803D] dark:text-[#4ADE80]'
                  }`}
                >
                  {isActiveGap ? 'DEFICIT DETECTED' : 'HIGH SIGNAL'}
                </span>
              </div>

              <div
                className={`rounded-[6px] p-3 border-l-4 ${
                  isActiveGap
                    ? 'bg-[#FEF2F2] dark:bg-[#B91C1C]/15 border-l-[#B91C1C]'
                    : 'bg-[#F0FDF4] dark:bg-[#15803D]/15 border-l-[#15803D]'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[12px] font-semibold ${
                    isActiveGap
                      ? 'text-[#B91C1C] dark:text-[#F87171]'
                      : 'text-[#15803D] dark:text-[#4ADE80]'
                  }`}
                >
                  {isActiveGap ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isActiveGap ? 'Missing Critical Proof Points' : 'Verified Repository Proof'}
                  </span>
                </div>
                <p className="text-[12px] text-[#0F172A] dark:text-[#F8FAFC] mt-1 leading-relaxed">
                  {activeNode.summary}
                </p>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                {activeNode.telemetryBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between py-1 border-b border-[#E2E8F0]/60 dark:border-[#334155]/60 last:border-0"
                  >
                    <span className="text-[#475569] dark:text-[#CBD5E1]">{item.label}</span>
                    <span
                      className={`font-semibold ${
                        item.passed
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : 'text-[#B91C1C] dark:text-[#F87171]'
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisite Ontologies */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] block">
                Prerequisite Ontologies
              </span>
              {activeNode.prerequisites.map((pre) => (
                <div
                  key={pre.name}
                  className="flex items-center justify-between p-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-[12px]"
                >
                  <div className="flex items-center gap-1.5 text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                    <span>
                      {pre.code} {pre.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#15803D] dark:text-[#4ADE80] tabular-nums">
                    {pre.score}% (Passed)
                  </span>
                </div>
              ))}
            </div>

            {/* Prescribed Action */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Prescribed Action
                </span>
                <span className="font-mono text-[11px] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                  {activeNode.prescribedAction.estimatedLift}
                </span>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
                <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {activeNode.prescribedAction.title}
                </div>
                <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {activeNode.prescribedAction.description}
                </p>
              </div>

              {isActiveGap && (
                <>
                  <button
                    type="button"
                    onClick={() => onTriggerRemediation(mapNodeToGapId(activeNode.id))}
                    className="w-full h-8 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger Remediation Challenge</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleManualOverride}
                    className="w-full h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Override with Manual Interview Score</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
