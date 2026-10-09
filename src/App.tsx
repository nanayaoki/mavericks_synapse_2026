import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Terminal,
  Network,
  SlidersHorizontal,
  BookOpen,
  Map,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';
import { BuildSkillTwinModal } from './components/BuildSkillTwinModal';
import { SkillAssessmentModal } from './components/SkillAssessmentModal';
import { OverviewTab } from './components/dashboard/OverviewTab';
import {
  ProfileInsightsUpdate,
} from './components/dashboard/OverviewProfileInsights';
import { JobReadinessTab } from './components/dashboard/JobReadinessTab';
import { EvidenceEngineTab } from './components/dashboard/EvidenceEngineTab';
import { SkillGraphTab } from './components/dashboard/SkillGraphTab';
import { GapRemediationTab } from './components/dashboard/GapRemediationTab';
import { DocumentationTab } from './components/dashboard/DocumentationTab';
import { RoadmapTab } from './components/dashboard/RoadmapTab';
import {
  EvaluatedSkill,
  EvidenceItem,
  RoleTemplate,
  SkillTwinProfile,
  SkillStatus,
} from './types/skilltwin';
import {
  ROLE_TEMPLATES,
  analyzeRealCandidate,
} from './services/skillAnalyzer';

export type DashboardTabId =
  | 'overview'
  | 'job-readiness'
  | 'evidence-engine'
  | 'skill-graph'
  | 'gap-remediation'
  | 'roadmap'
  | 'documentation';

const NAV_ITEMS: {
  id: DashboardTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'job-readiness', label: 'Job Readiness', icon: ShieldCheck },
  { id: 'evidence-engine', label: 'Evidence', icon: Terminal },
  { id: 'skill-graph', label: 'Skill Graph', icon: Network },
  { id: 'gap-remediation', label: 'Assessments & Gaps', icon: SlidersHorizontal },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'documentation', label: 'How It Works', icon: BookOpen },
];

