"use client";

import { useState } from "react";
import CopyButton from "@/app/components/copy-button";
import { updateCvProfile } from "./actions";
import { fieldInputClassName } from "./field-input";
import type { CvProfile } from "@/app/generated/prisma/client";

type ExperienceEntry = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  bullets: string;
};

type EducationEntry = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toExperienceEntries(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    const bullets = Array.isArray(record.bullets)
      ? record.bullets.filter((b): b is string => typeof b === "string").join("\n")
      : "";
    return {
      title: typeof record.title === "string" ? record.title : "",
      company: typeof record.company === "string" ? record.company : "",
      startDate: typeof record.startDate === "string" ? record.startDate : "",
      endDate: typeof record.endDate === "string" ? record.endDate : "",
      bullets,
    };
  });
}

function toEducationEntries(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const record = (entry ?? {}) as Record<string, unknown>;
    return {
      school: typeof record.school === "string" ? record.school : "",
      degree: typeof record.degree === "string" ? record.degree : "",
      startDate: typeof record.startDate === "string" ? record.startDate : "",
      endDate: typeof record.endDate === "string" ? record.endDate : "",
    };
  });
}

function experienceToText(entries: ExperienceEntry[]) {
  return entries
    .map((entry) => {
      const range = [entry.startDate, entry.endDate].filter(Boolean).join(" – ");
      const header = [entry.title, entry.company].filter(Boolean).join(" @ ");
      const bulletLines = entry.bullets
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `- ${line}`)
        .join("\n");
      return [header, range, bulletLines].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function educationToText(entries: EducationEntry[]) {
  return entries
    .map((entry) => {
      const range = [entry.startDate, entry.endDate].filter(Boolean).join(" – ");
      const header = [entry.degree, entry.school].filter(Boolean).join(", ");
      return [header, range].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

export default function CvProfileForm({ profile }: { profile: CvProfile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");
  const [skills, setSkills] = useState(asStringArray(profile.skills).join(", "));
  const [languages, setLanguages] = useState(asStringArray(profile.languages).join(", "));
  const [experience, setExperience] = useState<ExperienceEntry[]>(
    toExperienceEntries(profile.experience),
  );
  const [education, setEducation] = useState<EducationEntry[]>(
    toEducationEntries(profile.education),
  );

  function updateExperience(index: number, patch: Partial<ExperienceEntry>) {
    setExperience((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function updateEducation(index: number, patch: Partial<EducationEntry>) {
    setEducation((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  const experienceJson = JSON.stringify(
    experience.map((entry) => ({
      ...entry,
      bullets: entry.bullets
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    })),
  );
  const educationJson = JSON.stringify(education);

  return (
    <form action={updateCvProfile} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            Full name
            <CopyButton value={fullName} />
          </span>
          <input
            name="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            Email
            <CopyButton value={email} />
          </span>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            Phone
            <CopyButton value={phone} />
          </span>
          <input
            name="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            Address
            <CopyButton value={address} />
          </span>
          <input
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            LinkedIn URL
            <CopyButton value={linkedinUrl} />
          </span>
          <input
            type="url"
            name="linkedinUrl"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="flex items-center justify-between text-foreground/70">
            Portfolio URL
            <CopyButton value={portfolioUrl} />
          </span>
          <input
            type="url"
            name="portfolioUrl"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className={fieldInputClassName}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="flex items-center justify-between text-foreground/70">
          Summary
          <CopyButton value={summary} />
        </span>
        <textarea
          name="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={fieldInputClassName}
        />
      </label>

      <label className="block text-sm">
        <span className="flex items-center justify-between text-foreground/70">
          Skills (comma-separated)
          <CopyButton value={skills} />
        </span>
        <input
          name="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Roadmapping, SQL, Stakeholder management"
          className={fieldInputClassName}
        />
      </label>

      <label className="block text-sm">
        <span className="flex items-center justify-between text-foreground/70">
          Languages (comma-separated)
          <CopyButton value={languages} />
        </span>
        <input
          name="languages"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="English, French"
          className={fieldInputClassName}
        />
      </label>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Experience</h2>
          <div className="flex items-center gap-2">
            <CopyButton value={experienceToText(experience)} label="Copy section" />
            <button
              type="button"
              onClick={() =>
                setExperience((entries) => [
                  ...entries,
                  { title: "", company: "", startDate: "", endDate: "", bullets: "" },
                ])
              }
              className="rounded-md border border-black/[.08] px-3 py-1.5 text-sm font-medium dark:border-white/[.145]"
            >
              Add experience
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {experience.map((entry, index) => (
            <div
              key={index}
              className="rounded-md border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-foreground/70">Title</span>
                  <input
                    value={entry.title}
                    onChange={(e) => updateExperience(index, { title: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">Company</span>
                  <input
                    value={entry.company}
                    onChange={(e) => updateExperience(index, { company: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">Start date</span>
                  <input
                    value={entry.startDate}
                    onChange={(e) => updateExperience(index, { startDate: e.target.value })}
                    placeholder="e.g. 2021-03"
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">End date</span>
                  <input
                    value={entry.endDate}
                    onChange={(e) => updateExperience(index, { endDate: e.target.value })}
                    placeholder="e.g. Present"
                    className={fieldInputClassName}
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm">
                <span className="text-foreground/70">Bullets (one per line)</span>
                <textarea
                  rows={3}
                  value={entry.bullets}
                  onChange={(e) => updateExperience(index, { bullets: e.target.value })}
                  className={fieldInputClassName}
                />
              </label>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setExperience((entries) => entries.filter((_, i) => i !== index))
                  }
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {experience.length === 0 && (
            <p className="text-sm text-foreground/70">No experience entries yet.</p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Education</h2>
          <div className="flex items-center gap-2">
            <CopyButton value={educationToText(education)} label="Copy section" />
            <button
              type="button"
              onClick={() =>
                setEducation((entries) => [
                  ...entries,
                  { school: "", degree: "", startDate: "", endDate: "" },
                ])
              }
              className="rounded-md border border-black/[.08] px-3 py-1.5 text-sm font-medium dark:border-white/[.145]"
            >
              Add education
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {education.map((entry, index) => (
            <div
              key={index}
              className="rounded-md border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-foreground/70">School</span>
                  <input
                    value={entry.school}
                    onChange={(e) => updateEducation(index, { school: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">Degree</span>
                  <input
                    value={entry.degree}
                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">Start date</span>
                  <input
                    value={entry.startDate}
                    onChange={(e) => updateEducation(index, { startDate: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-foreground/70">End date</span>
                  <input
                    value={entry.endDate}
                    onChange={(e) => updateEducation(index, { endDate: e.target.value })}
                    className={fieldInputClassName}
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEducation((entries) => entries.filter((_, i) => i !== index))}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <p className="text-sm text-foreground/70">No education entries yet.</p>
          )}
        </div>
      </section>

      <input type="hidden" name="experienceJson" value={experienceJson} readOnly />
      <input type="hidden" name="educationJson" value={educationJson} readOnly />

      <button
        type="submit"
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Save profile
      </button>
    </form>
  );
}
