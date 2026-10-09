import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  Layers3,
  Map,
  Search,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { SkillTwinProfile } from '../../types/skilltwin';

interface RoadmapTopic {
  title: string;
  detail: string;
  skillId?: string;
}

interface RoadmapStage {
  title: string;
  description: string;
  topics: RoadmapTopic[];
}

interface RoadmapTrack {
  id: string;
  title: string;
  category: string;
  summary: string;
  level: string;
  profileRoleId?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  stages: RoadmapStage[];
}

const ROADMAP_PROGRESS_KEY = 'skilltwin_roadmap_progress_v1';

const ROADMAPS: RoadmapTrack[] = [
  {
    id: 'backend-engineer',
    title: 'Backend Engineer',
    category: 'Engineering',
    summary: 'Design, build, secure, and operate dependable backend services.',
    level: 'Beginner to advanced',
    profileRoleId: 'backend-engineer',
    icon: Code2,
    accent: 'blue',
    stages: [
      {
        title: 'Programming foundations',
        description: 'Build fluency in one server-side language and the tools around it.',
        topics: [
          { title: 'Choose a backend language', detail: 'Learn types, collections, errors, modules, and async execution.', skillId: 'java-ts-go-py' },
          { title: 'Use Git in a team', detail: 'Practice branches, reviewable commits, pull requests, and conflict resolution.', skillId: 'git-workflow' },
          { title: 'Work with a shell and processes', detail: 'Understand environment variables, exit codes, logs, and process signals.' },
        ],
      },
      {
        title: 'Web services and data',
        description: 'Create APIs that persist and validate real application data.',
        topics: [
          { title: 'HTTP and API design', detail: 'Model REST endpoints, status codes, pagination, and backward-compatible changes.', skillId: 'rest-apis' },
          { title: 'Relational data modeling', detail: 'Design tables, constraints, transactions, indexes, and safe migrations.', skillId: 'sql-db' },
          { title: 'Testing service behavior', detail: 'Add unit, integration, and contract tests for success and failure paths.', skillId: 'testing' },
        ],
      },
      {
        title: 'Production architecture',
        description: 'Make services fast, resilient, and safe under real traffic.',
        topics: [
          { title: 'Caching and asynchronous work', detail: 'Use cache invalidation, queues, retries, idempotency, and back-pressure.', skillId: 'system-design' },
          { title: 'Application security', detail: 'Apply least privilege, input validation, secret handling, and threat modeling.' },
          { title: 'Observability and reliability', detail: 'Instrument useful logs, metrics, traces, alerts, and service-level objectives.' },
        ],
      },
      {
        title: 'Ship a portfolio service',
        description: 'Prove the full lifecycle with a small, production-minded project.',
        topics: [
          { title: 'Containerize the service', detail: 'Build a small image, configure health checks, and run dependencies locally.', skillId: 'docker' },
          { title: 'Deploy to a cloud platform', detail: 'Provision a database and application with scoped access and repeatable configuration.', skillId: 'cloud-aws' },
          { title: 'Automate delivery', detail: 'Run checks in CI and document setup, trade-offs, and operating procedures.', skillId: 'testing' },
        ],
      },
    ],
  },
  {
    id: 'fullstack-engineer',
    title: 'Full-Stack Developer',
    category: 'Engineering',
    summary: 'Connect polished user experiences to well-designed services and data.',
    level: 'Beginner to advanced',
    profileRoleId: 'fullstack-engineer',
    icon: Layers3,
    accent: 'violet',
    stages: [
      {
        title: 'Web foundations',
        description: 'Understand the browser, the language, and the interfaces users rely on.',
        topics: [
          { title: 'HTML, CSS, and browser fundamentals', detail: 'Build semantic pages with responsive layouts and accessible controls.', skillId: 'css-tailwind' },
          { title: 'JavaScript and TypeScript', detail: 'Use modules, async flows, types, and browser APIs confidently.', skillId: 'ts-js' },
          { title: 'Git and collaboration', detail: 'Keep changes reviewable and resolve feedback through pull requests.', skillId: 'git-workflow' },
        ],
      },
      {
        title: 'Build the frontend',
        description: 'Create maintainable interfaces with clear state and data boundaries.',
        topics: [
          { title: 'Components and UI state', detail: 'Compose reusable components and choose local, shared, and server state.', skillId: 'react-ui' },
          { title: 'Forms and accessibility', detail: 'Validate input, communicate errors, support keyboard use, and label controls.' },
          { title: 'Frontend testing', detail: 'Test user-visible behavior and important integration paths.', skillId: 'testing' },
        ],
      },
      {
        title: 'Connect the backend',
        description: 'Design a secure, observable path from the UI through the data layer.',
        topics: [
          { title: 'APIs and authentication', detail: 'Define request contracts, identity, authorization, and error responses.', skillId: 'rest-apis' },
          { title: 'Databases and migrations', detail: 'Model application data, query it safely, and evolve schemas.', skillId: 'sql-db' },
          { title: 'Performance and caching', detail: 'Reduce unnecessary requests and make loading and failure states useful.' },
        ],
      },
      {
        title: 'Deliver the product',
        description: 'Ship a complete project with reliable deployment and handoff.',
        topics: [
          { title: 'Build and deploy', detail: 'Configure a production build, environment settings, and a hosting target.', skillId: 'docker' },
          { title: 'Continuous integration', detail: 'Run type checks, tests, and build validation automatically.', skillId: 'testing' },
          { title: 'Portfolio walkthrough', detail: 'Document architecture, trade-offs, and a short end-to-end product demo.' },
        ],
      },
    ],
  },
  {
    id: 'frontend-engineer',
    title: 'Frontend Engineer',
    category: 'Engineering',
    summary: 'Build accessible, fast, and maintainable web experiences and UI systems.',
    level: 'Beginner to advanced',
    profileRoleId: 'frontend-engineer',
    icon: Layers3,
    accent: 'pink',
    stages: [
      {
        title: 'Browser and interface basics',
        description: 'Learn how the browser renders pages and supports interaction.',
        topics: [
          { title: 'Semantic HTML and accessibility', detail: 'Use landmarks, labels, keyboard interaction, and accessible names.' },
          { title: 'CSS layout and responsive design', detail: 'Use grid, flexbox, responsive constraints, and consistent design tokens.', skillId: 'css-tailwind' },
          { title: 'JavaScript and TypeScript', detail: 'Understand event loops, modules, promises, and strict typing.', skillId: 'ts-js' },
        ],
      },
      {
        title: 'Application architecture',
        description: 'Structure complex UI behavior in a way teams can evolve.',
        topics: [
          { title: 'Components and composition', detail: 'Create reusable view primitives with clear props and state ownership.', skillId: 'react-ui' },
          { title: 'Routing and data fetching', detail: 'Handle loading, caching, cancellation, and request failures.', skillId: 'rest-apis' },
          { title: 'Forms and client-side validation', detail: 'Make input flows resilient, accessible, and easy to correct.' },
        ],
      },
      {
        title: 'Quality and performance',
        description: 'Protect user experience with tests and performance measurement.',
        topics: [
          { title: 'Component and browser tests', detail: 'Test behavior and workflows without relying on brittle internals.', skillId: 'testing' },
          { title: 'Web performance', detail: 'Measure loading, rendering, and interaction responsiveness before optimizing.' },
          { title: 'Design systems', detail: 'Document tokens, component states, variants, and visual regression checks.', skillId: 'css-tailwind' },
        ],
      },
      {
        title: 'Ship a UI project',
        description: 'Demonstrate a complete feature from design decisions through release.',
        topics: [
          { title: 'Integrate a real API', detail: 'Include pagination, search, empty states, and useful error feedback.', skillId: 'rest-apis' },
          { title: 'Automate checks and deployment', detail: 'Run tests and publish predictable preview and production builds.', skillId: 'testing' },
          { title: 'Write a case study', detail: 'Explain accessibility, performance, and architecture decisions.' },
        ],
      },
    ],
  },
  {
    id: 'devops-cloud',
    title: 'Cloud & DevOps',
    category: 'Infrastructure',
    summary: 'Automate infrastructure, delivery, observability, and secure operations.',
    level: 'Beginner to advanced',
    profileRoleId: 'devops-cloud',
    icon: Cloud,
    accent: 'cyan',
    stages: [
      {
        title: 'Systems foundations',
        description: 'Become comfortable with the operating environment applications run in.',
        topics: [
          { title: 'Linux, shell, and networking', detail: 'Practice processes, permissions, DNS, TLS, ports, and troubleshooting.', skillId: 'java-ts-go-py' },
          { title: 'Git and scripting', detail: 'Automate repeatable operational tasks and keep changes reviewable.', skillId: 'git-workflow' },
          { title: 'Cloud concepts', detail: 'Learn regions, identity, networking, storage, and shared responsibility.', skillId: 'cloud-aws' },
        ],
      },
      {
        title: 'Build and package',
        description: 'Make application artifacts reproducible across environments.',
        topics: [
          { title: 'Containers', detail: 'Write minimal images, understand layers, and run health-checked services.', skillId: 'docker' },
          { title: 'Infrastructure as Code', detail: 'Provision reviewed, repeatable cloud resources and manage state safely.', skillId: 'cloud-aws' },
          { title: 'Configuration and secrets', detail: 'Separate configuration from images and protect credentials and access.' },
        ],
      },
      {
        title: 'Operate services',
        description: 'Design deployment and incident response for reliable services.',
        topics: [
          { title: 'CI/CD and release safety', detail: 'Automate tests, approvals, rollbacks, and progressive delivery.', skillId: 'testing' },
          { title: 'Orchestration', detail: 'Learn scheduling, service discovery, scaling, and workload health.', skillId: 'docker' },
          { title: 'Monitoring and incident response', detail: 'Connect metrics and alerts to service objectives and runbooks.', skillId: 'system-design' },
        ],
      },
      {
        title: 'Prove operational readiness',
        description: 'Deploy a service and demonstrate how you would keep it healthy.',
        topics: [
          { title: 'Build a secure cloud environment', detail: 'Use least privilege, private networking, and auditable configuration.', skillId: 'cloud-aws' },
          { title: 'Practice failure recovery', detail: 'Test backups, rollback, and a documented recovery procedure.' },
          { title: 'Publish an operations portfolio', detail: 'Include architecture, pipeline, dashboards, and reliability decisions.' },
        ],
      },
    ],
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    category: 'Data',
    summary: 'Move trustworthy data from operational sources into useful analytics.',
    level: 'Beginner to advanced',
    icon: Database,
    accent: 'amber',
    stages: [
      {
        title: 'Data and programming foundations',
        description: 'Build the fundamentals needed to model, transform, and validate data.',
        topics: [
          { title: 'SQL and relational design', detail: 'Practice joins, aggregations, constraints, indexes, and query plans.', skillId: 'sql-db' },
          { title: 'Python for data workflows', detail: 'Use modules, data structures, APIs, and structured error handling.', skillId: 'java-ts-go-py' },
          { title: 'Git and testing basics', detail: 'Version transformations and add checks for representative inputs.', skillId: 'git-workflow' },
        ],
      },
      {
        title: 'Pipelines and modeling',
        description: 'Turn raw records into documented, reusable datasets.',
        topics: [
          { title: 'Ingestion patterns', detail: 'Handle batch loads, incremental updates, duplicates, and late-arriving data.' },
          { title: 'Transformations and data models', detail: 'Design clear staging, facts, dimensions, and business metrics.', skillId: 'sql-db' },
          { title: 'Data quality checks', detail: 'Validate schema, freshness, uniqueness, and business invariants.', skillId: 'testing' },
        ],
      },
      {
        title: 'Scale and orchestrate',
        description: 'Make data workflows observable and dependable as they grow.',
        topics: [
          { title: 'Workflow scheduling', detail: 'Model dependencies, retries, backfills, and safe reprocessing.' },
          { title: 'Distributed data systems', detail: 'Learn partitioning, event streams, queues, and delivery guarantees.', skillId: 'system-design' },
          { title: 'Warehouse performance', detail: 'Use partitioning, clustering, and cost-aware query patterns.' },
        ],
      },
      {
        title: 'Deliver an end-to-end pipeline',
        description: 'Demonstrate a reliable data product from source to consumer.',
        topics: [
          { title: 'Deploy pipeline infrastructure', detail: 'Use cloud storage, managed compute, and scoped identities.', skillId: 'cloud-aws' },
          { title: 'Add monitoring and documentation', detail: 'Report freshness, failures, ownership, and recovery instructions.' },
          { title: 'Present a data product', detail: 'Publish lineage, quality results, and example decisions enabled by the dataset.' },
        ],
      },
    ],
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    category: 'AI & Machine Learning',
    summary: 'Develop, evaluate, and deploy useful machine-learning features responsibly.',
    level: 'Beginner to advanced',
    icon: Sparkles,
    accent: 'violet',
    stages: [
      {
        title: 'Programming and math',
        description: 'Build enough foundation to reason about models and their behavior.',
        topics: [
          { title: 'Python and data handling', detail: 'Work with structured data, functions, packages, and reproducible environments.', skillId: 'java-ts-go-py' },
          { title: 'Statistics and linear algebra', detail: 'Review distributions, vectors, matrices, uncertainty, and evaluation.' },
          { title: 'Data preparation', detail: 'Inspect, clean, split, and document data to prevent leakage.' },
        ],
      },
      {
        title: 'Modeling and evaluation',
        description: 'Train baselines and evaluate them against the real use case.',
        topics: [
          { title: 'Machine-learning baselines', detail: 'Compare simple models before adding complexity.' },
          { title: 'Model evaluation', detail: 'Choose suitable metrics, test edge cases, and analyze errors.' },
          { title: 'Neural networks and embeddings', detail: 'Understand representations, fine-tuning, and retrieval trade-offs.' },
        ],
      },
      {
        title: 'Build AI applications',
        description: 'Connect models to products using reliable interfaces and safeguards.',
        topics: [
          { title: 'Inference APIs and serving', detail: 'Design bounded requests, timeouts, fallbacks, and capacity controls.', skillId: 'rest-apis' },
          { title: 'Retrieval and tool use', detail: 'Ground responses in relevant sources and constrain action-taking.' },
          { title: 'AI quality and safety', detail: 'Evaluate factuality, privacy, prompt attacks, bias, and regressions.', skillId: 'testing' },
        ],
      },
      {
        title: 'Deploy and monitor',
        description: 'Treat the model as a production dependency, not a demo.',
        topics: [
          { title: 'Experiment and model tracking', detail: 'Record datasets, parameters, versions, and evaluation results.' },
          { title: 'Cloud deployment and scaling', detail: 'Set resource limits and access controls for inference workloads.', skillId: 'cloud-aws' },
          { title: 'Monitor quality and cost', detail: 'Track latency, failures, drift, feedback, and per-request costs.' },
        ],
      },
    ],
  },
  {
    id: 'mobile-developer',
    title: 'Mobile Developer',
    category: 'App Development',
    summary: 'Create responsive mobile apps that work well across devices and networks.',
    level: 'Beginner to advanced',
    icon: Smartphone,
    accent: 'emerald',
    stages: [
      {
        title: 'Platform foundations',
        description: 'Choose a platform and learn the core language and device model.',
        topics: [
          { title: 'Choose native or cross-platform', detail: 'Compare platform APIs, shared UI approaches, and team needs.' },
          { title: 'Language and app lifecycle', detail: 'Understand state, lifecycle events, navigation, and background limits.', skillId: 'ts-js' },
          { title: 'Responsive layouts and accessibility', detail: 'Support screen sizes, assistive technology, and input preferences.', skillId: 'css-tailwind' },
        ],
      },
      {
        title: 'App architecture',
        description: 'Build interfaces that work offline and handle changing network conditions.',
        topics: [
          { title: 'Navigation and state management', detail: 'Organize screens and state transitions for larger experiences.', skillId: 'react-ui' },
          { title: 'Networking and API integration', detail: 'Handle authentication, retries, caching, and offline states.', skillId: 'rest-apis' },
          { title: 'Local persistence', detail: 'Store user data securely and support schema changes.' },
        ],
      },
      {
        title: 'Testing and release',
        description: 'Protect functionality across devices and release versions safely.',
        topics: [
          { title: 'Unit and UI testing', detail: 'Test business rules, interactions, and key device behaviors.', skillId: 'testing' },
          { title: 'Performance and crash diagnosis', detail: 'Profile startup, memory, rendering, and network activity.' },
          { title: 'Store release workflow', detail: 'Manage signing, staged rollout, versioning, and release notes.' },
        ],
      },
      {
        title: 'Build a complete app',
        description: 'Showcase a user-centered app with a dependable backend.',
        topics: [
          { title: 'Ship a polished app flow', detail: 'Include onboarding, validation, accessible interactions, and empty states.' },
          { title: 'Automate builds', detail: 'Run repeatable checks and package a release artifact.', skillId: 'testing' },
          { title: 'Document product decisions', detail: 'Explain platform choices, privacy, and offline behavior.' },
        ],
      },
    ],
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    category: 'Security',
    summary: 'Find and reduce software risk across design, code, and operations.',
    level: 'Beginner to advanced',
    icon: Shield,
    accent: 'rose',
    stages: [
      {
        title: 'Core foundations',
        description: 'Learn the systems and security principles behind modern applications.',
        topics: [
          { title: 'Networking and operating systems', detail: 'Understand TCP/IP, DNS, TLS, permissions, and process boundaries.' },
          { title: 'Programming and web architecture', detail: 'Trace a request through browser, API, identity, and storage.', skillId: 'java-ts-go-py' },
          { title: 'Security principles', detail: 'Apply least privilege, defense in depth, and secure defaults.' },
        ],
      },
      {
        title: 'Application security',
        description: 'Identify common weaknesses and prevent them during development.',
        topics: [
          { title: 'Threat modeling', detail: 'Map trust boundaries, assets, attackers, and realistic mitigations.' },
          { title: 'Identity and access control', detail: 'Review authentication, authorization, sessions, and privilege boundaries.' },
          { title: 'Secure coding and review', detail: 'Validate inputs, manage secrets, and assess dependencies.', skillId: 'rest-apis' },
        ],
      },
      {
        title: 'Detection and response',
        description: 'Build an operational loop for finding and responding to security events.',
        topics: [
          { title: 'Logging and alerting', detail: 'Create useful audit trails without logging sensitive data.' },
          { title: 'Vulnerability management', detail: 'Triage findings by impact, likelihood, and reachable attack surface.' },
          { title: 'Incident response', detail: 'Practice containment, evidence preservation, communication, and recovery.' },
        ],
      },
      {
        title: 'Demonstrate security practice',
        description: 'Build a defensive project and explain its risk decisions.',
        topics: [
          { title: 'Harden a sample service', detail: 'Add safe configuration, scoped permissions, and security tests.', skillId: 'testing' },
          { title: 'Automate security checks', detail: 'Integrate dependency, static, and secret scanning into CI.' },
          { title: 'Publish a remediation report', detail: 'Describe findings and fixes using safe, authorized test environments.' },
        ],
      },
    ],
  },
];

