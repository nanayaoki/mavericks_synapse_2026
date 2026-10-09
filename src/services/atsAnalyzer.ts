import {
  ArchiveFileEntry,
  AtsAnalysisResult,
  AtsBulletEvaluation,
  AtsKeywordMatch,
  AtsSectionCheck,
  RoleTemplate,
  SkillTwinProfile,
} from '../types/skilltwin';

const STRONG_ACTION_VERBS = [
  'architected',
  'engineered',
  'designed',
  'implemented',
  'optimized',
  'deployed',
  'migrated',
  'automated',
  'built',
  'refactored',
  'scaled',
  'developed',
  'reduced',
  'increased',
  'accelerated',
  'spearheaded',
  'established',
  'integrated',
  'delivered',
  'orchestrated',
  'modernized',
  'hardened',
  'instrumented',
  'launched',
];

const WEAK_PHRASES = [
  'worked on',
  'responsible for',
  'helped with',
  'assisted in',
  'assisted with',
  'participated in',
  'involved in',
  'duties included',
  'tasked with',
  'familiar with',
  'exposure to',
];

const CLICHE_BUZZWORDS = [
  'synergy',
  'go-getter',
  'rockstar',
  'ninja',
  'guru',
  'thought leader',
  'hardworking',
  'team player',
  'perfectionist',
  'bottom-line',
  'dynamic',
];

const BULLET_TEMPLATES_BY_SKILL: Record<string, string> = {
  'java-ts-go-py':
    '• Engineered high-throughput backend microservices in Java and TypeScript handling 12,000+ requests/sec with 99.98% uptime.',
  'ts-js':
    '• Architected modular TypeScript services and strict type-safe API contracts, reducing production runtime errors by 42%.',
  'react-ui':
    '• Built responsive React component architecture with optimized state management, improving Core Web Vitals LCP by 38%.',
  'css-tailwind':
    '• Designed accessible, token-driven UI components using Tailwind CSS across 25+ enterprise dashboard views.',
  'rest-apis':
    '• Designed and deployed RESTful and GraphQL APIs with idempotency, rate limiting, and schema validation serving 450K daily active users.',
  'sql-db':
    '• Optimized PostgreSQL relational schemas and composite B-tree indexes, reducing p95 query execution latency from 340ms to 28ms.',
  'git-workflow':
    '• Enforced trunk-based Git workflows, automated pull-request checks, and peer code reviews across a 14-engineer team.',
  docker:
    '• Containerized multi-stage production workloads using Docker and Kubernetes, cutting container image size by 62% and deployment time by 45%.',
  'system-design':
    '• Implemented distributed Redis Cache-Aside layer and Kafka event consumers, reducing primary database read load by 68%.',
  'cloud-aws':
    '• Provisioned multi-AZ AWS infrastructure (ECS, RDS, S3, IAM) using Terraform Infrastructure-as-Code with zero configuration drift.',
  testing:
    '• Automated unit, integration, and end-to-end CI/CD test suites via GitHub Actions, raising test coverage from 54% to 91%.',
};

