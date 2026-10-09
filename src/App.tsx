import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard,
  ShieldCheck,
  Terminal,
  Network,
  SlidersHorizontal,
  BookOpen,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { LandingPage } from './components/LandingPage';
import { BuildSkillTwinModal } from './components/BuildSkillTwinModal';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { JobReadinessTab } from './components/dashboard/JobReadinessTab';
import { EvidenceEngineTab } from './components/dashboard/EvidenceEngineTab';
import { SkillGraphTab } from './components/dashboard/SkillGraphTab';
import { GapRemediationTab } from './components/dashboard/GapRemediationTab';
import { DocumentationTab } from './components/dashboard/DocumentationTab';
import {
  CANDIDATE_PROFILE,
  createCandidateProfile,
  REMEDIATION_GAPS,
  SKILLS_DATA,
} from './data/skillTwinData';
import { auth } from './lib/firebase';

export type DashboardTabId =
  | 'overview'
  | 'job-readiness'
  | 'evidence-engine'
  | 'skill-graph'
  | 'gap-remediation'
  | 'documentation';

const NAV_ITEMS: {
  id: DashboardTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'job-readiness', label: 'Job Readiness', icon: ShieldCheck },
  { id: 'evidence-engine', label: 'Evidence Engine', icon: Terminal },
  { id: 'skill-graph', label: 'Skill Graph', icon: Network },
  { id: 'gap-remediation', label: 'Gap Remediation', icon: SlidersHorizontal },
  { id: 'documentation', label: 'Documentation', icon: BookOpen },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSurface, setCurrentSurface] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Interactive SkillTwin State
  const [remediatedIds, setRemediatedIds] = useState<string[]>([]);
  const [waivedIds, setWaivedIds] = useState<string[]>([]);
  const [connectedSources, setConnectedSources] = useState<Record<string, boolean>>({
    github: true,
    gitlab: true,
    bitbucket: false,
  });

  // Modals
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [buildModalMode, setBuildModalMode] = useState<
    'build' | 're-evaluate' | 'empty-demo'
  >('build');
  const [activeChallengeGapId, setActiveChallengeGapId] = useState<string | null>(null);
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAccountId(null);
        return;
      }

      Object.assign(CANDIDATE_PROFILE, createCandidateProfile(user));
      setAccountId(user.uid);

      try {
        const savedState = localStorage.getItem(`skilltwin:${user.uid}`);
        if (!savedState) {
          setRemediatedIds([]);
          setWaivedIds([]);
          setConnectedSources({ github: false, gitlab: false, bitbucket: false });
          return;
        }

        const parsedState = JSON.parse(savedState) as {
          remediatedIds?: unknown;
          waivedIds?: unknown;
          connectedSources?: unknown;
        };
        setRemediatedIds(Array.isArray(parsedState.remediatedIds) ? parsedState.remediatedIds.filter(
          (id): id is string => typeof id === 'string'
        ) : []);
        setWaivedIds(Array.isArray(parsedState.waivedIds) ? parsedState.waivedIds.filter(
          (id): id is string => typeof id === 'string'
        ) : []);
        if (parsedState.connectedSources && typeof parsedState.connectedSources === 'object') {
          setConnectedSources(parsedState.connectedSources as Record<string, boolean>);
        }
      } catch (error) {
        console.error('Unable to load the account dashboard:', error);
        setRemediatedIds([]);
        setWaivedIds([]);
        setConnectedSources({ github: false, gitlab: false, bitbucket: false });
      }
    });
  }, []);

  useEffect(() => {
    if (!accountId) {
      return;
    }

    localStorage.setItem(
      `skilltwin:${accountId}`,
      JSON.stringify({ remediatedIds, waivedIds, connectedSources })
    );
  }, [accountId, remediatedIds, waivedIds, connectedSources]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setActiveChallengeGapId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate dynamic Job Readiness score based on completed remediations
  const readinessLift = REMEDIATION_GAPS.reduce((acc, gap) => {
    if (remediatedIds.includes(gap.id)) {
      return acc + gap.liftPoints;
    }
    return acc;
  }, 0);
  const currentReadiness = Math.min(96, CANDIDATE_PROFILE.baseReadiness + readinessLift);

  const handleEnterDashboard = (initialTab?: string) => {
    if (initialTab && NAV_ITEMS.some((i) => i.id === initialTab)) {
      setActiveTab(initialTab as DashboardTabId);
    }
    setCurrentSurface('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBuildModal = (mode: 'build' | 're-evaluate' | 'empty-demo' = 'build') => {
    setBuildModalMode(mode);
    setBuildModalOpen(true);
  };

  const handleTriggerRemediation = (gapId: string) => {
    setActiveChallengeGapId(gapId);
    setChallengeRunning(true);
    setTimeout(() => {
      setChallengeRunning(false);
    }, 1100);
  };

  const confirmChallengeCompletion = () => {
    if (activeChallengeGapId && !remediatedIds.includes(activeChallengeGapId)) {
      setRemediatedIds((prev) => [...prev, activeChallengeGapId]);
    }
    setActiveChallengeGapId(null);
  };

  const handleWaiveSkill = (gapId: string) => {
    setWaivedIds((prev) =>
      prev.includes(gapId) ? prev.filter((id) => id !== gapId) : [...prev, gapId]
    );
  };

  const handleExecuteAllRemediations = () => {
    setRemediatedIds(['docker', 'aws', 'system-design']);
  };

  const handleToggleSource = (key: string) => {
    setConnectedSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeChallengeGap = REMEDIATION_GAPS.find(
    (g) => g.id === activeChallengeGapId
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC]">
      {currentSurface === 'landing' ? (
        <LandingPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onEnterDashboard={handleEnterDashboard}
          onOpenBuildModal={handleOpenBuildModal}
        />
      ) : (
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Desktop Fixed Left Sidebar (240px) */}
          <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 bg-[#FFFFFF] dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#334155] z-40 flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155]">
                <BrandLogo onClick={() => setCurrentSurface('landing')} />
              </div>

              {/* Navigation Links */}
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

            {/* Bottom Back to Landing & Candidate Switcher */}
            <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] space-y-2">
              <button
                type="button"
                onClick={() => handleOpenBuildModal('empty-demo')}
                className="w-full px-3 py-1.5 rounded-[6px] text-left text-[12px] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
              >
                Preview Empty State
              </button>
              <button
                type="button"
                onClick={() => setCurrentSurface('landing')}
                className="w-full px-3 py-1.5 rounded-[6px] text-left text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Product Overview</span>
              </button>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
            {/* Top Bar (Strict 3-Zone Contract) */}
            <header className="sticky top-0 z-30 h-16 bg-[#FFFFFF]/95 dark:bg-[#111827]/95 backdrop-blur-[2px] border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-6 flex items-center justify-between gap-4">
              {/* Zone 1: Mobile Menu Trigger or Search Bar */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-[6px] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
                  aria-label="Toggle Navigation"
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
                  <span>Search evidence, skills, telemetry...</span>
                  <kbd className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#E2E8F0]/70 dark:bg-[#0B1120] text-[#475569] dark:text-[#CBD5E1]">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Zone 2: Quick Readiness Pill */}
              <div className="hidden md:flex items-center gap-4 text-[13px] text-[#475569] dark:text-[#CBD5E1] tabular-nums">
                <span>
                  Candidate:{' '}
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
                    {CANDIDATE_PROFILE.name}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Readiness:{' '}
                  <strong className="font-mono text-[#1D4ED8] dark:text-[#3B82F6]">
                    {currentReadiness}%
                  </strong>
                </span>
              </div>

              {/* Zone 3: Primary Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center justify-center transition-colors"
                  aria-label="Toggle color theme"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenBuildModal('build')}
                  className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
                >
                  Build Your SkillTwin
                </button>
              </div>
            </header>

            {/* Mobile Collapsible Navigation Drawer */}
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
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentSurface('landing');
                    }}
                    className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] py-1"
                  >
                    ← Back to Landing Page
                  </button>
                </div>
              </div>
            )}

            {/* Main Dashboard Content Viewport */}
            <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
              {activeTab === 'overview' && (
                <OverviewTab
                  currentReadiness={currentReadiness}
                  remediatedIds={remediatedIds}
                  waivedIds={waivedIds}
                  connectedSources={connectedSources}
                  onToggleSource={handleToggleSource}
                  onNavigateTab={(t) => setActiveTab(t as DashboardTabId)}
                  onTriggerRemediation={handleTriggerRemediation}
                  onWaiveSkill={handleWaiveSkill}
                  onOpenBuildModal={handleOpenBuildModal}
                />
              )}
              {activeTab === 'job-readiness' && (
                <JobReadinessTab
                  currentReadiness={currentReadiness}
                  remediatedIds={remediatedIds}
                  waivedIds={waivedIds}
                  onNavigateTab={(t) => setActiveTab(t as DashboardTabId)}
                  onTriggerRemediation={handleTriggerRemediation}
                  onOpenBuildModal={handleOpenBuildModal}
                />
              )}
              {activeTab === 'evidence-engine' && (
                <EvidenceEngineTab onOpenBuildModal={handleOpenBuildModal} />
              )}
              {activeTab === 'skill-graph' && (
                <SkillGraphTab
                  remediatedIds={remediatedIds}
                  onTriggerRemediation={handleTriggerRemediation}
                  onNavigateTab={(t) => setActiveTab(t as DashboardTabId)}
                />
              )}
              {activeTab === 'gap-remediation' && (
                <GapRemediationTab
                  currentReadiness={currentReadiness}
                  remediatedIds={remediatedIds}
                  waivedIds={waivedIds}
                  onTriggerRemediation={handleTriggerRemediation}
                  onWaiveSkill={handleWaiveSkill}
                  onExecuteAllRemediations={handleExecuteAllRemediations}
                  onNavigateTab={(t) => setActiveTab(t as DashboardTabId)}
                />
              )}
              {activeTab === 'documentation' && <DocumentationTab />}
            </main>
          </div>
        </div>
      )}

      {/* Interactive Build / Evaluate SkillTwin Modal */}
      <BuildSkillTwinModal
        isOpen={buildModalOpen}
        onClose={() => setBuildModalOpen(false)}
        initialMode={buildModalMode}
        onComplete={() => {
          setCurrentSurface('dashboard');
          setActiveTab('job-readiness');
        }}
      />

      {/* Interactive Sandbox Remediation Challenge Modal */}
      {activeChallengeGap && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-[1px] p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                SkillTwin Verification Sandbox
              </span>
              <button
                type="button"
                onClick={() => setActiveChallengeGapId(null)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="font-mono text-[11px] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                  TARGET COMPETENCY: {activeChallengeGap.shortName.toUpperCase()}
                </div>
                <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                  {activeChallengeGap.optionB.title}
                </h3>
                <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-1">
                  {activeChallengeGap.optionB.description}
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#0F172A] text-[#E2E8F0] font-mono text-[12px] space-y-2">
                {challengeRunning ? (
                  <div className="flex items-center gap-2 text-[#60A5FA]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running AST &amp; container assertion suite...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[#4ADE80]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✓ Multi-stage build &amp; rootless execution verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4ADE80]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        ✓ Signal confidence updated: {activeChallengeGap.currentConfidence}% →{' '}
                        {activeChallengeGap.targetBenchmark + 6}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveChallengeGapId(null)}
                  className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={challengeRunning}
                  onClick={confirmChallengeCompletion}
                  className="h-8 px-3.5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium transition-colors"
                >
                  Commit Evidence (+{activeChallengeGap.liftPoints}% Readiness)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Command / Search Modal (⌘K) */}
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
                placeholder="Jump to skill, evidence node, or cockpit view..."
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
                  Cockpit Views
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
                    <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#3B82F6]">
                      Open View →
                    </span>
                  </button>
                ))}
              </div>
              <div className="py-1">
                <div className="px-2 py-1 text-[11px] font-semibold uppercase text-[#64748B]">
                  Evaluated Competencies
                </div>
                {SKILLS_DATA.filter((s) =>
                  s.name.toLowerCase().includes(quickSearchQuery.toLowerCase())
                ).map((skill) => (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
