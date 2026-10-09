import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Play,
  TrendingUp,
  Code2,
  Clock,
} from 'lucide-react';
import { EvaluatedSkill, SkillTwinProfile } from '../../types/skilltwin';
import { EmptyProfileState } from './EmptyProfileState';

interface GapRemediationTabProps {
  profile: SkillTwinProfile | null;
  onOpenVerifyModal: (skill: EvaluatedSkill) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

export const GapRemediationTab: React.FC<GapRemediationTabProps> = ({
  profile,
  onOpenVerifyModal,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  if (!profile) {
    return (
      <EmptyProfileState
        onOpenBuildModal={onOpenBuildModal}
        onQuickAnalyzeGithub={onQuickAnalyzeGithub}
      />
    );
  }

  const gapSkills = profile.skills.filter((s) => s.status !== 'strong');
  const verifiedSkills = profile.skills.filter((s) => s.status === 'strong');

  // Calculate potential readiness if all gaps reach their targetScore + 6
  const potentialTotal = profile.skills.reduce(
    (sum, s) =>
      sum + (s.status === 'strong' ? s.confidence : Math.max(s.confidence, s.targetScore + 6)),
    0
  );
  const projectedReadiness = Math.round(
    potentialTotal / Math.max(1, profile.skills.length)
  );

  return (
    <div className="space-y-6">
      {/* Header & Projected Lift */}
      <div className="card-surface p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[12px] font-mono font-semibold text-[#1D4ED8] dark:text-[#3B82F6] uppercase tracking-wider">
            Roadmap &amp; Interactive Assessments
          </div>
          <h1 className="text-[24px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Close Your Evidence Gaps
          </h1>
          <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            When a skill on your resume doesn&apos;t appear in your public GitHub repositories, you can verify it right here by completing a short code assessment or submitting project code.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-[8px] border border-[#E2E8F0] dark:border-[#334155] shrink-0 tabular-nums">
          <TrendingUp className="w-6 h-6 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
          <div>
            <div className="text-[11px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8]">
              Projected Readiness Lift
            </div>
            <div className="text-[20px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {profile.overallReadiness}% →{' '}
              <span className="text-[#15803D] dark:text-[#4ADE80]">
                {projectedReadiness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Gaps List */}
      {gapSkills.length === 0 ? (
        <div className="card-surface p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-[#15803D] mx-auto" />
          <div className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            All Target Skills Verified!
          </div>
          <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1]">
            You have met or exceeded the target benchmark for every skill required by {profile.targetRole.title}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Skills Needing Evidence ({gapSkills.length})
          </h2>

          {gapSkills.map((skill, idx) => {
            const deficit = skill.targetScore - skill.confidence;
            return (
              <div key={skill.id} className="card-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {idx + 1}. {skill.name}
                      </span>
                      <span className="font-mono text-[12px] text-[#B45309] dark:text-[#FBBF24] font-semibold tabular-nums">
                        · {skill.confidence}% Confidence (Target: {skill.targetScore}%)
                      </span>
                    </div>
                    <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      {skill.evidenceSummary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenVerifyModal(skill)}
                    className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Take Code Challenge (+{deficit + 8}%)</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden relative">
                  <div
                    className="bg-[#B45309] dark:bg-[#FBBF24] h-full rounded-full transition-all"
                    style={{ width: `${skill.confidence}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#0F172A] dark:bg-[#F8FAFC]"
                    style={{ left: `${skill.targetScore}%` }}
                    title={`Target: ${skill.targetScore}%`}
                  />
                </div>

                {/* Explanation & Assessment Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-1">
                    <div className="text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                      {skill.status === 'gap' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#1D4ED8]" />
                      )}
                      <span>Why is this a gap?</span>
                    </div>
                    <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                      {skill.whyExplanation}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                        <span>Available Verification Assessment</span>
                      </div>
                      <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] mt-1">
                        {skill.assessmentQuestion?.prompt}
                      </p>
                    </div>
                    <div className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6]">
                      Click &ldquo;Take Code Challenge&rdquo; to open the code editor or paste a project file.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Already Verified Skills */}
      {verifiedSkills.length > 0 && (
        <div className="card-surface p-5 space-y-3">
          <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Already Verified Skills ({verifiedSkills.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {verifiedSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                  <span className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                    {skill.name}
                  </span>
                </div>
                <span className="font-mono text-[13px] font-semibold text-[#15803D] dark:text-[#4ADE80] tabular-nums">
                  {skill.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
