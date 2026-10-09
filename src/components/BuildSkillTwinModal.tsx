import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  FileText,
  CheckCircle2,
  Circle,
  Loader2,
  ShieldCheck,
  Terminal,
  ArrowRight,
  FolderGit2,
} from 'lucide-react';

interface BuildSkillTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: {
    githubHandle: string;
    targetRole: string;
    addedRepo?: string;
  }) => void;
  initialMode?: 'build' | 're-evaluate' | 'empty-demo';
}

const ANALYSIS_STEPS = [
  'Analyzing repository structure',
  'Detecting technologies',
  'Evaluating project complexity',
  'Mapping evidence to skills',
  'Updating Skill Graph',
];

export const BuildSkillTwinModal: React.FC<BuildSkillTwinModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialMode = 'build',
}) => {
  const [githubHandle, setGithubHandle] = useState('github.com/sjenks-dev');
  const [repoUrl, setRepoUrl] = useState('org/payment-gateway, org/ledger-service');
  const [targetRole, setTargetRole] = useState('Backend Software Engineer (L5)');
  const [viewState, setViewState] = useState<'form' | 'empty' | 'analyzing' | 'done'>(
    initialMode === 'empty-demo' ? 'empty' : initialMode === 're-evaluate' ? 'analyzing' : 'form'
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialMode === 're-evaluate') {
        setViewState('analyzing');
        setCurrentStepIndex(0);
      } else if (initialMode === 'empty-demo') {
        setViewState('empty');
      } else {
        setViewState('form');
      }
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (viewState !== 'analyzing') return;

    if (currentStepIndex < ANALYSIS_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 480);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        setViewState('done');
      }, 300);
      return () => clearTimeout(finishTimer);
    }
  }, [viewState, currentStepIndex]);

  if (!isOpen) return null;

  const startEvaluation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCurrentStepIndex(0);
    setViewState('analyzing');
  };

  const handleComplete = () => {
    onComplete({
      githubHandle,
      targetRole,
      addedRepo: repoUrl,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[1px] p-4 transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-lg rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <h2
              id="modal-title"
              className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              {viewState === 'empty'
                ? 'Evidence Workspace'
                : viewState === 'analyzing'
                ? 'Deterministic Evidence Analysis'
                : 'Build Your SkillTwin'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {viewState !== 'analyzing' && (
              <button
                type="button"
                onClick={() => setViewState(viewState === 'empty' ? 'form' : 'empty')}
                className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] px-2 py-1 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] transition-colors whitespace-nowrap"
              >
                {viewState === 'empty' ? 'Configure Sources' : 'Preview Empty State'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {viewState === 'empty' && (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-[8px] bg-[#F8FAFC]/60 dark:bg-[#0B1120]/40">
              <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center text-[#475569] dark:text-[#CBD5E1] mb-3">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                No evidence yet
              </h3>
              <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] max-w-sm mt-1.5 leading-relaxed">
                Connect your GitHub account or add a project to start building your SkillTwin.
              </p>
              <button
                type="button"
                onClick={() => setViewState('form')}
                className="mt-5 h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-2 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
              >
                <GitBranch className="w-4 h-4" />
                Add Evidence
              </button>
            </div>
          )}

          {viewState === 'form' && (
            <form onSubmit={startEvaluation} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  GitHub / GitLab Profile or Organization
                </label>
                <div className="relative flex items-center">
                  <GitBranch className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="github.com/username"
                    className="w-full h-9 pl-9 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Repositories to Index (AST & Commit Verification)
                </label>
                <input
                  type="text"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="org/service-a, org/service-b"
                  className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                />
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                  Read-only ephemeral inspection. Zero source code is stored after AST extraction.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Target Job Benchmark
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
                >
                  <option value="Backend Software Engineer (L5)">
                    Backend Software Engineer — Tier-1 Distributed Systems (L5)
                  </option>
                  <option value="Staff Platform Architect (L6)">
                    Staff Platform Architect — Cloud & Core Infra (L6)
                  </option>
                  <option value="Senior Product Engineer (L4)">
                    Senior Product Engineer — Full-Stack Services (L4)
                  </option>
                </select>
              </div>

              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2 text-[#475569] dark:text-[#CBD5E1]">
                  <FileText className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                  <span>Resume claims cross-checked against repository AST</span>
                </div>
                <span className="font-mono text-[#15803D] dark:text-[#4ADE80] font-medium">
                  GPG Verify Active
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-3.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
                >
                  <span>Evaluate Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {(viewState === 'analyzing' || viewState === 'done') && (
            <div className="space-y-5">
              <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] font-mono text-[13px] space-y-2.5">
                {ANALYSIS_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex && viewState === 'analyzing';
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 transition-opacity duration-150 ${
                        isCompleted
                          ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                          : isCurrent
                          ? 'text-[#1D4ED8] dark:text-[#3B82F6] font-medium'
                          : 'text-[#64748B] dark:text-[#94A3B8]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6] animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#94A3B8] dark:text-[#475569] shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>

              {viewState === 'done' && (
                <div className="p-3.5 rounded-[6px] bg-[#F0FDF4] dark:bg-[#15803D]/15 border border-[#BBF7D0] dark:border-[#15803D]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                    <div className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                      <span className="font-semibold">Evaluation verified:</span> 1,509 AST signals mapped across 15 competencies.
                    </div>
                  </div>
                  <span className="font-mono text-[12px] font-semibold text-[#15803D] dark:text-[#4ADE80] tabular-nums">
                    81% Ready
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={viewState !== 'done'}
                  onClick={handleComplete}
                  className={`h-9 px-4 rounded-[6px] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    viewState === 'done'
                      ? 'bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white cursor-pointer'
                      : 'bg-[#E2E8F0] dark:bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                  }`}
                >
                  <span>Open SkillTwin Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