export const SAMPLE_ATS_RESUMES: {
  id: string;
  label: string;
  roleId: string;
  description: string;
  content: string;
}[] = [
  {
    id: 'needs-tuning',
    label: 'Resume Needing ATS Optimization (61% Match)',
    roleId: 'backend-engineer',
    description: 'Realistic developer resume with passive verbs, missing metrics, and missing cloud/container keywords.',
    content: `ALEX RIVERA
alex.rivera.dev@example.com | github.com/tj

SUMMARY
Hardworking software developer and team player with experience building backend web applications and databases.

EXPERIENCE
Backend Developer — FinCore Systems (2022 - Present)
• Worked on backend Java and Node.js services for customer payment processing.
• Responsible for writing SQL queries and maintaining PostgreSQL database tables.
• Helped with REST API endpoints and fixing bugs in production.
• Participated in Git code reviews and team sprint meetings.

Software Engineer Intern — CloudMetrics (2021 - 2022)
• Assisted with Python scripts for data processing and API integration.
• Worked on unit tests for backend endpoints.

EDUCATION
B.S. in Computer Science — State University (2021)

SKILLS
Java, TypeScript, SQL, PostgreSQL, REST APIs, Git`,
  },
  {
    id: 'high-scoring',
    label: 'ATS-Optimized Senior Backend Resume (92% Match)',
    roleId: 'backend-engineer',
    description: 'Quantified impact bullets, strong engineering verbs, complete section hygiene, and full keyword coverage.',
    content: `SARAH JENKS
Senior Backend Software Engineer
sarah.jenks@example.com | +1 (415) 890-4421 | github.com/sindresorhus | linkedin.com/in/sarahjenks

SUMMARY
Senior Backend Engineer with 6+ years of experience architecting distributed microservices, high-throughput REST APIs, and fault-tolerant relational data systems.

EXPERIENCE
Senior Backend Engineer — Apex Ledger Technologies (2022 - Present)
• Architected distributed Java and TypeScript payment microservices processing 18,500+ RPS with 99.99% availability SLA.
• Optimized PostgreSQL database schemas and composite indexes, reducing p99 query latency by 71% (from 410ms to 118ms).
• Implemented Redis distributed caching and Kafka event streaming pipelines to decouple ledger settlement services, cutting DB read load by 64%.
• Containerized 15+ production services using multi-stage Docker builds and deployed onto AWS ECS using Terraform Infrastructure-as-Code.

Software Engineer — Horizon Cloud Systems (2019 - 2022)
• Engineered RESTful and GraphQL API gateways with automated rate-limiting and OAuth2 authentication serving 1.2M monthly active users.
• Automated CI/CD test pipelines with Vitest, JUnit, and GitHub Actions, increasing automated test coverage from 58% to 92% and reducing deployment rollbacks by 80%.

PROJECTS
• Open-Source Distributed Rate Limiter: Built a Go and Redis token-bucket rate limiter library with Docker Compose benchmarks.

EDUCATION
B.S. in Computer Science — University of Washington (2019)

SKILLS
Languages: Java, TypeScript, Go, Python, SQL
Frameworks & APIs: Spring Boot, Node.js, Express, REST APIs, GraphQL, gRPC
Data & Architecture: PostgreSQL, Redis, Kafka, Distributed Systems, Microservices
Cloud & DevOps: Docker, Kubernetes, AWS (ECS, RDS, S3, Lambda), Terraform, Git, GitHub Actions, Automated Testing`,
  },
];

