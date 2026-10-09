import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Cpu,
  FileCheck2,
  Network,
  GitBranch,
  Gauge,
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('spec-014');
  const [manifestLevel, setManifestLevel] = useState<
    'L4_SENIOR_SWE' | 'L5_DISTRIBUTED_SYSTEMS' | 'L6_PRINCIPAL_ARCHITECT'
  >('L5_DISTRIBUTED_SYSTEMS');
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const manifestJson = `{
  "$schema": "https://skilltwin.dev/schemas/v2/evaluation.json",
  "benchmarkTarget": "${manifestLevel}",
  "evaluationWindowDays": 180,
  "authorship": {
    "requireGpgVerification": true,
    "excludeBots": ["dependabot[bot]", "renovate[bot]", "github-actions[bot]"],
    "minAttributionShare": 0.15
  },
  "signals": {
    "astWeight": 0.45,
    "productionEntropyWeight": 0.30,
    "concurrencyCoverageWeight": 0.25
  },
  "thresholds": {
    "minCyclomaticTolerance": ${manifestLevel === 'L6_PRINCIPAL_ARCHITECT' ? 10 : 12},
    "testCoverageMinimum": ${manifestLevel === 'L6_PRINCIPAL_ARCHITECT' ? 0.88 : 0.82},
    "memorySafetyRules": "STRICT_NO_UNSAFE"
  },
  "security": {
    "codeRetention": "EPHEMERAL_ZERO_STORAGE",
    "emitSignedAttestation": true
  }
}`;

  const handleCopyJson = () => {
    navigator.clipboard?.writeText(manifestJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            <span>Documentation</span>
            <span>/</span>
            <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
              Methodology &amp; Signal Verification
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            SkillTwin Evaluation Engine &amp; Methodology
          </h1>
          <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
            Deterministic skill telemetry, AST semantic extraction, cryptographic authorship proofs, and zero-retention code analysis.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter evaluation rules, AST specs..."
            className="w-full h-9 pl-9 pr-3 rounded-[6px] bg-[#F8FAFC] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>
      </div>

      {/* Main 12-Col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Sidebar (3 cols) */}
        <aside className="lg:col-span-3 card-surface p-4 space-y-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-2 block mb-1.5">
              Signal Foundations
            </span>
            <ul className="space-y-0.5 text-[13px]">
              {[
                { id: 'spec-014', label: 'Verification vs Keywords' },
                { id: 'pipeline', label: 'Telemetry Pipeline' },
                { id: 'manifest', label: 'Declarative Manifest' },
                { id: 'compliance', label: 'Zero Code Retention' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[6px] font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#1D4ED8]/10 text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                        : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] px-2 block mb-1.5">
              Benchmark Standards
            </span>
            <div className="space-y-1 text-[12px]">
              {(
                [
                  { id: 'L4_SENIOR_SWE', label: 'L4 Standard', tag: 'Generalist' },
                  { id: 'L5_DISTRIBUTED_SYSTEMS', label: 'L5 Distributed', tag: 'Active' },
                  { id: 'L6_PRINCIPAL_ARCHITECT', label: 'L6 Principal', tag: 'Architect' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setManifestLevel(b.id)}
                  className={`w-full px-2.5 py-1.5 rounded-[6px] flex items-center justify-between transition-colors ${
                    manifestLevel === b.id
                      ? 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#3B82F6] font-semibold'
                      : 'text-[#475569] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                  }`}
                >
                  <span>{b.label}</span>
                  <span className="font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {b.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Documentation Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Section 1: Deterministic Skill Verification vs Keyword Matching */}
          <section id="spec-014" className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              <span className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                SPEC-014 · Signal Foundations
              </span>
              <span>Updated: ISO 8601 UTC</span>
            </div>

            <h2 className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Deterministic Skill Verification vs Keyword Matching
            </h2>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Traditional recruitment relies on self-reported keywords and CV text, yielding high false-positive rates for Senior+ engineering capabilities. SkillTwin replaces unverified claims with semantic proofs harvested from version control history and syntax trees.
            </p>

            <div className="overflow-x-auto border border-[#E2E8F0] dark:border-[#334155] rounded-[6px]">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-[11px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
                    <th className="py-2.5 px-4">Verification Vector</th>
                    <th className="py-2.5 px-4">Traditional Resume / ATS</th>
                    <th className="py-2.5 px-4 text-[#1D4ED8] dark:text-[#3B82F6]">
                      SkillTwin Evidence Graph
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                  {[
                    {
                      vector: 'Authorship Integrity',
                      resume: 'Unverified self-attestation',
                      skilltwin: 'Cryptographic GPG + SSH commit verify',
                      status: 'pass',
                    },
                    {
                      vector: 'Depth Measurement',
                      resume: 'Years of experience string',
                      skilltwin: 'AST Cyclomatic entropy & refactor ratio',
                      status: 'primary',
                    },
                    {
                      vector: 'Claim Accuracy',
                      resume: 'High variance (unverified keyword lists)',
                      skilltwin: 'Deterministic bytecode, DDL & test logs',
                      status: 'pass',
                    },
                    {
                      vector: 'Production Context',
                      resume: 'Static bullet point descriptions',
                      skilltwin: 'Concurrency primitives & CI/CD metrics',
                      status: 'primary',
                    },
                    {
                      vector: 'Skill Currency / Decay',
                      resume: 'Undetected obsolescence',
                      skilltwin: 'Decay function applied per 90-day window',
                      status: 'pass',
                    },
                  ]
                    .filter(
                      (row) =>
                        !searchFilter.trim() ||
                        row.vector.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        row.skilltwin.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((row) => (
                      <tr key={row.vector} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40">
                        <td className="py-3 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {row.vector}
                        </td>
                        <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8]">
                          <span className="inline-flex items-center gap-1.5">
                            {row.vector === 'Claim Accuracy' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
                            )}
                            {row.resume}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[12px]">
                          <span
                            className={`font-semibold ${
                              row.status === 'pass'
                                ? 'text-[#15803D] dark:text-[#4ADE80]'
                                : 'text-[#1D4ED8] dark:text-[#3B82F6]'
                            }`}
                          >
                            {row.skilltwin}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Evaluation Telemetry Pipeline */}
          <section id="pipeline" className="card-surface p-6 space-y-4">
            <div className="text-[12px] font-mono text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
              PIPELINE · Deterministic Protocol
            </div>
            <h2 className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Evaluation Telemetry Pipeline
            </h2>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
              The engine executes a four-phase isolation pipeline designed to map high-assurance competencies without retaining customer intellectual property.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  phase: 'PHASE 01',
                  title: 'Repository Ingestion & Branch Analysis',
                  desc: 'Ephemeral container runs shallow clones of default and release branches. Scans merge history, pull-request metadata, commit cadences, and multi-file mutation patterns in RAM buffers.',
                  leftMeta: 'Read Scope: Metadata only',
                  rightMeta: 'Memory TTL: 120s',
                  icon: GitBranch,
                },
                {
                  phase: 'PHASE 02',
                  title: 'Authorship Cryptographic Signature Validation',
                  desc: 'Validates GPG/SSH public key signatures linked to enterprise identities. Commits generated by CI bots or squash rebases are partitioned into isolated attribution buckets.',
                  leftMeta: 'Verification: SHA-256 / Ed25519',
                  rightMeta: 'Spoof Resistance: 100%',
                  icon: ShieldCheck,
                },
                {
                  phase: 'PHASE 03',
                  title: 'AST Parsing & Cyclomatic Complexity',
                  desc: 'Constructs language-specific Abstract Syntax Trees (Tree-sitter native). Dissects concurrency routines, error boundaries, and architectural patterns while computing complexity scores.',
                  leftMeta: 'Parsers: 32 Languages',
                  rightMeta: 'Granularity: Function level',
                  icon: Network,
                },
                {
                  phase: 'PHASE 04',
                  title: 'Normalization & Competency Benchmarks',
                  desc: 'Aggregated signals are benchmarked against calibrated L4, L5, and L6 production systems engineering profiles across resilience, scalability, and code hygiene.',
                  leftMeta: 'Benchmark pool: Tier-1 Eng',
                  rightMeta: 'Calibration: Deterministic',
                  icon: Gauge,
                },
              ].map((p) => {
                const IconComp = p.icon;
                return (
                  <div
                    key={p.phase}
                    className="p-4 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#1D4ED8] dark:text-[#3B82F6]">
                          {p.phase}
                        </span>
                        <IconComp className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
                      </div>
                      <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                        {p.title}
                      </h3>
                      <p className="text-[12px] text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span>{p.leftMeta}</span>
                      <span>{p.rightMeta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Declarative Evaluation Manifest */}
          <section id="manifest" className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                CONFIGURATION · Manifest Schema v2
              </span>
              <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                JSON Schema compliant
              </span>
            </div>

            <h2 className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Declarative Evaluation Manifest (
              <code className="font-mono text-[15px] text-[#1D4ED8] dark:text-[#3B82F6]">
                skilltwin.config.json
              </code>
              )
            </h2>
            <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1]">
              Platform administrators calibrate readiness gates, define AST threshold vectors, and lock evaluation scopes by placing this manifest at the repository root.
            </p>

            <div className="rounded-[6px] overflow-hidden bg-[#0F172A] border border-[#334155]">
              <div className="px-4 py-2 bg-[#1E293B] flex items-center justify-between border-b border-[#334155]">
                <span className="font-mono text-[12px] text-[#CBD5E1]">
                  skilltwin.config.json ({manifestLevel})
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-[11px] font-mono text-[#CBD5E1] hover:text-white inline-flex items-center gap-1"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 font-mono text-[12px] leading-relaxed text-[#E2E8F0] overflow-x-auto">
                <code>{manifestJson}</code>
              </pre>
            </div>
          </section>

          {/* Section 4: Enterprise Compliance & Zero Retention */}
          <section id="compliance" className="card-surface p-6 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1D4ED8] dark:text-[#3B82F6]" />
                  <h3 className="text-[18px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Enterprise Compliance &amp; Zero Retention
                  </h3>
                </div>
                <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl">
                  SkillTwin processes repository syntax trees inside transient memory environments with zero persistence. Source code is never stored on disk.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                <span className="px-2.5 py-1 rounded-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                  SOC 2 TYPE II
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                  ISO 27001
                </span>
                <span className="px-2.5 py-1 rounded-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
                  GDPR REQ-17
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Read-Only Enclave
                  </div>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    OAuth and GitHub Apps connect strictly via read-only repository permissions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    RAM-Only Execution
                  </div>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    AST transformations run strictly in memory; all volumes unmounted on analysis termination.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Immutable Audit Trails
                  </div>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Every verification check writes a cryptographic merkle-proof event visible to auditors.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
