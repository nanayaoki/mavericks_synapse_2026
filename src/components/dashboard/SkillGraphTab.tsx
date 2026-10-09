import React, { useState } from 'react';
import {
  Network,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
} from 'lucide-react';
import { EvaluatedSkill, SkillTwinProfile } from '../../types/skilltwin';
import { EmptyProfileState } from './EmptyProfileState';

interface SkillGraphTabProps {
  profile: SkillTwinProfile | null;
  onOpenVerifyModal: (skill: EvaluatedSkill) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

export const SkillGraphTab: React.FC<SkillGraphTabProps> = ({
  profile,
  onOpenVerifyModal,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('tree');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  if (!profile) {
    return (
      <EmptyProfileState
        onOpenBuildModal={onOpenBuildModal}
        onQuickAnalyzeGithub={onQuickAnalyzeGithub}
      />
    );
  }

  const activeSkill: EvaluatedSkill =
    profile.skills.find((s) => s.id === selectedSkillId) || profile.skills[0];

  // Group skills by category for clean hierarchical tree display
  const categories = Array.from(new Set(profile.skills.map((s) => s.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Skill Graph — {profile.targetRole.title}
          </h1>
          <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
            Blue lines show active verified skills; neutral gray lines show unverified gaps. Click any node to inspect its evidence.
          </p>
        </div>

        <div className="inline-flex p-0.5 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'tree'
                ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                : 'text-[#475569] dark:text-[#CBD5E1]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Skill Tree</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'matrix'
                ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold shadow-xs'
                : 'text-[#475569] dark:text-[#CBD5E1]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Main Split: Graph (8 cols) + Node Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Restrained Orthogonal Skill Graph */}
        <div className="lg:col-span-8 card-surface p-6 overflow-x-auto">
          {viewMode === 'tree' ? (
            <div className="min-w-[540px]">
              {/* Root Node */}
              <div className="flex flex-col items-center">
                <div className="px-6 py-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border-2 border-[#1D4ED8] dark:border-[#3B82F6] text-center">
                  <div className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                    TARGET ROLE
                  </div>
                  <div className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {profile.targetRole.title} ({profile.overallReadiness}%)
                  </div>
                </div>
                <div className="w-[1.5px] h-6 bg-[#1D4ED8] dark:bg-[#3B82F6]" />
              </div>

              {/* Domain Branches */}
              <div className="space-y-6 pl-4 border-l-[1.5px] border-[#CBD5E1] dark:border-[#334155] ml-6">
                {categories.map((cat) => {
                  const catSkills = profile.skills.filter((s) => s.category === cat);
                  const hasStrong = catSkills.some((s) => s.status === 'strong');

                  return (
                    <div key={cat} className="relative pl-6">
                      <div
                        className={`absolute -left-[16px] top-4 w-6 h-[1.5px] ${
                          hasStrong
                            ? 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                            : 'bg-[#CBD5E1] dark:bg-[#334155]'
                        }`}
                      />
                      <div className="text-[12px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] mb-2.5">
                        {cat}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {catSkills.map((skill) => {
                          const isSelected = activeSkill?.id === skill.id;
                          const isStrong = skill.status === 'strong';

                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => setSelectedSkillId(skill.id)}
                              className={`p-3 rounded-[6px] text-left transition-all border ${
                                isSelected
                                  ? 'border-2 border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                                  : isStrong
                                  ? 'border-[#1D4ED8]/40 bg-[#FFFFFF] dark:bg-[#111827] hover:border-[#1D4ED8]'
                                  : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] hover:border-[#94A3B8]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[12px] mb-1">
                                <span
                                  className={`font-medium flex items-center gap-1 ${
                                    isStrong
                                      ? 'text-[#1D4ED8] dark:text-[#3B82F6]'
                                      : 'text-[#64748B] dark:text-[#94A3B8]'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isStrong ? 'bg-[#1D4ED8]' : 'bg-[#94A3B8]'
                                    }`}
                                  />
                                  {isStrong ? 'Verified' : 'Gap'}
                                </span>
                                <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                                  {skill.confidence}%
                                </span>
                              </div>
                              <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                {skill.name}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profile.skills.map((skill) => {
                const isSelected = activeSkill?.id === skill.id;
                const isStrong = skill.status === 'strong';
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => setSelectedSkillId(skill.id)}
                    className={`p-3.5 rounded-[6px] text-left border transition-all ${
                      isSelected
                        ? 'border-2 border-[#1D4ED8] bg-[#F8FAFC] dark:bg-[#1E293B]'
                        : 'border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]'
                    }`}
                  >
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {skill.category}
                    </div>
                    <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                      {skill.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[12px] tabular-nums">
                      <span
                        className={
                          isStrong
                            ? 'text-[#15803D] dark:text-[#4ADE80] font-semibold'
                            : 'text-[#B45309] dark:text-[#FBBF24] font-semibold'
                        }
                      >
                        {skill.confidence}%
                      </span>
                      <span className="text-[#64748B]">
                        Target: {skill.targetScore}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Selected Skill Inspector */}
        {activeSkill && (
          <div className="lg:col-span-4 card-surface p-5 space-y-4">
            <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <span className="text-[11px] font-mono uppercase text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                {activeSkill.category}
              </span>
              <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                {activeSkill.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 tabular-nums">
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Evidence Confidence
                </div>
                <div
                  className={`text-[20px] font-bold font-mono mt-0.5 ${
                    activeSkill.status === 'strong'
                      ? 'text-[#15803D] dark:text-[#4ADE80]'
                      : 'text-[#B45309] dark:text-[#FBBF24]'
                  }`}
                >
                  {activeSkill.confidence}%
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Role Benchmark
                </div>
                <div className="text-[20px] font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                  {activeSkill.targetScore}%
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[13px]">
              <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                {activeSkill.status === 'strong' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                ) : activeSkill.status === 'moderate' ? (
                  <Clock className="w-4 h-4 text-[#1D4ED8]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                )}
                <span>Why this score?</span>
              </div>
              <p className="text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {activeSkill.whyExplanation}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenVerifyModal(activeSkill)}
                className="w-full h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {activeSkill.status === 'strong'
                    ? 'Add Additional Proof'
                    : `Verify ${activeSkill.name} Now`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
