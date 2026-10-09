import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GitCommit,
  FileCode2,
  ShieldCheck,
  Terminal,
  Sun,
  Moon,
  Layers,
  Database,
  Code2,
  SlidersHorizontal,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LandingPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onEnterDashboard: (initialTab?: string) => void;
  onOpenBuildModal: (mode?: 'build' | 're-evaluate' | 'empty-demo') => void;
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
    metric: 'Claim Extraction',
    title: 'Baseline Claim Inventory',
    description:
      'Parses role history and self-reported technical claims into a structured hypothesis list requiring repository or assessment verification.',
    signals: [
      'Maps claimed languages and frameworks to target role ontologies',
      'Flags unsubstantiated keyword lists for repository cross-checking',
      'Extracts stated seniority scope and system scale claims',
    ],
  },
  {
    id: 'github',
    label: 'GitHub',
    metric: '1,420 Commits',
    title: 'Cryptographic Commit & PR Telemetry',
    description:
      'Verifies authorship via GPG/SSH signatures and evaluates commit granularity, review feedback ratios, and long-term maintenance.',
    signals: [
      'GPG / SSH signature validation to confirm individual authorship',
      'Filters out automated bot commits, vendored code, and boilerplate',
      'Measures PR review depth and defect revert rates over 90-day windows',
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    metric: 'AST Parsing',
    title: 'Abstract Syntax Tree & Architecture Analysis',
    description:
      'Tree-sitter parsers inspect actual syntax trees for concurrency safety, database indexing, error semantics, and container hardening.',
    signals: [
      'Detects Java 21 Structured Concurrency and non-blocking I/O idioms',
      'Evaluates SQL migration safety, partial indexes, and lock timeouts',
      'Audits Dockerfiles and Terraform manifests for production readiness',
    ],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    metric: 'Sandboxed Proof',
    title: 'Targeted Micro-Assessments for Gaps',
    description:
      'Instead of generic 3-hour algorithm puzzles, candidates complete focused 15–20 minute sandboxes only for unverified skill gaps.',
    signals: [
      '15-minute container hardening lab for unverified Docker claims',
      '20-minute distributed cache stampede scenario under simulated load',
      'Proctored execution attestation linked directly to the Skill Graph',
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence',
    metric: '81% Readiness',
    title: 'Calibrated Job Readiness Profile',
    description:
      'Produces a transparent, auditable readiness score measured against specific engineering benchmarks (L4, L5, L6).',
    signals: [
      'Separates Strong Evidence from actionable Evidence Gaps',
      'Provides causal "Why?" explanations for every single score',
      'Shareable with engineering hiring managers in one click',
    ],
  },
];

const COMPARISON_ITEMS = [
  {
    skill: 'Java',
    resumeClaim: 'Listed under Technical Skills · "5+ years Java experience"',
    confidence: 91,
    status: 'strong' as const,
    evidenceSummary: '420 GPG-signed commits across 4 production services',
    astProof:
      'Verified Java 21 Virtual Threads, StructuredTaskScope, and lock-free ring buffers in org/payment-gateway (avg cyclomatic complexity: 4.2).',
  },
  {
    skill: 'Spring Boot',
    resumeClaim: 'Listed under Frameworks · "Built microservices with Spring Boot"',
    confidence: 74,
    status: 'moderate' as const,
    evidenceSummary: '2 services using Spring Boot 3.2, Security filter chains',
    astProof:
      'Verified OAuth2 JWT revocation filters and Spring Data JPA repositories; missing Resilience4j bulkhead fault-isolation tests for L5 bar.',
  },
  {
    skill: 'Docker',
    resumeClaim: 'Listed under DevOps · "Containerized enterprise deployments"',
    confidence: 42,
    status: 'gap' as const,
    evidenceSummary: '1 basic single-stage Dockerfile in auxiliary repo',
    astProof:
      'No multi-stage layer caching, distroless base images, or non-root USER directives detected. Flagged for 15-minute container remediation.',
  },
  {
    skill: 'AWS',
    resumeClaim: 'Listed under Cloud · "AWS ECS, RDS, IAM architecture"',
    confidence: 18,
    status: 'gap' as const,
    evidenceSummary: '0 Terraform (.tf) or CloudFormation manifests found',
    astProof:
      'Zero infrastructure-as-code definitions detected in public repositories. Requires read-only AWS OIDC audit or private repo link.',
  },
];

interface InteractiveGraphNode {
  id: string;
  label: string;
  parentLabel: string;
  childLabel: string;
  confidence: number;
  active: boolean;
  filesCount: string;
  detail: string;
}

const LANDING_GRAPH_BRANCHES: InteractiveGraphNode[] = [
  {
    id: 'java-branch',
    label: 'Java',
    parentLabel: 'Backend',
    childLabel: 'Spring',
    confidence: 91,
    active: true,
    filesCount: '420 commits · 68 classes',
    detail:
      'Active verified path: Java 21 concurrency primitives and Spring Boot 3.2 service orchestration confirmed across core payment repositories.',
  },
  {
    id: 'rest-branch',
    label: 'REST',
    parentLabel: 'Backend',
    childLabel: 'APIs',
    confidence: 88,
    active: true,
    filesCount: '14 OpenAPI & gRPC specs',
    detail:
      'Active verified path: Contract-driven REST & gRPC endpoints with idempotency keys and token-bucket rate limiting.',
  },
  {
    id: 'sql-branch',
    label: 'SQL',
    parentLabel: 'Backend',
    childLabel: 'PostgreSQL',
    confidence: 84,
    active: true,
    filesCount: '18 Flyway DDL migrations',
    detail:
      'Active verified path: Zero-downtime PostgreSQL schema migrations, partial B-tree indexes, and lock-timeout safeguards.',
  },
  {
    id: 'docker-branch',
    label: 'Docker',
    parentLabel: 'Backend',
    childLabel: 'Containers',
    confidence: 42,
    active: false,
    filesCount: '1 single-stage Dockerfile',
    detail:
      'Secondary relationship (Gap): Listed on resume, but repository evidence shows only unoptimized single-stage manifests.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onEnterDashboard,
  onOpenBuildModal,
}) => {
  const [expandedHeroGap, setExpandedHeroGap] = useState<string | null>('docker');
  const [selectedStageId, setSelectedStageId] = useState<string>('projects');
  const [selectedComparisonSkill, setSelectedComparisonSkill] = useState<string>('Docker');
  const [selectedGraphBranch, setSelectedGraphBranch] = useState<string>('java-branch');
  const [audienceTab, setAudienceTab] = useState<'candidates' | 'recruiters'>('candidates');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    setIsSigningIn(true);
    setSignInError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      onEnterDashboard('overview');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : '';

      switch (errorCode) {
        case 'auth/network-request-failed':
          setSignInError('Unable to reach Google Sign-In. Check your connection and try again.');
          break;
        case 'auth/popup-closed-by-user':
          setSignInError('Google Sign-In was cancelled.');
          break;
        case 'auth/popup-blocked':
          setSignInError('Your browser blocked the sign-in popup. Allow popups and try again.');
          break;
        case 'auth/unauthorized-domain':
          setSignInError('This website is not authorized in the Firebase Authentication settings.');
          break;
        case 'auth/operation-not-allowed':
          setSignInError('Google Sign-In is not enabled in the Firebase Authentication settings.');
          break;
        default:
          setSignInError(
            errorCode
              ? `Google Sign-In failed (${errorCode}). Check the browser console for details.`
              : 'Google Sign-In could not be completed. Please try again.'
          );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const activeStage =
    PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[2];
  const activeBranch =
    LANDING_GRAPH_BRANCHES.find((b) => b.id === selectedGraphBranch) ||
    LANDING_GRAPH_BRANCHES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      {/* SECTION 1: Minimal Navbar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-40 min-h-16 bg-[#FFFFFF]/95 dark:bg-[#111827]/95 backdrop-blur-[2px] border-b border-[#E2E8F0] dark:border-[#334155]">
        <div className="max-w-[1280px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Zone 1: Brand */}
          <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          {/* Zone 2: 4 Clean Nav Links */}
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

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] flex items-center justify-center transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] px-2.5 py-1.5 transition-colors whitespace-nowrap"
            >
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => onOpenBuildModal('build')}
              className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[14px] font-medium transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
            >
              Build Your SkillTwin
            </button>
          </div>
        </div>
        {signInError && (
          <div
            role="alert"
            className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-3 text-right text-[12px] text-[#B91C1C] dark:text-[#FCA5A5]"
          >
            {signInError}
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="py-14 md:py-20 lg:py-24 border-b border-[#E2E8F0] dark:border-[#334155]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Narrative Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  <span>Deterministic Developer Skill Intelligence</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                    AST + Commit Telemetry
                  </span>
                </div>

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

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenBuildModal('build')}
                    className="h-10 px-5 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[14px] font-medium inline-flex items-center gap-2 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.04)] whitespace-nowrap"
                  >
                    <span>Build Your SkillTwin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEnterDashboard('job-readiness')}
                    className="h-10 px-5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] text-[14px] font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <span>Explore Live Cockpit</span>
                  </button>
                  <a
                    href="#how-it-works"
                    className="h-10 px-3 text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>See How It Works</span>
                  </a>
                </div>

                {/* Quiet factual metadata row */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                  <span>GPG &amp; SSH authorship verification</span>
                  <span aria-hidden="true">·</span>
                  <span>Tree-sitter AST complexity parsing</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero source-code retention</span>
                </div>
              </div>

              {/* Right Column: Realistic Product Interface Visual (Section 7 spec) */}
              <div className="lg:col-span-5">
                <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
                  {/* Interface Window Bar */}
                  <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#1E293B]/60 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        SkillTwin
                      </span>
                      <span className="text-[#CBD5E1] dark:text-[#475569]">/</span>
                      <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        ST-8942
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('job-readiness')}
                      className="text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Open Full View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Role & Readiness Score */}
                  <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-baseline justify-between">
                    <div>
                      <div className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        Backend Engineer
                      </div>
                      <div className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
                        Job Readiness · L5 Distributed Systems
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[36px] font-semibold leading-none text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                        81%
                      </div>
                      <div className="text-[12px] font-medium text-[#15803D] dark:text-[#4ADE80] mt-1">
                        12 / 15 bar met
                      </div>
                    </div>
                  </div>

                  {/* Strong Evidence List */}
                  <div className="p-5 border-b border-[#E2E8F0] dark:border-[#334155] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                        Strong evidence
                      </span>
                      <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                        Verified via Git + AST
                      </span>
                    </div>

                    {[
                      { name: 'Java', score: 91, note: '420 signed commits' },
                      { name: 'REST APIs', score: 88, note: '14 OpenAPI/gRPC specs' },
                      { name: 'SQL', score: 84, note: '18 Flyway migrations' },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[14px]">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
                            <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                              {item.name}
                            </span>
                            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                              · {item.note}
                            </span>
                          </div>
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

                  {/* Evidence Gaps List with Interactive "Why?" */}
                  <div className="p-5 space-y-3 bg-[#F8FAFC]/50 dark:bg-[#0B1120]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                        Evidence gaps
                      </span>
                      <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                        Click a gap to inspect Why?
                      </span>
                    </div>

                    {[
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
                        why: 'High-volume read controllers detected, but no distributed caching (Redis/Memcached) or stampede lock primitives were found in commit history.',
                      },
                    ].map((gap) => {
                      const isExpanded = expandedHeroGap === gap.id;
                      return (
                        <div
                          key={gap.id}
                          className="rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-3 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHeroGap(isExpanded ? null : gap.id)
                            }
                            className="w-full text-left space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[14px]">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] dark:text-[#FBBF24] shrink-0" />
                                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                                  {gap.name}
                                </span>
                                <span className="text-[12px] text-[#1D4ED8] dark:text-[#3B82F6] inline-flex items-center gap-0.5">
                                  Why?
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </span>
                              </div>
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
                            <p className="mt-2.5 pt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
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

        {/* SECTION 8: TRUST & EVIDENCE PIPELINE */}
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
                Select any stage in the verification pipeline below to inspect how SkillTwin converts raw developer artifacts into calibrated readiness signals.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Vertical / Horizontal Pipeline Flow (Resume -> GitHub -> Projects -> Assessments -> Evidence) */}
              <div className="lg:col-span-5 flex flex-col">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isSelected = stage.id === selectedStageId;
                  return (
                    <React.Fragment key={stage.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`w-full p-4 rounded-[8px] border text-left transition-colors flex items-center justify-between ${isSelected
                          ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#1D4ED8] dark:border-[#3B82F6] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
                          : 'bg-[#FFFFFF] dark:bg-[#111827] border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-[4px] font-mono text-[12px] font-semibold flex items-center justify-center ${isSelected
                              ? 'bg-[#1D4ED8] text-white'
                              : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#CBD5E1]'
                              }`}
                          >
                            0{idx + 1}
                          </span>
                          <span className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {stage.label}
                          </span>
                        </div>
                        <span className="font-mono text-[12px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
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

              {/* Stage Detail Panel */}
              <div className="lg:col-span-7 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#334155] pb-4">
                  <div>
                    <div className="text-[12px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                      Stage: {activeStage.label}
                    </div>
                    <h3 className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                      {activeStage.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {activeStage.metric}
                  </span>
                </div>

                <p className="text-[15px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {activeStage.description}
                </p>

                <div className="space-y-2.5">
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Deterministic Signals Extracted:
                  </div>
                  <ul className="space-y-2">
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
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    Inspect real signals in the Evidence Engine
                  </span>
                  <button
                    type="button"
                    onClick={() => onEnterDashboard('evidence-engine')}
                    className="h-8 px-3.5 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>View Evidence Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: PRODUCT EXPLANATION (From Resume Claims to Verified Evidence) */}
        <section
          id="product-comparison"
          className="py-16 md:py-20 border-b border-[#E2E8F0] dark:border-[#334155]"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                  From Resume Claims to Verified Evidence
                </h2>
                <p className="mt-2 text-[15px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
                  Resumes treat every listed keyword as equal. SkillTwin measures actual evidence confidence across commits, syntax trees, and runtime configurations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterDashboard('job-readiness')}
                className="h-9 px-4 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-1.5 self-start md:self-auto transition-colors whitespace-nowrap"
              >
                <span>Open Full Readiness Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left: Traditional Resume */}
              <div className="lg:col-span-5 rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        Traditional Resume
                      </h3>
                      <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                        Unverified self-reported keyword list
                      </p>
                    </div>
                    <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      0% Cryptographic Proof
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {COMPARISON_ITEMS.map((item) => {
                      const active = selectedComparisonSkill === item.skill;
                      return (
                        <button
                          key={item.skill}
                          type="button"
                          onClick={() => setSelectedComparisonSkill(item.skill)}
                          className={`w-full p-3.5 rounded-[6px] border text-left transition-colors ${active
                            ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                            : 'border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {item.skill}
                            </span>
                            <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                              Keyword Claim
                            </span>
                          </div>
                          <div className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1">
                            {item.resumeClaim}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                  Recruiters and hiring managers cannot distinguish production mastery from a weekend tutorial.
                </div>
              </div>

              {/* Right: SkillTwin Verified Evidence */}
              <div className="lg:col-span-7 rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                    <div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        SkillTwin
                      </h3>
                      <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
                        Calibrated evidence confidence from repositories &amp; AST
                      </p>
                    </div>
                    <span className="text-[12px] font-mono text-[#15803D] dark:text-[#4ADE80] font-medium">
                      SHA-256 Attested
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {COMPARISON_ITEMS.map((item) => {
                      const active = selectedComparisonSkill === item.skill;
                      const barColor =
                        item.status === 'strong'
                          ? 'bg-[#15803D] dark:bg-[#4ADE80]'
                          : item.status === 'moderate'
                            ? 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                            : 'bg-[#B45309] dark:bg-[#FBBF24]';
                      const textColor =
                        item.status === 'strong'
                          ? 'text-[#15803D] dark:text-[#4ADE80]'
                          : item.status === 'moderate'
                            ? 'text-[#1D4ED8] dark:text-[#3B82F6]'
                            : 'text-[#B45309] dark:text-[#FBBF24]';

                      return (
                        <div
                          key={item.skill}
                          onClick={() => setSelectedComparisonSkill(item.skill)}
                          className={`p-3.5 rounded-[6px] border cursor-pointer transition-colors ${active
                            ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-[#F8FAFC] dark:bg-[#1E293B]'
                            : 'border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                {item.skill}
                              </span>
                              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] ml-2">
                                · {item.evidenceSummary}
                              </span>
                            </div>
                            <span
                              className={`font-mono text-[14px] font-semibold tabular-nums ${textColor}`}
                            >
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
                            <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] text-[13px] text-[#475569] dark:text-[#CBD5E1] flex items-start justify-between gap-4">
                              <span>{item.astProof}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[13px]">
                  <span className="text-[#475569] dark:text-[#CBD5E1]">
                    Click any row above to inspect its repository AST verification note.
                  </span>
                  <button
                    type="button"
                    onClick={() => onEnterDashboard('gap-remediation')}
                    className="font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline whitespace-nowrap"
                  >
                    Remediate Gaps →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: RESTRAINED SKILL GRAPH */}
        <section className="py-16 md:py-20 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                  Architectural Skill Graph
                </h2>
                <p className="mt-2 text-[15px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
                  Dependencies between core languages, frameworks, and data systems mapped with orthogonal clarity. Active verified relationships appear in blue; unverified secondary paths appear in neutral slate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterDashboard('skill-graph')}
                className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 self-start md:self-auto transition-colors whitespace-nowrap"
              >
                <span>Open Interactive Ontology DAG</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Orthogonal Tree Diagram (Backend -> Java/Spring, REST/APIs, SQL/PostgreSQL, Docker/Containers) */}
              <div className="lg:col-span-8 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 sm:p-8 overflow-x-auto">
                <div className="min-w-[540px] flex flex-col items-center">
                  {/* Root Node: Backend */}
                  <div className="px-6 py-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] border-2 border-[#1D4ED8] dark:border-[#3B82F6] shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-center">
                    <div className="text-[11px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                      ROOT DOMAIN
                    </div>
                    <div className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Backend
                    </div>
                  </div>

                  {/* Vertical stem from Backend */}
                  <div className="w-[1.5px] h-7 bg-[#1D4ED8] dark:bg-[#3B82F6]" />

                  {/* Horizontal distribution bar */}
                  <div className="w-full max-w-[460px] grid grid-cols-4 relative">
                    <div className="col-span-4 h-[1.5px] bg-[#CBD5E1] dark:bg-[#334155] mx-[12.5%] relative">
                      <div className="absolute left-0 top-0 w-[66.6%] h-[1.5px] bg-[#1D4ED8] dark:bg-[#3B82F6]" />
                    </div>
                  </div>

                  {/* 4 Columns for Branches */}
                  <div className="w-full max-w-[520px] grid grid-cols-4 gap-4">
                    {LANDING_GRAPH_BRANCHES.map((branch) => {
                      const isSelected = selectedGraphBranch === branch.id;
                      const lineClass = branch.active
                        ? 'bg-[#1D4ED8] dark:bg-[#3B82F6]'
                        : 'bg-[#CBD5E1] dark:bg-[#334155]';
                      const borderClass = isSelected
                        ? 'border-2 border-[#1D4ED8] dark:border-[#3B82F6]'
                        : branch.active
                          ? 'border border-[#1D4ED8]/50 dark:border-[#3B82F6]/50 hover:border-[#1D4ED8]'
                          : 'border border-[#E2E8F0] dark:border-[#334155] hover:border-[#94A3B8]';

                      return (
                        <div
                          key={branch.id}
                          onClick={() => setSelectedGraphBranch(branch.id)}
                          className="flex flex-col items-center cursor-pointer group"
                        >
                          {/* Top connector */}
                          <div className={`w-[1.5px] h-6 ${lineClass}`} />

                          {/* Level 1 Node (Java, REST, SQL, Docker) */}
                          <div
                            className={`w-full py-2.5 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] ${borderClass} text-center transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
                          >
                            <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {branch.label}
                            </div>
                            <div
                              className={`text-[12px] font-mono tabular-nums mt-0.5 ${branch.active
                                ? 'text-[#1D4ED8] dark:text-[#3B82F6] font-medium'
                                : 'text-[#64748B] dark:text-[#94A3B8]'
                                }`}
                            >
                              {branch.confidence}%
                            </div>
                          </div>

                          {/* Middle connector */}
                          <div className={`w-[1.5px] h-7 ${lineClass}`} />

                          {/* Level 2 Node (Spring, APIs, PostgreSQL, Containers) */}
                          <div
                            className={`w-full py-2.5 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#111827] ${borderClass} text-center transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
                          >
                            <div className="text-[13px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                              {branch.childLabel}
                            </div>
                            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                              {branch.active ? 'Verified' : 'Gap'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Selected Branch Inspector */}
              <div className="lg:col-span-4 rounded-[8px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#E2E8F0] dark:border-[#334155] p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                  <div>
                    <span className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {activeBranch.parentLabel} → {activeBranch.label} → {activeBranch.childLabel}
                    </span>
                    <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                      {activeBranch.label} &amp; {activeBranch.childLabel}
                    </h3>
                  </div>
                  <span
                    className={`font-mono text-[18px] font-semibold tabular-nums ${activeBranch.active
                      ? 'text-[#1D4ED8] dark:text-[#3B82F6]'
                      : 'text-[#B45309] dark:text-[#FBBF24]'
                      }`}
                  >
                    {activeBranch.confidence}%
                  </span>
                </div>

                <div className="text-[13px] font-mono text-[#475569] dark:text-[#CBD5E1]">
                  Telemetry Volume: {activeBranch.filesCount}
                </div>

                <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                  {activeBranch.detail}
                </p>

                <div className="pt-2 flex items-center gap-3 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[#1D4ED8]" /> Active Relationship
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-[#94A3B8]" /> Secondary / Unverified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOR CANDIDATES & FOR RECRUITERS */}
        <section id="for-audiences" className="py-16 md:py-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[#0F172A] dark:text-[#F8FAFC]">
                  Built for Engineering Teams and Candidates
                </h2>
                <p className="text-[15px] text-[#475569] dark:text-[#CBD5E1] mt-1">
                  One shared source of truth for technical capability evaluation.
                </p>
              </div>
              <div className="inline-flex p-1 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] self-start">
                <button
                  type="button"
                  onClick={() => setAudienceTab('candidates')}
                  className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors whitespace-nowrap ${audienceTab === 'candidates'
                    ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
                    : 'text-[#475569] dark:text-[#CBD5E1]'
                    }`}
                >
                  For Candidates
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceTab('recruiters')}
                  className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors whitespace-nowrap ${audienceTab === 'recruiters'
                    ? 'bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
                    : 'text-[#475569] dark:text-[#CBD5E1]'
                    }`}
                >
                  For Recruiters &amp; Hiring Managers
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audienceTab === 'candidates' ? (
                <>
                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        01. Readiness Audit
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Know your exact score before applying
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        Benchmark your GitHub repositories and project portfolio against L4, L5, or L6 role thresholds and see where your evidence is strong.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('job-readiness')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Job Readiness Screen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        02. Targeted Gap Closure
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Fix missing signals in 15 minutes
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        When a skill on your resume lacks public repo evidence, complete a focused 15-minute container or caching sandbox to prove capability.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('gap-remediation')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Gap Remediation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        03. Cryptographic Dossier
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Share verifiable proof with hiring teams
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        Export a GPG-verified engineering dossier showing AST complexity, test coverage, and architectural patterns without exposing proprietary IP.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBuildModal('build')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Build Your SkillTwin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        01. Zero Keyword Noise
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Audit commit &amp; AST evidence instantly
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        Replace resume screening with deterministic AST telemetry across 32 languages, GPG authorship verification, and cyclomatic complexity metrics.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('evidence-engine')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect Evidence Engine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        02. Precision Interviews
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Test only the unverified gaps
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        When a candidate already has 91% verified evidence in Java and SQL, skip the basic coding screen and dispatch a 15-minute Docker or Redis lab.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('gap-remediation')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore Gap Remediation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="rounded-[8px] bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] p-6 flex flex-col justify-between">
                    <div>
                      <div className="text-[13px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                        03. Role Standardization
                      </div>
                      <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                        Calibrated L4, L5, and L6 ontologies
                      </h3>
                      <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] mt-2 leading-relaxed">
                        Configure declarative `skilltwin.config.json` manifests to standardize hiring bars across distributed engineering squads.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterDashboard('documentation')}
                      className="mt-6 text-[13px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Evaluation Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Enterprise Footer */}
      <footer className="border-t border-[#E2E8F0] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#111827] py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
              · Evidence-backed developer intelligence
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('job-readiness')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Job Readiness
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('skill-graph')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Skill Graph
            </button>
            <button
              type="button"
              onClick={() => onEnterDashboard('documentation')}
              className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
            >
              Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
