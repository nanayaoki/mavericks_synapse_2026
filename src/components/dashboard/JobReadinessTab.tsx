import React, { useState } from 'react';
import {
  FileDown,
  GitCompare,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Terminal,
  Link2,
  Check,
} from 'lucide-react';
import { CANDIDATE_PROFILE, SKILLS_DATA, SkillItem } from '../../data/skillTwinData';

interface JobReadinessTabProps {
  currentReadiness: number;
  remediatedIds: string[];
  waivedIds: string[];
  onNavigateTab: (tab: string) => void;
  onTriggerRemediation: (gapId: string) => void;
  onOpenBuildModal: (mode?: 'build' | 're-evaluate' | 'empty-demo') => void;
}

export const JobReadinessTab: React.FC<JobReadinessTabProps> = ({
  currentReadiness,
  remediatedIds,
  waivedIds,
  onNavigateTab,
  onTriggerRemediation,
  onOpenBuildModal,
}) => {
  const [tableFilter, setTableFilter] = useState<'all' | 'strong' | 'gaps'>('all');
  const [expandedWhySkillId, setExpandedWhySkillId] = useState<string | null>('docker');
  const [showCandidateComparisonModal, setShowCandidateComparisonModal] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);

  const getEffectiveScore = (skill: SkillItem) => {
    if (remediatedIds.includes(skill.id)) {
      return Math.max(skill.confidence, skill.targetL5 + 6);
    }
    return skill.confidence;
  };

  const strongSkills = SKILLS_DATA.filter(
    (s) => s.category === 'strong' || remediatedIds.includes(s.id)
  );
  const gapSkills = SKILLS_DATA.filter(
    (s) => s.category === 'gap' && !remediatedIds.includes(s.id)
  );

  const filteredTableSkills = SKILLS_DATA.filter((s) => {
    const isStrong = s.category === 'strong' || remediatedIds.includes(s.id);
    if (tableFilter === 'strong') return isStrong;
    if (tableFilter === 'gaps') return !isStrong;
    return true;
  });

  const metCompetencies = Math.min(
    15,
    CANDIDATE_PROFILE.verifiedSkillsCount + remediatedIds.length + waivedIds.length
  );
  const remainingGaps = Math.max(
    0,
    3 - remediatedIds.length - waivedIds.length
  );

  const handleExportPdf = () => {
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Role & Readiness Hero Strip (Section 15 Spec) */}
      <div className="card-surface p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-1.5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]"
            >
              <span>Candidates</span>
              <span>/</span>
              <span>{CANDIDATE_PROFILE.name}</span>
              <span>/</span>
              <span>Evaluation #{CANDIDATE_PROFILE.auditId}</span>
              <span>/</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                {CANDIDATE_PROFILE.role}
              </span>
            </nav>

            <div className="flex items-center flex-wrap gap-3 pt-1">
              <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Backend Software Engineer
              </h1>
              <span className="text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                · Tier-1 Distributed Systems (L5 Benchmark)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#15803D] dark:text-[#4ADE80]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#4ADE80]" />
                Evaluation Verified · 4 Active Sources
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleExportPdf}
              className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              {pdfExported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Audit PDF Exported</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                  <span>Export Audit PDF</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowCandidateComparisonModal(!showCandidateComparisonModal)}
              className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <GitCompare className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
              <span>{showCandidateComparisonModal ? 'Hide Comparison' : 'Compare Candidate'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenBuildModal('re-evaluate')}
              className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-evaluate Repositories</span>
            </button>
          </div>
        </div>

        {/* Section 15 Flagship Summary: Job Readiness 81% + Strong Evidence + Evidence Gaps + Expandable Why? */}
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Readiness Score Block */}
          <div className="lg:col-span-3 p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                Job Readiness
              </div>
              <div className="mt-2 flex items-baseline gap-2 tabular-nums">
                <span className="text-[40px] font-bold leading-none text-[#0F172A] dark:text-[#F8FAFC]">
                  {currentReadiness}%
                </span>
                <span className="text-[12px] font-medium text-[#15803D] dark:text-[#4ADE80]">
                  +{currentReadiness - 75}% vs last push
                </span>
              </div>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-2 leading-relaxed">
                Measured deterministically across 6 repositories, 1,420 signed commits, and 3 assessments.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
                  style={{ width: `${currentReadiness}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] mt-1.5 tabular-nums">
                <span>L5 Threshold: 78%</span>
                <span>Max Lift: 89%</span>
              </div>
            </div>
          </div>

          {/* Strong Evidence Column */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Strong Evidence
              </span>
              <span className="text-[12px] text-[#15803D] dark:text-[#4ADE80] font-mono">
                Verified
              </span>
            </div>
            <div className="space-y-2">
              {strongSkills.slice(0, 4).map((skill) => {
                const score = getEffectiveScore(skill);
                const isSelected = expandedWhySkillId === skill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => setExpandedWhySkillId(skill.id)}
                    className={`w-full p-2.5 rounded-[6px] border text-left transition-colors ${
                      isSelected
                        ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                        : 'border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                        {skill.name.split(' ')[0] === 'SQL'
                          ? 'SQL'
                          : skill.name.split(' ')[0] === 'Git'
                          ? 'Git'
                          : skill.name.includes('REST')
                          ? 'REST APIs'
                          : skill.name.split(' ')[0]}
                      </span>
                      <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                        {score}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Gaps + Interactive "Why?" Inspector */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Evidence Gaps &amp; Why?
              </span>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Click any skill to inspect explanation
              </span>
            </div>

            <div className="space-y-2">
              {SKILLS_DATA.filter((s) => s.category === 'gap').map((gap) => {
                const score = getEffectiveScore(gap);
                const isRemediated = remediatedIds.includes(gap.id);
                const isExpanded = expandedWhySkillId === gap.id;
                const shortLabel =
                  gap.id === 'docker'
                    ? 'Docker'
                    : gap.id === 'aws'
                    ? 'AWS'
                    : 'System Design';

                return (
                  <div
                    key={gap.id}
                    className={`rounded-[6px] border transition-colors ${
                      isExpanded
                        ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]/70'
                        : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWhySkillId(isExpanded ? null : gap.id)
                      }
                      className="w-full p-2.5 text-left flex items-center justify-between text-[13px]"
                    >
                      <div className="flex items-center gap-2">
                        {isRemediated ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FBBF24]" />
                        )}
                        <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                          {shortLabel}
                        </span>
                        <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] inline-flex items-center gap-0.5">
                          Why?
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          isRemediated
                            ? 'text-[#15803D] dark:text-[#4ADE80]'
                            : 'text-[#B45309] dark:text-[#FBBF24]'
                        }`}
                      >
                        {score}%
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] space-y-2">
                        <div className="font-mono text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {shortLabel} — {score}%
                        </div>
                        <p className="leading-relaxed">{gap.whyExplanation}</p>
                        {!isRemediated && (
                          <div className="pt-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => onTriggerRemediation(gap.id)}
                              className="h-7 px-2.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors whitespace-nowrap"
                            >
                              Verify Signal (+{gap.liftEstimate}% Readiness)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Candidate Comparison Table Drawer (Section 14 recommendation) */}
      {showCandidateComparisonModal && (
        <div className="card-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Candidate Cohort Comparison Table (L5 Backend Shortlist)
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Side-by-side deterministic telemetry comparison across active shortlist candidates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCandidateComparisonModal(false)}
              className="text-[12px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto border border-[#E2E8F0] dark:border-[#334155] rounded-[6px]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] text-[11px] font-semibold uppercase tracking-wider h-9 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <th className="py-2 px-3">Candidate</th>
                  <th className="py-2 px-3 text-right">Overall Readiness</th>
                  <th className="py-2 px-3 text-right">Java 21</th>
                  <th className="py-2 px-3 text-right">REST / gRPC</th>
                  <th className="py-2 px-3 text-right">PostgreSQL</th>
                  <th className="py-2 px-3 text-right">Docker / IaC</th>
                  <th className="py-2 px-3 text-right">Signed Commits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] tabular-nums">
                <tr className="bg-[#F8FAFC] dark:bg-[#1E293B]/40 font-medium">
                  <td className="py-2.5 px-3 text-[#1D4ED8] dark:text-[#3B82F6]">
                    Sarah Jenks (Current)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
                    {currentReadiness}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">91%</td>
                  <td className="py-2.5 px-3 text-right font-mono">88%</td>
                  <td className="py-2.5 px-3 text-right font-mono">84%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#B45309] dark:text-[#FBBF24]">
                    {remediatedIds.includes('docker') ? '81%' : '42%'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">1,420 (97.8%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#0F172A] dark:text-[#F8FAFC]">
                    Marcus Vance (ID: US-8814)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">76%</td>
                  <td className="py-2.5 px-3 text-right font-mono">79%</td>
                  <td className="py-2.5 px-3 text-right font-mono">81%</td>
                  <td className="py-2.5 px-3 text-right font-mono">74%</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#15803D] dark:text-[#4ADE80]">
                    86%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">890 (91.0%)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 text-[#0F172A] dark:text-[#F8FAFC]">
                    Elena Rostova (ID: EU-4409)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">72%</td>
                  <td className="py-2.5 px-3 text-right font-mono">84%</td>
                  <td className="py-2.5 px-3 text-right font-mono">75%</td>
                  <td className="py-2.5 px-3 text-right font-mono">70%</td>
                  <td className="py-2.5 px-3 text-right font-mono">61%</td>
                  <td className="py-2.5 px-3 text-right font-mono">615 (84.2%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Executive Metric Strip (4 high-density stat cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Overall Job Readiness
              </span>
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {currentReadiness}%
              </span>
              <span className="text-[12px] text-[#15803D] dark:text-[#4ADE80] font-medium">
                +{currentReadiness - 75}% vs last push
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Updated from Git telemetry
            </p>
          </div>
          <div className="mt-3 w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
              style={{ width: `${currentReadiness}%` }}
            />
          </div>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Evidence Confidence
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                88.4%
              </span>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Signal Coverage
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              15 validated skills across 6 repositories
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
            <span>3 live technical assessments integrated</span>
          </div>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Critical Competencies
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {metCompetencies}{' '}
                <span className="text-[16px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                  / 15
                </span>
              </span>
              <span className="text-[12px] text-[#475569] dark:text-[#CBD5E1] font-medium">
                L5 Bar Met
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              80% threshold required for Tier-1 benchmark
            </p>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-[1px] ${
                  i < metCompetencies
                    ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                    : 'bg-[#E2E8F0] dark:bg-[#334155]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Identified Gaps
              </span>
              <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
              <span className="text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {remainingGaps}
              </span>
              <span className="text-[12px] text-[#B45309] dark:text-[#FBBF24] font-medium">
                Actionable Remediations
              </span>
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              2 low risk, 1 moderate structural variance
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span>Est. verification:</span>
            <span className="text-[#0F172A] dark:text-[#F8FAFC]">~50m sandbox</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Analytical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7/12): Core Skill Readiness Table & Evidence Gaps Diagnostic Explanations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Core Skill Readiness & Verification Breakdown */}
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/60">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Core Skill Readiness &amp; Verification Breakdown
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Deterministic telemetry and commit-level artifact validation
                </p>
              </div>
              <div className="inline-flex p-0.5 bg-[#E2E8F0]/70 dark:bg-[#0B1120] rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium self-start">
                <button
                  type="button"
                  onClick={() => setTableFilter('all')}
                  className={`px-2.5 py-1 rounded-[4px] transition-colors whitespace-nowrap ${
                    tableFilter === 'all'
                      ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  All ({SKILLS_DATA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('strong')}
                  className={`px-2.5 py-1 rounded-[4px] transition-colors whitespace-nowrap ${
                    tableFilter === 'strong'
                      ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  Strong ({strongSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTableFilter('gaps')}
                  className={`px-2.5 py-1 rounded-[4px] transition-colors whitespace-nowrap ${
                    tableFilter === 'gaps'
                      ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  Gaps ({SKILLS_DATA.length - strongSkills.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Competency</th>
                    <th className="py-2.5 px-4">Confidence &amp; Level</th>
                    <th className="py-2.5 px-4">Verified Evidence Artifacts</th>
                    <th className="py-2.5 px-4 text-right">Target Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-[13px]">
                  {filteredTableSkills.map((skill) => {
                    const score = getEffectiveScore(skill);
                    const delta = score - skill.targetL5;
                    const isStrong =
                      skill.category === 'strong' || remediatedIds.includes(skill.id);

                    return (
                      <tr
                        key={skill.id}
                        onClick={() => setExpandedWhySkillId(skill.id)}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 align-top">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {skill.name}
                          </div>
                          <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {skill.domain}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-top tabular-nums">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {score}%
                            </span>
                            <div className="w-20 bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isStrong
                                    ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                                    : skill.category === 'moderate'
                                    ? 'bg-[#475569] dark:bg-[#94A3B8]'
                                    : 'bg-[#B45309] dark:bg-[#FBBF24]'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                          <span
                            className={`inline-block mt-1 text-[11px] font-medium ${
                              isStrong
                                ? 'text-[#15803D] dark:text-[#4ADE80]'
                                : 'text-[#64748B] dark:text-[#94A3B8]'
                            }`}
                          >
                            {remediatedIds.includes(skill.id)
                              ? 'Verified via Sandbox'
                              : skill.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-top text-[12px]">
                          <div className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                            {skill.artifactTitle}
                          </div>
                          <div className="text-[#64748B] dark:text-[#94A3B8]">
                            {skill.artifactDetail}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top text-right font-mono text-[12px] tabular-nums">
                          <span
                            className={`font-semibold ${
                              delta >= 0
                                ? 'text-[#15803D] dark:text-[#4ADE80]'
                                : 'text-[#B45309] dark:text-[#FBBF24]'
                            }`}
                          >
                            {delta >= 0 ? `+${delta}%` : `${delta}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Evidence Gaps & Diagnostic Explanations */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Evidence Gaps &amp; Diagnostic Explanations
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Causal explanations of unverified claims and automated remediation triggers
                </p>
              </div>
              <span className="font-mono text-[12px] text-[#B45309] dark:text-[#FBBF24] font-medium">
                {gapSkills.length} Signals Need Attention
              </span>
            </div>

            <div className="space-y-3">
              {SKILLS_DATA.filter((s) => s.category === 'gap').map((gap) => {
                const isRemediated = remediatedIds.includes(gap.id);
                const score = getEffectiveScore(gap);
                return (
                  <div
                    key={gap.id}
                    className={`rounded-[8px] border border-[#E2E8F0] dark:border-[#334155] p-4 border-l-4 ${
                      isRemediated
                        ? 'border-l-[#15803D]'
                        : gap.id === 'system-design'
                        ? 'border-l-[#B91C1C]'
                        : 'border-l-[#B45309]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {gap.name}
                          </span>
                          <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                            · {score}% Confidence (L5 Target: {gap.targetL5}%)
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                          {gap.whyExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#0F172A] dark:text-[#F8FAFC]">
                        <ArrowRight className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                        <span>
                          <strong>Recommended Action:</strong> {gap.remediationAction}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onTriggerRemediation(gap.id)}
                        disabled={isRemediated}
                        className={`h-7 px-3 rounded-[6px] text-[12px] font-medium shrink-0 transition-colors whitespace-nowrap ${
                          isRemediated
                            ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] text-[#1D4ED8] dark:text-[#3B82F6] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]'
                        }`}
                      >
                        {isRemediated
                          ? 'Signal Verified ✓'
                          : gap.remediationType === 'terminal'
                          ? 'Verify via Terminal'
                          : gap.remediationType === 'cloud'
                          ? 'Link Cloud Provider'
                          : 'Issue Challenge (20m)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5/12): Real-time Evidence Pipeline, Target Benchmark Comparison, Connect Source */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Real-time Evidence Pipeline */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Real-time Evidence Pipeline
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[12px] text-[#15803D] dark:text-[#4ADE80]">
                <span className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#4ADE80]" />
                <span>Live Synced</span>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-[12px]">
              {[
                {
                  status: '✓ Repository Analyzed',
                  statusColor: 'text-[#15803D] dark:text-[#4ADE80]',
                  time: '18m ago',
                  title: 'org/payment-gateway (Go/Java)',
                  detail: 'Complexity Index: 8.4 / 10 · Cyclomatic Risk: Low',
                },
                {
                  status: '✓ Detected Tech Stack',
                  statusColor: 'text-[#15803D] dark:text-[#4ADE80]',
                  time: '22m ago',
                  title: 'Kafka, PostgreSQL 15, Spring Boot 3.2.0',
                  detail: 'Found: Event Producer, Consumer groups & DLQ routines',
                },
                {
                  status: '✓ Authorship Cryptography Verified',
                  statusColor: 'text-[#15803D] dark:text-[#4ADE80]',
                  time: '1h ago',
                  title: 'GPG Signed Commits: 97.8% Match',
                  detail: 'Key ID: 0x82FA41DC99 · Identity validated against Git config',
                },
                {
                  status: '○ Async Assessment Complete',
                  statusColor: 'text-[#1D4ED8] dark:text-[#3B82F6]',
                  time: '48h ago',
                  title: 'Distributed Lock (Redlock algorithm)',
                  detail: 'Score: 94/100 · Passing concurrency fuzzing tests',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => onNavigateTab('evidence-engine')}
                  className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${item.statusColor}`}>
                      {item.status}
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                      {item.time}
                    </span>
                  </div>
                  <div className="font-sans text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                    {item.title}
                  </div>
                  <div className="font-sans text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              <span>GitHub Webhook #WH-4091</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                Synced 18m ago
              </span>
            </div>
          </div>

          {/* Card 2: Target Benchmark Comparison */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Target Benchmark Comparison
                </h3>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Tier-1 Distributed Systems Talent Pool
                </p>
              </div>
            </div>

            <div className="space-y-3.5 tabular-nums">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-semibold text-[#1D4ED8] dark:text-[#3B82F6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    {CANDIDATE_PROFILE.name} (Candidate)
                  </span>
                  <span className="font-mono font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                    {currentReadiness}%
                  </span>
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
                    style={{ width: `${currentReadiness}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    Internal Core Team Bar (Threshold)
                  </span>
                  <span className="font-mono text-[#475569] dark:text-[#CBD5E1]">
                    78%
                  </span>
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#475569] h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                    Median L5 Global Applicant
                  </span>
                  <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">
                    72%
                  </span>
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#CBD5E1] dark:bg-[#475569] h-full rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-[12px] text-[#0F172A] dark:text-[#F8FAFC] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <strong>Candidate exceeds Team Bar by +{currentReadiness - 78}%</strong> in core execution. Remediating Docker, AWS, and Caching signals lifts overall score to <strong>89%</strong> (top decile).
              </div>
            </div>
          </div>

          {/* Card 3: Connect Additional Source */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] flex items-center justify-center shrink-0 text-[#1D4ED8] dark:text-[#3B82F6]">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Have private repos or GitLab repositories?
                </h4>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                  Connect enterprise providers to resolve unverified cloud &amp; infrastructure telemetry without manual code reviews.
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => onOpenBuildModal('build')}
                className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                Connect GitHub Org
              </button>
              <button
                type="button"
                onClick={() => onOpenBuildModal('build')}
                className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
              >
                Connect GitLab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
