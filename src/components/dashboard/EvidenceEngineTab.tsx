import React, { useState } from 'react';
import {
  Plus,
  Code2,
  ExternalLink,
  Search,
  GitBranch,
  CheckCircle2,
  FolderGit2,
} from 'lucide-react';
import { EvidenceItem, SkillTwinProfile } from '../../types/skilltwin';
import { EmptyProfileState } from './EmptyProfileState';

interface EvidenceEngineTabProps {
  profile: SkillTwinProfile | null;
  onAddCustomEvidence: (
    title: string,
    language: string,
    codeContent: string,
    skillId: string
  ) => void;
  onOpenBuildModal: () => void;
  onQuickAnalyzeGithub: (username: string) => void;
}

export const EvidenceEngineTab: React.FC<EvidenceEngineTabProps> = ({
  profile,
  onAddCustomEvidence,
  onOpenBuildModal,
  onQuickAnalyzeGithub,
}) => {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github_repo' | 'assessment'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Quick Add Evidence Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('TypeScript / Java');
  const [newSkillId, setNewSkillId] = useState('');
  const [newCode, setNewCode] = useState('');

  if (!profile) {
    return (
      <EmptyProfileState
        onOpenBuildModal={onOpenBuildModal}
        onQuickAnalyzeGithub={onQuickAnalyzeGithub}
      />
    );
  }

  const filteredItems = profile.evidenceItems.filter((item) => {
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'github_repo' && item.sourceType === 'github_repo') ||
      (sourceFilter === 'assessment' && item.sourceType !== 'github_repo');
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skillsMatched.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSource && matchesQuery;
  });

  const activeItem: EvidenceItem | undefined =
    profile.evidenceItems.find((i) => i.id === selectedItemId) ||
    filteredItems[0] ||
    profile.evidenceItems[0];

  const handleSubmitNewEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;
    const targetSkillId = newSkillId || profile.skills[0]?.id || '';
    onAddCustomEvidence(newTitle.trim(), newLang, newCode, targetSkillId);
    setNewTitle('');
    setNewCode('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Verified Evidence Ledger
          </h1>
          <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">
            Every skill score on your profile is backed by the repositories, code files, and assessments listed below.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-9 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add Code / Project Evidence'}</span>
          </button>
        </div>
      </div>

      {/* Inline Add Project / Code Artifact Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitNewEvidence}
          className="card-surface p-5 space-y-4 border-l-4 border-l-[#1D4ED8]"
        >
          <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Add Project or Code Evidence
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                Project / File Name
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. payment-service/Dockerfile"
                className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                Language / Tool
              </label>
              <input
                type="text"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                placeholder="e.g. Docker, SQL, TypeScript"
                className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
                Target Skill to Strengthen
              </label>
              <select
                value={newSkillId || profile.skills[0]?.id}
                onChange={(e) => setNewSkillId(e.target.value)}
                className="w-full h-9 px-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#0B1120] border border-[#CBD5E1] dark:border-[#334155] text-[13px]"
              >
                {profile.skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Currently {s.confidence}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#475569] dark:text-[#CBD5E1] mb-1">
              Paste Code, Configuration, or Implementation Details
            </label>
            <textarea
              rows={4}
              required
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Paste your code snippet, Dockerfile, SQL migration, or Terraform block here..."
              className="w-full p-3 rounded-[6px] bg-[#0F172A] text-[#F8FAFC] font-mono text-[12px] border border-[#334155]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-[6px] bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white text-[12px] font-medium"
            >
              Verify &amp; Add to Ledger
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all' as const, label: `All Evidence (${profile.evidenceItems.length})` },
            {
              id: 'github_repo' as const,
              label: `GitHub Repositories (${
                profile.evidenceItems.filter((i) => i.sourceType === 'github_repo').length
              })`,
            },
            {
              id: 'assessment' as const,
              label: `Code & Assessments (${
                profile.evidenceItems.filter((i) => i.sourceType !== 'github_repo').length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSourceFilter(tab.id)}
              className={`h-8 px-3 rounded-[6px] text-[12px] font-medium transition-colors ${
                sourceFilter === tab.id
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by repository, language, or skill..."
            className="h-8 pl-8 pr-3 rounded-[6px] bg-[#FFFFFF] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] text-[12px] w-64"
          />
        </div>
      </div>

      {/* Main Split: Evidence Table (7 cols) + Inspector (5 cols) */}
      {filteredItems.length === 0 ? (
        <div className="card-surface p-8 text-center space-y-3">
          <FolderGit2 className="w-8 h-8 text-[#64748B] mx-auto" />
          <div className="text-[15px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            No matching evidence items found
          </div>
          <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">
            Connect a GitHub account or click &ldquo;Add Code / Project Evidence&rdquo; above to add verifiable artifacts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Evidence Table */}
          <div className="lg:col-span-7 card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F9] dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] text-[11px] font-semibold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] h-9">
                    <th className="py-2 px-4">Source / Repository</th>
                    <th className="py-2 px-4">Skills Verified</th>
                    <th className="py-2 px-4">Details</th>
                    <th className="py-2 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-[13px]">
                  {filteredItems.map((item) => {
                    const isSelected = activeItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#1D4ED8]/5 dark:bg-[#3B82F6]/10'
                            : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                        }`}
                      >
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6] shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            {item.language} · {item.timestamp}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <div className="text-[12px] font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                            {item.skillsMatched.join(', ') || 'General Engineering'}
                          </div>
                          <div className="text-[11px] text-[#15803D] dark:text-[#4ADE80] flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {item.metricLabel}
                        </td>
                        <td className="py-3 px-4 align-top text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItemId(item.id);
                            }}
                            className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#1D4ED8] text-white'
                                : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                            }`}
                          >
                            <span>View</span>
                            <Code2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 Cols: Selected Evidence Inspector */}
          {activeItem && (
            <div className="lg:col-span-5 card-surface p-5 space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#334155]">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#1D4ED8] dark:text-[#3B82F6] font-semibold">
                    Evidence Inspector
                  </span>
                  <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {activeItem.title}
                  </h3>
                </div>
                {activeItem.url && (
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-7 px-2.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#334155] text-[12px] font-medium text-[#1D4ED8] dark:text-[#3B82F6] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Open on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                  <div className="text-[#64748B] dark:text-[#94A3B8]">Primary Language</div>
                  <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {activeItem.language}
                  </div>
                </div>
                <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
                  <div className="text-[#64748B] dark:text-[#94A3B8]">Telemetry Metric</div>
                  <div className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {activeItem.metricLabel}
                  </div>
                </div>
              </div>

              {activeItem.codeSnippet && (
                <div>
                  <div className="text-[12px] font-mono text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                    {activeItem.codeSnippet.filename}
                  </div>
                  <pre className="p-3.5 rounded-[6px] bg-[#0F172A] text-[#E2E8F0] font-mono text-[12px] leading-relaxed overflow-x-auto border border-[#334155]">
                    <code>{activeItem.codeSnippet.content}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
