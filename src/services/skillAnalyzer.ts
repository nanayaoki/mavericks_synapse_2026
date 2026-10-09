import {
  EvaluatedSkill,
  EvidenceItem,
  RoleTemplate,
  SkillTwinProfile,
  SkillStatus,
} from '../types/skilltwin';
import { evaluateAtsResume } from './atsAnalyzer';

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'backend-engineer',
    title: 'Backend Software Engineer',
    level: 'Senior (L5)',
    description: 'APIs, databases, backend services, caching, and cloud deployment.',
    requiredSkills: [
      {
        id: 'java-ts-go-py',
        name: 'Backend Language (Java / Go / Python / Node)',
        category: 'Languages',
        targetScore: 80,
        keywords: ['java', 'go', 'golang', 'python', 'node', 'typescript', 'javascript', 'rust', 'c#', 'kotlin'],
      },
      {
        id: 'rest-apis',
        name: 'REST APIs & Backend Services',
        category: 'Frameworks & APIs',
        targetScore: 80,
        keywords: ['api', 'rest', 'graphql', 'grpc', 'express', 'spring', 'fastapi', 'django', 'flask', 'nest', 'backend', 'server', 'http'],
      },
      {
        id: 'sql-db',
        name: 'SQL & Relational Databases',
        category: 'Data & Storage',
        targetScore: 75,
        keywords: ['sql', 'postgres', 'postgresql', 'mysql', 'sqlite', 'prisma', 'drizzle', 'database', 'schema', 'migration', 'typeorm'],
      },
      {
        id: 'git-workflow',
        name: 'Git & Collaborative Workflows',
        category: 'Engineering Practices',
        targetScore: 80,
        keywords: ['git', 'github', 'commit', 'pull request', 'ci', 'workflow', 'version control'],
      },
      {
        id: 'docker',
        name: 'Docker & Containerization',
        category: 'Cloud & DevOps',
        targetScore: 75,
        keywords: ['docker', 'dockerfile', 'container', 'compose', 'kubernetes', 'k8s', 'helm', 'oci'],
      },
      {
        id: 'system-design',
        name: 'System Design & Caching',
        category: 'Architecture',
        targetScore: 75,
        keywords: ['redis', 'cache', 'caching', 'kafka', 'queue', 'rabbitmq', 'distributed', 'scalability', 'microservice', 'architecture'],
      },
      {
        id: 'cloud-aws',
        name: 'Cloud Infrastructure (AWS / GCP)',
        category: 'Cloud & DevOps',
        targetScore: 70,
        keywords: ['aws', 'gcp', 'azure', 'terraform', 'cloud', 'serverless', 'lambda', 's3', 'ecs', 'rds', 'iac'],
      },
      {
        id: 'testing',
        name: 'Automated Testing & CI/CD',
        category: 'Engineering Practices',
        targetScore: 75,
        keywords: ['test', 'jest', 'vitest', 'pytest', 'junit', 'cypress', 'playwright', 'github actions', 'ci/cd'],
      },
    ],
  },
  {
    id: 'fullstack-engineer',
    title: 'Full-Stack Product Engineer',
    level: 'Mid-Level (L4)',
    description: 'End-to-end web applications, modern UI frameworks, APIs, and data persistence.',
    requiredSkills: [
      {
        id: 'ts-js',
        name: 'TypeScript & Modern JavaScript',
        category: 'Languages',
        targetScore: 80,
        keywords: ['typescript', 'javascript', 'es6', 'ts', 'js', 'node'],
      },
      {
        id: 'react-ui',
        name: 'React & Frontend Architecture',
        category: 'Frameworks & APIs',
        targetScore: 80,
        keywords: ['react', 'nextjs', 'next', 'vue', 'svelte', 'angular', 'frontend', 'ui', 'component', 'hooks'],
      },
      {
        id: 'css-tailwind',
        name: 'Responsive CSS & Design Systems',
        category: 'Frameworks & APIs',
        targetScore: 75,
        keywords: ['css', 'tailwind', 'scss', 'styled', 'design', 'responsive', 'html'],
      },
      {
        id: 'rest-apis',
        name: 'API Design & Integration',
        category: 'Frameworks & APIs',
        targetScore: 75,
        keywords: ['api', 'rest', 'graphql', 'trpc', 'express', 'fetch', 'backend', 'server'],
      },
      {
        id: 'sql-db',
        name: 'Database Modeling & ORMs',
        category: 'Data & Storage',
        targetScore: 70,
        keywords: ['sql', 'postgres', 'mongodb', 'supabase', 'firebase', 'prisma', 'database', 'drizzle'],
      },
      {
        id: 'git-workflow',
        name: 'Git & Version Control',
        category: 'Engineering Practices',
        targetScore: 80,
        keywords: ['git', 'github'],
      },
      {
        id: 'testing',
        name: 'Testing & Quality Assurance',
        category: 'Engineering Practices',
        targetScore: 70,
        keywords: ['test', 'jest', 'vitest', 'cypress', 'playwright', 'testing'],
      },
      {
        id: 'docker',
        name: 'Deployment & Containers',
        category: 'Cloud & DevOps',
        targetScore: 65,
        keywords: ['docker', 'vercel', 'netlify', 'cloudflare', 'aws', 'deploy', 'ci/cd'],
      },
    ],
  },
  {
    id: 'frontend-engineer',
    title: 'Frontend / UI Systems Engineer',
    level: 'Senior (L5)',
    description: 'Component systems, state management, web performance, and accessibility.',
    requiredSkills: [
      {
        id: 'ts-js',
        name: 'TypeScript & JavaScript',
        category: 'Languages',
        targetScore: 85,
        keywords: ['typescript', 'javascript', 'ts', 'js'],
      },
      {
        id: 'react-ui',
        name: 'React / Component Frameworks',
        category: 'Frameworks & APIs',
        targetScore: 85,
        keywords: ['react', 'nextjs', 'vue', 'svelte', 'component', 'state', 'hooks'],
      },
      {
        id: 'css-tailwind',
        name: 'CSS Architecture & Styling',
        category: 'Frameworks & APIs',
        targetScore: 80,
        keywords: ['css', 'tailwind', 'animation', 'layout', 'design system', 'html'],
      },
      {
        id: 'testing',
        name: 'UI & End-to-End Testing',
        category: 'Engineering Practices',
        targetScore: 75,
        keywords: ['test', 'vitest', 'jest', 'playwright', 'cypress', 'storybook'],
      },
      {
        id: 'git-workflow',
        name: 'Git & Collaborative Delivery',
        category: 'Engineering Practices',
        targetScore: 80,
        keywords: ['git', 'github'],
      },
      {
        id: 'rest-apis',
        name: 'Client Data Fetching & Caching',
        category: 'Architecture',
        targetScore: 75,
        keywords: ['api', 'graphql', 'rest', 'query', 'swr', 'fetch', 'websocket'],
      },
    ],
  },
  {
    id: 'devops-cloud',
    title: 'Cloud & DevOps Platform Engineer',
    level: 'Senior (L5)',
    description: 'Containers, Kubernetes, Infrastructure as Code, CI/CD pipelines, and observability.',
    requiredSkills: [
      {
        id: 'docker',
        name: 'Docker & Container Orchestration',
        category: 'Cloud & DevOps',
        targetScore: 85,
        keywords: ['docker', 'kubernetes', 'k8s', 'helm', 'container', 'oci'],
      },
      {
        id: 'cloud-aws',
        name: 'Infrastructure as Code (Terraform / Cloud)',
        category: 'Cloud & DevOps',
        targetScore: 80,
        keywords: ['terraform', 'aws', 'gcp', 'azure', 'ansible', 'pulumi', 'cloudformation', 'iac'],
      },
      {
        id: 'testing',
        name: 'CI/CD Pipelines & Automation',
        category: 'Engineering Practices',
        targetScore: 80,
        keywords: ['ci', 'cd', 'github actions', 'gitlab', 'jenkins', 'pipeline', 'workflow'],
      },
      {
        id: 'java-ts-go-py',
        name: 'Scripting & Systems (Go / Python / Bash)',
        category: 'Languages',
        targetScore: 75,
        keywords: ['go', 'golang', 'python', 'shell', 'bash', 'rust', 'linux'],
      },
      {
        id: 'system-design',
        name: 'Distributed Systems & Observability',
        category: 'Architecture',
        targetScore: 75,
        keywords: ['prometheus', 'grafana', 'opentelemetry', 'logging', 'monitoring', 'redis', 'kafka'],
      },
      {
        id: 'git-workflow',
        name: 'GitOps & Version Control',
        category: 'Engineering Practices',
        targetScore: 80,
        keywords: ['git', 'argocd', 'flux', 'github'],
      },
    ],
  },
];

