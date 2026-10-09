import {
  Unzip,
  UnzipInflate,
  UnzipPassThrough,
  UnzipFile,
} from 'fflate';
import { extractFilesFromUpload } from './atsAnalyzer';

export interface LinkedInProfileSections {
  about: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
  projects: string;
  highlights: string;
  posts: string;
}

export interface LinkedInImportResult {
  text: string;
  sections: LinkedInProfileSections;
  fileNames: string[];
  candidateName?: string;
}

const MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 5 * 1024 * 1024;
const MAX_CSV_BYTES = 1024 * 1024;
const MAX_IMPORT_TEXT_LENGTH = 20000;
const MAX_SECTION_TEXT_LENGTH = 2500;

const EMPTY_SECTIONS = (): LinkedInProfileSections => ({
  about: '',
  experience: '',
  education: '',
  skills: '',
  certifications: '',
  projects: '',
  highlights: '',
  posts: '',
});

const SECTION_FILE_PATTERNS: Array<{
  section: keyof LinkedInProfileSections;
  pattern: RegExp;
}> = [
  { section: 'about', pattern: /^(profile|about)([-_. ]|$)/ },
  { section: 'experience', pattern: /^(positions?|experience|employment)([-_. ]|$)/ },
  { section: 'education', pattern: /^(education|schools?)([-_. ]|$)/ },
  { section: 'skills', pattern: /^(skills?|endorsements?)([-_. ]|$)/ },
  {
    section: 'certifications',
    pattern: /^(certifications?|licenses?)([-_. ]|$)/,
  },
  { section: 'projects', pattern: /^(projects?|publications?)([-_. ]|$)/ },
  {
    section: 'highlights',
    pattern: /^(honors?|awards?|volunteer|recommendations?|languages?)([-_. ]|$)/,
  },
  { section: 'posts', pattern: /^(shares?|posts?|articles?)([-_. ]|$)/ },
];

const SENSITIVE_HEADER = /\b(email|phone|mobile|address|birth|birthday|postal|zip|license number|credential id|member id|password|message)\b/i;

