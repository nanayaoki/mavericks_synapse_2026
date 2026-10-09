import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  Download,
  Check,
  Briefcase,
  ArrowRight,
  GitBranch,
  Sparkles,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import {
  ArchiveFileEntry,
  EvaluatedSkill,
  RoleTemplate,
  SkillTwinProfile,
} from '../../types/skilltwin';
import {
  ROLE_TEMPLATES,
  buildCustomRoleFromJobDescription,
} from '../../services/skillAnalyzer';
import {
  SAMPLE_ATS_RESUMES,
  evaluateAtsResume,
  extractFilesFromUpload,
} from '../../services/atsAnalyzer';

interface ATSScoreTabProps {
  profile: SkillTwinProfile | null;
  onSyncResumeToProfile: (params: {
    resumeText: string;
    codeText?: string;
    targetRole: RoleTemplate;
    atsScore: number;
  }) => Promise<void>;
  onOpenVerifyModal: (skill: EvaluatedSkill) => void;
}

export const ATSScoreTab: React.FC<ATSScoreTabProps> = ({
  profile,
  onSyncResumeToProfile,
  onOpenVerifyModal,
}) => {
  const [resumeText, setResumeText] = useState<string>(
    profile?.resumeText && profile.resumeText.trim().length > 40
      ? profile.resumeText
      : SAMPLE_ATS_RESUMES[0].content
  );
  const [extractedCodeText, setExtractedCodeText] = useState<string>('');
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFileEntry[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    profile?.targetRole.id &&
      ROLE_TEMPLATES.some((r) => r.id === profile.targetRole.id)
      ? profile.targetRole.id
      : ROLE_TEMPLATES[0].id
  );
  const [customJobTitle, setCustomJobTitle] = useState<string>(
    'Senior Software Engineer'
  );
  const [customJobDescription, setCustomJobDescription] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [downloadedResume, setDownloadedResume] = useState(false);
  const [appliedBulletIds, setAppliedBulletIds] = useState<string[]>([]);
  const [insertedSkillIds, setInsertedSkillIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (
      profile?.resumeText &&
      profile.resumeText.trim().length > 80 &&
      resumeText === SAMPLE_ATS_RESUMES[0].content
    ) {
      setResumeText(profile.resumeText);
    }
  }, [profile]);

  const activeTargetRole: RoleTemplate =
    selectedRoleId === 'custom'
      ? buildCustomRoleFromJobDescription(customJobTitle, customJobDescription)
      : ROLE_TEMPLATES.find((r) => r.id === selectedRoleId) || ROLE_TEMPLATES[0];

  const atsResult = evaluateAtsResume({
    resumeText,
    targetRole: activeTargetRole,
    customJobDescription,
    profile,
  });

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadStatusMsg(`Extracting "${file.name}"...`);
    try {
      const extracted = await extractFilesFromUpload(file);
      if (!extracted.resumeText && !extracted.codeText) {
        setUploadError(
          `Could not find readable text inside "${file.name}". Try uploading a .zip, .pdf, .docx, .txt, or .md file, or paste your resume below.`
        );
        setUploadStatusMsg(null);
        return;
      }

      if (extracted.resumeText) {
        setResumeText(extracted.resumeText);
      }
      if (extracted.codeText) {
        setExtractedCodeText(extracted.codeText);
      }
      setArchiveFiles(extracted.archiveFiles);
      setAppliedBulletIds([]);
      setInsertedSkillIds([]);
      setUploadStatusMsg(
        `Loaded ${file.name} (${extracted.archiveFiles.length} file${
          extracted.archiveFiles.length === 1 ? '' : 's'
        } extracted)`
      );
    } catch (err: any) {
      setUploadError(
        err?.message || 'Failed to read uploaded file. Please try pasting your resume text.'
      );
      setUploadStatusMsg(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleInsertMissingKeywordBullet = (
    skillId: string,
    skillName: string,
    suggestedBullet: string
  ) => {
    let updated = resumeText.trim();
    // Append bullet under EXPERIENCE if found, else append before SKILLS, else at end
    if (/SKILLS/i.test(updated)) {
      updated = updated.replace(
        /\n(SKILLS|TECHNICAL SKILLS)/i,
        `\n${suggestedBullet}\n\n$1`
      );
    } else {
      updated = `${updated}\n${suggestedBullet}`;
    }

    // Also ensure the skill name is listed in the SKILLS line
    if (!updated.toLowerCase().includes(skillName.toLowerCase())) {
      updated = `${updated}, ${skillName}`;
    }

    setResumeText(updated);
    setInsertedSkillIds((prev) => [...prev, skillId]);
  };

  const handleApplyBulletRewrite = (
    bulletId: string,
    originalText: string,
    suggestedRewrite: string
  ) => {
    if (resumeText.includes(originalText)) {
      setResumeText(resumeText.replace(originalText, suggestedRewrite));
    } else {
      setResumeText(`${resumeText.trim()}\n${suggestedRewrite}`);
    }
    setAppliedBulletIds((prev) => [...prev, bulletId]);
  };

  const handleOptimizeAllWeakBullets = () => {
    let updated = resumeText;
    const newlyApplied: string[] = [];

    atsResult.bullets.forEach((b) => {
      if (b.status !== 'strong' && updated.includes(b.originalText)) {
        updated = updated.replace(b.originalText, b.suggestedRewrite);
        newlyApplied.push(b.id);
      }
    });

    // Also insert top 2 missing keywords if any
    const missingKeywords = atsResult.keywordMatches
      .filter((k) => k.status === 'missing')
      .slice(0, 2);

    missingKeywords.forEach((mk) => {
      updated = `${updated.trim()}\n${mk.suggestedBullet}`;
    });

    setResumeText(updated);
    setAppliedBulletIds((prev) => [...prev, ...newlyApplied]);
  };

  const handleSyncToProfile = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onSyncResumeToProfile({
        resumeText,
        codeText: extractedCodeText || undefined,
        targetRole: activeTargetRole,
        atsScore: atsResult.overallAtsScore,
      });
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadOptimizedResume = () => {
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume-ats-${atsResult.overallAtsScore}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedResume(true);
    setTimeout(() => setDownloadedResume(false), 2500);
  };

  const scoreColorClass =
    atsResult.overallAtsScore >= 80
      ? 'text-[#15803D] dark:text-[#4ADE80]'
      : atsResult.overallAtsScore >= 60
      ? 'text-[#B45309] dark:text-[#FBBF24]'
      : 'text-[#B91C1C] dark:text-[#F87171]';

  const scoreBarColorClass =
    atsResult.overallAtsScore >= 80
      ? 'bg-[#15803D] dark:bg-[#4ADE80]'
      : atsResult.overallAtsScore >= 60
      ? 'bg-[#B45309] dark:bg-[#FBBF24]'
      : 'bg-[#B91C1C] dark:bg-[#F87171]';

  const weakBulletsCount = atsResult.bullets.filter(
    (b) => b.status !== 'strong'
  ).length;
  const missingKeywordsCount = atsResult.keywordMatches.filter(
    (k) => k.status === 'missing'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="card-surface p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6]">
              <ShieldCheck className="w-4 h-4" />
              <span>ATS Resume Parser &amp; Evidence Cross-Verifier</span>
            </div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              ATS Score Check &amp; Resume Optimizer
            </h1>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] max-w-3xl">
              Upload your resume or project <code className="font-mono text-[12px]">.zip</code> /{' '}
              <code className="font-mono text-[12px]">.pdf</code> /{' '}
              <code className="font-mono text-[12px]">.docx</code> /{' '}
              <code className="font-mono text-[12px]">.txt</code> file to check your exact ATS match score, uncover missing job keywords, fix weak bullet points in one click, and cross-verify resume claims against your GitHub repositories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadOptimizedResume}
              className="h-9 px-3.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] hover:bg-[#F8FAFC] text-[#0F172A] dark:text-[#F8FAFC] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              {downloadedResume ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Resume Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#475569] dark:text-[#CBD5E1]" />
                  <span>Download Resume (.TXT)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSyncToProfile}
              disabled={isSyncing}
              className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] disabled:opacity-50 text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing with SkillTwin...</span>
                </>
              ) : syncSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Synced to SkillTwin Profile!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Resume to SkillTwin Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Executive ATS Score Strip */}
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 4 Cols: Overall ATS Score & Pass Status */}
          <div className="lg:col-span-4 p-5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Overall ATS Match Score
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${
                    atsResult.passStatus === 'strong_pass'
                      ? 'bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]'
                      : atsResult.passStatus === 'moderate'
                      ? 'bg-[#FFFBEB] dark:bg-[#B45309]/20 text-[#B45309] dark:text-[#FBBF24]'
                      : 'bg-[#FEF2F2] dark:bg-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
                  }`}
                >
                  {atsResult.passStatus === 'strong_pass'
                    ? 'Strong ATS Pass (≥80%)'
                    : atsResult.passStatus === 'moderate'
                    ? 'Moderate Match (Needs Tuning)'
                    : 'High ATS Filter Risk (<60%)'}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-3 tabular-nums">
                <span className={`text-[48px] font-bold leading-none ${scoreColorClass}`}>
                  {atsResult.overallAtsScore}%
                </span>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  <div>Target: ≥80% for {activeTargetRole.title}</div>
                  {profile && (
                    <div className="text-[#1D4ED8] dark:text-[#3B82F6] font-medium mt-0.5">
                      Evidence-Verified Score: {atsResult.verifiedAtsScore}%
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 w-full bg-[#E2E8F0] dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${scoreBarColorClass}`}
                  style={{ width: `${atsResult.overallAtsScore}%` }}
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[12px] text-[#475569] dark:text-[#CBD5E1] tabular-nums">
              <span>{atsResult.wordCount} words</span>
              <span>·</span>
              <span>{atsResult.bulletCount} bullets detected</span>
              <span>·</span>
              <span>
                {atsResult.quantifiedBulletCount}/{atsResult.bulletCount} quantified
              </span>
            </div>
          </div>

          {/* Middle 5 Cols: 6-Dimension ATS Breakdown */}
          <div className="lg:col-span-5 p-5 rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                6-Dimension ATS Scoring Breakdown
              </h2>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                Weighted Parser Signals
              </span>
            </div>

            {[
              {
                label: 'Hard Skill & Keyword Match (40%)',
                score: atsResult.subScores.keywordMatch,
              },
              {
                label: 'Quantified Impact & Metrics (20%)',
                score: atsResult.subScores.impactMetrics,
              },
              {
                label: 'Technical Action Verbs (15%)',
                score: atsResult.subScores.actionVerbs,
              },
              {
                label: 'Standard Section Structure (10%)',
                score: atsResult.subScores.sectionStructure,
              },
              {
                label: 'Parseability & Word Hygiene (10%)',
                score: atsResult.subScores.parseability,
              },
              {
                label: 'Contact & GitHub Links (5%)',
                score: atsResult.subScores.contactInfo,
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[#475569] dark:text-[#CBD5E1] font-medium">
                    {item.label}
                  </span>
                  <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-[#F1F5F9] dark:bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      item.score >= 80
                        ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                        : item.score >= 60
                        ? 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                        : 'bg-[#B45309] dark:bg-[#FBBF24]'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right 3 Cols: Instant ATS Boost Actions */}
          <div className="lg:col-span-3 p-5 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Quick Score Improvements
              </div>
              <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                {missingKeywordsCount > 0 || weakBulletsCount > 0
                  ? `We detected ${missingKeywordsCount} missing job skill keyword${
                      missingKeywordsCount === 1 ? '' : 's'
                    } and ${weakBulletsCount} bullet point${
                      weakBulletsCount === 1 ? '' : 's'
                    } that can be strengthened.`
                  : 'Your resume meets strong ATS keyword and impact benchmarks for this role.'}
              </p>

              <div className="space-y-1.5 pt-1 text-[12px]">
                <div className="flex items-center justify-between text-[#475569] dark:text-[#CBD5E1]">
                  <span>Missing Role Keywords:</span>
                  <span className="font-mono font-semibold text-[#B45309] dark:text-[#FBBF24]">
                    {missingKeywordsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#475569] dark:text-[#CBD5E1]">
                  <span>Bullets Needing Metrics/Verbs:</span>
                  <span className="font-mono font-semibold text-[#B45309] dark:text-[#FBBF24]">
                    {weakBulletsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#475569] dark:text-[#CBD5E1]">
                  <span>Flagged Buzzwords:</span>
                  <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {atsResult.flaggedBuzzwords.length}
                  </span>
                </div>
              </div>
            </div>

            {(missingKeywordsCount > 0 || weakBulletsCount > 0) && (
              <button
                type="button"
                onClick={handleOptimizeAllWeakBullets}
                className="w-full h-9 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Auto-Optimize Resume</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Split: Upload & Live Resume Editor (5 Cols) + ATS Diagnostic Workbench (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: File Upload (.zip / .pdf / .docx / .txt) + Live Resume Editor */}
        <div className="lg:col-span-5 space-y-5">
          {/* File & .ZIP Upload Card */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  1. Upload Resume or Project .ZIP Archive
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Supports <code className="font-mono">.zip</code>,{' '}
                  <code className="font-mono">.pdf</code>,{' '}
                  <code className="font-mono">.docx</code>,{' '}
                  <code className="font-mono">.txt</code>,{' '}
                  <code className="font-mono">.md</code>, or{' '}
                  <code className="font-mono">.json</code>
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.pdf,.docx,.doc,.txt,.md,.json,.html,.rtf,.tex"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browse File / .ZIP</span>
              </button>
            </div>

            {/* Drag and Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-[6px] border-2 border-dashed cursor-pointer transition-colors text-center ${
                isDragging
                  ? 'border-[#1D4ED8] bg-[#1D4ED8]/5'
                  : 'border-[#CBD5E1] dark:border-[#334155] hover:border-[#1D4ED8] bg-[#F8FAFC] dark:bg-[#0B1120]'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] flex items-center justify-center">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  Drop your Resume or <span className="font-mono">.zip</span> bundle here
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Unpacks <span className="font-mono">.zip</span> archives &amp; extracts resume text and code evidence automatically
                </div>
              </div>
            </div>

            {uploadStatusMsg && (
              <div className="p-2.5 rounded-[6px] bg-[#F0FDF4] dark:bg-[#15803D]/15 border border-[#BBF7D0] dark:border-[#15803D]/40 text-[12px] text-[#15803D] dark:text-[#4ADE80] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadStatusMsg}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-2.5 rounded-[6px] bg-[#FEF2F2] dark:bg-[#B91C1C]/15 border border-[#FECACA] dark:border-[#B91C1C]/40 text-[12px] text-[#B91C1C] dark:text-[#F87171] flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Extracted .ZIP / File Manifest */}
            {archiveFiles.length > 0 && (
              <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  <span>Extracted Files ({archiveFiles.length})</span>
                  <button
                    type="button"
                    onClick={() => setArchiveFiles([])}
                    className="text-[#1D4ED8] dark:text-[#3B82F6] hover:underline normal-case font-normal"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {archiveFiles.map((entry, idx) => (
                    <div
                      key={`${entry.name}-${idx}`}
                      className="p-2 rounded-[4px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[12px]"
                    >
                      <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] truncate flex items-center gap-1.5">
                        {entry.category === 'code' ? (
                          <Code2 className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                        )}
                        <span className="truncate">{entry.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#64748B] shrink-0 ml-2">
                        {Math.max(1, Math.round(entry.sizeBytes / 1024))} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Sample Loader Buttons */}
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-[#64748B] dark:text-[#94A3B8] mr-1">
                Or test with example:
              </span>
              {SAMPLE_ATS_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setResumeText(sample.content);
                    setSelectedRoleId(sample.roleId);
                    setAppliedBulletIds([]);
                    setInsertedSkillIds([]);
                    setUploadStatusMsg(`Loaded example: ${sample.label}`);
                  }}
                  className="px-2 py-1 rounded-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-medium transition-colors"
                >
                  {sample.id === 'needs-tuning'
                    ? 'Load 61% Sample Resume'
                    : 'Load 92% Senior Resume'}
                </button>
              ))}
            </div>
          </div>

          {/* Target Job Role Selector */}
          <div className="card-surface p-5 space-y-3">
            <label className="block text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              2. Target Job Description / Benchmark
            </label>
            <div className="relative flex items-center">
              <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
              >
                {ROLE_TEMPLATES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} — {role.level} ({role.requiredSkills.length} required skill groups)
                  </option>
                ))}
                <option value="custom">
                  + Paste Custom Job Description...
                </option>
              </select>
            </div>

            {selectedRoleId === 'custom' && (
              <div className="space-y-2.5 pt-2">
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                  placeholder="Job Title (e.g. Senior Backend Engineer)"
                  className="w-full h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[12px]"
                />
                <textarea
                  rows={3}
                  value={customJobDescription}
                  onChange={(e) => setCustomJobDescription(e.target.value)}
                  placeholder="Paste the job posting requirements here..."
                  className="w-full p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[12px]"
                />
              </div>
            )}
          </div>

          {/* Live Editable Resume Content */}
          <div className="card-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="live-ats-resume-editor"
                className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                3. Live Resume Editor (Real-Time ATS Scoring)
              </label>
              <span className="font-mono text-[11px] text-[#1D4ED8] dark:text-[#3B82F6]">
                Auto-scores as you edit
              </span>
            </div>
            <textarea
              id="live-ats-resume-editor"
              rows={18}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here or upload a file above..."
              className="w-full p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] font-mono text-[12px] leading-relaxed text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
        </div>

        {/* Right 7 Cols: ATS Diagnostic Workbench */}
        <div className="lg:col-span-7 space-y-6">
          {/* SkillTwin Evidence Cross-Check Banner (if profile exists or encourage connecting GitHub) */}
          <div className="card-surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div>
                <h2 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                  <span>ATS Claims vs. Verified GitHub Evidence</span>
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Traditional ATS only checks if a word is on your resume. SkillTwin checks whether your resume keywords are backed by real repositories.
                </p>
              </div>
              {profile && (
                <span className="font-mono text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] shrink-0">
                  @{profile.githubUsername} connected
                </span>
              )}
            </div>

            {!profile ? (
              <div className="p-4 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
                  Click <strong>Sync Resume to SkillTwin Profile</strong> above or connect your GitHub username to cross-verify which of your ATS keywords are backed by real code.
                </p>
                <button
                  type="button"
                  onClick={handleSyncToProfile}
                  className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] text-white text-[12px] font-medium shrink-0 whitespace-nowrap"
                >
                  Sync &amp; Cross-Verify →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                  <div className="text-[12px] font-semibold text-[#B45309] dark:text-[#FBBF24] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Unverified Resume Claims ({atsResult.unverifiedResumeClaims.length})
                    </span>
                  </div>
                  {atsResult.unverifiedResumeClaims.length === 0 ? (
                    <p className="text-[12px] text-[#15803D] dark:text-[#4ADE80]">
                      Every skill on your resume is backed by GitHub or assessment evidence!
                    </p>
                  ) : (
                    <>
                      <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                        Listed on your resume (passes ATS), but 0 matching public repos found:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {atsResult.unverifiedResumeClaims.map((skillName) => {
                          const matchingSkill = profile.skills.find(
                            (s) => s.name === skillName
                          );
                          return (
                            <button
                              key={skillName}
                              type="button"
                              onClick={() => {
                                if (matchingSkill) onOpenVerifyModal(matchingSkill);
                              }}
                              className="px-2 py-1 rounded-[4px] bg-[#FFFBEB] dark:bg-[#B45309]/20 border border-[#FDE68A] dark:border-[#B45309]/40 text-[11px] font-medium text-[#B45309] dark:text-[#FBBF24] hover:underline"
                            >
                              {skillName} · Verify →
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] space-y-2">
                  <div className="text-[12px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Proven on GitHub, Missing on Resume ({atsResult.unclaimedVerifiedSkills.length})
                    </span>
                  </div>
                  {atsResult.unclaimedVerifiedSkills.length === 0 ? (
                    <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      All of your verified GitHub skills are already included on your resume.
                    </p>
                  ) : (
                    <>
                      <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                        You have real GitHub proof for these skills, but forgot to put them on your resume:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {atsResult.unclaimedVerifiedSkills.map((skillName) => {
                          const km = atsResult.keywordMatches.find(
                            (k) => k.skillName === skillName
                          );
                          return (
                            <button
                              key={skillName}
                              type="button"
                              onClick={() => {
                                if (km) {
                                  handleInsertMissingKeywordBullet(
                                    km.skillId,
                                    km.skillName,
                                    km.suggestedBullet
                                  );
                                }
                              }}
                              className="px-2 py-1 rounded-[4px] bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] text-[11px] font-medium hover:underline"
                            >
                              + Add {skillName} to Resume
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Keyword Match & Missing Keyword Matrix */}
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Keyword Match &amp; Gap Matrix ({activeTargetRole.title})
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  Click <strong>+ Insert Tailored Bullet</strong> on any missing skill to add it to your resume and boost your ATS score immediately.
                </p>
              </div>
              <span className="font-mono text-[12px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6] tabular-nums">
                {atsResult.subScores.keywordMatch}% Match
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {atsResult.keywordMatches.map((km) => {
                const isMatched = km.status === 'matched';
                const isPartial = km.status === 'partial';
                const wasInserted = insertedSkillIds.includes(km.skillId);

                return (
                  <div
                    key={km.skillId}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                        ) : isPartial ? (
                          <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0" />
                        )}
                        <span className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {km.skillName}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] tabular-nums">
                          {km.occurrencesInResume}x in resume
                        </span>
                        {profile && (
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                              km.verifiedInGithub
                                ? 'bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]'
                                : 'bg-[#FFFBEB] dark:bg-[#B45309]/20 text-[#B45309] dark:text-[#FBBF24]'
                            }`}
                          >
                            {km.verifiedInGithub
                              ? '✓ Verified in GitHub'
                              : 'Unverified in GitHub'}
                          </span>
                        )}
                      </div>

                      <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] pl-6">
                        {km.matchedTerms.length > 0 && (
                          <span className="mr-3">
                            Found:{' '}
                            <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                              {km.matchedTerms.join(', ')}
                            </strong>
                          </span>
                        )}
                        {km.missingTerms.length > 0 && (
                          <span>
                            Related terms:{' '}
                            <span className="font-mono">
                              {km.missingTerms.slice(0, 4).join(', ')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pl-6 sm:pl-0 shrink-0">
                      {!isMatched ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleInsertMissingKeywordBullet(
                              km.skillId,
                              km.skillName,
                              km.suggestedBullet
                            )
                          }
                          className="h-8 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {wasInserted ? 'Added Bullet' : 'Insert Tailored Bullet'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[12px] font-mono font-medium text-[#15803D] dark:text-[#4ADE80]">
                          ATS Matched
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Line-by-Line Bullet Point Grader & 1-Click Rewriter */}
          <div className="card-surface overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Experience Bullet Point Impact &amp; Action Verb Audit
                </h2>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  ATS and engineering hiring managers prioritize bullets that pair strong technical action verbs with quantified metrics.
                </p>
              </div>
              <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                {atsResult.quantifiedBulletCount}/{atsResult.bulletCount} strong
              </span>
            </div>

            {atsResult.bullets.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                No experience bullet points detected yet. Add bullet points starting with <code className="font-mono">•</code> or <code className="font-mono">-</code> in the editor on the left.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {atsResult.bullets.map((bullet) => {
                  const isStrong = bullet.status === 'strong';
                  const wasApplied = appliedBulletIds.includes(bullet.id);

                  return (
                    <div key={bullet.id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isStrong
                                  ? 'bg-[#F0FDF4] dark:bg-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]'
                                  : 'bg-[#FFFBEB] dark:bg-[#B45309]/20 text-[#B45309] dark:text-[#FBBF24]'
                              }`}
                            >
                              {isStrong
                                ? 'Strong Impact Bullet'
                                : bullet.status === 'weak_verb'
                                ? 'Weak / Passive Verb'
                                : bullet.status === 'needs_metrics'
                                ? 'Missing Quantified Metric'
                                : 'Too Brief'}
                            </span>
                            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                              {bullet.issueLabel}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-mono leading-relaxed">
                            {bullet.originalText}
                          </p>
                        </div>
                      </div>

                      {!isStrong && !wasApplied && (
                        <div className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#1D4ED8] dark:text-[#3B82F6]">
                              Suggested High-Impact Rewrite:
                            </div>
                            <p className="text-[12px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                              {bullet.suggestedRewrite}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleApplyBulletRewrite(
                                bullet.id,
                                bullet.originalText,
                                bullet.suggestedRewrite
                              )
                            }
                            className="h-8 px-3 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors"
                          >
                            <span>Apply Rewrite</span>
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

          {/* Section & Formatting Hygiene Checklist */}
          <div className="card-surface p-5 space-y-4">
            <h2 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              ATS Section Structure &amp; Parseability Checklist
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {atsResult.sectionChecks.map((sec) => (
                <div
                  key={sec.id}
                  className="p-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] flex items-start gap-2.5"
                >
                  {sec.present ? (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                      {sec.label}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {sec.present ? 'Detected by ATS parser' : `Missing — add a "${sec.label.split('/')[0].trim().toUpperCase()}" heading`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {atsResult.flaggedBuzzwords.length > 0 && (
              <div className="p-3 rounded-[6px] bg-[#FFFBEB] dark:bg-[#B45309]/15 border border-[#FDE68A] dark:border-[#B45309]/40 text-[12px] text-[#B45309] dark:text-[#FBBF24]">
                <strong>Cliché / Buzzword Warning:</strong> Remove generic filler terms (
                <code className="font-mono">{atsResult.flaggedBuzzwords.join(', ')}</code>) and replace them with concrete technical deliverables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
