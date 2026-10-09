import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RefreshCw,
  Clock,
  Briefcase,
} from 'lucide-react';
import { EvaluatedSkill, RoleTemplate, SkillTwinProfile } from '../../types/skilltwin';
import { ROLE_TEMPLATES } from '../../services/skillAnalyzer';
import { EmptyProfileState } from './EmptyProfileState';

interface JobReadinessTabProps {
  profile: SkillTwinProfile | null;
  onChangeTargetRole: (newRole: RoleTemplate) => void;
  onOpenVerifyModal: (skill: EvaluatedSkill) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

export const JobReadinessTab: React.FC<JobReadinessTabProps> = ({
  profile,
  onChangeTargetRole,
  onOpenVerifyModal,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  const [tableFilter, setTableFilter] = useState<'all' | 'strong' | 'gaps'>('all');
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);

  if (!profile) {
    return (
      <EmptyProfileState
        onOpenBuildModal={onOpenBuildModal}
        onQuickAnalyzeGithub={onQuickAnalyzeGithub}
      />
    );
  }

  const strongSkills = profile.skills.filter((s) => s.status === 'strong');
  const gapSkills = profile.skills.filter((s) => s.status !== 'strong');

  const filteredTableSkills = profile.skills.filter((s) => {
    if (tableFilter === 'strong') return s.status === 'strong';
    if (tableFilter === 'gaps') return s.status !== 'strong';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Section 15 Flagship Header: Target Role + Job Readiness % */}
      <div className="card-surface p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Target Job Benchmark
            </div>
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {profile.targetRole.title}
            </h1>
            <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1]">
              {profile.targetRole.description}
            </p>
          </div>

          {/* Role Switcher & Re-analyze */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="relative flex items-center">
              <Briefcase className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
              <select
                value={
                  ROLE_TEMPLATES.some((r) => r.id === profile.targetRole.id)
                    ? profile.targetRole.id
                    : 'custom'
                }
                onChange={(e) => {
                  const found = ROLE_TEMPLATES.find((r) => r.id === e.target.value);
                  if (found) onChangeTargetRole(found);
                }}
                aria-label="Switch target role"
                className="h-9 pl-8 pr-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
              >
                {ROLE_TEMPLATES.map((r) => (
                  <option key={r.id} value={r.id}>
                    Switch Role: {r.title}
                  </option>
                ))}
                {!ROLE_TEMPLATES.some((r) => r.id === profile.targetRole.id) && (
                  <option value="custom">{profile.targetRole.title}</option>
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenBuildModal}
              className="h-9 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Add / Update Evidence</span>
            </button>
          </div>
        </div>

        {/* Section 15 Layout: Job Readiness Score + Strong Evidence + Evidence Gaps */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Job Readiness Score Box */}
          <div className="lg:col-span-4 p-5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                Job Readiness
              </div>
              <div className="mt-2 flex items-baseline gap-2 tabular-nums">
                <span className="text-[44px] font-bold leading-none text-[#0F172A] dark:text-[#F8FAFC]">
                  {profile.overallReadiness}%
                </span>
                <span className="text-[13px] font-medium text-[#15803D] dark:text-[#4ADE80]">
                  {strongSkills.length} of {profile.skills.length} skills verified
                </span>
              </div>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-3 leading-relaxed">
                Calculated from your connected GitHub repositories, code artifacts, and completed skill verifications.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
                  style={{ width: `${profile.overallReadiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Strong Evidence Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-[14px]">
              <h2 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Strong Evidence
              </h2>
              <span className="text-[12px] font-mono text-[#15803D] dark:text-[#4ADE80]">
                {strongSkills.length} verified
              </span>
            </div>

            {strongSkills.length === 0 ? (
              <div className="p-4 rounded-[6px] border border-dashed border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                No skills have crossed the strong benchmark yet. Complete a skill challenge on the right to verify your first skill.
              </div>
            ) : (
              <div className="space-y-2">
                {strongSkills.map((skill) => {
                  const isOpen = expandedWhyId === skill.id;
                  return (
                    <div
                      key={skill.id}
                      className="rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedWhyId(isOpen ? null : skill.id)
                        }
                        className="w-full p-3 text-left flex items-center justify-between text-[14px]"
                      >
                        <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                          <span>{skill.name}</span>
                        </span>
                        <span className="font-mono font-semibold text-[#15803D] dark:text-[#4ADE80] tabular-nums">
                          {skill.confidence}%
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1]">
                          {skill.whyExplanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Evidence Gaps Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-[14px]">
              <h2 className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Evidence Gaps
              </h2>
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                Click Why? to inspect
              </span>
            </div>

            {gapSkills.length === 0 ? (
              <div className="p-4 rounded-[6px] bg-[#F0FDF4] dark:bg-[#15803D]/15 border border-[#BBF7D0] text-[13px] text-[#15803D] dark:text-[#4ADE80]">
                All required skills for {profile.targetRole.title} are verified!
              </div>
            ) : (
              <div className="space-y-2">
                {gapSkills.map((gap) => {
                  const isOpen = expandedWhyId === gap.id;
                  return (
                    <div
                      key={gap.id}
                      className="rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedWhyId(isOpen ? null : gap.id)}
                        className="w-full p-3 text-left flex items-center justify-between text-[14px]"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                          <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                            {gap.name}
                          </span>
                          <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] inline-flex items-center gap-0.5">
                            Why?
                            {isOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                          {gap.confidence}%
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] space-y-2.5">
                          <p className="leading-relaxed">{gap.whyExplanation}</p>
                          <button
                            type="button"
                            onClick={() => onOpenVerifyModal(gap)}
                            className="h-7 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Verify {gap.name}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Why? & Skill Verification Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Complete Skill Breakdown &amp; Why? Explanations
            </h2>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Every score includes a transparent explanation and a direct way to strengthen your evidence.
            </p>
          </div>

          <div className="inline-flex p-0.5 bg-[#E2E8F0]/70 dark:bg-[#0B1120] rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium self-start">
            <button
              type="button"
              onClick={() => setTableFilter('all')}
              className={`px-3 py-1 rounded-[4px] transition-colors ${
                tableFilter === 'all'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                  : 'text-[#475569] dark:text-[#CBD5E1]'
              }`}
            >
              All ({profile.skills.length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter('strong')}
              className={`px-3 py-1 rounded-[4px] transition-colors ${
                tableFilter === 'strong'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                  : 'text-[#475569] dark:text-[#CBD5E1]'
              }`}
            >
              Strong ({strongSkills.length})
            </button>
            <button
              type="button"
              onClick={() => setTableFilter('gaps')}
              className={`px-3 py-1 rounded-[4px] transition-colors ${
                tableFilter === 'gaps'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                  : 'text-[#475569] dark:text-[#CBD5E1]'
              }`}
            >
              Gaps ({gapSkills.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
          {filteredTableSkills.map((skill) => {
            const isStrong = skill.status === 'strong';
            return (
              <div
                key={skill.id}
                className="p-4 sm:p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {isStrong ? (
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                    ) : skill.status === 'moderate' ? (
                      <Clock className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                    )}
                    <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {skill.name}
                    </span>
                    <span className="font-mono text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      — {skill.confidence}%
                    </span>
                    <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      (Target: {skill.targetScore}%)
                    </span>
                  </div>

                  <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed pl-6">
                    {skill.whyExplanation}
                  </p>
                </div>

                <div className="pl-6 lg:pl-0 flex items-center gap-3 shrink-0">
                  <div className="w-28 bg-[#E2E8F0] dark:bg-[#0B1120] h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className={`h-full rounded-full ${
                        isStrong
                          ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                          : 'bg-[#B45309] dark:bg-[#FBBF24]'
                      }`}
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenVerifyModal(skill)}
                    className={`h-8 px-3.5 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap ${
                      isStrong
                        ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9]'
                        : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white'
                    }`}
                  >
                    {isStrong ? 'Add More Proof' : 'Verify Skill'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
