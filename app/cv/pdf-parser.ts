import { extractLinks, extractTextItems, getDocumentProxy } from "unpdf";

// Deterministic parser tuned to a specific one-page LaTeX resume template:
// NAME line, contact line, then ÉDUCATION / EXPÉRIENCES / COMPÉTENCES /
// AUTRES EXPÉRIENCES sections (French section headers). It works from PDF
// text-item positions (x/y/fontSize) rather than the flattened text stream,
// because this template's font renders accented letters as separate
// combining-mark glyphs that a plain-text dump reorders unpredictably.

export type CvExperienceEntry = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type CvEducationEntry = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type CvProfileExtraction = {
  fullName: string;
  email: string;
  phone: string;
  address: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  summary: string | null;
  skills: string[];
  languages: string[];
  experience: CvExperienceEntry[];
  education: CvEducationEntry[];
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
};

type Line = {
  leftText: string;
  rightText: string | null;
  isBullet: boolean;
  hasBigFont: boolean;
  rawUpper: string;
};

// Gap thresholds (PDF points) calibrated against this template: fragments split
// mid-word by a combining diacritic mark sit ~4pt apart (often overlapping,
// i.e. negative); a genuine word/character space is ~2.5-6pt; the right-hand
// "date / location" column starts 75-450pt after the left column ends.
const MERGE_GAP_THRESHOLD = 1.5;
const COLUMN_GAP_THRESHOLD = 50;