async function inflateRawBytes(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream not supported');
  }
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLen = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLen += value.byteLength;
    }
  }

  const out = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<\/w:p>/gi, '\n')
    .replace(/<w:tab\/>/gi, ' ')
    .replace(/<w:br\/>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractReadableTextFromPdfBytes(bytes: Uint8Array): string {
  const decoder = new TextDecoder('latin1');
  const raw = decoder.decode(bytes);
  const extractedChunks: string[] = [];

  // Extract parenthesized strings inside PDF text objects BT ... ET
  const btBlocks = raw.match(/BT[\s\S]*?ET/g) || [];
  for (const block of btBlocks) {
    const strMatches = block.match(/\((?:\\.|[^\\()])*\)/g) || [];
    const lineTokens: string[] = [];
    for (const token of strMatches) {
      const inner = token
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      // Keep printable ASCII/Latin text
      const cleaned = inner.replace(/[^\x20-\x7E\n]/g, '');
      if (cleaned.trim().length > 0) {
        lineTokens.push(cleaned);
      }
    }
    if (lineTokens.length > 0) {
      extractedChunks.push(lineTokens.join(' '));
    }
  }

  if (extractedChunks.join(' ').trim().length > 60) {
    return extractedChunks.join('\n').replace(/[ \t]{2,}/g, ' ').trim();
  }

  // Fallback: extract printable ASCII sequences of 4+ characters that look like resume text
  const asciiMatches = raw.match(/[A-Za-z0-9@.,:/+\-()• ]{6,}/g) || [];
  const filtered = asciiMatches.filter(
    (s) =>
      !/^(obj|endobj|stream|endstream|xref|trailer|startxref|\/Type|\/Font|\/Page|\/Filter)/i.test(
        s.trim()
      )
  );
  return filtered.join('\n').slice(0, 15000).trim();
}

/**
 * Extracts resume text, source code evidence, and archive file manifests
 * from uploaded .zip, .docx, .pdf, .txt, .md, .json, or source code files.
 */
export async function extractFilesFromUpload(file: File): Promise<{
  resumeText: string;
  codeText: string;
  archiveFiles: ArchiveFileEntry[];
}> {
  const lowerName = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check if ZIP or DOCX (PK\x03\x04 magic header)
  const isZipMagic =
    bytes.length > 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;

  if (isZipMagic || lowerName.endsWith('.zip') || lowerName.endsWith('.docx')) {
    const view = new DataView(buffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let offset = 0;

    const archiveFiles: ArchiveFileEntry[] = [];
    const resumeParts: string[] = [];
    const codeParts: string[] = [];

    while (offset + 30 <= buffer.byteLength) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) {
        break;
      }

      const flags = view.getUint16(offset + 6, true);
      const compressionMethod = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const uncompressedSize = view.getUint32(offset + 22, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraFieldLen = view.getUint16(offset + 28, true);

      const nameBytes = bytes.subarray(offset + 30, offset + 30 + fileNameLen);
      const entryName = decoder.decode(nameBytes);
      const dataStart = offset + 30 + fileNameLen + extraFieldLen;

      // If bit 3 of general purpose flags is set and compressedSize is 0, stop or skip
      if (compressedSize === 0 && (flags & 0x08) !== 0) {
        break;
      }

      const dataEnd = Math.min(buffer.byteLength, dataStart + compressedSize);
      const rawEntryData = bytes.subarray(dataStart, dataEnd);
      offset = dataEnd;

      // Skip directories and macOS metadata files
      if (
        entryName.endsWith('/') ||
        entryName.includes('__MACOSX') ||
        entryName.split('/').pop()?.startsWith('._') ||
        entryName.includes('node_modules/') ||
        entryName.includes('.git/')
      ) {
        continue;
      }

      let decodedText = '';
      try {
        if (compressionMethod === 0) {
          decodedText = decoder.decode(rawEntryData);
        } else if (compressionMethod === 8) {
          const inflated = await inflateRawBytes(rawEntryData);
          decodedText = decoder.decode(inflated);
        }
      } catch {
        // Ignore binary or unsupported entry
      }

      if (!decodedText) continue;

      // Special handling for .docx word/document.xml
      if (entryName === 'word/document.xml') {
        const docxClean = stripXmlTags(decodedText);
        if (docxClean.length > 0) {
          resumeParts.push(docxClean);
          archiveFiles.push({
            name: file.name,
            sizeBytes: uncompressedSize || file.size,
            category: 'resume',
            preview: docxClean.slice(0, 300),
          });
        }
        continue;
      }

      // Skip other internal docx XML files if the uploaded file itself is a .docx
      if (lowerName.endsWith('.docx')) {
        continue;
      }

      const lowerEntry = entryName.toLowerCase();
      const isResumeFile =
        lowerEntry.includes('resume') ||
        lowerEntry.includes('cv') ||
        lowerEntry.endsWith('.txt') ||
        lowerEntry.endsWith('.md') ||
        lowerEntry.endsWith('.rtf') ||
        lowerEntry.endsWith('.tex') ||
        lowerEntry.endsWith('.html');

      const isCodeOrConfig =
        lowerEntry.endsWith('.ts') ||
        lowerEntry.endsWith('.tsx') ||
        lowerEntry.endsWith('.js') ||
        lowerEntry.endsWith('.jsx') ||
        lowerEntry.endsWith('.py') ||
        lowerEntry.endsWith('.java') ||
        lowerEntry.endsWith('.go') ||
        lowerEntry.endsWith('.sql') ||
        lowerEntry.endsWith('.tf') ||
        lowerEntry.endsWith('.yaml') ||
        lowerEntry.endsWith('.yml') ||
        lowerEntry.endsWith('.json') ||
        lowerEntry.includes('dockerfile');

      if (!isResumeFile && !isCodeOrConfig) {
        continue;
      }

      const cleanContent = lowerEntry.endsWith('.html')
        ? stripXmlTags(decodedText)
        : decodedText;

      const category: ArchiveFileEntry['category'] =
        lowerEntry.includes('resume') || lowerEntry.includes('cv')
          ? 'resume'
          : lowerEntry.endsWith('.json') ||
            lowerEntry.endsWith('.yaml') ||
            lowerEntry.endsWith('.yml') ||
            lowerEntry.includes('dockerfile')
          ? 'config'
          : isCodeOrConfig
          ? 'code'
          : 'doc';

      archiveFiles.push({
        name: entryName,
        sizeBytes: uncompressedSize || compressedSize,
        category,
        preview: cleanContent.slice(0, 280),
      });

      if (category === 'resume' || category === 'doc') {
        resumeParts.push(`--- ${entryName} ---\n${cleanContent.slice(0, 8000)}`);
      } else {
        codeParts.push(`// File: ${entryName}\n${cleanContent.slice(0, 4000)}`);
      }
    }

    // If a .zip only had code files and no explicit resume.txt/README, synthesize a summary from the zip manifest so ATS can still evaluate it
    const finalResumeText =
      resumeParts.join('\n\n').trim() ||
      (codeParts.length > 0
        ? `Extracted Project Archive (${file.name})\nFiles included: ${archiveFiles
            .map((f) => f.name)
            .join(', ')}\n\n${codeParts.join('\n\n').slice(0, 6000)}`
        : '');

    return {
      resumeText: finalResumeText,
      codeText: codeParts.join('\n\n').slice(0, 15000),
      archiveFiles,
    };
  }

  // Handle PDF files
  if (lowerName.endsWith('.pdf')) {
    const pdfText = extractReadableTextFromPdfBytes(bytes);
    return {
      resumeText: pdfText,
      codeText: '',
      archiveFiles: [
        {
          name: file.name,
          sizeBytes: file.size,
          category: 'resume',
          preview: pdfText.slice(0, 300),
        },
      ],
    };
  }

  // Handle plain text, markdown, JSON, HTML, or source files
  const textContent = await file.text();
  const cleaned = lowerName.endsWith('.html')
    ? stripXmlTags(textContent)
    : textContent;

  return {
    resumeText: cleaned,
    codeText: '',
    archiveFiles: [
      {
        name: file.name,
        sizeBytes: file.size,
        category: 'resume',
        preview: cleaned.slice(0, 300),
      },
    ],
  };
}

/**
 * Evaluates a resume against a target RoleTemplate + optional custom Job Description
 * and cross-verifies against the user's SkillTwinProfile (GitHub & code evidence).
 */
export function evaluateAtsResume(params: {
  resumeText: string;
  targetRole: RoleTemplate;
  customJobDescription?: string;
  profile?: SkillTwinProfile | null;
}): AtsAnalysisResult {
  const rawText = params.resumeText || '';
  const lowerResume = rawText.toLowerCase();
  const words = rawText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  // 1. Evaluate Keyword Match against Target Role + Custom Job Description
  const keywordMatches: AtsKeywordMatch[] = params.targetRole.requiredSkills.map(
    (reqSkill) => {
      const matchedTerms: string[] = [];
      const missingTerms: string[] = [];
      let totalOccurrences = 0;

      reqSkill.keywords.forEach((kw) => {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = rawText.match(regex);
        const count = matches
          ? matches.length
          : lowerResume.includes(kw.toLowerCase())
          ? 1
          : 0;

        if (count > 0) {
          matchedTerms.push(kw);
          totalOccurrences += count;
        } else {
          missingTerms.push(kw);
        }
      });

      const status: AtsKeywordMatch['status'] =
        matchedTerms.length >= 2 || totalOccurrences >= 2
          ? 'matched'
          : matchedTerms.length === 1
          ? 'partial'
          : 'missing';

      const profileSkill = params.profile?.skills.find(
        (s) => s.id === reqSkill.id
      );
      const verifiedInGithub = Boolean(
        profileSkill?.verifiedByGithub || profileSkill?.verifiedByAssessment
      );

      const suggestedBullet =
        BULLET_TEMPLATES_BY_SKILL[reqSkill.id] ||
        `• Engineered production features using ${reqSkill.name} (${reqSkill.keywords
          .slice(0, 3)
          .join(', ')}), improving system reliability and delivery speed by 35%.`;

      return {
        skillId: reqSkill.id,
        skillName: reqSkill.name,
        category: reqSkill.category,
        matchedTerms,
        missingTerms: missingTerms.slice(0, 5),
        occurrencesInResume: totalOccurrences,
        status,
        verifiedInGithub,
        suggestedBullet,
      };
    }
  );

  const matchedCount = keywordMatches.filter(
    (k) => k.status === 'matched'
  ).length;
  const partialCount = keywordMatches.filter(
    (k) => k.status === 'partial'
  ).length;
  const totalSkills = Math.max(1, keywordMatches.length);
  const keywordMatchScore = Math.min(
    100,
    Math.round(((matchedCount + partialCount * 0.65) / totalSkills) * 100)
  );

  // 2. Extract and grade Experience / Project Bullet Points
  const rawLines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidateBullets = rawLines.filter(
    (line) =>
      /^[•\-*▪▸]/.test(line) ||
      (line.length >= 45 &&
        line.length <= 260 &&
        !line.includes('@') &&
        !line.includes('|') &&
        !/^(summary|experience|education|skills|projects|certifications)/i.test(
          line
        ))
  );

  const bullets: AtsBulletEvaluation[] = candidateBullets
    .slice(0, 12)
    .map((line, idx) => {
      const cleanLine = line.replace(/^[•\-*▪▸]\s*/, '').trim();
      const lowerLine = cleanLine.toLowerCase();
      const firstWord = lowerLine.split(/\s+/)[0]?.replace(/[^a-z]/g, '') || '';

      const hasQuantifiedMetric =
        /\b\d+(\.\d+)?\s*(%|ms|s|x|k|m|rps|qps|tb|gb|mb|users|requests|services|repos|endpoints|hours|days|\+)\b/i.test(
          cleanLine
        ) || /\$\d+/i.test(cleanLine);

      const startsWithWeakPhrase = WEAK_PHRASES.some((wp) =>
        lowerLine.startsWith(wp)
      );
      const hasStrongActionVerb =
        !startsWithWeakPhrase &&
        (STRONG_ACTION_VERBS.includes(firstWord) ||
          STRONG_ACTION_VERBS.some((v) => lowerLine.startsWith(v)));

      let status: AtsBulletEvaluation['status'] = 'strong';
      let issueLabel = 'Strong action verb + measurable engineering metric';
      let suggestedRewrite = `• ${cleanLine}`;

      if (cleanLine.split(/\s+/).length < 7) {
        status = 'too_short';
        issueLabel = 'Bullet is too brief — lacks technical depth and measurable outcome';
        suggestedRewrite = `• Engineered ${cleanLine.replace(
          /\.$/,
          ''
        )}, improving service throughput by 35% and reducing error rates in production.`;
      } else if (startsWithWeakPhrase || !hasStrongActionVerb) {
        status = 'weak_verb';
        issueLabel = startsWithWeakPhrase
          ? 'Starts with passive phrasing ("Worked on / Responsible for") instead of direct technical ownership'
          : 'Needs a stronger technical action verb & measurable impact metric';

        let upgradedCore = cleanLine;
        for (const wp of WEAK_PHRASES) {
          if (lowerLine.startsWith(wp)) {
            upgradedCore = cleanLine.slice(wp.length).trim();
            break;
          }
        }
        suggestedRewrite = hasQuantifiedMetric
          ? `• Engineered and optimized ${upgradedCore}`
          : `• Engineered ${upgradedCore.replace(
              /\.$/,
              ''
            )}, reducing p95 latency by 38% and supporting 99.95% uptime.`;
      } else if (!hasQuantifiedMetric) {
        status = 'needs_metrics';
        issueLabel =
          'Good action verb, but missing quantified impact (%, latency ms, throughput, or scale)';
        suggestedRewrite = `• ${cleanLine.replace(
          /\.$/,
          ''
        )}, reducing execution latency by 40% across 10,000+ daily requests.`;
      }

      return {
        id: `bullet-${idx}`,
        originalText: line,
        status,
        hasQuantifiedMetric,
        hasStrongActionVerb,
        issueLabel,
        suggestedRewrite,
      };
    });

  const bulletCount = bullets.length;
  const quantifiedBulletCount = bullets.filter(
    (b) => b.hasQuantifiedMetric
  ).length;
  const strongVerbBulletCount = bullets.filter(
    (b) => b.hasStrongActionVerb
  ).length;

  const impactMetricsScore =
    bulletCount === 0
      ? 20
      : Math.min(
          100,
          Math.round((quantifiedBulletCount / Math.max(3, bulletCount)) * 100)
        );

  const actionVerbsScore =
    bulletCount === 0
      ? 25
      : Math.min(
          100,
          Math.round((strongVerbBulletCount / Math.max(1, bulletCount)) * 100)
        );

  // 3. Section Structure Check
  const sectionChecks: AtsSectionCheck[] = [
    {
      id: 'experience',
      label: 'Work Experience / History',
      present: /\b(experience|employment|work history|career)\b/i.test(rawText),
      detail: 'Standard chronological experience section header for ATS parsers',
    },
    {
      id: 'skills',
      label: 'Technical Skills Section',
      present: /\b(skills|technologies|technical stack|core competencies)\b/i.test(
        rawText
      ),
      detail: 'Dedicated skills block for keyword indexing',
    },
    {
      id: 'education',
      label: 'Education / Degree',
      present: /\b(education|university|college|b\.s\.|m\.s\.|bachelor|master|degree)\b/i.test(
        rawText
      ),
      detail: 'Academic credentials and graduation dates',
    },
    {
      id: 'projects',
      label: 'Projects / Open Source',
      present: /\b(projects|open source|repositories|key implementations)\b/i.test(
        rawText
      ),
      detail: 'Direct project evidence section',
    },
    {
      id: 'summary',
      label: 'Executive / Technical Summary',
      present: /\b(summary|profile|objective|about)\b/i.test(rawText),
      detail: 'Role-aligned opening summary at top of resume',
    },
  ];

  const presentSections = sectionChecks.filter((s) => s.present).length;
  const sectionStructureScore = Math.round(
    (presentSections / sectionChecks.length) * 100
  );

  // 4. Contact & Profile Links Check
  const contactChecks = {
    email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(rawText),
    phone: /(\+?\d[\d\s\-()]{7,}\d)/.test(rawText),
    github: /github\.com\/[a-z0-9_-]+/i.test(rawText),
    linkedinOrPortfolio: /(linkedin\.com\/in\/|https?:\/\/)/i.test(rawText),
  };
  const contactPoints =
    (contactChecks.email ? 35 : 0) +
    (contactChecks.github ? 35 : 0) +
    (contactChecks.phone ? 15 : 0) +
    (contactChecks.linkedinOrPortfolio ? 15 : 0);
  const contactInfoScore = Math.min(100, contactPoints);

  // 5. Parseability & Hygiene Check
  const flaggedBuzzwords = CLICHE_BUZZWORDS.filter((bw) =>
    lowerResume.includes(bw)
  );
  let parseabilityScore = 90;
  if (wordCount < 120) {
    parseabilityScore = 45;
  } else if (wordCount < 220) {
    parseabilityScore = 70;
  } else if (wordCount > 1100) {
    parseabilityScore = 75;
  }
  parseabilityScore = Math.max(
    30,
    parseabilityScore - flaggedBuzzwords.length * 8
  );

  // Overall Weighted ATS Score
  const overallAtsScore =
    wordCount < 15
      ? 0
      : Math.min(
          99,
          Math.round(
            keywordMatchScore * 0.4 +
              impactMetricsScore * 0.2 +
              actionVerbsScore * 0.15 +
              sectionStructureScore * 0.1 +
              parseabilityScore * 0.1 +
              contactInfoScore * 0.05
          )
        );

  // Cross-Check with SkillTwin GitHub / Code Evidence
  const unverifiedResumeClaims: string[] = [];
  const unclaimedVerifiedSkills: string[] = [];

  keywordMatches.forEach((km) => {
    const isOnResume = km.status === 'matched' || km.status === 'partial';
    if (params.profile) {
      if (isOnResume && !km.verifiedInGithub) {
        unverifiedResumeClaims.push(km.skillName);
      } else if (!isOnResume && km.verifiedInGithub) {
        unclaimedVerifiedSkills.push(km.skillName);
      }
    }
  });

  const verifiedAtsScore = params.profile
    ? Math.round(overallAtsScore * 0.55 + params.profile.overallReadiness * 0.45)
    : overallAtsScore;

  const passStatus: AtsAnalysisResult['passStatus'] =
    overallAtsScore >= 80
      ? 'strong_pass'
      : overallAtsScore >= 60
      ? 'moderate'
      : 'at_risk';

  return {
    overallAtsScore,
    verifiedAtsScore,
    passStatus,
    wordCount,
    bulletCount,
    quantifiedBulletCount,
    subScores: {
      keywordMatch: keywordMatchScore,
      impactMetrics: impactMetricsScore,
      actionVerbs: actionVerbsScore,
      sectionStructure: sectionStructureScore,
      parseability: parseabilityScore,
      contactInfo: contactInfoScore,
    },
    keywordMatches,
    unverifiedResumeClaims,
    unclaimedVerifiedSkills,
    bullets,
    sectionChecks,
    contactChecks,
    flaggedBuzzwords,
  };
}
