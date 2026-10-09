import sarahAvatar from '../assets/images/sarah_jenks_avatar_1791484161676.jpg';

export type SkillCategory = 'strong' | 'moderate' | 'gap';

export interface SkillItem {
  id: string;
  name: string;
  domain: string;
  subtitle: string;
  confidence: number;
  targetL4: number;
  targetL5: number;
  targetL6: number;
  category: SkillCategory;
  statusLabel: string;
  artifactTitle: string;
  artifactDetail: string;
  whyExplanation: string;
  remediationAction: string;
  remediationType: 'terminal' | 'cloud' | 'challenge' | 'repo';
  remediationTime: string;
  liftEstimate: number;
}

export interface GraphSubNode {
  id: string;
  nodeRef: string;
  title: string;
  domainId: 'jvm' | 'distributed' | 'data' | 'cloud';
  domainTitle: string;
  score: number;
  targetL4: number;
  targetL5: number;
  targetL6: number;
  weight: string;
  status: 'Verified' | 'Adequate' | 'Gap Flagged';
  summary: string;
  telemetryBreakdown: {
    label: string;
    value: string;
    passed: boolean;
  }[];
  prerequisites: {
    code: string;
    name: string;
    score: number;
  }[];
  prescribedAction: {
    title: string;
    description: string;
    duration: string;
    estimatedLift: string;
  };
}

export interface EvidenceRecord {
  id: string;
  repo: string;
  refLabel: string;
  category: 'repo' | 'pr' | 'challenge' | 'commit';
  language: 'Java' | 'Go' | 'SQL' | 'Python';
  skillTitle: string;
  skillSubtitle: string;
  confidence: number;
  depthMetric: string;
  proofType: string;
  proofDetail: string;
  timestamp: string;
  astPreview: {
    filePath: string;
    parserVersion: string;
    idiom: string;
    idiomSub: string;
    resourceCleanup: string;
    resourceSub: string;
    errorSemantics: string;
    errorSub: string;
    lines: {
      lineNumber: number;
      code: string;
      probability: string;
      highlighted?: boolean;
    }[];
  };
}

export interface RemediationGapItem {
  id: string;
  index: number;
  title: string;
  shortName: string;
  deficitDelta: number;
  currentConfidence: number;
  targetBenchmark: number;
  summary: string;
  parserName: string;
  resumeClaim: string;
  diagnosticParagraph: string;
  checks: {
    passed: boolean | 'neutral';
    label: string;
    result: string;
  }[];
  artifactSource: string;
  optionA: {
    badge: string;
    title: string;
    description: string;
    footer: string;
    buttonLabel: string;
  };
  optionB: {
    badge: string;
    title: string;
    description: string;
    footer: string;
    buttonLabel: string;
  };
  liftPoints: number;
}

export const CANDIDATE_PROFILE = {
  name: 'Sarah Jenks',
  id: 'US-9042-SJ',
  auditId: 'ST-8942',
  hexId: '0x9E74A1',
  role: 'Backend Software Engineer',
  levelTitle: 'L5 Senior Backend Engineer',
  division: 'FinTech Core Systems',
  benchmarkName: 'Tier-1 Distributed Systems Benchmark',
  avatarUrl: sarahAvatar,
  baseReadiness: 81,
  evidenceConfidence: 88.4,
  verifiedSkillsCount: 12,
  totalSkillsCount: 15,
  activeReposCount: 6,
  totalCommits: 1420,
  authoredPRs: 82,
  gpgFingerprint: '82FA 41DC 99E2 00B4',
  githubHandle: '@sjenks-dev',
  proofDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
};

