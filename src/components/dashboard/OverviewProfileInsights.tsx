import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Linkedin,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  AtsAnalysisResult,
  SkillTwinProfile,
} from '../../types/skilltwin';
import { evaluateAtsResume, extractFilesFromUpload } from '../../services/atsAnalyzer';
import {
  importLinkedInProfile,
  LinkedInProfileSections,
} from '../../services/linkedinImport';

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const MAX_PROFILE_TEXT_LENGTH = 20000;
const SUPPORTED_RESUME_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const MAX_LINKEDIN_IMPORT_BYTES = 25 * 1024 * 1024;

export interface ProfileInsightsUpdate {
  resumeText: string;
  resumeFileName?: string;
  linkedinUrl?: string;
  linkedinProfileText?: string;
  linkedinImportFileName?: string;
  linkedinSections?: LinkedInProfileSections;
  importedCandidateName?: string;
  atsScore?: number;
}

interface OverviewProfileInsightsProps {
  profile: SkillTwinProfile;
  onSave: (update: ProfileInsightsUpdate) => void;
}

const getLinkedInUrlError = (value: string): string | null => {
  if (!value.trim()) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`
    );
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    if (
      (hostname !== 'linkedin.com' && hostname !== 'm.linkedin.com') ||
      !/^\/in\/[^/]+\/?$/i.test(url.pathname)
    ) {
      return 'Enter a LinkedIn profile URL in the format linkedin.com/in/your-name.';
    }
    return null;
  } catch {
    return 'Enter a valid LinkedIn profile URL.';
  }
};

const analyzeText = (
  text: string,
  profile: SkillTwinProfile
): AtsAnalysisResult =>
  evaluateAtsResume({
    resumeText: text,
    targetRole: profile.targetRole,
    profile,
  });

const getMatchedSkills = (result: AtsAnalysisResult) =>
  result.keywordMatches.filter((match) => match.status !== 'missing');

const getMissingSkills = (result: AtsAnalysisResult) =>
  result.keywordMatches.filter((match) => match.status === 'missing');

export const OverviewProfileInsights: React.FC<OverviewProfileInsightsProps> = ({
  profile,
  onSave,
}) => {
  const [resumeText, setResumeText] = useState(profile.resumeText || '');
  const [resumeFileName, setResumeFileName] = useState(profile.resumeFileName || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [linkedinProfileText, setLinkedinProfileText] = useState(
    profile.linkedinProfileText || ''
  );
  const [linkedinImportFileName, setLinkedinImportFileName] = useState(
    profile.linkedinImportFileName || ''
  );
  const [linkedinSections, setLinkedinSections] = useState<
    LinkedInProfileSections | undefined
  >(profile.linkedinSections);
  const [importedCandidateName, setImportedCandidateName] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const linkedInFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setResumeText(profile.resumeText || '');
    setResumeFileName(profile.resumeFileName || '');
    setLinkedinUrl(profile.linkedinUrl || '');
    setLinkedinProfileText(profile.linkedinProfileText || '');
    setLinkedinImportFileName(profile.linkedinImportFileName || '');
    setLinkedinSections(profile.linkedinSections);
  }, [profile]);

  const resumeResult = resumeText.trim()
    ? analyzeText(resumeText, profile)
    : null;
  const linkedinResult = linkedinProfileText.trim()
    ? analyzeText(linkedinProfileText, profile)
    : null;

  const handleResumeUpload = async (file?: File) => {
    if (!file) return;
    setError(null);
    setSuccess(false);

    const extension = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.toLowerCase()}`
      : '';
    if (!SUPPORTED_RESUME_EXTENSIONS.includes(extension)) {
      setError('Upload a PDF, DOCX, TXT, or Markdown resume.');
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setError('Resume files must be 10 MB or smaller.');
      return;
    }

    setIsReadingFile(true);
    try {
      const extracted = await extractFilesFromUpload(file);
      if (extracted.resumeText.trim().length < 40) {
        throw new Error(
          'We could not extract enough readable text. Try a text-based PDF or DOCX, or upload a TXT/Markdown copy.'
        );
      }
      setResumeText(extracted.resumeText.slice(0, 40000));
      setResumeFileName(file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not read the selected resume.'
      );
    } finally {
      setIsReadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkedInImport = async (file?: File) => {
    if (!file) return;
    setError(null);
    setSuccess(false);
    if (file.size > MAX_LINKEDIN_IMPORT_BYTES) {
      setError('LinkedIn imports must be 25 MB or smaller.');
      return;
    }
    setIsImportingLinkedIn(true);
    try {
      const imported = await importLinkedInProfile(file);
      setLinkedinProfileText(imported.text.slice(0, MAX_PROFILE_TEXT_LENGTH));
      setLinkedinSections(imported.sections);
      setLinkedinImportFileName(imported.fileNames.join(', '));
      setImportedCandidateName(imported.candidateName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not import the LinkedIn profile file.'
      );
    } finally {
      setIsImportingLinkedIn(false);
      if (linkedInFileInputRef.current) linkedInFileInputRef.current.value = '';
    }
  };

  const handleSaveAndAnalyze = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const urlError = getLinkedInUrlError(linkedinUrl);
    if (urlError) {
      setError(urlError);
      return;
    }
    if (linkedinProfileText.length > MAX_PROFILE_TEXT_LENGTH) {
      setError('LinkedIn profile text must be 20,000 characters or less.');
      return;
    }
    if (!resumeText.trim() && !linkedinProfileText.trim()) {
      setError('Upload a resume or paste LinkedIn profile text to analyze.');
      return;
    }

    const normalizedLinkedInUrl = linkedinUrl.trim()
      ? (/^https?:\/\//i.test(linkedinUrl.trim())
          ? linkedinUrl.trim()
          : `https://${linkedinUrl.trim()}`
        ).replace(/\/+$/, '')
      : undefined;

    onSave({
      resumeText,
      resumeFileName: resumeFileName || undefined,
      linkedinUrl: normalizedLinkedInUrl,
      linkedinProfileText: linkedinProfileText.trim() || undefined,
      linkedinImportFileName: linkedinImportFileName || undefined,
      linkedinSections,
      importedCandidateName,
      atsScore: resumeText.trim()
        ? analyzeText(resumeText, profile).overallAtsScore
        : undefined,
    });
    setSuccess(true);
  };

  const linkedInMatchedSkills = linkedinResult
    ? getMatchedSkills(linkedinResult)
    : [];
  const resumeMatchedSkillIds = new Set(
    resumeResult ? getMatchedSkills(resumeResult).map((skill) => skill.skillId) : []
  );
  const sharedSkills = linkedInMatchedSkills.filter((skill) =>
    resumeMatchedSkillIds.has(skill.skillId)
  );

  return (
    <section className="card-surface p-5 space-y-5" aria-labelledby="profile-insights-title">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2
            id="profile-insights-title"
            className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            Resume &amp; LinkedIn Insights
          </h2>
          <p className="mt-1 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
            Compare your resume and LinkedIn profile against {profile.targetRole.title}.
          </p>
        </div>
        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Analysis runs in this browser
        </span>
      </div>

      <form onSubmit={handleSaveAndAnalyze} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3 rounded-[6px] bg-[#FEF2F2] dark:bg-[#B91C1C]/15 border border-[#FECACA] dark:border-[#B91C1C]/40 text-[#B91C1C] dark:text-[#F87171] text-[13px] flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <FileText className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
              Resume
            </div>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Upload a PDF, DOCX, TXT, or Markdown resume (max 10 MB).
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="sr-only"
              aria-label="Upload resume"
              onChange={(event) => void handleResumeUpload(event.target.files?.[0])}
            />
            <button
              type="button"
              disabled={isReadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isReadingFile ? 'Reading resume...' : 'Choose resume file'}
            </button>
            <div className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
              {resumeFileName || (resumeText.trim() ? 'Existing profile text' : 'No resume uploaded')}
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] space-y-3">
            <label
              htmlFor="linkedin-profile-url"
              className="flex items-center gap-2 text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              <Linkedin className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
              LinkedIn profile URL
            </label>
            <input
              id="linkedin-profile-url"
              type="text"
              inputMode="url"
              value={linkedinUrl}
              onChange={(event) => {
                setLinkedinUrl(event.target.value);
                setSuccess(false);
              }}
              placeholder="https://www.linkedin.com/in/your-name"
              className="w-full h-9 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[12px] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30"
            />
            {linkedinUrl.trim() && !getLinkedInUrlError(linkedinUrl) && (
              <a
                href={
                  /^https?:\/\//i.test(linkedinUrl.trim())
                    ? linkedinUrl.trim()
                    : `https://${linkedinUrl.trim()}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
              >
                Open LinkedIn profile <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <p className="text-[11px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
              A URL alone cannot be used to read LinkedIn. Import your LinkedIn profile PDF
              or data export ZIP to analyze sections available in your export.
            </p>
            <input
              ref={linkedInFileInputRef}
              type="file"
              accept=".pdf,.zip,.csv"
              className="sr-only"
              aria-label="Import LinkedIn profile PDF, export ZIP, or CSV"
              onChange={(event) => void handleLinkedInImport(event.target.files?.[0])}
            />
            <button
              type="button"
              disabled={isImportingLinkedIn}
              onClick={() => linkedInFileInputRef.current?.click()}
              className="h-9 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {isImportingLinkedIn ? 'Importing LinkedIn data...' : 'Import LinkedIn PDF / ZIP / CSV'}
            </button>
            {linkedinImportFileName && (
              <div className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                Imported: {linkedinImportFileName}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="linkedin-profile-text"
            className="block text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] mb-1.5"
          >
            LinkedIn profile text <span className="font-normal text-[#64748B]">(optional)</span>
          </label>
          <textarea
            id="linkedin-profile-text"
            value={linkedinProfileText}
            onChange={(event) => {
              setLinkedinProfileText(event.target.value);
              setSuccess(false);
            }}
            maxLength={MAX_PROFILE_TEXT_LENGTH}
            rows={4}
            placeholder="Imported data appears here. You can also paste About, Experience, Skills, Certifications, Highlights, and Posts..."
            className="w-full p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 resize-y"
          />
          <div className="mt-1 text-right text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {linkedinProfileText.length}/{MAX_PROFILE_TEXT_LENGTH}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze &amp; Save Profile
          </button>
          {success && (
            <span role="status" className="inline-flex items-center gap-1.5 text-[12px] text-[#15803D] dark:text-[#4ADE80]">
              <CheckCircle2 className="w-4 h-4" />
              Profile details saved and insights updated.
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Resume text and LinkedIn details are saved in this browser with your SkillTwin profile.
        </p>
      </form>

      {(resumeResult || linkedinResult) && (
        <div className="border-t border-[#E2E8F0] dark:border-[#334155] pt-5 space-y-4">
          <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Profile insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resumeResult && (
              <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Resume role match</div>
                <div className="mt-1 text-[26px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {resumeResult.overallAtsScore}%
                </div>
                <p className="mt-1 text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                  {getMatchedSkills(resumeResult).length} of {resumeResult.keywordMatches.length} role skill areas found
                </p>
              </div>
            )}
            {linkedinResult ? (
              <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">LinkedIn role match</div>
                <div className="mt-1 text-[26px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                  {Math.round(
                    (getMatchedSkills(linkedinResult).length /
                      Math.max(1, linkedinResult.keywordMatches.length)) *
                      100
                  )}
                  %
                </div>
                <p className="mt-1 text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                  {getMatchedSkills(linkedinResult).length} of {linkedinResult.keywordMatches.length} role skill areas found in pasted profile text
                </p>
              </div>
            ) : profile.linkedinUrl ? (
              <div className="p-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">LinkedIn profile</div>
                <div className="mt-1 text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  URL connected; content not analyzed
                </div>
                <p className="mt-1 text-[12px] text-[#475569] dark:text-[#CBD5E1]">
                  Paste your profile text above to generate skill-match insights.
                </p>
              </div>
            ) : null}
          </div>

          {linkedinResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                <div>
                  <h4 className="font-semibold text-[#15803D] dark:text-[#4ADE80] mb-1.5">
                    Skills aligned across resume and LinkedIn
                  </h4>
                  <p className="text-[#475569] dark:text-[#CBD5E1]">
                    {sharedSkills.length > 0
                      ? sharedSkills.map((skill) => skill.skillName).join(', ')
                      : 'No role skills are currently present in both. Add consistent evidence to both profiles.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#B45309] dark:text-[#FBBF24] mb-1.5">
                    {resumeResult ? 'Role skills to highlight on your resume' : 'Role skills to highlight on LinkedIn'}
                  </h4>
                  <p className="text-[#475569] dark:text-[#CBD5E1]">
                    {(resumeResult ? getMissingSkills(resumeResult) : getMissingSkills(linkedinResult))
                      .slice(0, 4)
                      .map((skill) => skill.skillName)
                      .join(', ') || 'Your text mentions all selected role skill areas.'}
                  </p>
                </div>
              </div>
              {linkedinSections && (
                <div>
                  <h4 className="text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                    Imported LinkedIn sections
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(linkedinSections)
                      .filter(([, value]) => value.trim())
                      .map(([section, value]) => (
                        <details
                          key={section}
                          className="rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0B1120]"
                        >
                          <summary className="cursor-pointer px-3 py-2 text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </summary>
                          <pre className="whitespace-pre-wrap break-words px-3 pb-3 text-[11px] leading-relaxed text-[#475569] dark:text-[#CBD5E1] font-sans">
                            {value}
                          </pre>
                        </details>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {resumeResult && resumeResult.sectionChecks.some((section) => !section.present) && (
            <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1]">
              <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Resume structure:</strong>{' '}
              Consider adding {resumeResult.sectionChecks
                .filter((section) => !section.present)
                .map((section) => section.label)
                .slice(0, 3)
                .join(', ')}.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
