export type SkillStatus = 'strong' | 'moderate' | 'gap';

export interface EvaluatedSkill {
  id: string;
  name: string;
  category: string; // e.g. "Languages", "Frameworks & APIs", "Data & Storage", "Cloud & DevOps"
  confidence: number; // 0 - 100
  targetScore: number; // e.g. 75 or 80
  status: SkillStatus;
  claimedOnResume: boolean;
  claimedOnLinkedIn?: boolean;
  verifiedByGithub: boolean;
  verifiedByAssessment: boolean;
  repoCount: number;
  commitEstimate: number;
  evidenceSummary: string;
  whyExplanation: string;
  recommendedAction: string;
  assessmentQuestion?: {
    prompt: string;
    starterCode: string;
    validationKeywords: string[];
    hint: string;
  };
}

export interface EvidenceItem {
  id: string;
  title: string;
  sourceType:
    | 'github_repo'
    | 'github_commit'
    | 'code_submission'
    | 'assessment'
    | 'resume_claim'
    | 'linkedin_profile'
    | 'zip_artifact';
  url?: string;
  language: string;
  skillsMatched: string[];
  confidenceContribution: number;
  metricLabel: string; // e.g. "48 KB code · 12 stars" or "Commit a8f921"
  timestamp: string;
  verified: boolean;
  codeSnippet?: {
    filename: string;
    content: string;
    highlights: string[];
  };
}

export interface RoleTemplate {
  id: string;
  title: string;
  level: 'Junior (L3)' | 'Mid-Level (L4)' | 'Senior (L5)' | 'Staff (L6)';
  description: string;
  requiredSkills: {
    id: string;
    name: string;
    category: string;
    targetScore: number;
    keywords: string[];
  }[];
}

export interface ArchiveFileEntry {
  name: string;
  sizeBytes: number;
  category: 'resume' | 'code' | 'config' | 'doc';
  preview: string;
}

export interface AtsKeywordMatch {
  skillId: string;
  skillName: string;
  category: string;
  matchedTerms: string[];
  missingTerms: string[];
  occurrencesInResume: number;
  status: 'matched' | 'partial' | 'missing';
  verifiedInGithub: boolean;
  suggestedBullet: string;
}

export interface AtsBulletEvaluation {
  id: string;
  originalText: string;
  status: 'strong' | 'needs_metrics' | 'weak_verb' | 'too_short';
  hasQuantifiedMetric: boolean;
  hasStrongActionVerb: boolean;
  issueLabel: string;
  suggestedRewrite: string;
}

export interface AtsSectionCheck {
  id: string;
  label: string;
  present: boolean;
  detail: string;
}

export interface AtsAnalysisResult {
  overallAtsScore: number; // 0 - 100
  verifiedAtsScore: number; // 0 - 100 cross-checked with GitHub/code evidence
  passStatus: 'strong_pass' | 'moderate' | 'at_risk';
  wordCount: number;
  bulletCount: number;
  quantifiedBulletCount: number;
  subScores: {
    keywordMatch: number; // 40% weight
    impactMetrics: number; // 20% weight
    actionVerbs: number; // 15% weight
    sectionStructure: number; // 10% weight
    parseability: number; // 10% weight
    contactInfo: number; // 5% weight
  };
  keywordMatches: AtsKeywordMatch[];
  unverifiedResumeClaims: string[]; // On resume, but 0 GitHub/assessment proof
  unclaimedVerifiedSkills: string[]; // Proven on GitHub/assessment, but missing on resume!
  bullets: AtsBulletEvaluation[];
  sectionChecks: AtsSectionCheck[];
  contactChecks: {
    email: boolean;
    phone: boolean;
    github: boolean;
    linkedinOrPortfolio: boolean;
  };
  flaggedBuzzwords: string[];
}

export interface SkillTwinProfile {
  createdAt: string;
  updatedAt: string;
  candidateName: string;
  githubUsername: string;
  avatarUrl: string;
  bio: string;
  location: string;
  publicReposCount: number;
  followersCount: number;
  targetRole: RoleTemplate;
  customJobText?: string;
  resumeText: string;
  resumeFileName?: string;
  linkedinUrl?: string;
  linkedinProfileText?: string;
  linkedinImportFileName?: string;
  linkedinSections?: {
    about: string;
    experience: string;
    education: string;
    skills: string;
    certifications: string;
    projects: string;
    highlights: string;
    posts: string;
  };
  overallReadiness: number;
  evidenceConfidence: number;
  atsScore?: number;
  skills: EvaluatedSkill[];
  evidenceItems: EvidenceItem[];
}