const STORAGE_KEY = 'skilltwin_real_profile_v1';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSurface, setCurrentSurface] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real Evaluated Profile State (null by default — zero fake data!)
  const [profile, setProfile] = useState<SkillTwinProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [verifyingSkill, setVerifyingSkill] = useState<EvaluatedSkill | null>(null);
  const [quickLoadingUser, setQuickLoadingUser] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setVerifyingSkill(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEnterDashboard = (initialTab?: string) => {
    if (initialTab && NAV_ITEMS.some((i) => i.id === initialTab)) {
      setActiveTab(initialTab as DashboardTabId);
    }
    setCurrentSurface('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileCreated = (newProfile: SkillTwinProfile) => {
    setProfile(newProfile);
    setCurrentSurface('dashboard');
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfileInsights = (update: ProfileInsightsUpdate) => {
    setProfile((currentProfile) => {
      if (!currentProfile) return currentProfile;

      const {
        importedCandidateName,
        ...profileUpdate
      } = update;
      const linkedInText = update.linkedinProfileText || '';
      const resumeText = update.resumeText || '';
      const matchesKeyword = (text: string, keyword: string) => {
        const escapedKeyword = keyword
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\s+/g, '\\s+');
        return new RegExp(
          `(^|[^\\p{L}\\p{N}])${escapedKeyword}(?=$|[^\\p{L}\\p{N}])`,
          'iu'
        ).test(text);
      };
      const normalizedResume = resumeText.toLowerCase();
      const normalizedLinkedIn = linkedInText.toLowerCase();
      const updatedSkills = currentProfile.skills.map((skill) => {
        const roleSkill = currentProfile.targetRole.requiredSkills.find(
          (requiredSkill) => requiredSkill.id === skill.id
        );
        const keywords = roleSkill?.keywords || [];
        const claimedOnResume = keywords.some((keyword) =>
          matchesKeyword(normalizedResume, keyword)
        );
        const claimedOnLinkedIn = keywords.some((keyword) =>
          matchesKeyword(normalizedLinkedIn, keyword)
        );

        if (skill.verifiedByGithub || skill.verifiedByAssessment) {
          return { ...skill, claimedOnResume, claimedOnLinkedIn };
        }

        const hasProfileClaim = claimedOnResume || claimedOnLinkedIn;
        const confidence = hasProfileClaim ? 38 : 22;
        const status: SkillStatus =
          confidence >= skill.targetScore
            ? 'strong'
            : confidence >= 55
            ? 'moderate'
            : 'gap';
        const claimSources = [
          claimedOnResume ? 'resume' : '',
          claimedOnLinkedIn ? 'LinkedIn' : '',
        ].filter(Boolean);

        return {
          ...skill,
          claimedOnResume,
          claimedOnLinkedIn,
          confidence,
          status,
          evidenceSummary: hasProfileClaim
            ? `Claimed on ${claimSources.join(' and ')} · needs independent verification`
            : 'No repository, resume, or LinkedIn evidence detected',
          whyExplanation: hasProfileClaim
            ? `${skill.name} appears in your ${claimSources.join(
                ' and '
              )} profile information, but a profile claim is not independent proof. Link a relevant repository or complete a verification assessment to demonstrate it.`
            : `${skill.name} was not found in your resume or imported LinkedIn content, and no independent evidence is linked yet.`,
          recommendedAction: hasProfileClaim
            ? `Verify ${skill.name} with a repository or skill assessment.`
            : `Add relevant ${skill.name} experience to your profile and provide evidence.`,
        };
      });
      const overallReadiness = Math.round(
        updatedSkills.reduce((sum, skill) => sum + skill.confidence, 0) /
          Math.max(1, updatedSkills.length)
      );

      const roleSkillsMentioned = currentProfile.targetRole.requiredSkills
        .filter((requiredSkill) =>
          requiredSkill.keywords.some((keyword) =>
              matchesKeyword(normalizedLinkedIn, keyword)
          )
        )
        .map((requiredSkill) => requiredSkill.name);
      const linkedinEvidence = linkedInText.trim()
        ? [
            {
              id: 'linkedin-profile-import',
              title: update.linkedinImportFileName
                ? `LinkedIn import: ${update.linkedinImportFileName}`
                : 'LinkedIn profile information',
              sourceType: 'linkedin_profile' as const,
              url: update.linkedinUrl,
              language: 'LinkedIn',
              skillsMatched: roleSkillsMentioned,
              confidenceContribution: 0,
              metricLabel: 'Profile claim · not independently verified',
              timestamp: new Date().toISOString().split('T')[0],
              verified: false,
            },
          ]
        : [];

      return {
        ...currentProfile,
        ...profileUpdate,
        candidateName: importedCandidateName || currentProfile.candidateName,
        atsScore: update.atsScore,
        updatedAt: new Date().toISOString(),
        overallReadiness,
        skills: updatedSkills,
        evidenceItems: [
          ...currentProfile.evidenceItems.filter(
            (item) => item.id !== 'linkedin-profile-import'
          ),
          ...linkedinEvidence,
        ],
      };
    });
  };

  const handleQuickAnalyzeGithub = async (username: string) => {
    setQuickLoadingUser(username);
    try {
      const generated = await analyzeRealCandidate({
        githubUsername: username,
        resumeText:
          'Claimed Skills: Java, TypeScript, Go, REST APIs, SQL, Docker, AWS, System Design',
        targetRole: ROLE_TEMPLATES[0],
      });
      setProfile(generated);
      setCurrentSurface('dashboard');
      setActiveTab('overview');
    } finally {
      setQuickLoadingUser(null);
    }
  };

  const handleChangeTargetRole = async (newRole: RoleTemplate) => {
    if (!profile) return;
    setQuickLoadingUser(profile.githubUsername);
    try {
      const updated = await analyzeRealCandidate({
        githubUsername:
          profile.githubUsername === 'local-workspace' ? '' : profile.githubUsername,
        candidateName: profile.candidateName,
        resumeText: profile.resumeText,
        targetRole: newRole,
      });
      setProfile(updated);
    } finally {
      setQuickLoadingUser(null);
    }
  };

  const handleSkillVerified = (
    skillId: string,
    newScore: number,
    newEvidenceItem: EvidenceItem
  ) => {
    if (!profile) return;

    const updatedSkills = profile.skills.map((s) => {
      if (s.id !== skillId) return s;
      const status: SkillStatus =
        newScore >= s.targetScore
          ? 'strong'
          : newScore >= 55
          ? 'moderate'
          : 'gap';
      return {
        ...s,
        confidence: newScore,
        status,
        verifiedByAssessment: true,
        evidenceSummary: `Verified via code assessment (${newScore}%)`,
        whyExplanation: `${s.name} was verified via an interactive code assessment / project artifact, raising your confidence score to ${newScore}% (Target: ${s.targetScore}%).`,
      };
    });

    const overallReadiness = Math.round(
      updatedSkills.reduce((sum, s) => sum + s.confidence, 0) /
        Math.max(1, updatedSkills.length)
    );

    const verifiedCount = updatedSkills.filter(
      (s) => s.verifiedByGithub || s.verifiedByAssessment
    ).length;

    setProfile({
      ...profile,
      updatedAt: new Date().toISOString(),
      overallReadiness,
      evidenceConfidence: Math.round(
        (verifiedCount / Math.max(1, updatedSkills.length)) * 100
      ),
      skills: updatedSkills,
      evidenceItems: [newEvidenceItem, ...profile.evidenceItems],
    });
  };

  const handleAddCustomEvidence = (
    title: string,
    language: string,
    codeContent: string,
    skillId: string
  ) => {
    if (!profile) return;
    const targetSkill = profile.skills.find((s) => s.id === skillId);
    const boostedScore = targetSkill
      ? Math.min(96, Math.max(targetSkill.confidence + 20, targetSkill.targetScore + 5))
      : 82;

    const newItem: EvidenceItem = {
      id: `custom-${Date.now()}`,
      title,
      sourceType: 'code_submission',
      language,
      skillsMatched: targetSkill ? [targetSkill.name] : [language],
      confidenceContribution: boostedScore,
      metricLabel: `${codeContent.split('\n').length} lines submitted`,
      timestamp: new Date().toISOString().split('T')[0],
      verified: true,
      codeSnippet: {
        filename: title,
        content: codeContent,
        highlights: targetSkill ? [targetSkill.name] : [],
      },
    };

    handleSkillVerified(skillId, boostedScore, newItem);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* Quick loading overlay when fetching a live GitHub user */}
      {quickLoadingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[1px]">
          <div className="card-surface p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-[#1D4ED8] animate-spin" />
            <span className="text-[14px] font-medium">
              Fetching live GitHub repositories for @{quickLoadingUser}...
            </span>
          </div>
        </div>
      )}

      {currentSurface === 'landing' ? (
        <LandingPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          profile={profile}
          onEnterDashboard={handleEnterDashboard}
          onOpenBuildModal={() => setBuildModalOpen(true)}
          onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
        />
      ) : (
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Desktop Sidebar (240px) */}
          <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-[#FFFFFF] dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#334155] z-40 flex-col justify-between">
            <div>
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]">
                <BrandLogo onClick={() => setCurrentSurface('landing')} />
              </div>

              <nav className="p-2.5 space-y-1" aria-label="Dashboard Navigation">
                {NAV_ITEMS.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-[#1D4ED8]/10 dark:bg-[#3B82F6]/15 text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                          : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-1.5">
              {profile && (
                <button
                  type="button"
                  onClick={() => setProfile(null)}
                  className="w-full px-3 py-1.5 rounded-[6px] text-left text-[12px] text-[#B91C1C] dark:text-[#F87171] hover:bg-[#FEF2F2] dark:hover:bg-[#B91C1C]/15 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset / Clear Profile</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentSurface('landing')}
                className="w-full px-3 py-1.5 rounded-[6px] text-left text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace */}
          <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 dark:bg-[#111827]/95 backdrop-blur-[2px] border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-6 flex items-center justify-between gap-4">
              {/* Zone 1 */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-[6px] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="lg:hidden">
                  <BrandLogo onClick={() => setCurrentSurface('landing')} />
                </div>

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center gap-2.5 h-8 px-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors text-[12px]"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search skills or views...</span>
                  <kbd className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#E2E8F0]/70 dark:bg-[#0B1120]">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Zone 2 */}
              {profile ? (
                <div className="hidden md:flex items-center gap-3 text-[13px] text-[#475569] dark:text-[#CBD5E1] tabular-nums">
                  <span>
                    Profile:{' '}
                    <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
                      {profile.candidateName}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Readiness:{' '}
                    <strong className="font-mono text-[#1D4ED8] dark:text-[#3B82F6]">
                      {profile.overallReadiness}%
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="hidden md:block text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                  No profile loaded yet — connect your GitHub to start
                </div>
              )}

              {/* Zone 3 */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] flex items-center justify-center transition-colors"
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setBuildModalOpen(true)}
                  className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{profile ? 'Switch / Update Profile' : 'Build Your SkillTwin'}</span>
                </button>
              </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden bg-[#FFFFFF] dark:bg-[#111827] border-b border-[#E2E8F0] dark:border-[#334155] px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium ${
                        isActive
                          ? 'bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                          : 'text-[#475569] dark:text-[#CBD5E1]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(null);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-[12px] text-[#B91C1C]"
                  >
                    Reset Profile
                  </button>
                )}
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
              {activeTab === 'overview' && (
                <OverviewTab
                  profile={profile}
                  onNavigateTab={(t) => setActiveTab(t as DashboardTabId)}
                  onOpenVerifyModal={(skill) => setVerifyingSkill(skill)}
                  onOpenBuildModal={() => setBuildModalOpen(true)}
                  onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
                  onSaveProfileInsights={handleSaveProfileInsights}
                />
              )}
              {activeTab === 'job-readiness' && (
                <JobReadinessTab
                  profile={profile}
                  onChangeTargetRole={handleChangeTargetRole}
                  onOpenVerifyModal={(skill) => setVerifyingSkill(skill)}
                  onOpenBuildModal={() => setBuildModalOpen(true)}
                  onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
                />
              )}
              {activeTab === 'evidence-engine' && (
                <EvidenceEngineTab
                  profile={profile}
                  onAddCustomEvidence={handleAddCustomEvidence}
                  onOpenBuildModal={() => setBuildModalOpen(true)}
                  onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
                />
              )}
              {activeTab === 'skill-graph' && (
                <SkillGraphTab
                  profile={profile}
                  onOpenVerifyModal={(skill) => setVerifyingSkill(skill)}
                  onOpenBuildModal={() => setBuildModalOpen(true)}
                  onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
                />
              )}
              {activeTab === 'gap-remediation' && (
                <GapRemediationTab
                  profile={profile}
                  onOpenVerifyModal={(skill) => setVerifyingSkill(skill)}
                  onOpenBuildModal={() => setBuildModalOpen(true)}
                  onQuickAnalyzeGithub={handleQuickAnalyzeGithub}
                />
              )}
              {activeTab === 'documentation' && <DocumentationTab />}
              {activeTab === 'roadmap' && <RoadmapTab profile={profile} />}
            </main>
          </div>
        </div>
      )}

      {/* Build / Analyze Modal */}
      <BuildSkillTwinModal
        isOpen={buildModalOpen}
        onClose={() => setBuildModalOpen(false)}
        existingProfile={profile}
        onProfileCreated={handleProfileCreated}
      />

      {/* Interactive Skill Verification Modal */}
      <SkillAssessmentModal
        skill={verifyingSkill}
        onClose={() => setVerifyingSkill(null)}
        onSkillVerified={handleSkillVerified}
      />

      {/* Quick Search Modal (⌘K) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#0F172A]/50 backdrop-blur-[1px] pt-20 p-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                autoFocus
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Jump to view or skill..."
                className="w-full text-[13px] bg-transparent text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="font-mono text-[11px] text-[#64748B] px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B]"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              <div className="py-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase text-[#64748B]">
                  Views
                </div>
                {NAV_ITEMS.filter((i) =>
                  i.label.toLowerCase().includes(quickSearchQuery.toLowerCase())
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentSurface('dashboard');
                      setActiveTab(item.id);
                      setSearchOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[13px] rounded-[6px] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center justify-between"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#3B82F6]">
                      Open →
                    </span>
                  </button>
                ))}
              </div>
              {profile && (
                <div className="py-1">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase text-[#64748B]">
                    Your Evaluated Skills
                  </div>
                  {profile.skills
                    .filter((s) =>
                      s.name.toLowerCase().includes(quickSearchQuery.toLowerCase())
                    )
                    .map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          setCurrentSurface('dashboard');
                          setActiveTab('job-readiness');
                          setSearchOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-[13px] rounded-[6px] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center justify-between"
                      >
                        <span>{skill.name}</span>
                        <span className="font-mono text-[12px] text-[#64748B] tabular-nums">
                          {skill.confidence}%
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