const readSavedProgress = (): Record<string, string[]> => {
  try {
    const saved = localStorage.getItem(ROADMAP_PROGRESS_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : {};
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, topics]) =>
          Array.isArray(topics) && topics.every((topic) => typeof topic === 'string')
      )
    ) as Record<string, string[]>;
  } catch {
    return {};
  }
};

const getRecommendedRoadmapId = (profile: SkillTwinProfile | null): string => {
  if (!profile) return 'backend-engineer';
  const roleMatch = ROADMAPS.find(
    (roadmap) => roadmap.profileRoleId === profile.targetRole.id
  );
  if (roleMatch) return roleMatch.id;

  const roleTitle = profile.targetRole.title.toLowerCase();
  if (/data|analytics|machine learning|ai|ml/.test(roleTitle)) return 'data-engineer';
  if (/cloud|devops|platform|sre/.test(roleTitle)) return 'devops-cloud';
  if (/frontend|front-end|ui|web interface/.test(roleTitle)) return 'frontend-engineer';
  if (/full.stack|fullstack|product engineer/.test(roleTitle)) return 'fullstack-engineer';
  if (/mobile|ios|android/.test(roleTitle)) return 'mobile-developer';
  if (/security|application security|infosec/.test(roleTitle)) return 'security-engineer';
  return 'backend-engineer';
};

