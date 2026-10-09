import React from 'react';
import { FolderGit2, GitBranch, ArrowRight } from 'lucide-react';

interface EmptyProfileStateProps {
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

export const EmptyProfileState: React.FC<EmptyProfileStateProps> = ({
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  return (
    <div className="card-surface p-8 sm:p-12 text-center max-w-2xl mx-auto my-8">
      <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#1D4ED8] dark:text-[#3B82F6] mx-auto mb-4">
        <FolderGit2 className="w-6 h-6" />
      </div>

      <h2 className="text-[22px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
        No evidence yet
      </h2>

      <p className="text-[15px] text-[#475569] dark:text-[#CBD5E1] max-w-md mx-auto mt-2 leading-relaxed">
        Connect your GitHub account or add a project to start building your SkillTwin.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenBuildModal}
          className="h-10 px-5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[14px] font-medium inline-flex items-center gap-2 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          <GitBranch className="w-4 h-4" />
          <span>Add Evidence</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-[#334155]">
        <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mb-2.5">
          Or test immediately with a live public GitHub account:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { handle: 'tj', label: '@tj (Backend & Go/Node)' },
            { handle: 'sindresorhus', label: '@sindresorhus (TypeScript & OSS)' },
            { handle: 'shadcn', label: '@shadcn (UI & Full-Stack)' },
          ].map((item) => (
            <button
              key={item.handle}
              type="button"
              onClick={() => onQuickAnalyzeGithub(item.handle)}
              className="h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3 h-3 text-[#64748B]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
