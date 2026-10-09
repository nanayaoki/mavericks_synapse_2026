import React, { useState } from 'react';
import {
  X,
  GitBranch,
  FileText,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  Code2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import {
  ROLE_TEMPLATES,
  analyzeRealCandidate,
  buildCustomRoleFromJobDescription,
} from '../services/skillAnalyzer';
import { SkillTwinProfile } from '../types/skilltwin';

interface BuildSkillTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProfile: SkillTwinProfile | null;
  onProfileCreated: (profile: SkillTwinProfile) => void;
}

const ANALYSIS_STEPS = [
  'Analyzing repository structure',
  'Detecting technologies',
  'Evaluating project complexity',
  'Mapping evidence to skills',
  'Updating Skill Graph',
];

const QUICK_RESUME_TAGS = [
  'Java',
  'TypeScript',
  'Python',
  'Go',
  'React',
  'REST APIs',
  'SQL / PostgreSQL',
  'Docker',
  'AWS',
  'Redis / System Design',
  'Git',
  'Automated Testing',
];

export const BuildSkillTwinModal: React.FC<BuildSkillTwinModalProps> = ({
  isOpen,
  onClose,
  existingProfile,
  onProfileCreated,
}) => {
  const [githubUsername, setGithubUsername] = useState(
    existingProfile?.githubUsername === 'local-workspace'
      ? ''
      : existingProfile?.githubUsername || ''
  );
  const [candidateName, setCandidateName] = useState(
    existingProfile?.candidateName || ''
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    existingProfile?.targetRole.id || ROLE_TEMPLATES[0].id
  );
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customJobDescription, setCustomJobDescription] = useState('');
  const [resumeText, setResumeText] = useState(
    existingProfile?.resumeText || ''
  );
  const [selectedClaimTags, setSelectedClaimTags] = useState<string[]>([
    'Java',
    'REST APIs',
    'SQL / PostgreSQL',
    'Docker',
    'AWS',
  ]);
  const [extraCodeText, setExtraCodeText] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleClaimTag = (tag: string) => {
    setSelectedClaimTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !githubUsername.trim() &&
      !resumeText.trim() &&
      selectedClaimTags.length === 0 &&
      !extraCodeText.trim()
    ) {
      setErrorMsg(
        'Please enter a GitHub username, select claimed skills, or paste resume/code text to analyze.'
      );
      return;
    }

    setIsAnalyzing(true);
    setStepIndex(0);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 350);

    try {
      const targetRole =
        selectedRoleId === 'custom'
          ? buildCustomRoleFromJobDescription(customJobTitle, customJobDescription)
          : ROLE_TEMPLATES.find((r) => r.id === selectedRoleId) || ROLE_TEMPLATES[0];

      const combinedResumeText = `${resumeText}\nClaimed Skills: ${selectedClaimTags.join(
        ', '
      )}`;

      const profile = await analyzeRealCandidate({
        githubUsername,
        candidateName,
        resumeText: combinedResumeText,
        extraCodeText,
        targetRole,
      });

      clearInterval(stepInterval);
      setStepIndex(ANALYSIS_STEPS.length);

      setTimeout(() => {
        setIsAnalyzing(false);
        onProfileCreated(profile);
        onClose();
      }, 350);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMsg(err?.message || 'Unable to complete analysis. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[1px] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="build-modal-title"
    >
      <div className="w-full max-w-2xl rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] overflow-hidden my-8">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div>
            <h2
              id="build-modal-title"
              className="text-[17px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              {isAnalyzing
                ? 'Building Your Evidence-Backed SkillTwin'
                : 'Build Your SkillTwin Profile'}
            </h2>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Connect your real GitHub repositories and compare them against your resume claims and target job.
            </p>
          </div>
          {!isAnalyzing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {isAnalyzing ? (
            <div className="py-6 space-y-5">
              <div className="p-5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] font-mono text-[13px] space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                  const isCompleted = index < stepIndex;
                  const isCurrent = index === stepIndex;
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
              <p className="text-[12px] text-center text-[#64748B] dark:text-[#94A3B8]">
                Fetching live repository metadata and comparing against role requirements...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRunAnalysis} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-[6px] bg-[#FEF2F2] dark:bg-[#B91C1C]/15 border border-[#FECACA] dark:border-[#B91C1C]/40 text-[#B91C1C] dark:text-[#F87171] text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: GitHub Username & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    1. GitHub Username (Live Fetch)
                  </label>
                  <div className="relative flex items-center">
                    <GitBranch className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. sindresorhus, tj, or your username"
                      className="w-full h-9 pl-9 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                    />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>Try live GitHub user:</span>
                    {['tj', 'sindresorhus', 'shadcn'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => setGithubUsername(handle)}
                        className="font-mono text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
                      >
                        @{handle}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Auto-filled from GitHub if blank"
                    className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                  />
                </div>
              </div>

              {/* Step 2: Target Job Role */}
              <div>
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  2. Target Job Benchmark
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
                  >
                    {ROLE_TEMPLATES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.title} — {role.level} ({role.requiredSkills.length} core skills)
                      </option>
                    ))}
                    <option value="custom">
                      + Paste a Custom Job Description...
                    </option>
                  </select>
                </div>

                {selectedRoleId === 'custom' && (
                  <div className="mt-3 p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <input
                      type="text"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      placeholder="Custom Job Title (e.g. Senior Backend Engineer)"
                      className="w-full h-8 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px]"
                    />
                    <textarea
                      rows={3}
                      value={customJobDescription}
                      onChange={(e) => setCustomJobDescription(e.target.value)}
                      placeholder="Paste the job requirements or description here (e.g. Looking for an engineer experienced in Java, PostgreSQL, Docker, AWS, and REST APIs)..."
                      className="w-full p-2.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[12px]"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Resume Claims (Quick Tags + Optional Paste) */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  3. Skills Claimed on Your Resume
                </label>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Select the skills you claim on your resume, or paste your resume summary below. SkillTwin will check which claims are backed by your repositories vs. where you have evidence gaps.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_RESUME_TAGS.map((tag) => {
                    const active = selectedClaimTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleClaimTag(tag)}
                        className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium border transition-colors ${
                          active
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:border-[#94A3B8]'
                        }`}
                      >
                        {active ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  rows={2}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Optional: Paste your resume text or experience bullets here..."
                  className="w-full mt-2 p-2.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              {/* Optional Step 4: Paste Code / Dockerfile / SQL Snippet */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>
                    {showCodeInput
                      ? 'Hide direct code artifact input'
                      : '+ Optional: Paste a Dockerfile, SQL script, or code snippet as extra evidence'}
                  </span>
                </button>

                {showCodeInput && (
                  <textarea
                    rows={3}
                    value={extraCodeText}
                    onChange={(e) => setExtraCodeText(e.target.value)}
                    placeholder="Paste code, package.json, Dockerfile, or Terraform config here..."
                    className="w-full mt-2 p-2.5 rounded-[6px] bg-[#0F172A] text-[#F8FAFC] font-mono text-[12px] border border-[#334155] focus:outline-none focus:border-[#3B82F6]"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-2 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <span>Analyze &amp; Build SkillTwin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
