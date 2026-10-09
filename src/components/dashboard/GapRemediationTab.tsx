import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Terminal,
  Ban,
  TrendingUp,
  FileDown,
  Check,
  ExternalLink,
  Code2,
  GitCommit,
  ShieldCheck,
} from 'lucide-react';
import {
  CANDIDATE_PROFILE,
  REMEDIATION_GAPS,
  RemediationGapItem,
} from '../../data/skillTwinData';

interface GapRemediationTabProps {
  currentReadiness: number;
  remediatedIds: string[];
  waivedIds: string[];
  onTriggerRemediation: (gapId: string) => void;
  onWaiveSkill: (gapId: string) => void;
  onExecuteAllRemediations: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GapRemediationTab: React.FC<GapRemediationTabProps> = ({
  currentReadiness,
  remediatedIds,
  waivedIds,
  onTriggerRemediation,
  onWaiveSkill,
  onExecuteAllRemediations,
  onNavigateTab,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, 'A' | 'B'>>({
    docker: 'B',
    aws: 'A',
    'system-design': 'A',
  });
  const [notifyCandidate, setNotifyCandidate] = useState(true);
  const [cliTokenModalGap, setCliTokenModalGap] = useState<RemediationGapItem | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const unresolvedCount = REMEDIATION_GAPS.filter(
    (g) => !remediatedIds.includes(g.id) && !waivedIds.includes(g.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Audit Utility Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] flex-wrap">
          <span>Talent Pool</span>
          <span>/</span>
          <span>Senior Backend Engineer</span>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-sans font-medium">
            {CANDIDATE_PROFILE.name} ({CANDIDATE_PROFILE.auditId})
          </span>
          <span>/</span>
          <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
            Gap Remediation
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
          <span>AUDIT ID: GR-9941-VERIFY</span>
          <span>·</span>
          <span>OIDC Authenticated</span>
        </div>
      </div>

      {/* Header Block with KPI Bar */}
      <div className="card-surface p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[12px] font-mono font-semibold text-[#B91C1C] dark:text-[#F87171] uppercase tracking-wider">
            Diagnostic Workbench · {unresolvedCount} Discrepancies Flagged
          </div>
          <h1 className="text-[24px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Evidence Gap Remediation &amp; Skill Validation
          </h1>
          <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            Automated resolution engine resolving candidate profile claims against observed code repositories, telemetry artifacts, and verifiable platform benchmarks.
          </p>
        </div>

        {/* Compact Metric Capsule */}
        <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3 tabular-nums">
          <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] min-w-[135px] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Critical Gaps
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold text-[#B91C1C] dark:text-[#F87171]">
                {unresolvedCount}
              </span>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                / 15 skills
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#B91C1C] dark:text-[#F87171] mt-1">
              {unresolvedCount === 0 ? 'All Resolved' : 'Actionable'}
            </span>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] min-w-[140px] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Est. Verification
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                45
              </span>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                mins
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
              Automated sandboxes
            </span>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#1D4ED8]/5 dark:bg-[#3B82F6]/10 border border-[#1D4ED8]/30 dark:border-[#3B82F6]/30 min-w-[165px] flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase text-[#1D4ED8] dark:text-[#3B82F6]">
              Readiness Lift
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold text-[#1D4ED8] dark:text-[#3B82F6]">
                +8.0%
              </span>
              <span className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                ({currentReadiness}% → 89%)
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
                style={{ width: `${currentReadiness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Profile Quick Strip */}
      <div className="card-surface p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={CANDIDATE_PROFILE.avatarUrl}
            alt={CANDIDATE_PROFILE.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {CANDIDATE_PROFILE.name}
              </span>
              <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                · L5 Target
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Target: {CANDIDATE_PROFILE.role} · {CANDIDATE_PROFILE.division}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[12px] text-[#475569] dark:text-[#CBD5E1] flex-wrap tabular-nums">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            Repos Scanned: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">6 Active</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <GitCommit className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            Commits Analyzed: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">1,420</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
            Verified Benchmarks:{' '}
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
              {12 + remediatedIds.length} passed
            </strong>
          </span>
        </div>
      </div>

      {/* Main Remediation Cards */}
      <div className="space-y-5">
        {REMEDIATION_GAPS.map((gap) => {
          const isRemediated = remediatedIds.includes(gap.id);
          const isWaived = waivedIds.includes(gap.id);
          const effectiveConfidence = isRemediated
            ? gap.targetBenchmark + 6
            : gap.currentConfidence;
          const selectedOpt = selectedOptions[gap.id] || 'A';

          return (
            <div key={gap.id} className="card-surface p-5 space-y-4">
              {/* Top Row */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {gap.index}. {gap.title}
                    </h2>
                    <span
                      className={`font-mono text-[12px] font-semibold tabular-nums ${
                        isRemediated
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : isWaived
                          ? 'text-[#64748B] dark:text-[#94A3B8]'
                          : 'text-[#B91C1C] dark:text-[#F87171]'
                      }`}
                    >
                      ·{' '}
                      {isRemediated
                        ? 'Remediated (+Lift Verified)'
                        : isWaived
                        ? 'Requirement Waived'
                        : `Deficit Delta: ${gap.deficitDelta}%`}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    {gap.summary}
                  </p>
                </div>

                {/* Score Comparison Block */}
                <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#1E293B] px-4 py-2 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] shrink-0 tabular-nums">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                      Current Confidence
                    </div>
                    <div
                      className={`font-mono text-[13px] font-bold ${
                        isRemediated
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : 'text-[#B91C1C] dark:text-[#F87171]'
                      }`}
                    >
                      {effectiveConfidence}% ({isRemediated ? 'Verified' : 'Low'})
                    </div>
                  </div>
                  <div className="h-6 w-[1px] bg-[#E2E8F0] dark:bg-[#334155]" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
                      Target Benchmark
                    </div>
                    <div className="font-mono text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {gap.targetBenchmark}% (L5 Threshold)
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar with Target Marker */}
              <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isRemediated ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
                  }`}
                  style={{ width: `${effectiveConfidence}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#0F172A] dark:bg-[#F8FAFC]"
                  style={{ left: `${gap.targetBenchmark}%` }}
                  title={`Target Threshold: ${gap.targetBenchmark}%`}
                />
              </div>

              {/* Split Grid: Diagnostic Evidence Trace (5 cols) vs Resolution Options (7 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 5 cols: Telemetry Diagnostic Log */}
                <div className="lg:col-span-5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        TELEMETRY DIAGNOSTIC LOG
                      </span>
                      <span>{gap.parserName}</span>
                    </div>

                    <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed">
                      {gap.diagnosticParagraph}
                    </p>

                    <div className="space-y-1.5 pt-1 font-mono text-[12px]">
                      {gap.checks.map((chk) => {
                        const passed = isRemediated ? true : chk.passed;
                        return (
                          <div
                            key={chk.label}
                            className="flex items-center gap-2 text-[#475569] dark:text-[#CBD5E1]"
                          >
                            {passed === true ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                            ) : passed === 'neutral' ? (
                              <HelpCircle className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-[#B91C1C] dark:text-[#F87171] shrink-0" />
                            )}
                            <span>
                              {chk.label}{' '}
                              <strong
                                className={
                                  passed === true
                                    ? 'text-[#15803D] dark:text-[#4ADE80]'
                                    : passed === 'neutral'
                                    ? 'text-[#64748B]'
                                    : 'text-[#B91C1C] dark:text-[#F87171]'
                                }
                              >
                                {isRemediated ? 'Verified ✓' : chk.result}
                              </strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>{gap.artifactSource}</span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('evidence-engine')}
                      className="text-[#1D4ED8] dark:text-[#3B82F6] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <span>Inspect AST</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Right 7 cols: Actionable Resolution Options */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A */}
                    <div
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [gap.id]: 'A' }))
                      }
                      className={`p-4 rounded-[6px] border cursor-pointer transition-colors flex flex-col justify-between ${
                        selectedOpt === 'A'
                          ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                          : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase text-[#1D4ED8] dark:text-[#3B82F6]">
                            {gap.optionA.badge}
                          </span>
                          <input
                            type="radio"
                            checked={selectedOpt === 'A'}
                            onChange={() =>
                              setSelectedOptions((prev) => ({ ...prev, [gap.id]: 'A' }))
                            }
                            className="accent-[#1D4ED8]"
                          />
                        </div>
                        <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                          {gap.optionA.title}
                        </div>
                        <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                          {gap.optionA.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                        {gap.optionA.footer}
                      </div>
                    </div>

                    {/* Option B */}
                    <div
                      onClick={() =>
                        setSelectedOptions((prev) => ({ ...prev, [gap.id]: 'B' }))
                      }
                      className={`p-4 rounded-[6px] border cursor-pointer transition-colors flex flex-col justify-between ${
                        selectedOpt === 'B'
                          ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                          : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase text-[#15803D] dark:text-[#4ADE80]">
                            {gap.optionB.badge}
                          </span>
                          <input
                            type="radio"
                            checked={selectedOpt === 'B'}
                            onChange={() =>
                              setSelectedOptions((prev) => ({ ...prev, [gap.id]: 'B' }))
                            }
                            className="accent-[#1D4ED8]"
                          />
                        </div>
                        <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                          {gap.optionB.title}
                        </div>
                        <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                          {gap.optionB.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] font-mono text-[11px] text-[#15803D] dark:text-[#4ADE80] truncate">
                        {gap.optionB.footer}
                      </div>
                    </div>
                  </div>

                  {/* Execution Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onTriggerRemediation(gap.id)}
                        disabled={isRemediated}
                        className={`h-8 px-3.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                          isRemediated
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {isRemediated
                            ? `Verified (+${gap.liftPoints}% Readiness Added)`
                            : selectedOpt === 'A'
                            ? gap.optionA.buttonLabel
                            : gap.optionB.buttonLabel}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCliTokenModalGap(gap)}
                        className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Inspect CLI Command</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onWaiveSkill(gap.id)}
                      className="text-[12px] font-medium text-[#64748B] hover:text-[#B91C1C] dark:hover:text-[#F87171] inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>
                        {isWaived ? 'Restore Requirement' : 'Waive Requirement'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLI Inspection Snippet Drawer if triggered */}
      {cliTokenModalGap && (
        <div className="card-surface p-5 bg-[#0F172A] text-[#F8FAFC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] text-[#4ADE80]">
              Ephemeral CLI Verification Token · {cliTokenModalGap.title}
            </span>
            <button
              type="button"
              onClick={() => setCliTokenModalGap(null)}
              className="text-[12px] text-[#94A3B8] hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="p-3 rounded-[6px] bg-[#1E293B] font-mono text-[12px] text-[#E2E8F0] overflow-x-auto">
            {`curl -sSL https://skilltwin.io/cli | bash -s -- \\
  --candidate=${CANDIDATE_PROFILE.id} \\
  --verify-node=${cliTokenModalGap.id} \\
  --zero-retention`}
          </pre>
        </div>
      )}

      {/* Projected Verification Outcome Banner */}
      <div className="card-surface p-5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#1D4ED8] dark:text-[#3B82F6] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Projected Verification Outcome
            </div>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
              Completing these 3 micro-verifications lifts {CANDIDATE_PROFILE.name} from{' '}
              <strong>81%</strong> to <strong>89%</strong> Job Readiness.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 tabular-nums">
          <span className="text-[11px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
            Readiness Score
          </span>
          <span className="font-mono text-[13px] font-bold text-[#1D4ED8] dark:text-[#3B82F6] bg-[#FFFFFF] dark:bg-[#111827] px-3 py-1 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155]">
            {currentReadiness}% → 89% MAX
          </span>
        </div>
      </div>

      {/* Bottom Action Control Bar */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={notifyCandidate}
            onChange={(e) => setNotifyCandidate(e.target.checked)}
            className="w-4 h-4 accent-[#1D4ED8] rounded"
          />
          <div>
            <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Notify {CANDIDATE_PROFILE.name} via Email
            </div>
            <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Dispatches candidate cockpit access with personalized remediation sandboxes
            </div>
          </div>
        </label>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000);
            }}
            className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] transition-colors whitespace-nowrap"
          >
            {draftSaved ? 'Draft Saved ✓' : 'Save Draft Plan'}
          </button>
          <button
            type="button"
            onClick={onExecuteAllRemediations}
            disabled={remediatedIds.length === 3}
            className={`h-8 px-4 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              remediatedIds.length === 3
                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white'
            }`}
          >
            {remediatedIds.length === 3 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>All 3 Remediations Verified (89% Ready)</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute All (3) Remediation Tasks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