export const SKILLS_DATA: SkillItem[] = [
  {
    id: 'java',
    name: 'Java & Concurrency Patterns',
    domain: 'Core / JVM 21',
    subtitle: 'Virtual Threads, Structured Concurrency, JMM',
    confidence: 91,
    targetL4: 75,
    targetL5: 80,
    targetL6: 88,
    category: 'strong',
    statusLabel: 'Exceeds L5 Bar',
    artifactTitle: '4 Production Repositories',
    artifactDetail: '1,420 Commits · 82 PRs authored/reviewed',
    whyExplanation:
      'Java is backed by 420+ GPG-signed commits in org/payment-gateway and org/ledger-service. AST analysis confirmed production usage of Java 21 Virtual Threads, StructuredTaskScope, and lock-free ring buffers with low cyclomatic complexity (avg 4.2).',
    remediationAction: 'Maintain current trunk commit cadence.',
    remediationType: 'repo',
    remediationTime: 'Verified',
    liftEstimate: 0,
  },
  {
    id: 'rest-apis',
    name: 'REST APIs & Architecture',
    domain: 'Contract-Driven Design',
    subtitle: 'OpenAPI 3.1, gRPC, Idempotency & Rate Limiting',
    confidence: 88,
    targetL4: 72,
    targetL5: 80,
    targetL6: 85,
    category: 'strong',
    statusLabel: 'Strong Alignment',
    artifactTitle: 'OpenAPI 3.1 & gRPC Contracts',
    artifactDetail: 'Microservices orchestration, token-bucket filters',
    whyExplanation:
      'Verified across 14 authored schema contracts and 38 merged pull requests implementing idempotency keys, RFC 7807 problem details, and token-bucket rate-limiting interceptors.',
    remediationAction: 'No remediation required for L5 benchmark.',
    remediationType: 'repo',
    remediationTime: 'Verified',
    liftEstimate: 0,
  },
  {
    id: 'sql',
    name: 'SQL & Relational Schema Modeling',
    domain: 'RDBMS Internals',
    subtitle: 'PostgreSQL 15, Partial Indexes, Flyway Migrations',
    confidence: 84,
    targetL4: 70,
    targetL5: 80,
    targetL6: 86,
    category: 'strong',
    statusLabel: 'At Benchmark',
    artifactTitle: 'PostgreSQL Flyway Migrations',
    artifactDetail: 'EXPLAIN query optimization, composite indexing',
    whyExplanation:
      '18 zero-downtime Flyway migration scripts authored in org/ledger-service. Includes composite B-tree partial indexes and verifiable query plan optimizations reducing p99 read latency.',
    remediationAction: 'Optional for L6: Add multi-region read-replica partitioning proof.',
    remediationType: 'repo',
    remediationTime: 'Verified',
    liftEstimate: 0,
  },
  {
    id: 'git',
    name: 'Git & Collaborative Delivery',
    domain: 'SDLC Cadence',
    subtitle: 'Trunk-Based Development, Code Review Rigor',
    confidence: 82,
    targetL4: 75,
    targetL5: 82,
    targetL6: 85,
    category: 'strong',
    statusLabel: 'Validated',
    artifactTitle: 'Linear Ticket Tracing & PR Reviews',
    artifactDetail: '97.8% GPG signed commits, +1.4 review ratio',
    whyExplanation:
      'Consistent atomic commit history with 97.8% hardware GPG signature verification and high-signal peer review comments across 4 core services.',
    remediationAction: 'Verified via GitHub Enterprise webhook telemetry.',
    remediationType: 'repo',
    remediationTime: 'Verified',
    liftEstimate: 0,
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot & Microservices',
    domain: 'Framework Architecture',
    subtitle: 'Spring Boot 3.2, Security Filter Chains, Actuator',
    confidence: 74,
    targetL4: 70,
    targetL5: 80,
    targetL6: 85,
    category: 'moderate',
    statusLabel: 'Borderline L5',
    artifactTitle: 'Spring Data JPA, OAuth2 Security',
    artifactDetail: '2 Services using Spring Boot 3.2, Actuator metrics',
    whyExplanation:
      'Strong controller and service-layer patterns detected in org/auth-service, but custom auto-configuration and resilient circuit-breaker bulkhead tests are only partially covered (74% vs 80% target).',
    remediationAction: 'Add Resilience4j bulkhead integration test suite.',
    remediationType: 'repo',
    remediationTime: '25m',
    liftEstimate: 2,
  },
  {
    id: 'docker',
    name: 'Docker & Container Orchestration',
    domain: 'Cloud & Deployment',
    subtitle: 'OCI Images, Multi-Stage Builds, Rootless Execution',
    confidence: 42,
    targetL4: 65,
    targetL5: 75,
    targetL6: 82,
    category: 'gap',
    statusLabel: 'Evidence Gap',
    artifactTitle: '1 Basic Single-Stage Dockerfile',
    artifactDetail: 'No multi-stage caching or distroless hardening found',
    whyExplanation:
      'Docker is listed on your resume, but SkillTwin found only limited repository evidence (a single basic Dockerfile in an auxiliary repo). Add a containerized deployment with multi-stage caching and non-root execution to strengthen this signal.',
    remediationAction: 'Submit containerized repo or execute 15m deployment verification suite.',
    remediationType: 'terminal',
    remediationTime: '15m',
    liftEstimate: 3,
  },
  {
    id: 'system-design',
    name: 'System Design & Distributed Caching',
    domain: 'Distributed Systems',
    subtitle: 'Redis Cluster, Cache-Aside, Stampede Mitigation',
    confidence: 38,
    targetL4: 60,
    targetL5: 80,
    targetL6: 90,
    category: 'gap',
    statusLabel: 'Evidence Gap',
    artifactTitle: 'In-Memory ConcurrentHashMap Only',
    artifactDetail: '0 Redis/Memcached cluster eviction policies in repos',
    whyExplanation:
      'High-volume data read logic is present in your controllers, but no dedicated distributed caching layer (Redis/Memcached), TTL invalidation strategy, or thundering-herd mutex protection was detected in repository telemetry.',
    remediationAction: 'Complete 20-minute Distributed Cache Fuzzing Sandbox or link Redis repo.',
    remediationType: 'challenge',
    remediationTime: '20m',
    liftEstimate: 3,
  },
  {
    id: 'aws',
    name: 'AWS Cloud Architecture (IaC)',
    domain: 'Cloud Infrastructure',
    subtitle: 'ECS Fargate, RDS Multi-AZ, IAM Least-Privilege, Terraform',
    confidence: 31,
    targetL4: 60,
    targetL5: 70,
    targetL6: 85,
    category: 'gap',
    statusLabel: 'Evidence Gap',
    artifactTitle: '0 Terraform / CDK Definitions',
    artifactDetail: 'Resume claims ECS/RDS; 0 .tf manifests in public repos',
    whyExplanation:
      'AWS ECS and RDS are listed on your resume, but zero Terraform modules, CloudFormation templates, or AWS CDK constructs were detected across your connected repositories. Connect a private IaC repository or run a read-only IAM audit to verify.',
    remediationAction: 'Link AWS read-only OIDC audit role or connect Terraform repository.',
    remediationType: 'cloud',
    remediationTime: '10m',
    liftEstimate: 2,
  },
];