const ACCENT_MAP: Record<string, Record<string, string>> = {
  acute: { a: "á", e: "é", i: "í", o: "ó", u: "ú", y: "ý", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", Y: "Ý" },
  grave: { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" },
  diaeresis: { a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü" },
  circumflex: { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" },
};

function applyAccent(char: string, type: keyof typeof ACCENT_MAP): string {
  return ACCENT_MAP[type][char] ?? char;
}

// Reconstructs accented characters that this PDF encodes as a bare combining
// mark next to its base letter (e.g. "´e" -> "é", "Franc¸ais" -> "Français").
function normalizeDiacritics(text: string): string {
  return text
    .replace(/c¸/g, "ç")
    .replace(/C¸/g, "Ç")
    .replace(/´([aeiouyAEIOUY])/g, (_, c: string) => applyAccent(c, "acute"))
    .replace(/`([aeiouAEIOU])/g, (_, c: string) => applyAccent(c, "grave"))
    .replace(/¨([aeiouAEIOU])/g, (_, c: string) => applyAccent(c, "diaeresis"))
    .replace(/\^([aeiouAEIOU])/g, (_, c: string) => applyAccent(c, "circumflex"))
    .replace(/[´`¨¸^]/g, "");
}

function clusterLines(items: RawItem[]): RawItem[][] {
  const filtered = items.filter((item) => item.str.trim() !== "");
  const sorted = [...filtered].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: RawItem[][] = [];
  let lineStartY: number | null = null;
  for (const item of sorted) {
    if (lineStartY === null || Math.abs(item.y - lineStartY) > 4) {
      lines.push([item]);
      lineStartY = item.y;
    } else {
      lines[lines.length - 1].push(item);
    }
  }
  return lines;
}

// Section-header capital letters render at ~11.96pt in this template (just
// under the nominal 12pt), while every other line tops out at 11pt.
const HEADER_FONT_SIZE_THRESHOLD = 11.5;

function reconstructLine(items: RawItem[]): Line {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const isBullet = sorted[0]?.str.trim() === "•";
  const hasBigFont = sorted.some((item) => item.fontSize >= HEADER_FONT_SIZE_THRESHOLD);
  const rawUpper = sorted.map((item) => item.str).join("").toUpperCase();

  const segments: string[] = [""];
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const prev = sorted[i - 1];
    const gap = prev ? item.x - (prev.x + prev.width) : 0;
    if (prev && gap >= COLUMN_GAP_THRESHOLD) {
      segments.push("");
    } else if (prev && gap >= MERGE_GAP_THRESHOLD) {
      segments[segments.length - 1] += " ";
    }
    segments[segments.length - 1] += item.str;
  }

  const leftText = normalizeDiacritics(segments[0] ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^•\s*/, "");
  const rightRaw = segments.length > 1 ? segments.slice(1).join(" ") : "";
  const rightText = normalizeDiacritics(rightRaw).replace(/\s+/g, " ").trim() || null;

  return { leftText, rightText, isBullet, hasBigFont, rawUpper };
}

function splitDateRange(text: string): { startDate: string; endDate: string } {
  const parts = text.split(/\s*[–-]\s*/);
  if (parts.length >= 2) {
    return { startDate: parts[0].trim(), endDate: parts.slice(1).join("-").trim() };
  }
  return { startDate: text.trim(), endDate: "" };
}

function splitLabelValue(text: string): { label: string; value: string } {
  const idx = text.indexOf(":");
  if (idx === -1) return { label: text, value: "" };
  return { label: text.slice(0, idx).trim(), value: text.slice(idx + 1).trim() };
}

type Section = "none" | "education" | "experience" | "skills" | "skip";

function detectHeader(line: Line): Section | null {
  if (!line.hasBigFont) return null;
  if (line.rawUpper.includes("UTRES")) return "skip";
  if (line.rawUpper.includes("XPERIENCE")) return "experience";
  if (line.rawUpper.includes("DUCATION")) return "education";
  if (line.rawUpper.includes("ETENCE")) return "skills";
  return null;
}

export async function parseCvPdf(buffer: Buffer): Promise<CvProfileExtraction> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { items: pages } = await extractTextItems(pdf);
  const { links } = await extractLinks(pdf);

  const allLines: Line[] = [];
  for (const pageItems of pages) {
    for (const cluster of clusterLines(pageItems as RawItem[])) {
      allLines.push(reconstructLine(cluster));
    }
  }

  const email = links.find((link) => link.startsWith("mailto:"))?.slice("mailto:".length) ?? "";
  const linkedinUrl = links.find((link) => /linkedin\.com/i.test(link)) ?? null;
  const portfolioUrl =
    links.find((link) => link !== linkedinUrl && !link.startsWith("mailto:")) ?? null;

  const fullName = allLines[0]?.leftText ?? "";
  const phone = allLines[1]?.leftText.split("|")[0]?.trim() ?? "";

  const education: CvEducationEntry[] = [];
  const experience: CvExperienceEntry[] = [];
  const skills: string[] = [];
  const languages: string[] = [];

  let section: Section = "none";
  let pendingSchool: string | null = null;
  let currentExperience: CvExperienceEntry | null = null;
  let expectingCompanyLine = false;

  for (let i = 2; i < allLines.length; i++) {
    const line = allLines[i];
    if (!line.leftText && !line.rightText) continue;

    const header = detectHeader(line);
    if (header) {
      if (currentExperience) {
        experience.push(currentExperience);
        currentExperience = null;
      }
      pendingSchool = null;
      expectingCompanyLine = false;
      section = header;
      continue;
    }

    if (section === "none" || section === "skip") continue;

    if (section === "education") {
      if (line.rightText && /\d/.test(line.rightText)) {
        if (pendingSchool) {
          const { startDate, endDate } = splitDateRange(line.rightText);
          education.push({ school: pendingSchool, degree: line.leftText, startDate, endDate });
          pendingSchool = null;
        }
      } else if (line.rightText) {
        pendingSchool = line.leftText;
      }
      continue;
    }

    if (section === "experience") {
      if (line.rightText && /\d/.test(line.rightText)) {
        if (currentExperience) experience.push(currentExperience);
        const { startDate, endDate } = splitDateRange(line.rightText);
        const [titlePart, stackPart] = line.leftText.split("|").map((part) => part.trim());
        currentExperience = {
          title: stackPart ? `${titlePart} — ${stackPart}` : titlePart,
          company: "",
          startDate,
          endDate,
          bullets: [],
        };
        expectingCompanyLine = true;
      } else if (expectingCompanyLine && currentExperience) {
        currentExperience.company = line.leftText;
        expectingCompanyLine = false;
      } else if (currentExperience) {
        if (line.isBullet) {
          currentExperience.bullets.push(line.leftText);
        } else if (currentExperience.bullets.length > 0) {
          currentExperience.bullets[currentExperience.bullets.length - 1] += ` ${line.leftText}`;
        }
      }
      continue;
    }

    if (section === "skills") {
      const { label, value } = splitLabelValue(line.leftText);
      const upperLabel = label.toUpperCase();
      const values = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      if (
        upperLabel.includes("LANGUES DE PROGRAMMATION") ||
        upperLabel.includes("FRAMEWORK") ||
        upperLabel.includes("OUTILS") ||
        upperLabel.includes("THODOLOG")
      ) {
        skills.push(...values);
      } else if (upperLabel.includes("LANGUES PARL")) {
        languages.push(...values);
      }
      // Other labels (e.g. "Passions") have no matching CvProfile field.
    }
  }

  if (currentExperience) experience.push(currentExperience);

  return {
    fullName,
    email,
    phone,
    address: null,
    linkedinUrl,
    portfolioUrl,
    summary: null,
    skills,
    languages,
    experience,
    education,
  };
}
