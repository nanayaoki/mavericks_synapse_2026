import React, { useState } from 'react';
import {
  RefreshCw,
  Download,
  Terminal,
  Code2,
  ShieldCheck,
  Copy,
  Check,
  BarChart3,
  Network,
  KeyRound,
  GitMerge,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  CANDIDATE_PROFILE,
  EVIDENCE_LEDGER,
  EvidenceRecord,
} from '../../data/skillTwinData';

interface EvidenceEngineTabProps {
  onOpenBuildModal: (mode?: 'build' | 're-evaluate' | 'empty-demo') => void;
}

export const EvidenceEngineTab: React.FC<EvidenceEngineTabProps> = ({
  onOpenBuildModal,
}) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'repo' | 'pr' | 'challenge' | 'commit'>('all');
  const [langFilter, setLangFilter] = useState<'All' | 'Java' | 'Go' | 'SQL'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string>(EVIDENCE_LEDGER[0].id);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [bundleExported, setBundleExported] = useState(false);

  const filteredRecords = EVIDENCE_LEDGER.filter((rec) => {
    const matchesSource = sourceFilter === 'all' || rec.category === sourceFilter;
    const matchesLang = langFilter === 'All' || rec.language === langFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      rec.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.skillTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.skillSubtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesLang && matchesQuery;
  });

  const activeRecord: EvidenceRecord =
    EVIDENCE_LEDGER.find((r) => r.id === selectedRecordId) || EVIDENCE_LEDGER[0];

  const handleCopyDigest = () => {
    navigator.clipboard?.writeText(CANDIDATE_PROFILE.proofDigest);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  const handleExportAudit = () => {
    setBundleExported(true);
    setTimeout(() => setBundleExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Cockpit Control & Telemetry Header */}
      <div className="card-surface p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] flex-wrap">
            <span>Talent Pool</span>
            <span>/</span>
            <span>Engineers</span>
            <span>/</span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-sans font-medium">
              {CANDIDATE_PROFILE.name} (Lead Distributed Systems)
            </span>
            <span>/</span>
            <span className="text-[#1D4ED8] dark:text-[#3B82F6]">
              ID: {CANDIDATE_PROFILE.hexId}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
              Ingestion: Active
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#475569]">
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
              SHA-256 Tree: Signed
            </span>
            <button
              type="button"
              onClick={() => onOpenBuildModal('re-evaluate')}
              className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[#1D4ED8] dark:text-[#3B82F6] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-index AST</span>
            </button>
            <button
              type="button"
              onClick={handleExportAudit}
              className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {bundleExported ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Audit Bundle Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit Bundle</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Verified Evidence Engine
            </h1>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
              Deterministic cryptographic validation, AST pattern extraction, and authorship verification across integrated VCS pipelines.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex items-center gap-3 overflow-x-auto tabular-nums">
            <div className="px-3.5 py-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] min-w-[125px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Signals Indexed
              </div>
              <div className="text-[16px] font-semibold font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                1,509 <span className="text-[11px] text-[#15803D] dark:text-[#4ADE80]">+18</span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] min-w-[115px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Proof Level
              </div>
              <div className="text-[16px] font-semibold text-[#15803D] dark:text-[#4ADE80] mt-0.5">
                L3 Rigor
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] min-w-[115px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Syntactic Match
              </div>
              <div className="text-[16px] font-semibold font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                99.4%
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pipeline / Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all' as const, label: 'All Sources', count: '5' },
              { id: 'repo' as const, label: 'Production Repositories', count: '4' },
              { id: 'pr' as const, label: 'Authored PRs', count: '82' },
              { id: 'challenge' as const, label: 'Async Challenges', count: '1' },
              { id: 'commit' as const, label: 'Git Commits', count: '1,420' },
            ].map((tab) => {
              const active = sourceFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSourceFilter(tab.id)}
                  className={`h-8 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#E2E8F0] dark:hover:bg-[#334155]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded-[4px] tabular-nums ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FFFFFF] dark:bg-[#0B1120] text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Language Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repo or skill..."
                className="h-8 pl-8 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div className="inline-flex items-center gap-1 p-0.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[12px]">
              {(['All', 'Java', 'Go', 'SQL'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLangFilter(lang)}
                  className={`px-2 py-1 rounded-[4px] font-mono text-[11px] transition-colors ${
                    langFilter === lang
                      ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workspace Split (8 cols Ledger + AST, 4 cols Cryptographic Proof + Complexity) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 8-COL: Canonical Evidence Ledger + Deep AST Analysis Preview */}
        <div className="xl:col-span-8 space-y-6 min-w-0">
          {/* Canonical Evidence Ledger Table */}
          <div className="card-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/60">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <h2 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Canonical Evidence Ledger
                </h2>
                <span className="font-mono text-[11px] text-[#15803D] dark:text-[#4ADE80] font-medium">
                  · {filteredRecords.length} High-Assurance Records
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Click Inspect to load AST
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] text-[11px] font-semibold uppercase tracking-wider h-9">
                    <th className="py-2 px-3">Artifact / Target Repo</th>
                    <th className="py-2 px-3">Verified Skill Signal</th>
                    <th className="py-2 px-3">Confidence &amp; Depth</th>
                    <th className="py-2 px-3">Authorship Proof</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-[13px]">
                  {filteredRecords.map((rec) => {
                    const isSelected = rec.id === activeRecord.id;
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => setSelectedRecordId(rec.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1D4ED8]/5 dark:bg-[#3B82F6]/10'
                            : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50'
                        }`}
                      >
                        <td className="py-3 px-3 align-top">
                          <div className="font-mono text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                            <span>{rec.repo}</span>
                            <ExternalLink className="w-3 h-3 text-[#64748B]" />
                          </div>
                          <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {rec.refLabel}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {rec.skillTitle}
                          </div>
                          <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                            {rec.skillSubtitle}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top tabular-nums">
                          <div className="font-mono text-[12px] font-semibold text-[#15803D] dark:text-[#4ADE80]">
                            {rec.confidence}% Confidence
                          </div>
                          <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {rec.depthMetric}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="font-mono text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1">
                            {rec.proofType.startsWith('GPG') ? (
                              <KeyRound className="w-3 h-3 text-[#15803D] dark:text-[#4ADE80]" />
                            ) : (
                              <GitMerge className="w-3 h-3 text-[#1D4ED8] dark:text-[#3B82F6]" />
                            )}
                            <span>{rec.proofType}</span>
                          </div>
                          <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                            {rec.proofDetail}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top whitespace-nowrap font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                          {rec.timestamp}
                        </td>
                        <td className="py-3 px-3 align-top text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecordId(rec.id);
                            }}
                            className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#1D4ED8] text-white'
                                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#1D4ED8] hover:text-white'
                            }`}
                          >
                            <span>{isSelected ? 'Active' : 'Inspect'}</span>
                            <Code2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deep AST Analysis Preview */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Code2 className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Deep AST Analysis Preview
                </h3>
                <span className="font-mono text-[12px] text-[#475569] dark:text-[#CBD5E1] bg-[#F1F5F9] dark:bg-[#1E293B] px-2 py-0.5 rounded-[4px]">
                  {activeRecord.astPreview.filePath}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#15803D] dark:text-[#4ADE80] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#4ADE80]" />
                PARSER: {activeRecord.astPreview.parserVersion}
              </span>
            </div>

            {/* Code Inspection Box */}
            <div className="rounded-[6px] bg-[#0F172A] text-[#F8FAFC] p-4 font-mono text-[12px] overflow-x-auto border border-[#334155]">
              <div className="flex text-[#94A3B8] pb-2 mb-2 border-b border-[#334155] text-[11px]">
                <span className="w-10 text-right pr-3 select-none">#</span>
                <span className="flex-1">TOKEN / AST NODE DECLARATION</span>
                <span>PROBABILITY</span>
              </div>
              {activeRecord.astPreview.lines.map((line) => (
                <div
                  key={line.lineNumber}
                  className={`flex py-0.5 px-1 rounded-[3px] ${
                    line.highlighted
                      ? 'bg-[#1D4ED8]/30 text-[#FDE047] font-semibold'
                      : 'hover:bg-white/5 text-[#E2E8F0]'
                  }`}
                >
                  <span className="w-10 text-right pr-3 text-[#64748B] select-none tabular-nums">
                    {line.lineNumber}
                  </span>
                  <span className="flex-1 whitespace-pre">{line.code}</span>
                  <span className="text-[#4ADE80] pl-4 whitespace-nowrap tabular-nums">
                    {line.probability}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Extracted Idioms
                </div>
                <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                  {activeRecord.astPreview.idiom}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {activeRecord.astPreview.idiomSub}
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Resource Cleanup
                </div>
                <div className="text-[14px] font-semibold text-[#15803D] dark:text-[#4ADE80] mt-1">
                  {activeRecord.astPreview.resourceCleanup}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {activeRecord.astPreview.resourceSub}
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Error Semantics
                </div>
                <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                  {activeRecord.astPreview.errorSemantics}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {activeRecord.astPreview.errorSub}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4-COL: Cryptographic Proof, Complexity & Test Churn, Extracted Capabilities */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. Cryptographic Proof Certificate */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Cryptographic Proof
                </h3>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#15803D] dark:text-[#4ADE80]">
                GPG PASS
              </span>
            </div>

            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Signatures cross-validated against hardware tokens and trusted remote origin repositories.
            </p>

            <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] dark:text-[#94A3B8]">GPG Fingerprint:</span>
                <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {CANDIDATE_PROFILE.gpgFingerprint}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] dark:text-[#94A3B8]">GitHub Verified:</span>
                <span className="text-[#15803D] dark:text-[#4ADE80] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {CANDIDATE_PROFILE.githubHandle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] dark:text-[#94A3B8]">SSH Ed25519:</span>
                <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">
                  SHA256:4tL9xQ+...92Z
                </span>
              </div>
              <div className="flex justify-between items-center tabular-nums">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Signed Commit Ratio:</span>
                <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  97.8% (1,389 / 1,420)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] font-mono text-[11px] text-[#475569] dark:text-[#CBD5E1] flex items-center justify-between">
              <span className="truncate">
                PROOF_DIGEST: {CANDIDATE_PROFILE.proofDigest}
              </span>
              <button
                type="button"
                onClick={handleCopyDigest}
                className="pl-2 text-[#1D4ED8] dark:text-[#3B82F6] hover:underline shrink-0 inline-flex items-center gap-1"
                title="Copy SHA256 Checksum"
              >
                {copiedChecksum ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. Complexity & Test Churn Histogram */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Complexity &amp; Test Churn
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#15803D] dark:text-[#4ADE80] tabular-nums">
                86.4% COVERAGE
              </span>
            </div>

            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Cyclomatic complexity histogram across authored classes versus unit/integration coverage tests.
            </p>

            <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-end justify-between h-24 gap-2 pt-2">
                {[
                  { bin: '1-5', height: 76, count: '412 funcs' },
                  { bin: '6-10', height: 58, count: '290 funcs' },
                  { bin: '11-15', height: 34, count: '142 funcs' },
                  { bin: '16-20', height: 18, count: '54 funcs' },
                  { bin: '21-30', height: 9, count: '16 funcs' },
                  { bin: '>30', height: 4, count: '2 funcs' },
                ].map((bar) => (
                  <div key={bar.bin} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full bg-[#1D4ED8] dark:bg-[#3B82F6] rounded-t-[2px] transition-all"
                      style={{ height: `${bar.height}px` }}
                      title={`Complexity ${bar.bin}: ${bar.count}`}
                    />
                    <span className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      {bar.bin}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                <span>
                  Average Cyclomatic Score:{' '}
                  <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">4.2</strong> (Healthy)
                </span>
                <span className="font-mono text-[#15803D] dark:text-[#4ADE80]">p95 &lt; 14</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 tabular-nums">
              <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Code Churn Rate
                </div>
                <div className="text-[16px] font-semibold font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                  3.8%
                </div>
                <div className="text-[11px] text-[#15803D] dark:text-[#4ADE80]">
                  Low revert frequency
                </div>
              </div>
              <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Mutation Score
                </div>
                <div className="text-[16px] font-semibold font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                  78.2%
                </div>
                <div className="text-[11px] text-[#15803D] dark:text-[#4ADE80]">
                  High test kill-rate
                </div>
              </div>
            </div>
          </div>

          {/* 3. Extracted Capabilities */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Extracted Capabilities
                </h3>
              </div>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                14 Active Patterns
              </span>
            </div>

            <div className="space-y-2 tabular-nums">
              {[
                {
                  title: 'Saga Pattern Orchestration',
                  sub: 'Compensating transaction logic in 8 repositories',
                  conf: '96%',
                },
                {
                  title: 'Idempotency Keys',
                  sub: 'Header-driven deduplication filters in REST handlers',
                  conf: '93%',
                },
                {
                  title: 'Deadlock Prevention Strategies',
                  sub: 'Strict lock acquisition ordering in Go & Java monitors',
                  conf: '89%',
                },
                {
                  title: 'Zero-Alloc Serialization',
                  sub: 'FlatBuffers & custom Protobuf marshalers implemented',
                  conf: '82%',
                },
              ].map((pat) => (
                <div
                  key={pat.title}
                  className="p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {pat.title}
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      {pat.sub}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#15803D] dark:text-[#4ADE80] shrink-0">
                    CONF: {pat.conf}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