export const GRAPH_NODES: GraphSubNode[] = [
  {
    id: 'java21',
    nodeRef: 'L5-JVM-01',
    title: 'Java 21 (LTS Features)',
    domainId: 'jvm',
    domainTitle: '1. Core JVM & Language Execution',
    score: 91,
    targetL4: 75,
    targetL5: 80,
    targetL6: 88,
    weight: '1.2x',
    status: 'Verified',
    summary:
      'Production AST telemetry confirms idiomatic usage of Virtual Threads (JEP 444), Structured Concurrency (JEP 453), and sealed domain records across 420+ signed commits.',
    telemetryBreakdown: [
      { label: 'VirtualThread / StructuredTaskScope AST hits:', value: '34 occurrences', passed: true },
      { label: 'Sealed interface & Record pattern matching:', value: '68 classes', passed: true },
      { label: 'ThreadLocal pinning warnings:', value: '0 detected', passed: true },
    ],
    prerequisites: [
      { code: 'L4-JVM', name: 'Object Lifecycle & Generics', score: 95 },
      { code: 'L4-MEM', name: 'JVM Memory Model Fundamentals', score: 90 },
    ],
    prescribedAction: {
      title: 'Competency Verified (Exceeds L5 Bar)',
      description: 'Candidate exceeds L5 threshold by +11%. Eligible for L6 Staff concurrency evaluation.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'multithreading',
    nodeRef: 'L5-JVM-02',
    title: 'Multithreading & Executors',
    domainId: 'jvm',
    domainTitle: '1. Core JVM & Language Execution',
    score: 89,
    targetL4: 72,
    targetL5: 80,
    targetL6: 86,
    weight: '1.4x',
    status: 'Verified',
    summary:
      'Deterministic lock ordering, CompletableFuture pipeline composition, and non-blocking ring-buffer dispatch verified in payment ledger repositories.',
    telemetryBreakdown: [
      { label: 'CompletableFuture / ExecutorService configs:', value: '19 modules', passed: true },
      { label: 'Deadlock & race condition static checks:', value: '100% pass', passed: true },
      { label: 'Uncaught exception handler coverage:', value: '96.4%', passed: true },
    ],
    prerequisites: [
      { code: 'L4-JVM', name: 'Synchronization Primitives', score: 92 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Strong multi-threaded execution evidence across high-throughput payment services.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'gc',
    nodeRef: 'L5-JVM-03',
    title: 'Garbage Collection Tuning',
    domainId: 'jvm',
    domainTitle: '1. Core JVM & Language Execution',
    score: 78,
    targetL4: 65,
    targetL5: 78,
    targetL6: 85,
    weight: '0.9x',
    status: 'Adequate',
    summary:
      'ZGC and G1GC JVM flags configured in production startup scripts; low allocation churn observed in hot loops.',
    telemetryBreakdown: [
      { label: 'Zero-allocation hot-path buffers:', value: '11 classes', passed: true },
      { label: 'ZGC generational flag configuration:', value: 'Present', passed: true },
      { label: 'JFR profiling artifact attachments:', value: '1 PR attached', passed: false },
    ],
    prerequisites: [
      { code: 'L4-MEM', name: 'Heap & Generation Layout', score: 84 },
    ],
    prescribedAction: {
      title: 'Optional L6 Enhancement',
      description: 'Attach Java Flight Recorder (JFR) flamegraph analysis to verify sub-millisecond pause tuning.',
      duration: '15m',
      estimatedLift: '+4%',
    },
  },
  {
    id: 'rest_grpc',
    nodeRef: 'L5-DIST-01',
    title: 'REST & gRPC Contracts',
    domainId: 'distributed',
    domainTitle: '2. Distributed Architecture',
    score: 88,
    targetL4: 75,
    targetL5: 80,
    targetL6: 86,
    weight: '1.1x',
    status: 'Verified',
    summary:
      'Protobuf v3 backward-compatible field numbering and OpenAPI 3.1 strict schema validation verified across 14 service boundaries.',
    telemetryBreakdown: [
      { label: 'Protobuf / OpenAPI schema definitions:', value: '14 contracts', passed: true },
      { label: 'Idempotency-Key middleware enforcement:', value: 'Verified', passed: true },
      { label: 'Breaking wire-change CI checks:', value: 'Enabled (buf)', passed: true },
    ],
    prerequisites: [
      { code: 'L4-HTTP', name: 'HTTP/2 & Serialization Formats', score: 91 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Contract-first API design meets all L5 distributed systems criteria.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'kafka',
    nodeRef: 'L5-DIST-02',
    title: 'Event-Driven (Kafka)',
    domainId: 'distributed',
    domainTitle: '2. Distributed Architecture',
    score: 82,
    targetL4: 70,
    targetL5: 80,
    targetL6: 88,
    weight: '1.3x',
    status: 'Verified',
    summary:
      'Transactional outbox pattern, dead-letter queue (DLQ) replay consumers, and consumer-group rebalance listeners verified in org/ledger-service.',
    telemetryBreakdown: [
      { label: 'Transactional Outbox / KafkaProducer:', value: '8 services', passed: true },
      { label: 'DLQ backoff & poison-pill handling:', value: 'Verified', passed: true },
      { label: 'Idempotent consumer deduplication:', value: 'Verified', passed: true },
    ],
    prerequisites: [
      { code: 'L4-MSG', name: 'Asynchronous Messaging Queues', score: 87 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Event-driven producer and consumer resilience meets L5 benchmark.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'caching',
    nodeRef: 'L5-DIST-03',
    title: 'Distributed Caching',
    domainId: 'distributed',
    domainTitle: '2. Distributed Architecture',
    score: 38,
    targetL4: 65,
    targetL5: 80,
    targetL6: 88,
    weight: '1.3x',
    status: 'Gap Flagged',
    summary:
      'Zero Redis or Memcached cluster configuration, distributed locking primitives, or TTL eviction policies found across 90-day verified GitHub commits and PR reviews.',
    telemetryBreakdown: [
      { label: 'lettuce-core / jedis dependency:', value: '0 occurrences', passed: false },
      { label: 'Cache-Aside pattern commits:', value: 'Not detected', passed: false },
      { label: 'Cache stampede safeguards:', value: 'Unverified', passed: false },
    ],
    prerequisites: [
      { code: 'L4-JVM', name: 'Concurrency Primitives', score: 89 },
      { code: 'L4-NET', name: 'Non-blocking Network I/O', score: 85 },
    ],
    prescribedAction: {
      title: 'SkillTwin Remediation Challenge',
      description:
        '20-minute sandbox: Implement Cache Invalidation, Thundering Herd mitigation, and a distributed Mutex using Redis Sentinel.',
      duration: '20m',
      estimatedLift: '+42% Node / +3% Overall',
    },
  },
  {
    id: 'postgres',
    nodeRef: 'L5-DB-01',
    title: 'Relational DB / PostgreSQL',
    domainId: 'data',
    domainTitle: '3. Data Systems & Storage',
    score: 84,
    targetL4: 72,
    targetL5: 80,
    targetL6: 86,
    weight: '1.3x',
    status: 'Verified',
    summary:
      'ACID isolation levels, HikariCP connection pool sizing, and optimistic locking version columns verified in core ledger schemas.',
    telemetryBreakdown: [
      { label: 'SERIALIZABLE / READ COMMITTED tx boundaries:', value: '24 methods', passed: true },
      { label: 'HikariCP pool & leak detection config:', value: 'Verified', passed: true },
      { label: 'Row-level locking (SELECT FOR UPDATE):', value: '6 queries', passed: true },
    ],
    prerequisites: [
      { code: 'L4-SQL', name: 'Normalized Schema Design', score: 90 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Meets L5 Data Systems bar across production ledger tables.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'query_opt',
    nodeRef: 'L5-DB-02',
    title: 'Query Optimization & Indexing',
    domainId: 'data',
    domainTitle: '3. Data Systems & Storage',
    score: 86,
    targetL4: 70,
    targetL5: 80,
    targetL6: 86,
    weight: '1.1x',
    status: 'Verified',
    summary:
      'Composite B-tree indexes, GIN JSONB indexing, and N+1 query elimination verified across 18 database PRs.',
    telemetryBreakdown: [
      { label: 'Partial & covering index definitions:', value: '14 indexes', passed: true },
      { label: 'EXPLAIN ANALYZE PR attachments:', value: '9 PRs', passed: true },
      { label: 'N+1 ORM query prevention tests:', value: 'Verified', passed: true },
    ],
    prerequisites: [
      { code: 'L4-SQL', name: 'Relational Algebra & Joins', score: 88 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Strong empirical evidence of production query tuning.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'flyway',
    nodeRef: 'L5-DB-03',
    title: 'Flyway Schema Migrations',
    domainId: 'data',
    domainTitle: '3. Data Systems & Storage',
    score: 90,
    targetL4: 70,
    targetL5: 78,
    targetL6: 84,
    weight: '0.8x',
    status: 'Verified',
    summary:
      'Expand-and-contract zero-downtime schema migrations and non-blocking index creation (`CREATE INDEX CONCURRENTLY`) verified.',
    telemetryBreakdown: [
      { label: 'Versioned Flyway DDL scripts:', value: '18 migrations', passed: true },
      { label: 'CONCURRENTLY lock-safe index creation:', value: '100% compliant', passed: true },
      { label: 'Rollback safety verification:', value: 'Verified', passed: true },
    ],
    prerequisites: [
      { code: 'L4-DB', name: 'DDL & Schema Versioning', score: 92 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Exceeds L5 migration safety standards.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
  {
    id: 'docker',
    nodeRef: 'L5-OPS-01',
    title: 'Docker & OCI Images',
    domainId: 'cloud',
    domainTitle: '4. Cloud & Deployment Systems',
    score: 42,
    targetL4: 65,
    targetL5: 75,
    targetL6: 82,
    weight: '1.0x',
    status: 'Gap Flagged',
    summary:
      'Only generic single-stage Dockerfiles detected. Missing multi-stage build layer caching, distroless base images, and non-root USER directives.',
    telemetryBreakdown: [
      { label: 'Distroless / Non-root execution:', value: '0 manifests', passed: false },
      { label: 'Multi-stage caching layers:', value: 'Not detected', passed: false },
      { label: 'Base image pin sha256:', value: 'Present in 2 repos', passed: true },
    ],
    prerequisites: [
      { code: 'L4-LINUX', name: 'Linux Process & Filesystem Basics', score: 84 },
    ],
    prescribedAction: {
      title: '15m Cloud Sandbox Challenge',
      description:
        'Optimize a 1.2GB single-stage Java container manifest into a hardened, rootless multi-stage OCI image under 90MB.',
      duration: '15m',
      estimatedLift: '+33% Node / +3% Overall',
    },
  },
  {
    id: 'aws_tf',
    nodeRef: 'L5-OPS-02',
    title: 'AWS Infra / Terraform',
    domainId: 'cloud',
    domainTitle: '4. Cloud & Deployment Systems',
    score: 31,
    targetL4: 60,
    targetL5: 75,
    targetL6: 85,
    weight: '1.1x',
    status: 'Gap Flagged',
    summary:
      'Zero Terraform (.tf), OpenTofu, or AWS CDK definitions detected across synced repositories despite resume claims of ECS and RDS management.',
    telemetryBreakdown: [
      { label: 'Terraform / OpenTofu modules:', value: '0 .tf files located', passed: false },
      { label: 'AWS CDK / CloudFormation constructs:', value: '0 packages', passed: false },
      { label: 'IAM least-privilege policy JSON:', value: 'Unverified', passed: false },
    ],
    prerequisites: [
      { code: 'L4-NET', name: 'VPC & Subnet Routing Basics', score: 79 },
    ],
    prescribedAction: {
      title: 'Connect AWS OIDC Read-Only Role or Private VCS',
      description:
        'Attach a read-only IAM inspection role or link private infrastructure repositories to validate ECS/RDS provisioning.',
      duration: '10m',
      estimatedLift: '+39% Node / +2% Overall',
    },
  },
  {
    id: 'cicd',
    nodeRef: 'L5-OPS-03',
    title: 'CI/CD & Trunk Cadence',
    domainId: 'cloud',
    domainTitle: '4. Cloud & Deployment Systems',
    score: 82,
    targetL4: 70,
    targetL5: 78,
    targetL6: 84,
    weight: '1.0x',
    status: 'Verified',
    summary:
      'GitHub Actions workflows with matrix test runners, deterministic Maven/Gradle dependency locking, and automated canary checks verified.',
    telemetryBreakdown: [
      { label: 'GitHub Actions / GitLab CI pipelines:', value: '6 workflows', passed: true },
      { label: 'Automated integration test gates:', value: '94.2% coverage', passed: true },
      { label: 'Dependency vulnerability scanning:', value: 'Enabled', passed: true },
    ],
    prerequisites: [
      { code: 'L4-GIT', name: 'Automated Build Pipelines', score: 88 },
    ],
    prescribedAction: {
      title: 'Competency Verified',
      description: 'Meets L5 continuous delivery standards.',
      duration: '0m',
      estimatedLift: 'Verified',
    },
  },
];

export const EVIDENCE_LEDGER: EvidenceRecord[] = [
  {
    id: 'ev-1',
    repo: 'org/payment-gateway',
    refLabel: 'ref: master (PR #412)',
    category: 'repo',
    language: 'Java',
    skillTitle: 'Java 21 · High Concurrency',
    skillSubtitle: 'Virtual Threads, Non-blocking I/O ring',
    confidence: 91,
    depthMetric: '420 Commits · Low Cyclomatic',
    proofType: 'GPG: 0x82FA41DC99',
    proofDetail: 'Verified Keybase ID',
    timestamp: '2026-10-04 14:22 UTC',
    astPreview: {
      filePath: 'org/payment-gateway: TransactionCoordinator.java',
      parserVersion: 'TREE-SITTER JAVA v0.20',
      idiom: 'Structured Concurrency',
      idiomSub: 'JEP 453 compliance validated',
      resourceCleanup: 'Deterministic',
      resourceSub: 'Auto-closable scope closure',
      errorSemantics: 'Symmetric Failover',
      errorSub: 'Custom fault isolation handlers',
      lines: [
        {
          lineNumber: 148,
          code: 'public class TransactionCoordinator implements DistributedLockAware {',
          probability: '1.00',
        },
        {
          lineNumber: 149,
          code: '  // Guard against cross-partition deadlocks using non-blocking virtual threads',
          probability: '-',
        },
        {
          lineNumber: 150,
          code: '  try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {',
          probability: '0.97 [SAGA_COORD]',
          highlighted: true,
        },
        {
          lineNumber: 151,
          code: '    Supplier<Payment> tx = scope.fork(() -> ledgerClient.reserve(orderId));',
          probability: '0.94',
        },
        {
          lineNumber: 152,
          code: '    Supplier<Receipt> rc = scope.fork(() -> auditClient.commitLog(orderId));',
          probability: '0.91',
        },
        {
          lineNumber: 153,
          code: '    scope.join().throwIfFailed(PartitionExhaustionException::new);',
          probability: '0.99 [FAIL_EARLY]',
        },
        {
          lineNumber: 154,
          code: '  }',
          probability: '-',
        },
      ],
    },
  },
  {
    id: 'ev-2',
    repo: 'org/payment-gateway',
    refLabel: 'ref: proto/v3.1 (PR #418)',
    category: 'pr',
    language: 'Java',
    skillTitle: 'OpenAPI 3.1 & gRPC',
    skillSubtitle: 'Rate Limiting Token-Bucket Filters',
    confidence: 88,
    depthMetric: '14 Schema Contracts Authored',
    proofType: 'Co-authored / Signed',
    proofDetail: '4 Peer Approvals',
    timestamp: '2026-09-28 09:11 UTC',
    astPreview: {
      filePath: 'org/payment-gateway: RateLimiterGrpcInterceptor.java',
      parserVersion: 'TREE-SITTER JAVA v0.20',
      idiom: 'Token-Bucket Backpressure',
      idiomSub: 'Non-blocking atomic CAS refill',
      resourceCleanup: 'Bounded Context',
      resourceSub: 'gRPC Context deadline propagation',
      errorSemantics: 'RESOURCE_EXHAUSTED',
      errorSub: 'Strict Retry-After metadata trailer',
      lines: [
        {
          lineNumber: 62,
          code: 'public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(',
          probability: '0.98',
        },
        {
          lineNumber: 63,
          code: '    ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {',
          probability: '0.98',
        },
        {
          lineNumber: 64,
          code: '  String tenantId = headers.get(TENANT_KEY);',
          probability: '0.92',
        },
        {
          lineNumber: 65,
          code: '  if (!tokenBucketRing.tryConsume(tenantId, 1, Duration.ofMillis(5))) {',
          probability: '0.99 [RATE_LIMIT]',
          highlighted: true,
        },
        {
          lineNumber: 66,
          code: '    call.close(Status.RESOURCE_EXHAUSTED.withDescription("Quota exceeded"), trailerWithRetry());',
          probability: '0.96 [GRPC_STATUS]',
        },
        {
          lineNumber: 67,
          code: '    return new ServerCall.Listener<ReqT>() {};',
          probability: '0.95',
        },
        {
          lineNumber: 68,
          code: '  }',
          probability: '-',
        },
      ],
    },
  },
  {
    id: 'ev-3',
    repo: 'org/ledger-service',
    refLabel: 'ref: schema/v18',
    category: 'commit',
    language: 'SQL',
    skillTitle: 'PostgreSQL Flyway Migrations',
    skillSubtitle: 'EXPLAIN query optimization, Partial Indexes',
    confidence: 84,
    depthMetric: '18 Migration DDLs Authored',
    proofType: 'GPG: 0x82FA41DC99',
    proofDetail: 'SHA: 8e910fa (Merged)',
    timestamp: '2026-09-19 18:40 UTC',
    astPreview: {
      filePath: 'org/ledger-service: V18__Partitioned_Ledger_Indices.sql',
      parserVersion: 'PG-QUERY AST v15.4',
      idiom: 'Zero-Downtime Indexing',
      idiomSub: 'CONCURRENTLY non-blocking DDL',
      resourceCleanup: 'Lock Timeout Guard',
      resourceSub: 'lock_timeout = 2000ms enforced',
      errorSemantics: 'Idempotent DDL',
      errorSub: 'Partial predicate filter active',
      lines: [
        {
          lineNumber: 1,
          code: "SET lock_timeout = '2000ms';",
          probability: '0.99 [LOCK_GUARD]',
        },
        {
          lineNumber: 2,
          code: "SET statement_timeout = '60000ms';",
          probability: '0.95',
        },
        {
          lineNumber: 3,
          code: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_entries_unsettled_tenant',
          probability: '0.99 [ZERO_DOWNTIME]',
          highlighted: true,
        },
        {
          lineNumber: 4,
          code: '  ON ledger_entries (tenant_id, created_at DESC)',
          probability: '0.96',
        },
        {
          lineNumber: 5,
          code: '  INCLUDE (amount_cents, currency_code, idempotency_hash)',
          probability: '0.98 [COVERING_IDX]',
        },
        {
          lineNumber: 6,
          code: "  WHERE settlement_state IN ('PENDING', 'AUTHORIZED');",
          probability: '0.97 [PARTIAL_PRED]',
        },
      ],
    },
  },
  {
    id: 'ev-4',
    repo: 'org/auth-service',
    refLabel: 'ref: sec/oauth-refresh (PR #108)',
    category: 'pr',
    language: 'Java',
    skillTitle: 'Spring Security & OAuth2',
    skillSubtitle: 'JWT Rotation Filter & Revocation Lists',
    confidence: 74,
    depthMetric: 'Middle AST Complexity',
    proofType: 'Authored PR #108',
    proofDetail: 'Squash Commit Verify',
    timestamp: '2026-09-05 11:05 UTC',
    astPreview: {
      filePath: 'org/auth-service: JwtRevocationFilter.java',
      parserVersion: 'TREE-SITTER JAVA v0.20',
      idiom: 'OncePerRequest Security Filter',
      idiomSub: 'Constant-time signature digest check',
      resourceCleanup: 'SecurityContext Clear',
      resourceSub: 'Finally-block context disposal',
      errorSemantics: 'RFC 6750 Bearer Error',
      errorSub: 'Strict 401 WWW-Authenticate header',
      lines: [
        {
          lineNumber: 88,
          code: '@Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)',
          probability: '0.94',
        },
        {
          lineNumber: 89,
          code: '    throws ServletException, IOException {',
          probability: '-',
        },
        {
          lineNumber: 90,
          code: '  Optional<JwsClaims> claims = tokenVerifier.verifyAndDecode(req.getHeader("Authorization"));',
          probability: '0.92',
        },
        {
          lineNumber: 91,
          code: '  if (claims.isPresent() && revocationStore.isRevoked(claims.get().jti())) {',
          probability: '0.96 [TOKEN_REVOKE]',
          highlighted: true,
        },
        {
          lineNumber: 92,
          code: '    SecurityContextHolder.clearContext();',
          probability: '0.98',
        },
        {
          lineNumber: 93,
          code: '    res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token JTI revoked");',
          probability: '0.95',
        },
        {
          lineNumber: 94,
          code: '    return;',
          probability: '-',
        },
      ],
    },
  },
  {
    id: 'ev-5',
    repo: 'takehome-async-eval',
    refLabel: 'benchmark: sandboxed-exec-4',
    category: 'challenge',
    language: 'Go',
    skillTitle: 'Distributed Redlock Algorithm',
    skillSubtitle: 'Fuzzing resilience against split-brain',
    confidence: 94,
    depthMetric: 'Zero race conditions in 10k ops',
    proofType: 'Execution Attestation',
    proofDetail: 'Proctored sandbox environment',
    timestamp: '2026-08-24 16:55 UTC',
    astPreview: {
      filePath: 'takehome-async-eval: RedlockFuzzingHarness.go',
      parserVersion: 'TREE-SITTER GO v0.21',
      idiom: 'Quorum Clock-Drift Guard',
      idiomSub: 'Majority N/2+1 fencing token validation',
      resourceCleanup: 'Deferred Lease Release',
      resourceSub: 'Lua atomic compare-and-delete',
      errorSemantics: 'QuorumLostError',
      errorSub: 'Immediate rollback on clock skew',
      lines: [
        {
          lineNumber: 41,
          code: 'func (r *RedlockCoordinator) AcquireQuorum(ctx context.Context, key string, ttl time.Duration) (*Lease, error) {',
          probability: '0.99',
        },
        {
          lineNumber: 42,
          code: '  start := time.Now()',
          probability: '0.95',
        },
        {
          lineNumber: 43,
          code: '  acks, fencingToken := r.broadcastSetNX(ctx, key, ttl)',
          probability: '0.97 [QUORUM_VOTE]',
        },
        {
          lineNumber: 44,
          code: '  drift := time.Duration(float64(ttl)*r.clockDriftFactor) + 2*time.Millisecond',
          probability: '0.98 [DRIFT_CALC]',
          highlighted: true,
        },
        {
          lineNumber: 45,
          code: '  validity := ttl - time.Since(start) - drift',
          probability: '0.99',
        },
        {
          lineNumber: 46,
          code: '  if acks >= (len(r.nodes)/2)+1 && validity > 0 {',
          probability: '1.00 [MAJORITY_LOCK]',
        },
        {
          lineNumber: 47,
          code: '    return &Lease{Key: key, Token: fencingToken, Validity: validity}, nil',
          probability: '0.98',
        },
      ],
    },
  },
];

export const REMEDIATION_GAPS: RemediationGapItem[] = [
  {
    id: 'docker',
    index: 1,
    title: 'Docker & Containerization Architecture',
    shortName: 'Docker',
    deficitDelta: -33,
    currentConfidence: 42,
    targetBenchmark: 75,
    summary:
      'Discrepancy detected between self-reported production expertise and automated abstract syntax tree (AST) parse.',
    parserName: 'PARSER: DOCKER-LINT-v4',
    resumeClaim: 'Multi-stage rootless container deployments at enterprise scale',
    diagnosticParagraph:
      'Resume asserts "Multi-stage rootless container deployments at enterprise scale". However, public GitHub repository inspection found only generic single-stage node/java manifests lacking layer optimization, multi-architecture buildx setups, and security hardening.',
    checks: [
      { passed: false, label: 'Distroless / Non-root execution:', result: '0 manifests' },
      { passed: false, label: 'Multi-stage caching layers:', result: 'Not detected' },
      { passed: true, label: 'Base image pin sha256:', result: 'Present in 2 repos' },
    ],
    artifactSource: 'github.com/sjenks-dev (6 repos)',
    optionA: {
      badge: 'Option A: CLI Proof',
      title: 'Terminal Diagnostic CLI',
      description:
        'Run the SkillTwin CLI against local Docker configs to emit a zero-knowledge structural attestation without uploading company IP.',
      footer: 'curl -sSL https://skilltwin.io/cli | bash',
      buttonLabel: 'Generate CLI Token',
    },
    optionB: {
      badge: 'Option B: Ephemeral Lab',
      title: '15m Cloud Sandbox Challenge',
      description:
        'Interactive browser terminal: optimize a slow 1.2GB image into a secure sub-90MB distroless multi-stage binary.',
      footer: 'Instant Verification (+33% Node / +3% Readiness)',
      buttonLabel: 'Launch 15m Sandbox Challenge',
    },
    liftPoints: 3,
  },
  {
    id: 'aws',
    index: 2,
    title: 'AWS & Cloud Infrastructure (IaC)',
    shortName: 'AWS Infrastructure',
    deficitDelta: -39,
    currentConfidence: 31,
    targetBenchmark: 70,
    summary:
      'Zero verifiable IaC telemetry found. Claimed AWS ECS & RDS architecture not grounded in public repository code.',
    parserName: 'IAC SCAN ENGINE',
    resumeClaim: 'AWS ECS Fargate, RDS PostgreSQL Multi-AZ & CloudWatch log streaming',
    diagnosticParagraph:
      'Candidate profile highlights extensive "AWS ECS Fargate, RDS PostgreSQL Multi-AZ & CloudWatch log streaming". Telemetry scanners identified 0 Terraform modules, 0 AWS CDK scripts, and 0 CloudFormation templates across all submitted public sources.',
    checks: [
      { passed: false, label: 'Terraform / OpenTofu:', result: '0 .tf files located' },
      { passed: false, label: 'AWS CDK Constructs:', result: '0 packages detected' },
      { passed: 'neutral', label: 'AWS IAM Role Policies:', result: 'Unchecked (Private IP)' },
    ],
    artifactSource: 'Risk Rating: High (Claim unverified in public repos)',
    optionA: {
      badge: 'Option A: Read-Only Audit',
      title: 'Connect AWS IAM OIDC Role',
      description:
        'Attach a temporary read-only IAM policy validating ECS/RDS cluster metadata and Terraform state safely.',
      footer: 'SecurityProfile: ReadOnlyAuditMetadata',
      buttonLabel: 'Verify via AWS OIDC Link',
    },
    optionB: {
      badge: 'Option B: Enterprise VCS',
      title: 'Private Repo Link (GitLab/GitHub)',
      description:
        'Grant SkillTwin ephemeral zero-retention metadata read on private infrastructure repositories.',
      footer: 'SOC2 Type II Encrypted · Zero Code Storage',
      buttonLabel: 'Link Private IaC Repo',
    },
    liftPoints: 2,
  },
  {
    id: 'system-design',
    index: 3,
    title: 'System Design & Distributed Caching',
    shortName: 'Distributed Caching',
    deficitDelta: -42,
    currentConfidence: 38,
    targetBenchmark: 80,
    summary:
      'High volume Java controllers observed, but missing state invalidation, Redis cluster, or Cache-Aside strategies.',
    parserName: 'CACHE_PATTERN_V2',
    resumeClaim: 'High-throughput distributed caching & low-latency state partitioning',
    diagnosticParagraph:
      'Candidate scores in the 91st percentile for Java concurrency and PostgreSQL query optimization, but shows no code evidence managing Redis/Memcached race conditions, cache stampedes, or distributed invalidations required for L5/L6.',
    checks: [
      { passed: true, label: 'Database Transactions & ACID:', result: 'Verified (91%)' },
      { passed: false, label: 'Cache-Aside / Write-Through:', result: '0 references' },
      { passed: false, label: 'Mutex / Stampede prevention:', result: 'Not found' },
    ],
    artifactSource: 'Required for: Real-Time Ledger & Payments Benchmark',
    optionA: {
      badge: 'Recommended Route',
      title: 'Async Cache Fuzzing Scenario',
      description:
        '20-minute distributed systems simulator: resolve thundering herd problem under 50k RPS load injection.',
      footer: '20 min auto-scored test (+42% Node / +3% Readiness)',
      buttonLabel: 'Launch 20m Cache Challenge',
    },
    optionB: {
      badge: 'Manual Route',
      title: 'Staff Bar Raiser Architecture Review',
      description:
        'Schedule a structured 45-minute live architectural review with a Principal Systems Engineer on distributed consensus.',
      footer: 'Requires Staff Eng scheduling',
      buttonLabel: 'Schedule Architecture Review',
    },
    liftPoints: 3,
  },
];
