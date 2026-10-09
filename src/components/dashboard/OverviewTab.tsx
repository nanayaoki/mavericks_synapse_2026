import React, { useState } from 'react';
import {
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitCommit,
  GitPullRequest,
  GitMerge,
  ShieldCheck,
  Terminal,
  Code2,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { CANDIDATE_PROFILE, SKILLS_DATA, SkillItem } from '../../data/skillTwinData';

interface OverviewTabProps {
  currentReadiness: number;
  remediatedIds: string[];
  waivedIds: string[];
  connectedSources: Record<string, boolean>;
  onToggleSource: (sourceKey: string) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerRemediation: (gapId: string) => void;
  onWaiveSkill: (gapId: string) => void;
  onOpenBuildModal: (mode?: 'build' | 're-evaluate' | 'empty-demo') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentReadiness,
  remediatedIds,
  waivedIds,
  connectedSources,
  onToggleSource,
  onNavigateTab,
  onTriggerRemediation,
  onWaiveSkill,
  onOpenBuildModal,
}) => {
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportDossier = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const getEffectiveConfidence = (skill: SkillItem) => {
    if (remediatedIds.includes(skill.id)) {
      return Math.max(skill.confidence, skill.targetL5 + 6);
    }
    return skill.confidence;
  };

  const strongSkills = SKILLS_DATA.filter(
    (s) => s.category === 'strong' || remediatedIds.includes(s.id)
  );
  const deficitSkills = SKILLS_DATA.filter(
    (s) => s.category !== 'strong' && !remediatedIds.includes(s.id)
  );

  const unresolvedGapsCount = SKILLS_DATA.filter(
    (s) => s.category === 'gap' && !remediatedIds.includes(s.id) && !waivedIds.includes(s.id)
  ).length;

  const verifiedCount =
    CANDIDATE_PROFILE.verifiedSkillsCount + remediatedIds.length + waivedIds.length;

  return (
    <div className="space-y-6">
      {/* Top Profile Strip & Telemetry Health */}
      <div className="card-surface p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={CANDIDATE_PROFILE.avatarUrl}
              alt={`${CANDIDATE_PROFILE.name}, ${CANDIDATE_PROFILE.levelTitle}`}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
            />
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#15803D] ring-2 ring-[#FFFFFF] dark:ring-[#111827]"
              title="Active Telemetry Feed"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {CANDIDATE_PROFILE.name}
              </h1>
              <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                ID: {CANDIDATE_PROFILE.id}
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1] dark:text-[#475569]">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#15803D] dark:text-[#4ADE80]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#4ADE80]" />
                Cryptographically Verified
              </span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#CBD5E1] flex-wrap">
              <span>{CANDIDATE_PROFILE.levelTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{CANDIDATE_PROFILE.division}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#1D4ED8] dark:text-[#3B82F6]">
                {CANDIDATE_PROFILE.benchmarkName}
              </span>
            </div>
          </div>
        </div>

        {/* Quick CTA Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportDossier}
            className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
                <span>Dossier Exported (.PDF)</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                <span>Export Dossier (.PDF)</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('gap-remediation')}
            className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Remediation</span>
          </button>
        </div>
      </div>

      {/* Critical Cockpit Metrics Bar (4 KPI Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Tile 1: Overall Job Readiness */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
              Overall Job Readiness
            </span>
            <span className="font-mono text-[12px] text-[#15803D] dark:text-[#4ADE80] font-medium tabular-nums">
              +{currentReadiness - 77}.2% MoM
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 tabular-nums">
              <span className="text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
                {currentReadiness}
              </span>
              <span className="text-[15px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                / 100
              </span>
            </div>
            <div className="w-16 h-8">
              <svg
                className="w-full h-full stroke-[#1D4ED8] dark:stroke-[#3B82F6] fill-none stroke-[2]"
                viewBox="0 0 64 32"
              >
                <path d="M2 26 L14 24 L28 18 L42 20 L52 10 L62 6" />
              </svg>
            </div>
          </div>
          <div className="flex items-center justify-between text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            <span>Target Baseline: 75.0</span>
            <span className="text-[#15803D] dark:text-[#4ADE80] font-semibold">
              Tier-1 Clear
            </span>
          </div>
        </div>

        {/* Tile 2: Verified Competencies */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
              Verified Competencies
            </span>
            <ShieldCheck className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
          </div>
          <div className="my-3 flex items-baseline justify-between tabular-nums">
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
                {Math.min(verifiedCount, 15)}
              </span>
              <span className="text-[15px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                / 15 skills
              </span>
            </div>
            <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              {((Math.min(verifiedCount, 15) / 15) * 100).toFixed(1)}% satisfied
            </span>
          </div>
          <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full transition-all duration-200"
              style={{ width: `${(Math.min(verifiedCount, 15) / 15) * 100}%` }}
            />
          </div>
        </div>

        {/* Tile 3: Evidence Confidence */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
              Evidence Confidence
            </span>
            <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              {Object.values(connectedSources).filter(Boolean).length * 2} Active Repos
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between tabular-nums">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
                88.4
              </span>
              <span className="text-[16px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                %
              </span>
            </div>
            <span className="font-mono text-[12px] text-[#15803D] dark:text-[#4ADE80] font-medium">
              High Signal
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            <span>Deterministic AST parse</span>
            <span>4.2k LOC/wk</span>
          </div>
        </div>

        {/* Tile 4: Unresolved Gaps */}
        <div className="card-surface p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
              Unresolved Gaps
            </span>
            <AlertCircle className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171]" />
          </div>
          <div className="my-3 flex items-baseline justify-between tabular-nums">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-[#B91C1C] dark:text-[#F87171] leading-none">
                {unresolvedGapsCount}
              </span>
              <span className="text-[15px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                Action items
              </span>
            </div>
            <span className="font-mono text-[12px] text-[#B91C1C] dark:text-[#F87171] font-medium">
              {unresolvedGapsCount > 0 ? 'Needs Audit' : 'All Resolved'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            <span className="truncate pr-2">AWS / Dist. Caching / Docker</span>
            <button
              type="button"
              onClick={() => onNavigateTab('gap-remediation')}
              className="text-[#1D4ED8] dark:text-[#3B82F6] hover:underline font-sans font-medium whitespace-nowrap"
            >
              Review →
            </button>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Workspace Layout (8 cols left, 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Skill Readiness & Benchmark Variance + Target Remediation Vectors */}
        <div className="lg:col-span-8 space-y-6">
          {/* Matrix Card */}
          <div className="card-surface p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Skill Readiness &amp; Benchmark Variance
                </h2>
                <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
                  Calculated against Tier-1 Distributed Systems L5 benchmark profile. Click any skill row to inspect causal evidence.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#15803D]" /> Verified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#B91C1C]" /> Gap Deficit
                </span>
              </div>
            </div>

            {/* Top Verified Competencies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  Top Verified Competencies
                </span>
                <span className="font-mono text-[#15803D] dark:text-[#4ADE80] font-medium tabular-nums">
                  {strongSkills.length} / {strongSkills.length} Satisfied
                </span>
              </div>

              <div className="space-y-2">
                {strongSkills.map((skill) => {
                  const score = getEffectiveConfidence(skill);
                  const delta = score - skill.targetL5;
                  const isExpanded = expandedWhyId === skill.id;
                  return (
                    <div
                      key={skill.id}
                      className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedWhyId(isExpanded ? null : skill.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between text-[13px] mb-1.5">
                          <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                            <span>{skill.name}</span>
                            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">
                              · Why?
                            </span>
                          </span>
                          <div className="flex items-center gap-3 font-mono tabular-nums">
                            <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {score}%
                            </span>
                            <span className="text-[12px] text-[#15803D] dark:text-[#4ADE80]">
                              {delta >= 0 ? `+${delta}%` : `${delta}%`} vs Bar
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#15803D] dark:bg-[#4ADE80] h-full rounded-full transition-all duration-200"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <p className="leading-relaxed">{skill.whyExplanation}</p>
                          <button
                            type="button"
                            onClick={() => onNavigateTab('evidence-engine')}
                            className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline shrink-0 whitespace-nowrap"
                          >
                            Inspect AST →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Requires Evidence Verification */}
            {deficitSkills.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#475569] dark:text-[#CBD5E1]">
                    Requires Evidence Verification
                  </span>
                  <span className="font-mono text-[#B91C1C] dark:text-[#F87171] font-medium tabular-nums">
                    {deficitSkills.length} Priority Attention
                  </span>
                </div>

                <div className="space-y-2">
                  {deficitSkills.map((skill) => {
                    const score = getEffectiveConfidence(skill);
                    const delta = score - skill.targetL5;
                    const isExpanded = expandedWhyId === skill.id;
                    const isModerate = skill.category === 'moderate';
                    const isWaived = waivedIds.includes(skill.id);

                    return (
                      <div
                        key={skill.id}
                        className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569] transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedWhyId(isExpanded ? null : skill.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between text-[13px] mb-1.5">
                            <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                              {isModerate ? (
                                <Clock className="w-4 h-4 text-[#475569] dark:text-[#CBD5E1] shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0" />
                              )}
                              <span>{skill.name}</span>
                              {isWaived && (
                                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                                  (Waived)
                                </span>
                              )}
                              <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] font-normal inline-flex items-center gap-0.5">
                                Why?
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </span>
                            </span>
                            <div className="flex items-center gap-3 font-mono tabular-nums">
                              <span
                                className={`font-semibold ${
                                  isModerate
                                    ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                                    : 'text-[#B91C1C] dark:text-[#F87171]'
                                }`}
                              >
                                {score}%
                              </span>
                              <span
                                className={`text-[12px] ${
                                  isModerate
                                    ? 'text-[#64748B] dark:text-[#94A3B8]'
                                    : 'text-[#B91C1C] dark:text-[#F87171]'
                                }`}
                              >
                                {delta}% vs Bar
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-200 ${
                                isModerate
                                  ? 'bg-[#475569] dark:bg-[#94A3B8]'
                                  : 'bg-[#B91C1C] dark:bg-[#F87171]'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] space-y-2">
                            <p className="leading-relaxed">{skill.whyExplanation}</p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                                Recommended: {skill.remediationAction}
                              </span>
                              <button
                                type="button"
                                onClick={() => onNavigateTab('gap-remediation')}
                                className="h-7 px-2.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors whitespace-nowrap"
                              >
                                Remediate Gap →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Gap Analysis Cards (Target Remediation Vectors) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Target Remediation Vectors
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('gap-remediation')}
                className="text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Diagnostic Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 1: AWS Deficit */}
            <div className="card-surface border-l-4 border-l-[#B91C1C] p-5 flex flex-col md:flex-row items-stretch justify-between gap-5">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-mono">
                    <span className="text-[#B91C1C] dark:text-[#F87171] font-semibold">
                      GAP #1: HIGH DEFICIT
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      Target Variance: -39%
                    </span>
                  </div>
                  <h4 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                    Infrastructure Provisioning &amp; Cloud Delivery (AWS)
                  </h4>
                  <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                    Zero infrastructure-as-code (Terraform) or CloudFormation definitions detected across synced repositories. Evidence score is derived solely from auxiliary Dockerfiles.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                  <Terminal className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                  <span>Recommended: Connect AWS OIDC Audit Role or execute 15m IaC verification</span>
                </div>
              </div>
              <div className="shrink-0 flex md:flex-col items-center justify-center gap-2 bg-[#F8FAFC] dark:bg-[#1E293B] p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] min-w-[160px]">
                <button
                  type="button"
                  onClick={() => onTriggerRemediation('aws')}
                  disabled={remediatedIds.includes('aws')}
                  className={`h-8 px-3 rounded-[6px] text-[12px] font-medium w-full flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    remediatedIds.includes('aws')
                      ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                      : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white'
                  }`}
                >
                  {remediatedIds.includes('aws') ? 'Challenge Verified ✓' : 'Deploy Challenge'}
                </button>
                <button
                  type="button"
                  onClick={() => onWaiveSkill('aws')}
                  className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium w-full flex items-center justify-center transition-colors whitespace-nowrap"
                >
                  {waivedIds.includes('aws') ? 'Unwaive Skill' : 'Waive Skill'}
                </button>
              </div>
            </div>

            {/* Card 2: Distributed Caching */}
            <div className="card-surface border-l-4 border-l-[#B45309] p-5 flex flex-col md:flex-row items-stretch justify-between gap-5">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[12px] font-mono">
                    <span className="text-[#B45309] dark:text-[#FBBF24] font-semibold">
                      GAP #2: SIGNAL DEFICIENCY
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      Target Variance: -42%
                    </span>
                  </div>
                  <h4 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                    High-Throughput Caching &amp; Partitioning
                  </h4>
                  <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-1 leading-relaxed">
                    Candidate commits display simple in-memory Map caches without TTL eviction policy controls, stampede protection, or distributed lock mechanisms.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                  <Code2 className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                  <span>Remediation: Launch 20-minute Redis Cache Fuzzing Sandbox or link repo</span>
                </div>
              </div>
              <div className="shrink-0 flex md:flex-col items-center justify-center gap-2 bg-[#F8FAFC] dark:bg-[#1E293B] p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] min-w-[160px]">
                <button
                  type="button"
                  onClick={() => onTriggerRemediation('system-design')}
                  disabled={remediatedIds.includes('system-design')}
                  className={`h-8 px-3 rounded-[6px] text-[12px] font-medium w-full flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                    remediatedIds.includes('system-design')
                      ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                      : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white'
                  }`}
                >
                  {remediatedIds.includes('system-design')
                    ? 'Verified ✓'
                    : 'Verify Cache Sandbox'}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('gap-remediation')}
                  className="h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium w-full flex items-center justify-center transition-colors whitespace-nowrap"
                >
                  Schedule Pair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Telemetry Evidence Log & Integrated Sources */}
        <div className="lg:col-span-4 space-y-6">
          {/* Telemetry Evidence Log */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Telemetry Evidence Log
                </h3>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Deterministic parser events
                </span>
              </div>
              <span
                className="w-2 h-2 rounded-full bg-[#15803D]"
                title="Active Stream"
              />
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'e82f91a',
                  type: 'commit',
                  time: '14m ago',
                  repo: 'org/ledger-service',
                  msg: 'feat(tx): implement 2-phase idempotency commit logic',
                  badge: 'GPG Signed',
                  meta: 'AST Compl: 8.4',
                },
                {
                  id: 'PR #418',
                  type: 'pr',
                  time: '2h ago',
                  repo: 'org/payment-gateway',
                  msg: 'Reviewed async event publisher circuit-breaker fallback',
                  badge: 'Code Review: +1.4 ratio',
                  meta: '3 suggestions',
                },
                {
                  id: 'd4110bc',
                  type: 'commit',
                  time: '5h ago',
                  repo: 'org/payment-gateway',
                  msg: 'refactor: migrate HikariCP pool thresholds for spike load',
                  badge: 'GPG Signed',
                  meta: 'AST Compl: 6.9',
                },
                {
                  id: 'PR #392',
                  type: 'merge',
                  time: 'Yesterday',
                  repo: 'fintech/core-auth-proxy',
                  msg: 'Add token revocation webhook integration tests',
                  badge: 'Test Cov: 94.2%',
                  meta: 'Merged',
                },
              ].map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onNavigateTab('evidence-engine')}
                  className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold flex items-center gap-1.5">
                      {ev.type === 'commit' ? (
                        <GitCommit className="w-3.5 h-3.5" />
                      ) : ev.type === 'pr' ? (
                        <GitPullRequest className="w-3.5 h-3.5" />
                      ) : (
                        <GitMerge className="w-3.5 h-3.5" />
                      )}
                      {ev.id}
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">{ev.time}</span>
                  </div>
                  <div className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {ev.repo}
                  </div>
                  <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] line-clamp-1">
                    {ev.msg}
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span className="text-[#15803D] dark:text-[#4ADE80] font-medium">
                      {ev.badge}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.meta}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('evidence-engine')}
              className="w-full py-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
            >
              View All Telemetry Nodes (1,509 Events) →
            </button>
          </div>

          {/* Integrated Sources */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Integrated Sources
              </h3>
              <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                {Object.values(connectedSources).filter(Boolean).length}/3 Active
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'github',
                  name: 'GitHub Enterprise',
                  host: 'github.internal.fintech',
                },
                {
                  key: 'gitlab',
                  name: 'GitLab Self-Hosted',
                  host: 'gitlab.core.internal',
                },
                {
                  key: 'bitbucket',
                  name: 'Bitbucket Cloud',
                  host: connectedSources.bitbucket
                    ? 'bitbucket.org/fintech-ops'
                    : 'Not Connected',
                },
              ].map((src) => {
                const isConnected = connectedSources[src.key];
                return (
                  <div
                    key={src.key}
                    className="flex items-center justify-between p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                        {src.name}
                      </div>
                      <div className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        {src.host}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSource(src.key)}
                      className={`text-[12px] font-medium px-2.5 py-1 rounded-[4px] transition-colors ${
                        isConnected
                          ? 'text-[#15803D] dark:text-[#4ADE80] bg-[#F0FDF4] dark:bg-[#15803D]/20'
                          : 'text-[#1D4ED8] dark:text-[#3B82F6] hover:underline'
                      }`}
                    >
                      {isConnected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onOpenBuildModal('build')}
              className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-1.5 transition-colors w-full"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Telemetry Source</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
