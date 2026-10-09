import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  GitBranch,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SkillTwinProfile } from '../types/skilltwin';

interface LandingPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  profile: SkillTwinProfile | null;
  onEnterDashboard: (initialTab?: string) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

interface PipelineStage {
  id: string;
  label: string;
  metric: string;
  title: string;
  description: string;
  signals: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'resume',
    label: 'Resume',
    metric: 'Step 1',
    title: 'Extract Claimed Skills & Experience',
    description:
      'SkillTwin reads the skills you claim on your resume and maps them against the requirements of your target job.',
    signals: [
      'Identifies claimed programming languages, frameworks, and cloud tools',
      'Matches claims against target job requirements (Backend, Full-Stack, Frontend, Cloud)',
      'Flags unverified claims that need repository or assessment proof',
    ],
  },
  {
    id: 'github',
    label: 'GitHub',
    metric: 'Step 2',
    title: 'Verify Real Repositories & Activity',
    description:
      'Connects to the public GitHub API to inspect your repositories, primary languages, topics, and recent activity.',
    signals: [
      'Fetches live repository metadata, languages, and update history',
      'Counts how many real projects back each skill on your resume',
      'Separates multi-project production skills from one-off tutorials',
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    metric: 'Step 3',
    title: 'Analyze Project Structure & Code',
    description:
      'Evaluates submitted code files, Dockerfiles, SQL schemas, and API handlers to confirm practical engineering depth.',
    signals: [
      'Inspects code and configuration files directly in your browser',
      'Checks for production patterns (error handling, indexing, container hardening)',
      'Links each verified project file directly to your Skill Graph',
    ],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    metric: 'Step 4',
    title: 'Close Gaps with 2-Minute Challenges',
    description:
      'When a skill on your resume lacks public GitHub evidence, take a focused 2-minute code challenge to verify it.',
    signals: [
      'Targeted micro-challenges only for your missing evidence gaps',
      'Instant validation that updates your confidence score immediately',
      'No generic 3-hour algorithm tests',
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    metric: 'Step 5',
    title: 'Measure Readiness Against Real Jobs',
    description:
      'Produces a clear Job Readiness percentage, Strong Evidence list, and actionable Evidence Gaps with "Why?" explanations.',
    signals: [
      'Transparent breakdown of Strong Evidence vs. Evidence Gaps',
      'Clear "Why?" explanation for every single skill score',
      'Exportable JSON profile to share or track your career progress',
    ],
  },
];

const COMPARISON_ITEMS = [
  {
    skill: 'Java',
    resumeClaim: 'Listed under Technical Skills',
    confidence: 91,
    status: 'strong' as const,
    detail: 'Verified across multiple backend repositories and service implementations.',
  },
  {
    skill: 'Spring Boot',
    resumeClaim: 'Listed under Frameworks',
    confidence: 74,
    status: 'moderate' as const,
    detail: 'REST controllers and service layers verified; fault-isolation tests developing.',
  },
  {
    skill: 'Docker',
    resumeClaim: 'Listed under DevOps',
    confidence: 42,
    status: 'gap' as const,
    detail: 'Listed on resume, but limited repository evidence found. Add a containerized deployment to strengthen this signal.',
  },
  {
    skill: 'AWS',
    resumeClaim: 'Listed under Cloud',
    confidence: 18,
    status: 'gap' as const,
    detail: 'No Terraform or cloud deployment configs found in public repositories.',
  },
];

const LANDING_GRAPH_BRANCHES = [
  {
    id: 'java-branch',
    label: 'Java',
    childLabel: 'Spring',
    confidence: 91,
    active: true,
    detail:
      'Active verified relationship: Core language and framework backed by repository evidence.',
  },
  {
    id: 'rest-branch',
    label: 'REST',
    childLabel: 'APIs',
    confidence: 88,
    active: true,
    detail:
      'Active verified relationship: API endpoint design and service contracts verified in projects.',
  },
  {
    id: 'sql-branch',
    label: 'SQL',
    childLabel: 'PostgreSQL',
    confidence: 84,
    active: true,
    detail:
      'Active verified relationship: Relational schema design and queries verified.',
  },
  {
    id: 'docker-branch',
    label: 'Docker',
    childLabel: 'Containers',
    confidence: 42,
    active: false,
    detail:
      'Secondary relationship (Gap): Claimed on resume, needs a containerized project or quick verification challenge.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  darkMode,
  onToggleDarkMode,
  profile,
  onEnterDashboard,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  const [quickGithubInput, setQuickGithubInput] = useState('');
  const [expandedHeroGap, setExpandedHeroGap] = useState<string | null>('docker');
  const [selectedStageId, setSelectedStageId] = useState<string>('github');
  const [selectedComparisonSkill, setSelectedComparisonSkill] = useState<string>('Docker');
  const [selectedGraphBranch, setSelectedGraphBranch] = useState<string>('java-branch');
  const [audienceTab, setAudienceTab] = useState<'candidates' | 'recruiters'>('candidates');

  const activeStage =
    PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[1];
  const activeBranch =
    LANDING_GRAPH_BRANCHES.find((b) => b.id === selectedGraphBranch) ||
    LANDING_GRAPH_BRANCHES[0];

  const handleQuickHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickGithubInput.trim()) {
      onQuickAnalyzeGithub(quickGithubInput.trim());
    } else {
      onOpenBuildModal();
    }
  };

  // Use user's real profile in the Hero card if they already built one, otherwise show the specification preview
  const heroRoleTitle = profile ? profile.targetRole.title : 'Backend Engineer';
  const heroReadiness = profile ? profile.overallReadiness : 81;
  const heroStrong = profile
    ? profile.skills
        .filter((s) => s.status === 'strong')
        .slice(0, 3)
        .map((s) => ({ name: s.name, score: s.confidence }))
    : [
        { name: 'Java', score: 91 },
        { name: 'REST APIs', score: 88 },
        { name: 'SQL', score: 84 },
      ];
  const heroGaps = profile
    ? profile.skills
        .filter((s) => s.status !== 'strong')
        .slice(0, 2)
        .map((s) => ({
          id: s.id,
          name: s.name,
          score: s.confidence,
          why: s.whyExplanation,
        }))
    : [
        {
          id: 'docker',
          name: 'Docker',
          score: 42,
          why: 'Docker is listed on your resume, but SkillTwin found only limited repository evidence. Add a containerized deployment to strengthen this signal.',
        },
        {
          id: 'sysdesign',
          name: 'System Design',
          score: 38,
          why: 'High-volume read logic detected, but no distributed caching layer (Redis/Memcached) was found in public repositories.',
        },
      ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      {/* SECTION 1: Minimal Navbar */}
      <header className="sticky top-0 z-40 h-16 bg-[#FFFFFF]/95 dark:bg-[#111827]/95 backdrop-blur-[2px] border-b border-[#E2E8F0] dark:border-[#334155]">
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1]"
          >
            <a
              href="#product-comparison"
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              Product
            </a>
            <a
              href="#for-audiences"
              onClick={() => setAudienceTab('candidates')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              For Candidates
            </a>
            <a
              href="#for-audiences"
              onClick={() => setAudienceTab('recruiters')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              For Recruiters
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              {profile ? 'Open Dashboard' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={onOpenBuildModal}
              className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[14px] font-medium transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
            >
              Build Your SkillTwin
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="py-14 md:py-20 lg:py-24 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <h1
                  className="text-[36px] sm:text-[44px] lg:text-[56px] font-semibold tracking-[-0.025em] leading-[1.1] text-[#0F172A] dark:text-[#F8FAFC]"
                  style={{ textWrap: 'balance' }}
                >
                  Don&apos;t prove what you studied.{' '}
                  <span className="text-[#1D4ED8] dark:text-[#3B82F6]">
                    Prove what you can do.
                  </span>
                </h1>

                <p className="text-[16px] sm:text-[17px] leading-[1.6] text-[#475569] dark:text-[#CBD5E1] max-w-[60ch]">
                  SkillTwin turns your projects, GitHub activity, assessments and experience
                  into an evidence-backed skill profile — then measures it against the jobs
                  you actually want.
                </p>

                {/* Instant GitHub Handle Input + Primary Buttons */}
                <form
                  onSubmit={handleQuickHeroSubmit}
                  className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl"
                >
                  <div className="relative flex-1 flex items-center">
                    <GitBranch className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={quickGithubInput}
                      onChange={(e) => setQuickGithubInput(e.target.value)}
                      placeholder="Enter GitHub username (e.g. tj, sindresorhus)..."
                      className="w-full h-10 pl-10 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[14px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
                  >
                    <span>Build Your SkillTwin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <a
                    href="#how-it-works"
                    className="h-9 px-4 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium inline-flex items-center transition-colors whitespace-nowrap"
                  >
                    See How It Works
                  </a>
                  <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                    <span>Quick test with live GitHub:</span>
                    {['tj', 'sindresorhus', 'shadcn'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => onQuickAnalyzeGithub(u)}
                        className="font-mono text-[#1D4ED8] dark:text-[#3B82F6] hover:underline"
                      >
                        @{u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Product Interface Visual */}
              <div className="lg:col-span-5">
                <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
                  {/* Top Bar */}
                  <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      SkillTwin {profile ? `· @${profile.githubUsername}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        profile ? onEnterDashboard('job-readiness') : onOpenBuildModal()
                      }
                      className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>{profile ? 'Open Full Dashboard' : 'Customize Yours'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Role & Readiness Score */}
                  <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-baseline justify-between">
                    <div>
                      <div className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {heroRoleTitle}
                      </div>
                      <div className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
                        Job Readiness
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[36px] font-semibold leading-none text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                        {heroReadiness}%
                      </div>
                    </div>
                  </div>

                  {/* Strong Evidence */}
                  <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      Strong evidence
                    </div>

                    {heroStrong.map((item) => (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[14px]">
                          <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                            {item.name}
                          </span>
                          <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                            {item.score}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
                          <div
                            className="h-full bg-[#15803D] dark:bg-[#4ADE80] rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Evidence Gaps */}
                  <div className="p-5 space-y-3 bg-[#F8FAFC]/50 dark:bg-[#0B1120]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                        Evidence gaps
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Click a gap to see Why?
                      </span>
                    </div>

                    {heroGaps.map((gap) => {
                      const isExpanded = expandedHeroGap === gap.id;
                      return (
                        <div
                          key={gap.id}
                          className="rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-3"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHeroGap(isExpanded ? null : gap.id)
                            }
                            className="w-full text-left space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[14px]">
                              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                                {gap.name}
                                <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] inline-flex items-center gap-0.5">
                                  Why?
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </span>
                              </span>
                              <span className="font-mono font-semibold text-[#B45309] dark:text-[#FBBF24] tabular-nums">
                                {gap.score}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] overflow-hidden">
                              <div
                                className="h-full bg-[#B45309] dark:bg-[#FBBF24] rounded-full"
                                style={{ width: `${gap.score}%` }}
                              />
                            </div>
                          </button>
                          {isExpanded && (
                            <p className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[12px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                              {gap.why}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: TRUST SECTION */}
        <section
          id="how-it-works"
          className="py-16 md:py-20 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                Skills backed by evidence, not keywords.
              </h2>
              <p className="mt-2 text-[15px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                Click any step below to see how SkillTwin turns your real work into a verified profile.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 flex flex-col">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isSelected = stage.id === selectedStageId;
                  return (
                    <React.Fragment key={stage.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`w-full p-4 rounded-[8px] border text-left transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#1D4ED8] dark:border-[#3B82F6]'
                            : 'bg-[#FFFFFF] dark:bg-[#111827] border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50'
                        }`}
                      >
                        <span className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {stage.label}
                        </span>
                        <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                          {stage.metric}
                        </span>
                      </button>
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <div className="py-1.5 flex justify-center">
                          <ArrowDown className="w-4 h-4 text-[#94A3B8] dark:text-[#475569]" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="lg:col-span-7 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-8 space-y-5">
                <div className="border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
                  <div className="text-[12px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                    {activeStage.label}
                  </div>
                  <h3 className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {activeStage.title}
                  </h3>
                </div>

                <p className="text-[15px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {activeStage.description}
                </p>

                <ul className="space-y-2.5">
                  {activeStage.signals.map((sig) => (
                    <li
                      key={sig}
                      className="flex items-start gap-2.5 text-[14px] text-[#475569] dark:text-[#CBD5E1]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onOpenBuildModal}
                    className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Try It With Your GitHub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: PRODUCT EXPLANATION */}
        <section
          id="product-comparison"
          className="py-16 md:py-20 border-b border-[#E2E8F0] dark:border-[#334155]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                From Resume Claims to Verified Evidence
              </h2>
              <p className="mt-2 text-[15px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
                A traditional resume lists keywords without proof. SkillTwin shows the exact evidence confidence behind each skill.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Traditional Resume */}
              <div className="lg:col-span-5 rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6">
                <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                  Traditional Resume
                </h3>
                <div className="mt-4 space-y-3">
                  {COMPARISON_ITEMS.map((item) => (
                    <button
                      key={item.skill}
                      type="button"
                      onClick={() => setSelectedComparisonSkill(item.skill)}
                      className={`w-full p-3.5 rounded-[6px] border text-left transition-colors ${
                        selectedComparisonSkill === item.skill
                          ? 'border-[#1D4ED8] bg-[#F8FAFC] dark:bg-[#1E293B]'
                          : 'border-[#E2E8F0] dark:border-[#334155]'
                      }`}
                    >
                      <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {item.skill}
                      </div>
                      <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        {item.resumeClaim}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SkillTwin */}
              <div className="lg:col-span-7 rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6">
                <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                  SkillTwin
                </h3>
                <div className="mt-4 space-y-3">
                  {COMPARISON_ITEMS.map((item) => {
                    const active = selectedComparisonSkill === item.skill;
                    const barColor =
                      item.status === 'strong'
                        ? 'bg-[#15803D]'
                        : item.status === 'moderate'
                        ? 'bg-[#1D4ED8]'
                        : 'bg-[#B45309]';
                    return (
                      <div
                        key={item.skill}
                        onClick={() => setSelectedComparisonSkill(item.skill)}
                        className={`p-3.5 rounded-[6px] border cursor-pointer transition-colors ${
                          active
                            ? 'border-[#1D4ED8] bg-[#F8FAFC] dark:bg-[#1E293B]'
                            : 'border-[#E2E8F0] dark:border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {item.skill}
                          </span>
                          <span className="font-mono text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                            {item.confidence}% evidence confidence
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#0B1120] overflow-hidden mt-2">
                          <div
                            className={`h-full rounded-full ${barColor}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        {active && (
                          <p className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1]">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: SKILL GRAPH */}
        <section className="py-16 md:py-20 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                Skill Graph
              </h2>
              <p className="mt-2 text-[15px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
                Clean, structured relationship mapping between core domains and specific technologies.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-8 overflow-x-auto">
                <div className="min-w-[500px] flex flex-col items-center">
                  <div className="px-6 py-2.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border-2 border-[#1D4ED8] text-[15px] font-semibold">
                    Backend
                  </div>
                  <div className="w-[1.5px] h-6 bg-[#1D4ED8]" />
                  <div className="w-full max-w-[440px] h-[1.5px] bg-[#CBD5E1] dark:bg-[#334155] relative">
                    <div className="absolute left-0 top-0 w-[75%] h-[1.5px] bg-[#1D4ED8]" />
                  </div>
                  <div className="w-full max-w-[500px] grid grid-cols-4 gap-4">
                    {LANDING_GRAPH_BRANCHES.map((branch) => {
                      const lineColor = branch.active
                        ? 'bg-[#1D4ED8]'
                        : 'bg-[#CBD5E1] dark:bg-[#334155]';
                      const isSelected = selectedGraphBranch === branch.id;
                      return (
                        <div
                          key={branch.id}
                          onClick={() => setSelectedGraphBranch(branch.id)}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <div className={`w-[1.5px] h-6 ${lineColor}`} />
                          <div
                            className={`w-full py-2 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border text-center ${
                              isSelected
                                ? 'border-2 border-[#1D4ED8]'
                                : branch.active
                                ? 'border-[#1D4ED8]/50'
                                : 'border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            <div className="text-[14px] font-semibold">
                              {branch.label}
                            </div>
                            <div className="text-[12px] font-mono text-[#64748B]">
                              {branch.confidence}%
                            </div>
                          </div>
                          <div className={`w-[1.5px] h-6 ${lineColor}`} />
                          <div
                            className={`w-full py-2 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border text-center ${
                              isSelected
                                ? 'border-2 border-[#1D4ED8]'
                                : 'border-[#E2E8F0] dark:border-[#334155]'
                            }`}
                          >
                            <div className="text-[13px] font-medium">
                              {branch.childLabel}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-semibold">
                    {activeBranch.label} → {activeBranch.childLabel}
                  </h3>
                  <span className="font-mono text-[16px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                    {activeBranch.confidence}%
                  </span>
                </div>
                <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {activeBranch.detail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOR CANDIDATES & FOR RECRUITERS */}
        <section id="for-audiences" className="py-16 md:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em]">
                For Candidates &amp; Hiring Teams
              </h2>
              <div className="inline-flex p-1 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] self-start">
                <button
                  type="button"
                  onClick={() => setAudienceTab('candidates')}
                  className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium ${
                    audienceTab === 'candidates'
                      ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  For Candidates
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceTab('recruiters')}
                  className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium ${
                    audienceTab === 'recruiters'
                      ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                      : 'text-[#475569] dark:text-[#CBD5E1]'
                  }`}
                >
                  For Recruiters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audienceTab === 'candidates' ? (
                <>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      1. Measure your real job readiness
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Connect your GitHub and resume to see your exact readiness percentage for Backend, Full-Stack, Frontend, or Cloud roles.
                    </p>
                  </div>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      2. Understand your evidence gaps
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Every score includes a clear &ldquo;Why?&rdquo; explanation showing which skills are backed by repositories and which ones need proof.
                    </p>
                  </div>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      3. Verify missing skills in minutes
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Take short, focused code challenges or attach project files to close your evidence gaps and boost your readiness score.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      1. Evaluate any GitHub candidate instantly
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Enter a candidate&apos;s GitHub username and paste their resume to immediately separate verified production skills from unverified keyword claims.
                    </p>
                  </div>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      2. Custom job requirement matching
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Paste your own job description to evaluate candidates specifically against your team&apos;s tech stack.
                    </p>
                  </div>
                  <div className="card-surface p-6">
                    <h3 className="text-[17px] font-semibold">
                      3. Focus interviews only on gaps
                    </h3>
                    <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                      Skip redundant screening on skills already proven in public repositories and focus interview time on unverified areas.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
            <button
              type="button"
              onClick={onOpenBuildModal}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Build Your SkillTwin
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('documentation')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              How It Works
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