const ASSESSMENT_BANK: Record<
  string,
  {
    prompt: string;
    starterCode: string;
    validationKeywords: string[];
    hint: string;
  }
> = {
  docker: {
    prompt:
      'Write a hardened multi-stage or non-root Dockerfile snippet that copies the built artifact and runs as a non-root USER.',
    starterCode: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Complete the production stage below with a non-root USER and CMD:
FROM node:20-alpine AS runner
WORKDIR /app
`,
    validationKeywords: ['user', 'copy', 'cmd'],
    hint: 'Include COPY --from=builder, USER node (or a non-root user), and CMD ["node", ...]',
  },
  'system-design': {
    prompt:
      'Implement a Cache-Aside lookup function with a TTL expiration to prevent redundant database hits under high read load.',
    starterCode: `async function getUserProfile(userId: string, redis: any, db: any) {
  const cacheKey = \`user:profile:\${userId}\`;
  // 1. Check redis.get(cacheKey)
  // 2. On miss, fetch from db.findUser(userId) and store in redis.set(cacheKey, data, { EX: 300 })
  
}`,
    validationKeywords: ['get', 'set', 'return'],
    hint: 'Call redis.get(cacheKey), fallback to db, then call redis.set(...) with a TTL and return the result.',
  },
  'cloud-aws': {
    prompt:
      'Define a Terraform resource or least-privilege IAM policy snippet for an application service.',
    starterCode: `resource "aws_s3_bucket" "artifacts" {
  bucket = "skilltwin-verified-artifacts"
}

# Add server-side encryption or an IAM policy resource below:
`,
    validationKeywords: ['resource', 'aws_'],
    hint: 'Define an aws_iam_role, aws_s3_bucket_server_side_encryption_configuration, or aws_ecs_service block.',
  },
  'sql-db': {
    prompt:
      'Write a SQL statement creating an index on (tenant_id, created_at) or a parameterized query to optimize tenant lookups.',
    starterCode: `-- Optimize slow queries filtering by tenant_id and ordering by created_at DESC:
`,
    validationKeywords: ['create', 'index', 'on'],
    hint: 'Use CREATE INDEX idx_tenant_created ON orders (tenant_id, created_at DESC);',
  },
  'rest-apis': {
    prompt:
      'Write a REST endpoint handler that validates input and returns an appropriate HTTP status code (e.g. 400 or 200/201).',
    starterCode: `app.post('/api/orders', async (req, res) => {
  const { itemId, quantity } = req.body;
  // Validate quantity > 0 and return status(400) if invalid, or status(201) if valid:
  
});`,
    validationKeywords: ['status', 'res.', 'if'],
    hint: 'Check if (!itemId || quantity <= 0) return res.status(400).json(...); and return res.status(201).json(...);',
  },
  testing: {
    prompt:
      'Write a unit test assertion verifying that an invalid input throws an error or returns a rejected status.',
    starterCode: `describe('PaymentValidator', () => {
  it('rejects negative payment amounts', () => {
    // Write an expect(...) assertion below:
    
  });
});`,
    validationKeywords: ['expect', 'to'],
    hint: 'Use expect(validateAmount(-10)).toBe(false) or expect(() => ...).toThrow().',
  },
};

export function buildCustomRoleFromJobDescription(
  jobTitle: string,
  jobDescriptionText: string
): RoleTemplate {
  const lower = jobDescriptionText.toLowerCase();
  const basePool = [
    ...ROLE_TEMPLATES[0].requiredSkills,
    ...ROLE_TEMPLATES[1].requiredSkills.filter(
      (s) => !ROLE_TEMPLATES[0].requiredSkills.some((b) => b.id === s.id)
    ),
  ];

  const matched = basePool.filter((skill) =>
    skill.keywords.some((kw) => lower.includes(kw))
  );

  const selectedSkills =
    matched.length >= 3 ? matched : ROLE_TEMPLATES[0].requiredSkills.slice(0, 6);

  return {
    id: 'custom-role',
    title: jobTitle.trim() || 'Custom Target Role',
    level: 'Senior (L5)',
    description:
      jobDescriptionText.slice(0, 140) +
      (jobDescriptionText.length > 140 ? '...' : ''),
    requiredSkills: selectedSkills,
  };
}

export async function analyzeRealCandidate(params: {
  githubUsername: string;
  candidateName?: string;
  resumeText: string;
  extraCodeText?: string;
  targetRole: RoleTemplate;
}): Promise<SkillTwinProfile> {
  const cleanUsername = params.githubUsername
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .split('/')[0]
    .trim();

  let userData: any = null;
  let reposData: any[] = [];

  if (cleanUsername) {
    try {
      const userRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`
      );
      if (userRes.ok) {
        userData = await userRes.json();
      }
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(
          cleanUsername
        )}/repos?sort=updated&per_page=30`
      );
      if (reposRes.ok) {
        const parsed = await reposRes.json();
        if (Array.isArray(parsed)) {
          reposData = parsed.filter((r) => !r.fork);
        }
      }
    } catch {
      // Fallback to local text analysis if offline or rate-limited
    }
  }

  const evidenceItems: EvidenceItem[] = [];
  const resumeLower = (params.resumeText || '').toLowerCase();
  const extraCodeLower = (params.extraCodeText || '').toLowerCase();

  // Build corpus from GitHub repositories
  const repoTexts = reposData.map((r) => {
    const topics = Array.isArray(r.topics) ? r.topics.join(' ') : '';
    return {
      repo: r,
      combinedText: `${r.name || ''} ${r.description || ''} ${
        r.language || ''
      } ${topics}`.toLowerCase(),
    };
  });

  // Create EvidenceItems from top real GitHub repositories
  reposData.slice(0, 10).forEach((repo, idx) => {
    const matchedSkillNames: string[] = [];
    const repoSearchStr = `${repo.name || ''} ${repo.description || ''} ${
      repo.language || ''
    } ${(repo.topics || []).join(' ')}`.toLowerCase();

    params.targetRole.requiredSkills.forEach((reqSkill) => {
      if (reqSkill.keywords.some((kw) => repoSearchStr.includes(kw))) {
        matchedSkillNames.push(reqSkill.name);
      }
    });

    if (matchedSkillNames.length === 0 && repo.language) {
      matchedSkillNames.push(repo.language);
    }

    const sizeKb = repo.size || 120;
    const stars = repo.stargazers_count || 0;

    evidenceItems.push({
      id: `repo-${repo.id || idx}`,
      title: repo.full_name || `${cleanUsername}/${repo.name}`,
      sourceType: 'github_repo',
      url: repo.html_url,
      language: repo.language || 'Multi-language',
      skillsMatched: matchedSkillNames.slice(0, 3),
      confidenceContribution: Math.min(95, 70 + Math.min(25, Math.floor(sizeKb / 200) + stars * 2)),
      metricLabel: `${sizeKb.toLocaleString()} KB · ${stars} ★ · ${
        repo.default_branch || 'main'
      }`,
      timestamp: repo.updated_at
        ? new Date(repo.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      verified: true,
      codeSnippet: {
        filename: `${repo.name}/README & Repository Metadata`,
        content: [
          `// Repository: ${repo.full_name}`,
          `// Primary Language: ${repo.language || 'Detected via file tree'}`,
          `// Description: ${repo.description || 'Production repository'}`,
          `// Size: ${sizeKb} KB | Stars: ${stars} | Open Issues: ${repo.open_issues_count || 0}`,
          `// Topics: ${(repo.topics || []).join(', ') || 'standard-build'}`,
          `// Last Pushed: ${repo.pushed_at || repo.updated_at}`,
        ].join('\n'),
        highlights: matchedSkillNames,
      },
    });
  });

  // If user pasted extra code / project snippet, add it as an EvidenceItem
  if (params.extraCodeText && params.extraCodeText.trim().length > 10) {
    const matchedInCode = params.targetRole.requiredSkills
      .filter((s) => s.keywords.some((kw) => extraCodeLower.includes(kw)))
      .map((s) => s.name);

    evidenceItems.push({
      id: `code-sub-${Date.now()}`,
      title: 'Submitted Project / Code Artifact',
      sourceType: 'code_submission',
      language: 'Source Code',
      skillsMatched: matchedInCode.length > 0 ? matchedInCode : ['Code Architecture'],
      confidenceContribution: 85,
      metricLabel: `${params.extraCodeText.split('\n').length} lines analyzed`,
      timestamp: new Date().toISOString().split('T')[0],
      verified: true,
      codeSnippet: {
        filename: 'submitted_artifact.txt',
        content: params.extraCodeText.slice(0, 1200),
        highlights: matchedInCode,
      },
    });
  }

  // Evaluate each required skill for the target role
  const evaluatedSkills: EvaluatedSkill[] = params.targetRole.requiredSkills.map(
    (reqSkill) => {
      const claimedOnResume = reqSkill.keywords.some((kw) =>
        resumeLower.includes(kw)
      );

      // Count how many real repos match this skill
      const matchingRepos = repoTexts.filter((rt) =>
        reqSkill.keywords.some((kw) => rt.combinedText.includes(kw))
      );

      // Special case: Git & workflow is verified if the user has public GitHub repos
      const isGitSkill = reqSkill.id === 'git-workflow';
      const effectiveRepoCount = isGitSkill
        ? reposData.length
        : matchingRepos.length;

      const matchedInSubmittedCode = reqSkill.keywords.some((kw) =>
        extraCodeLower.includes(kw)
      );

      const verifiedByGithub = effectiveRepoCount > 0 || matchedInSubmittedCode;

      // Compute deterministic confidence score (0 - 96)
      let confidence = 18;
      if (effectiveRepoCount >= 4) {
        confidence = 88 + Math.min(7, effectiveRepoCount);
      } else if (effectiveRepoCount === 3) {
        confidence = 84;
      } else if (effectiveRepoCount === 2) {
        confidence = 78;
      } else if (effectiveRepoCount === 1) {
        confidence = 68;
      } else if (matchedInSubmittedCode) {
        confidence = 76;
      } else if (claimedOnResume) {
        // Claimed on resume, but 0 repo evidence found -> classic Evidence Gap!
        confidence = 38;
      } else {
        confidence = 22;
      }

      const status: SkillStatus =
        confidence >= reqSkill.targetScore
          ? 'strong'
          : confidence >= 55
          ? 'moderate'
          : 'gap';

      const matchedRepoNames = matchingRepos
        .slice(0, 3)
        .map((r) => r.repo.name)
        .join(', ');

      let evidenceSummary = '';
      let whyExplanation = '';
      let recommendedAction = '';

      if (effectiveRepoCount > 0) {
        evidenceSummary = isGitSkill
          ? `${reposData.length} public repositories active on GitHub`
          : `Verified in ${effectiveRepoCount} repo${
              effectiveRepoCount > 1 ? 's' : ''
            } (${matchedRepoNames})`;
        whyExplanation = isGitSkill
          ? `Git version control and repository structure verified across ${reposData.length} active repositories under @${cleanUsername}.`
          : `${reqSkill.name} was detected in ${effectiveRepoCount} of your GitHub repositories (${matchedRepoNames}). ${
              confidence >= reqSkill.targetScore
                ? `This meets the ${reqSkill.targetScore}% target benchmark for ${params.targetRole.title}.`
                : `Add one more project or complete the quick verification assessment to reach the ${reqSkill.targetScore}% target.`
            }`;
        recommendedAction =
          confidence >= reqSkill.targetScore
            ? 'Evidence meets role benchmark.'
            : `Complete the ${reqSkill.name} verification challenge to boost confidence above ${reqSkill.targetScore}%.`;
      } else if (claimedOnResume) {
        evidenceSummary = 'Listed on resume · 0 matching public repos found';
        whyExplanation = `${reqSkill.name} is listed on your resume, but SkillTwin found 0 public repositories or code files demonstrating it. Complete the interactive verification assessment below or add a project repository to prove this skill.`;
        recommendedAction = `Complete the 2-minute ${reqSkill.name} code verification challenge or link a repository.`;
      } else {
        evidenceSummary = 'No repository or resume evidence detected yet';
        whyExplanation = `${reqSkill.name} is required for ${params.targetRole.title} (Target: ${reqSkill.targetScore}%), but wasn't found in your connected GitHub repositories or resume text.`;
        recommendedAction = `Take the ${reqSkill.name} verification challenge or add a project using ${reqSkill.name}.`;
      }

      const assessmentTemplate = ASSESSMENT_BANK[reqSkill.id] || {
        prompt: `Write a concise code snippet demonstrating ${reqSkill.name} best practices (e.g., error handling, modular structure, or configuration).`,
        starterCode: `// Demonstrate ${reqSkill.name} implementation below:\n`,
        validationKeywords: reqSkill.keywords.slice(0, 1),
        hint: `Include key constructs or patterns used in ${reqSkill.name}.`,
      };

      return {
        id: reqSkill.id,
        name: reqSkill.name,
        category: reqSkill.category,
        confidence,
        targetScore: reqSkill.targetScore,
        status,
        claimedOnResume,
        verifiedByGithub,
        verifiedByAssessment: false,
        repoCount: effectiveRepoCount,
        commitEstimate: effectiveRepoCount * 14,
        evidenceSummary,
        whyExplanation,
        recommendedAction,
        assessmentQuestion: assessmentTemplate,
      };
    }
  );

  const overallReadiness = Math.round(
    evaluatedSkills.reduce((sum, s) => sum + s.confidence, 0) /
      Math.max(1, evaluatedSkills.length)
  );

  const verifiedCount = evaluatedSkills.filter(
    (s) => s.verifiedByGithub || s.verifiedByAssessment
  ).length;
  const evidenceConfidence = Math.round(
    (verifiedCount / Math.max(1, evaluatedSkills.length)) * 100
  );

  const atsEval = evaluateAtsResume({
    resumeText: params.resumeText,
    targetRole: params.targetRole,
  });

  return {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    candidateName:
      params.candidateName?.trim() ||
      userData?.name ||
      cleanUsername ||
      'Developer Profile',
    githubUsername: cleanUsername || 'local-workspace',
    avatarUrl: userData?.avatar_url || '',
    bio:
      userData?.bio ||
      `Target Role: ${params.targetRole.title} (${params.targetRole.level})`,
    location: userData?.location || 'Remote / Global',
    publicReposCount: userData?.public_repos ?? reposData.length,
    followersCount: userData?.followers ?? 0,
    targetRole: params.targetRole,
    resumeText: params.resumeText,
    overallReadiness,
    evidenceConfidence,
    atsScore: atsEval.overallAtsScore,
    skills: evaluatedSkills,
    evidenceItems,
  };
}
