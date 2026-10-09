import React, { useState, useEffect } from 'react';
import {
  X,
  Code2,
  CheckCircle2,
  AlertCircle,
  Play,
  Lightbulb,
  FolderGit2,
} from 'lucide-react';
import { EvaluatedSkill, EvidenceItem } from '../types/skilltwin';

interface SkillAssessmentModalProps {
  skill: EvaluatedSkill | null;
  onClose: () => void;
  onSkillVerified: (
    skillId: string,
    newScore: number,
    newEvidenceItem: EvidenceItem
  ) => void;
}

export const SkillAssessmentModal: React.FC<SkillAssessmentModalProps> = ({
  skill,
  onClose,
  onSkillVerified,
}) => {
  const [mode, setMode] = useState<'challenge' | 'paste-repo'>('challenge');
  const [codeValue, setCodeValue] = useState('');
  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [repoCodeSnippet, setRepoCodeSnippet] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (skill) {
      setCodeValue(skill.assessmentQuestion?.starterCode || '');
      setFeedback(null);
      setShowHint(false);
      setMode('challenge');
    }
  }, [skill]);

  if (!skill) return null;

  const handleValidateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const lower = codeValue.toLowerCase();
    const starterLower = (skill.assessmentQuestion?.starterCode || '').toLowerCase();

    if (codeValue.trim().length <= starterLower.trim().length + 8) {
      setFeedback({
        passed: false,
        message:
          'Please complete the implementation in the editor before running verification.',
      });
      return;
    }

    const requiredKeywords = skill.assessmentQuestion?.validationKeywords || [];
    const matchedKeywords = requiredKeywords.filter((kw) =>
      lower.includes(kw.toLowerCase())
    );

    if (requiredKeywords.length > 0 && matchedKeywords.length === 0) {
      setFeedback({
        passed: false,
        message: `Verification check: Make sure your solution includes the expected construct (${
          skill.assessmentQuestion?.hint || 'see hint'
        }).`,
      });
      return;
    }

    const boostedScore = Math.max(skill.confidence, skill.targetScore + 8);
    setFeedback({
      passed: true,
      message: `Verification passed! ${skill.name} confidence increased from ${skill.confidence}% to ${boostedScore}%.`,
    });

    const newEvidence: EvidenceItem = {
      id: `assess-${skill.id}-${Date.now()}`,
      title: `Verified Assessment: ${skill.name}`,
      sourceType: 'assessment',
      language: 'Code Verification',
      skillsMatched: [skill.name],
      confidenceContribution: boostedScore,
      metricLabel: `Score: ${boostedScore}% · Passed validation`,
      timestamp: new Date().toISOString().split('T')[0],
      verified: true,
      codeSnippet: {
        filename: `${skill.id}_verification.code`,
        content: codeValue,
        highlights: [skill.name],
      },
    };

    setTimeout(() => {
      onSkillVerified(skill.id, boostedScore, newEvidence);
      onClose();
    }, 900);
  };

  const handleVerifyFromSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoCodeSnippet.trim() && !repoUrlInput.trim()) {
      setFeedback({
        passed: false,
        message: 'Please provide a repository link or paste a code/config file.',
      });
      return;
    }

    const boostedScore = Math.max(skill.confidence, skill.targetScore + 5);
    const newEvidence: EvidenceItem = {
      id: `proj-${skill.id}-${Date.now()}`,
      title: repoUrlInput.trim() || `Project Evidence: ${skill.name}`,
      sourceType: 'code_submission',
      url: repoUrlInput.trim().startsWith('http')
        ? repoUrlInput.trim()
        : undefined,
      language: 'Project Artifact',
      skillsMatched: [skill.name],
      confidenceContribution: boostedScore,
      metricLabel: 'Submitted Project Evidence',
      timestamp: new Date().toISOString().split('T')[0],
      verified: true,
      codeSnippet: {
        filename: `${skill.id}_project_artifact.txt`,
        content:
          repoCodeSnippet.trim() ||
          `Linked repository evidence: ${repoUrlInput.trim()}`,
        highlights: [skill.name],
      },
    };

    onSkillVerified(skill.id, boostedScore, newEvidence);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase text-[#1D4ED8] dark:text-[#3B82F6]">
              Skill Verification · Target: {skill.targetScore}%
            </div>
            <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Verify {skill.name} (Current: {skill.confidence}%)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('challenge');
              setFeedback(null);
            }}
            className={`h-8 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
              mode === 'challenge'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Code Challenge</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('paste-repo');
              setFeedback(null);
            }}
            className={`h-8 px-3 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors ${
              mode === 'paste-repo'
                ? 'bg-[#1D4ED8] text-white'
                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Add Project / Code File</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {mode === 'challenge' ? (
            <form onSubmit={handleValidateChallenge} className="space-y-4">
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">
                <p className="leading-relaxed">
                  {skill.assessmentQuestion?.prompt}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] inline-flex items-center gap-1 hover:underline"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Show Solution Hint'}</span>
                  </button>
                </div>
                {showHint && (
                  <p className="mt-1.5 text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                    Hint: {skill.assessmentQuestion?.hint}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Code Editor
                </label>
                <textarea
                  rows={8}
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  className="w-full p-3 rounded-[6px] bg-[#0F172A] text-[#F8FAFC] font-mono text-[12px] leading-relaxed border border-[#334155] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-[6px] text-[12px] flex items-center gap-2 ${
                    feedback.passed
                      ? 'bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80] border border-[#BBF7D0]'
                      : 'bg-[#FEF2F2] dark:bg-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171] border border-[#FECACA]'
                  }`}
                >
                  {feedback.passed ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Verification &amp; Update Score</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyFromSnippet} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Repository URL or Project Name
                </label>
                <input
                  type="text"
                  value={repoUrlInput}
                  onChange={(e) => setRepoUrlInput(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Paste Configuration or Code File Demonstrating {skill.name}
                </label>
                <textarea
                  rows={5}
                  value={repoCodeSnippet}
                  onChange={(e) => setRepoCodeSnippet(e.target.value)}
                  placeholder={`Paste your ${skill.name} implementation, Dockerfile, or config file...`}
                  className="w-full p-3 rounded-[6px] bg-[#0F172A] text-[#F8FAFC] font-mono text-[12px] border border-[#334155]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors"
                >
                  Save Evidence &amp; Update SkillTwin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