function sectionForFile(fileName: string): keyof LinkedInProfileSections | null {
  const baseName = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.csv$/i, '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
  if (!baseName) return null;
  return (
    SECTION_FILE_PATTERNS.find(({ pattern }) => pattern.test(baseName))?.section ||
    null
  );
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

function formatCsvSection(
  fileName: string,
  section: keyof LinkedInProfileSections,
  content: string
): { text: string; candidateName?: string } {
  const rows = parseCsv(content.replace(/^\uFEFF/, ''));
  if (rows.length < 2) return { text: '' };

  const headers = rows[0].map((header) => header.trim());
  const lines: string[] = [];
  let candidateName = '';

  for (const values of rows.slice(1)) {
    const fields = headers
      .map((header, index) => ({
        header,
        value: (values[index] || '').trim(),
      }))
      .filter(({ header, value }) => value && !SENSITIVE_HEADER.test(header));

    if (section === 'about') {
      const firstName = fields.find(
        ({ header }) => header.trim().toLowerCase() === 'first name'
      )?.value;
      const lastName = fields.find(
        ({ header }) => header.trim().toLowerCase() === 'last name'
      )?.value;
      if (firstName || lastName) candidateName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    if (fields.length === 0) continue;
    lines.push(
      fields
        .map(({ header, value }) => `${header}: ${value}`)
        .join('\n')
    );
  }

  return {
    text: lines.length > 0 ? `## ${fileName}\n${lines.join('\n\n')}` : '',
    candidateName: candidateName || undefined,
  };
}

async function extractLinkedInZip(file: File): Promise<LinkedInImportResult> {
  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new Error('LinkedIn ZIP exports must be 25 MB or smaller.');
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sections = EMPTY_SECTIONS();
  const fileNames: string[] = [];
  let extractedBytes = 0;
  let candidateName: string | undefined;
  let settled = false;

  return new Promise<LinkedInImportResult>((resolve, reject) => {
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const archive = new Unzip((entry: UnzipFile) => {
      if (settled) return;
      const section = sectionForFile(entry.name);
      if (!section) return;

      if (entry.compression !== 0 && entry.compression !== 8) {
        fail(new Error(`Unsupported compression method in ${entry.name}.`));
        return;
      }
      if ((entry.originalSize || 0) > MAX_CSV_BYTES) {
        fail(new Error(`${entry.name} is larger than the 1 MB per-file limit.`));
        return;
      }
      if (extractedBytes + (entry.originalSize || 0) > MAX_EXTRACTED_BYTES) {
        fail(new Error('LinkedIn export data exceeds the 5 MB extraction limit.'));
        return;
      }

      const chunks: Uint8Array[] = [];
      let entryBytes = 0;
      entry.ondata = (error, chunk, final) => {
        if (settled) return;
        if (error) {
          fail(new Error(`Could not read ${entry.name}: ${error.message}`));
          return;
        }
        entryBytes += chunk.length;
        extractedBytes += chunk.length;
        if (
          entryBytes > MAX_CSV_BYTES ||
          extractedBytes > MAX_EXTRACTED_BYTES
        ) {
          entry.terminate();
          fail(new Error('LinkedIn export data exceeds the extraction size limit.'));
          return;
        }
        chunks.push(chunk);
        if (!final || settled) return;

        const contentBytes = new Uint8Array(entryBytes);
        let offset = 0;
        for (const part of chunks) {
          contentBytes.set(part, offset);
          offset += part.length;
        }
        const content = new TextDecoder('utf-8', { fatal: false }).decode(contentBytes);
        const formatted = formatCsvSection(entry.name, section, content);
        if (formatted.text) {
          sections[section] = [sections[section], formatted.text]
            .filter(Boolean)
            .join('\n\n')
            .slice(0, MAX_SECTION_TEXT_LENGTH);
          fileNames.push(entry.name.split(/[\\/]/).pop() || entry.name);
        }
        candidateName = formatted.candidateName || candidateName;
      };
      entry.start();
    });

    archive.register(UnzipInflate);
    archive.register(UnzipPassThrough);
    try {
      archive.push(bytes, true);
      if (settled) return;

      const text = Object.entries(sections)
        .filter(([, value]) => value)
        .map(([name, value]) => `# ${name}\n${value}`)
        .join('\n\n')
        .slice(0, MAX_IMPORT_TEXT_LENGTH);
      if (!text.trim()) {
        fail(
          new Error(
            'No supported LinkedIn profile CSVs were found. Include files such as Profile.csv, Positions.csv, Skills.csv, or Certifications.csv in the export.'
          )
        );
        return;
      }
      settled = true;
      resolve({ text, sections, fileNames, candidateName });
    } catch (error) {
      fail(error instanceof Error ? error : new Error('Could not read LinkedIn ZIP export.'));
    }
  });
}

export async function importLinkedInProfile(file: File): Promise<LinkedInImportResult> {
  const extension = file.name.includes('.')
    ? `.${file.name.split('.').pop()?.toLowerCase()}`
    : '';

  if (extension === '.zip') {
    return extractLinkedInZip(file);
  }

  if (extension === '.pdf') {
    const extracted = await extractFilesFromUpload(file);
    if (extracted.resumeText.trim().length < 40) {
      throw new Error(
        'Could not extract enough text from this PDF. Download a text-based LinkedIn profile PDF or import the LinkedIn data ZIP.'
      );
    }
    const sections = EMPTY_SECTIONS();
    sections.about = extracted.resumeText.slice(0, MAX_SECTION_TEXT_LENGTH);
    return {
      text: `# LinkedIn Profile PDF\n${sections.about}`,
      sections,
      fileNames: [file.name],
    };
  }

  if (extension === '.csv') {
    const section = sectionForFile(file.name);
    if (!section) {
      throw new Error(
        'This CSV does not appear to be a supported LinkedIn profile export section.'
      );
    }
    if (file.size > MAX_CSV_BYTES) {
      throw new Error('LinkedIn CSV files must be 1 MB or smaller.');
    }
    const formatted = formatCsvSection(file.name, section, await file.text());
    if (!formatted.text) {
      throw new Error(`No profile data was found in ${file.name}.`);
    }
    const sections = EMPTY_SECTIONS();
    sections[section] = formatted.text.slice(0, MAX_SECTION_TEXT_LENGTH);
    return {
      text: `# ${section}\n${formatted.text}`.slice(0, MAX_IMPORT_TEXT_LENGTH),
      sections,
      fileNames: [file.name],
      candidateName: formatted.candidateName,
    };
  }

  throw new Error('Import a LinkedIn profile PDF, data export ZIP, or profile CSV.');
}
