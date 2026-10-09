import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  RefreshCw,
  User,
} from 'lucide-react';
import { EvaluatedSkill, SkillTwinProfile } from '../../types/skilltwin';
import { EmptyProfileState } from './EmptyProfileState';
import {
  OverviewProfileInsights,
  ProfileInsightsUpdate,
} from './OverviewProfileInsights';

interface OverviewTabProps {
  profile: SkillTwinProfile | null;
  onNavigateTab: (tab: string) => void;
  onOpenVerifyModal: (skill: EvaluatedSkill) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
  onSaveProfileInsights: (update: ProfileInsightsUpdate) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  profile,
  onNavigateTab,
  onOpenVerifyModal,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
  onSaveProfileInsights,
}) => {
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  if (!profile) {
    return (
      <EmptyProfileState
        onOpenBuildModal={onOpenBuildModal}
        onQuickAnalyzeGithub={onQuickAnalyzeGithub}
      />
    );
  }

  const strongSkills = profile.skills.filter((s) => s.status === 'strong');
  const gapAndModerateSkills = profile.skills.filter((s) => s.status !== 'strong');
  const gapsOnly = profile.skills.filter((s) => s.status === 'gap');

  const handleExportReport = () => {
    const reportBlob = new Blob([JSON.stringify(profile, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(reportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skilltwin-${profile.githubUsername}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Candidate Profile Header */}
      <div className="card-surface p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.candidateName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                <User className="w-6 h-6" />
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#15803D] ring-2 ring-[#FFFFFF] dark:ring-[#111827]"
              title="Profile Active"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                {profile.candidateName}
              </h1>
              {profile.githubUsername !== 'local-workspace' && (
                <a
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                >
                  @{profile.githubUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#CBD5E1] flex-wrap">
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                Target Role: {profile.targetRole.title}
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.targetRole.level}</span>
              <span aria-hidden="true">·</span>
              <span>{profile.publicReposCount} public repositories</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportReport}
            className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            {exported ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Report Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                <span>Export Profile (.JSON)</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenBuildModal}
            className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Evidence / Role</span>
          </button>
        </div>
      </div>

      <OverviewProfileInsights
        profile={profile}
        onSave={onSaveProfileInsights}
      />

      {/* Section 11: 3 Primary Summary Cards + Evidence Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4 flex flex-col justify-between">
          <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
            Job Readiness
          </span>
          <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
              {profile.overallReadiness}%
            </span>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Ready
            </span>
          </div>
          <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1D4ED8] dark:bg-[#3B82F6] h-full rounded-full transition-all duration-200"
              style={{ width: `${profile.overallReadiness}%` }}
            />
          </div>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
            Strong Skills
          </span>
          <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[32px] font-bold text-[#15803D] dark:text-[#4ADE80] leading-none">
              {strongSkills.length}
            </span>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              / {profile.skills.length} skills verified
            </span>
          </div>
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            Meets target role benchmark
          </span>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
            Evidence Gaps
          </span>
          <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[32px] font-bold text-[#B45309] dark:text-[#FBBF24] leading-none">
              {gapsOnly.length}
            </span>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Gaps to close
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('gap-remediation')}
            className="text-left text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
          >
            Verify gaps to boost readiness →
          </button>
        </div>

        <div className="card-surface p-4 flex flex-col justify-between">
          <span className="text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]">
            Evidence Items
          </span>
          <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[32px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-none">
              {profile.evidenceItems.length}
            </span>
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              Repos &amp; Proofs
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('evidence-engine')}
            className="text-left text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
          >
            View Evidence →
          </button>
        </div>
      </div>

      {/* Main Split: Skill Readiness (8 cols) + Recent Evidence (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Skill Readiness */}
        <div className="lg:col-span-8 card-surface p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div>
              <h2 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Skill Readiness
              </h2>
              <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
                Measured against {profile.targetRole.title}. Click any skill to see why it received its score.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('job-readiness')}
              className="text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Full Readiness Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Strong Evidence Group */}
          {strongSkills.length > 0 && (
            <div className="space-y-2.5">
              <div className="text-[12px] font-semibold text-[#15803D] dark:text-[#4ADE80]">
                Strong Evidence ({strongSkills.length})
              </div>
              {strongSkills.map((skill) => {
                const isExpanded = expandedWhyId === skill.id;
                return (
                  <div
                    key={skill.id}
                    className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWhyId(isExpanded ? null : skill.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                          <span>{skill.name}</span>
                          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-normal">
                            · {skill.evidenceSummary}
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                          {skill.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#15803D] dark:bg-[#4ADE80] h-full rounded-full transition-all"
                          style={{ width: `${skill.confidence}%` }}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <p className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                        {skill.whyExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Developing & Evidence Gaps Group */}
          {gapAndModerateSkills.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-[12px] font-semibold text-[#B45309] dark:text-[#FBBF24]">
                Evidence Gaps &amp; Developing Skills ({gapAndModerateSkills.length})
              </div>
              {gapAndModerateSkills.map((skill) => {
                const isExpanded = expandedWhyId === skill.id;
                const isGap = skill.status === 'gap';
                return (
                  <div
                    key={skill.id}
                    className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWhyId(isExpanded ? null : skill.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                          {isGap ? (
                            <AlertCircle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                          )}
                          <span>{skill.name}</span>
                          <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] font-normal inline-flex items-center gap-0.5">
                            Why?
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </span>
                        </span>
                        <span className="font-mono font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                          {skill.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] dark:bg-[#0B1120] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isGap
                              ? 'bg-[#B45309] dark:bg-[#FBBF24]'
                              : 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                          }`}
                          style={{ width: `${skill.confidence}%` }}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="leading-relaxed">{skill.whyExplanation}</p>
                        <button
                          type="button"
                          onClick={() => onOpenVerifyModal(skill)}
                          className="h-7 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium shrink-0 whitespace-nowrap"
                        >
                          Verify Skill →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Recent Evidence */}
        <div className="lg:col-span-4 card-surface p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
            <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Recent Evidence
            </h3>
            <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              {profile.evidenceItems.length} sources
            </span>
          </div>

          {profile.evidenceItems.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                No repositories or code artifacts added yet.
              </p>
              <button
                type="button"
                onClick={onOpenBuildModal}
                className="h-8 px-3 rounded-[6px] bg-[#1D4ED8] text-white text-[12px] font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add GitHub or Code Evidence</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {profile.evidenceItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab('evidence-engine')}
                  className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[12px] font-mono">
                    <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold flex items-center gap-1 truncate">
                      <GitBranch className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                    {item.skillsMatched.join(', ') || item.language}
                  </div>
                  <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                    {item.metricLabel}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateTab('evidence-engine')}
            className="w-full py-2 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
          >
            Inspect All Evidence →
          </button>
        </div>
      </div>
    </div>
  );
};