interface RoadmapTabProps {
  profile: SkillTwinProfile | null;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ profile }) => {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(() =>
    getRecommendedRoadmapId(profile)
  );
  const [search, setSearch] = useState('');
  const [completedTopics, setCompletedTopics] = useState(readSavedProgress);

  useEffect(() => {
    try {
      localStorage.setItem(ROADMAP_PROGRESS_KEY, JSON.stringify(completedTopics));
    } catch {
      // Progress remains available in this session if storage is unavailable.
    }
  }, [completedTopics]);

  const filteredRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ROADMAPS.filter(
      (roadmap) =>
        !query ||
        `${roadmap.title} ${roadmap.category} ${roadmap.summary}`
          .toLowerCase()
          .includes(query)
    );
  }, [search]);

  const selectedRoadmap =
    ROADMAPS.find((roadmap) => roadmap.id === selectedRoadmapId) || ROADMAPS[0];
  const roadmapTopics = selectedRoadmap.stages.flatMap((stage) =>
    stage.topics.map((topic, index) => ({
      ...topic,
      id: `${selectedRoadmap.id}-${stage.title}-${index}`,
    }))
  );
  const checkedTopics = new Set(completedTopics[selectedRoadmap.id] || []);
  const completedCount = roadmapTopics.filter((topic) => checkedTopics.has(topic.id)).length;
  const progressPercentage = Math.round(
    (completedCount / Math.max(1, roadmapTopics.length)) * 100
  );
  const profileGaps = profile?.skills.filter((skill) => skill.status !== 'strong') || [];
  const profileSkillById = new globalThis.Map(
    profile?.skills.map((skill) => [skill.id, skill] as const) || []
  );

  const toggleTopic = (topicId: string) => {
    setCompletedTopics((current) => {
      const next = new Set(current[selectedRoadmap.id] || []);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return { ...current, [selectedRoadmap.id]: [...next] };
    });
  };

  const selectRoadmap = (roadmap: RoadmapTrack) => {
    setSelectedRoadmapId(roadmap.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Icon = selectedRoadmap.icon;

  return (
    <div className="space-y-6">
      <section className="card-surface overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] dark:from-[#14213B] dark:via-[#111827] dark:to-[#211A39]">
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D4ED8] dark:text-[#60A5FA]">
            <Map className="w-4 h-4" />
            SkillTwin learning paths
          </div>
          <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                A clear path from here to there.
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                Explore practical, role-based learning maps. Track what you’ve covered
                and use your SkillTwin evidence gaps to decide what to focus on next.
              </p>
            </div>
            {profile && (
              <div className="max-w-sm rounded-[8px] border border-[#BFDBFE] dark:border-[#1D4ED8]/40 bg-white/80 dark:bg-[#0B1120]/60 p-3.5">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Matched to your target role
                </div>
                <p className="mt-1 text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {profile.targetRole.title}
                </p>
                <p className="mt-1 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                  {profileGaps.length
                    ? `${profileGaps.length} developing or unverified skill areas can guide your next steps.`
                    : 'Your current skill evidence is strong across this role benchmark.'}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] text-[#475569] dark:text-[#CBD5E1]">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
            <span>
              {completedCount} of {roadmapTopics.length} topics completed
            </span>
          </div>
          <div className="flex items-center gap-3 sm:w-64">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-[#1E293B]"
              role="progressbar"
              aria-label={`${selectedRoadmap.title} roadmap progress`}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#1D4ED8] dark:bg-[#3B82F6] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="card-surface p-4 space-y-3">
            <label htmlFor="roadmap-search" className="sr-only">
              Search learning paths
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                id="roadmap-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search learning paths..."
                className="h-9 w-full rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0B1120] pl-9 pr-3 text-[12px] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
            <div className="space-y-1">
              {filteredRoadmaps.map((roadmap) => {
                const RoadmapIcon = roadmap.icon;
                const isSelected = selectedRoadmap.id === roadmap.id;
                const total = roadmap.stages.reduce(
                  (count, stage) => count + stage.topics.length,
                  0
                );
                const done = roadmap.stages.reduce(
                  (count, stage) =>
                    count +
                    stage.topics.filter((_, topicIndex) =>
                      (completedTopics[roadmap.id] || []).includes(
                        `${roadmap.id}-${stage.title}-${topicIndex}`
                      )
                    ).length,
                  0
                );
                return (
                  <button
                    key={roadmap.id}
                    type="button"
                    onClick={() => selectRoadmap(roadmap)}
                    className={`w-full rounded-[7px] p-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#EFF6FF] dark:bg-[#1D4ED8]/15 border border-[#BFDBFE] dark:border-[#1D4ED8]/50'
                        : 'border border-transparent hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-[7px] flex items-center justify-center ${
                          isSelected
                            ? 'bg-white dark:bg-[#1E293B] text-[#1D4ED8] dark:text-[#60A5FA]'
                            : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#CBD5E1]'
                        }`}
                      >
                        <RoadmapIcon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {roadmap.title}
                        </span>
                        <span className="block mt-0.5 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {roadmap.category} · {done}/{total} topics
                        </span>
                      </span>
                      {roadmap.profileRoleId &&
                        profile?.targetRole.id === roadmap.profileRoleId && (
                        <span className="rounded-full bg-[#DBEAFE] dark:bg-[#1D4ED8]/25 px-2 py-0.5 text-[9px] font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                          YOUR ROLE
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              {filteredRoadmaps.length === 0 && (
                <p className="px-2 py-4 text-center text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  No paths match “{search}”.
                </p>
              )}
            </div>
          </div>

          {profile && (
            <div className="card-surface p-4">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                <Sparkles className="w-4 h-4 text-[#B45309] dark:text-[#FBBF24]" />
                Your next focus
              </h2>
              <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Based on the skills needing more evidence for your target role.
              </p>
              {profileGaps.length ? (
                <ul className="mt-3 space-y-2">
                  {profileGaps.slice(0, 4).map((skill) => (
                    <li key={skill.id} className="flex items-start gap-2 text-[11px]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" />
                      <span className="text-[#475569] dark:text-[#CBD5E1]">
                        <strong className="text-[#0F172A] dark:text-[#F8FAFC]">
                          {skill.name}
                        </strong>
                        <span className="block mt-0.5">
                          {skill.verifiedByGithub || skill.verifiedByAssessment
                            ? 'Evidence is developing; strengthen it with another project or assessment.'
                            : skill.recommendedAction}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[11px] text-[#475569] dark:text-[#CBD5E1]">
                  No unverified skill gaps right now. Explore an advanced path or mark a
                  new topic as a learning goal.
                </p>
              )}
            </div>
          )}
        </aside>

        <section className="lg:col-span-8 xl:col-span-9 card-surface p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E2E8F0] dark:border-[#334155]">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-[8px] bg-[#EFF6FF] dark:bg-[#1D4ED8]/15 text-[#1D4ED8] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  {selectedRoadmap.category} · {selectedRoadmap.level}
                </div>
                <h2 className="mt-1 text-[22px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {selectedRoadmap.title} Roadmap
                </h2>
                <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#475569] dark:text-[#CBD5E1]">
                  {selectedRoadmap.summary}
                </p>
              </div>
            </div>
            {selectedRoadmap.profileRoleId &&
              selectedRoadmap.profileRoleId === profile?.targetRole.id && (
              <span className="shrink-0 rounded-full border border-[#BFDBFE] dark:border-[#1D4ED8]/40 px-2.5 py-1 text-[10px] font-semibold text-[#1D4ED8] dark:text-[#93C5FD]">
                Matched to your profile
              </span>
            )}
          </div>

          <div className="pt-6">
            {selectedRoadmap.stages.map((stage, stageIndex) => (
              <div key={stage.title} className="relative pb-7 last:pb-0">
                {stageIndex < selectedRoadmap.stages.length - 1 && (
                  <div className="absolute left-[15px] top-9 bottom-0 w-px bg-[#CBD5E1] dark:bg-[#334155]" />
                )}
                <div className="relative flex items-start gap-4">
                  <span
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      stage.topics.every((_, topicIndex) =>
                        checkedTopics.has(
                          `${selectedRoadmap.id}-${stage.title}-${topicIndex}`
                        )
                      )
                        ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D] dark:border-[#4ADE80] dark:bg-[#14532D]/20 dark:text-[#4ADE80]'
                        : 'border-[#CBD5E1] bg-white text-[#64748B] dark:border-[#475569] dark:bg-[#111827] dark:text-[#94A3B8]'
                    }`}
                  >
                    {stage.topics.every((_, topicIndex) =>
                      checkedTopics.has(
                        `${selectedRoadmap.id}-${stage.title}-${topicIndex}`
                      )
                    ) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="font-mono text-[11px] font-semibold">
                        {String(stageIndex + 1).padStart(2, '0')}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h3 className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {stage.title}
                      </h3>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                        {stage.topics.filter((_, topicIndex) =>
                          checkedTopics.has(
                            `${selectedRoadmap.id}-${stage.title}-${topicIndex}`
                          )
                        ).length}{' '}
                        / {stage.topics.length} topics
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                      {stage.description}
                    </p>
                    <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-2">
                      {stage.topics.map((topic, topicIndex) => {
                        const topicId = `${selectedRoadmap.id}-${stage.title}-${topicIndex}`;
                        const isComplete = checkedTopics.has(topicId);
                        const linkedSkill = topic.skillId
                          ? profileSkillById.get(topic.skillId)
                          : undefined;
                        return (
                          <button
                            key={topicId}
                            type="button"
                            onClick={() => toggleTopic(topicId)}
                            aria-pressed={isComplete}
                            className={`group rounded-[7px] border p-3 text-left transition-colors ${
                              isComplete
                                ? 'border-[#BBF7D0] bg-[#F0FDF4]/70 dark:border-[#166534] dark:bg-[#14532D]/10'
                                : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#111827] dark:hover:border-[#1D4ED8]/60 dark:hover:bg-[#1E293B]'
                            }`}
                          >
                            <span className="flex items-start gap-2.5">
                              <span
                                className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${
                                  isComplete
                                    ? 'border-[#15803D] bg-[#15803D] text-white dark:border-[#4ADE80] dark:bg-[#4ADE80] dark:text-[#052E16]'
                                    : 'border-[#CBD5E1] bg-white dark:border-[#475569] dark:bg-[#0B1120]'
                                }`}
                              >
                                {isComplete && <Check className="w-3 h-3" />}
                              </span>
                              <span className="min-w-0">
                                <span
                                  className={`block text-[12px] font-semibold ${
                                    isComplete
                                      ? 'text-[#166534] dark:text-[#86EFAC]'
                                      : 'text-[#0F172A] dark:text-[#F8FAFC]'
                                  }`}
                                >
                                  {topic.title}
                                </span>
                                <span className="mt-1 block text-[11px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                                  {topic.detail}
                                </span>
                                {linkedSkill && (
                                  <span
                                    className={`mt-2 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide ${
                                      linkedSkill.status === 'strong'
                                        ? 'text-[#15803D] dark:text-[#4ADE80]'
                                        : 'text-[#B45309] dark:text-[#FBBF24]'
                                    }`}
                                  >
                                    {linkedSkill.status === 'strong'
                                      ? 'SkillTwin evidence strong'
                                      : `Profile focus · ${linkedSkill.confidence}%`}
                                  </span>
                                )}
                              </span>
                              <ChevronRight className="mt-0.5 w-3.5 h-3.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[8px] border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0B1120] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 mt-0.5 text-[#64748B] dark:text-[#94A3B8]" />
              <p className="text-[11px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                A flexible guide, not a fixed curriculum. Mark a topic when you’ve learned
                or practiced it; progress is saved in this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompletedTopics((current) => ({ ...current, [selectedRoadmap.id]: [] }))}
              disabled={completedCount === 0}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#475569] dark:text-[#CBD5E1] hover:text-[#B91C1C] dark:hover:text-[#F87171] disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Reset progress
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
