import { useMemo, useState, type ChangeEvent } from "react";
import { ImagePlus, Palette, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Eyebrow } from "../ui/Eyebrow";
import {
  COVER_PRESETS,
  COVER_PRESET_KEYS,
  PROJECT_ICONS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABEL,
  coverBackground,
  presetForColor,
  projectColorClasses,
  type Project,
  type ProjectColor,
  type ProjectCover,
  type ProjectIconKey,
  type ProjectStatus,
} from "../../data/projects";
import {
  ACTIVITY_CATEGORIES,
  CATEGORY_ORDER,
  type ActivityCategory,
} from "../../data/activityCategories";
import { useProjectStore } from "../../state/projectStore";
import { newId } from "../../utils/id";
import { resizeImageToDataUrl } from "../../utils/image";

type Props = {
  open: boolean;
  onClose: () => void;
  existing: Project | null;
};

const COLOR_OPTIONS: ProjectColor[] = ["purple", "green", "orange"];
const ICON_OPTIONS: ProjectIconKey[] = ["code", "book", "music"];

type CoverTab = "preset" | "upload";

type FormState = {
  name: string;
  category: string;
  description: string;
  status: ProjectStatus;
  activityCategory: ActivityCategory;
  color: ProjectColor;
  iconKey: ProjectIconKey;
  tagsInput: string;
  progressPercent: number;
  weeklyGoalMinutes: number;
  cover: ProjectCover;
};

function initialState(existing: Project | null): FormState {
  if (existing) {
    return {
      name: existing.name,
      category: existing.category,
      description: existing.description,
      status: existing.status,
      activityCategory: existing.activityCategory,
      color: existing.color,
      iconKey: existing.iconKey,
      tagsInput: existing.tags.join(", "),
      progressPercent: existing.progressPercent,
      weeklyGoalMinutes: existing.weeklyGoalMinutes,
      cover: existing.cover,
    };
  }
  return {
    name: "",
    category: "",
    description: "",
    status: "active",
    activityCategory: "coding",
    color: "purple",
    iconKey: "code",
    tagsInput: "",
    progressPercent: 0,
    weeklyGoalMinutes: 600,
    cover: { kind: "preset", preset: "nebula" },
  };
}

function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}

export function ProjectFormModal({ open, onClose, existing }: Props) {
  const upsertProject = useProjectStore((s) => s.upsertProject);
  const [form, setForm] = useState<FormState>(() => initialState(existing));
  const [coverTab, setCoverTab] = useState<CoverTab>(
    existing?.cover.kind === "image" ? "upload" : "preset"
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const isValid = form.name.trim().length > 0;
  const tags = useMemo(() => parseTags(form.tagsInput), [form.tagsInput]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const onSelectColor = (color: ProjectColor) => {
    setForm((s) => {
      const next: FormState = { ...s, color };
      if (s.cover.kind === "preset") {
        next.cover = { kind: "preset", preset: presetForColor(color) };
      }
      return next;
    });
  };

  const onUploadCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 800, 400, 0.82);
      update("cover", { kind: "image", dataUrl });
      setCoverTab("upload");
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not load that image."
      );
    } finally {
      setUploading(false);
    }
  };

  const onRemoveUpload = () => {
    update("cover", { kind: "preset", preset: presetForColor(form.color) });
    setCoverTab("preset");
  };

  const handleSubmit = () => {
    if (!isValid) return;
    const now = Date.now();
    const next: Project = {
      id: existing?.id ?? newId("project"),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      status: form.status,
      tags,
      weeklyMinutes: existing?.weeklyMinutes ?? 0,
      weeklyGoalMinutes: Math.max(0, form.weeklyGoalMinutes),
      progressPercent: Math.max(0, Math.min(100, form.progressPercent)),
      color: form.color,
      iconKey: form.iconKey,
      activityCategory: form.activityCategory,
      cover: form.cover,
      manualEntries: existing?.manualEntries ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    upsertProject(next);
    onClose();
  };

  const ringColors = projectColorClasses(form.color);
  const PreviewIcon = PROJECT_ICONS[form.iconKey];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit project" : "New project"}
      description={
        existing
          ? "Update your project details."
          : "Add a new home base for focused work."
      }
      size="lg"
    >
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto scrollbar-thin pr-1">
        <div
          className="relative h-28 rounded-xl border border-border-subtle overflow-hidden"
          style={{ background: coverBackground(form.cover) }}
          aria-label="Cover preview"
        >
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/10">
            <PreviewIcon size={14} className={ringColors.iconColor} />
            <span className="text-xs font-semibold text-white">
              {form.name.trim() || "Untitled project"}
            </span>
          </div>
        </div>

        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="What are you building?"
            className={inputCls}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Deep Learning Specialization"
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            <div className="flex items-center gap-1 bg-bg-elevated rounded-xl p-1">
              {PROJECT_STATUSES.map((s) => {
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update("status", s)}
                    className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-bg-card text-text-primary border border-border-subtle"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    aria-pressed={active}
                  >
                    {PROJECT_STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A short summary of what this project is about."
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60 resize-none"
          />
        </Field>

        <Field label="Tags" hint="Comma-separated">
          <input
            type="text"
            value={form.tagsInput}
            onChange={(e) => update("tagsInput", e.target.value)}
            placeholder="Deep Work, Personal, Machine Learning"
            className={inputCls}
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-bg-elevated text-text-secondary border border-border-subtle"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Activity category">
            <select
              value={form.activityCategory}
              onChange={(e) =>
                update("activityCategory", e.target.value as ActivityCategory)
              }
              className={inputCls}
            >
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {ACTIVITY_CATEGORIES[cat].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Weekly goal (minutes)">
            <input
              type="number"
              min={0}
              step={15}
              value={form.weeklyGoalMinutes}
              onChange={(e) =>
                update("weeklyGoalMinutes", Number(e.target.value) || 0)
              }
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Color">
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => {
                const active = form.color === c;
                const sw = projectColorClasses(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Color ${c}`}
                    aria-pressed={active}
                    onClick={() => onSelectColor(c)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${sw.iconBg} border ${
                      active ? "border-brand-purple" : "border-transparent"
                    } transition-colors`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sw.ringStroke }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Icon">
            <div className="flex items-center gap-2">
              {ICON_OPTIONS.map((key) => {
                const Icon = PROJECT_ICONS[key];
                const active = form.iconKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Icon ${key}`}
                    aria-pressed={active}
                    onClick={() => update("iconKey", key)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-bg-elevated border ${
                      active
                        ? "border-brand-purple text-brand-purple"
                        : "border-transparent text-text-secondary"
                    } transition-colors`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field
          label="Progress"
          hint={`${form.progressPercent}% complete`}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={form.progressPercent}
            onChange={(e) =>
              update("progressPercent", Number(e.target.value))
            }
            className="w-full accent-brand-purple"
          />
        </Field>

        <Field label="Cover">
          <div className="flex items-center gap-1 bg-bg-elevated rounded-xl p-1 mb-3 w-fit">
            <button
              type="button"
              onClick={() => setCoverTab("preset")}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                coverTab === "preset"
                  ? "bg-bg-card text-text-primary border border-border-subtle"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-pressed={coverTab === "preset"}
            >
              <Palette size={14} /> Preset
            </button>
            <button
              type="button"
              onClick={() => setCoverTab("upload")}
              className={`h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                coverTab === "upload"
                  ? "bg-bg-card text-text-primary border border-border-subtle"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-pressed={coverTab === "upload"}
            >
              <ImagePlus size={14} /> Upload
            </button>
          </div>

          {coverTab === "preset" ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {COVER_PRESET_KEYS.map((key) => {
                const active =
                  form.cover.kind === "preset" && form.cover.preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      update("cover", {
                        kind: "preset",
                        preset: key,
                      } satisfies ProjectCover)
                    }
                    aria-label={`Preset ${COVER_PRESETS[key].label}`}
                    aria-pressed={active}
                    className={`relative h-14 rounded-lg border-2 overflow-hidden transition-colors ${
                      active
                        ? "border-brand-purple"
                        : "border-transparent hover:border-border-strong"
                    }`}
                    style={{ background: COVER_PRESETS[key].background }}
                  >
                    <span className="absolute bottom-1 left-1 text-[9px] uppercase tracking-wider text-white/85 font-semibold">
                      {COVER_PRESETS[key].label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cover-upload"
                className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary cursor-pointer hover:bg-bg-cardHover transition-colors w-fit"
              >
                <ImagePlus size={14} />
                {uploading
                  ? "Processing…"
                  : form.cover.kind === "image"
                  ? "Replace image"
                  : "Choose image"}
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onUploadCover}
              />
              {form.cover.kind === "image" && (
                <button
                  type="button"
                  onClick={onRemoveUpload}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary w-fit"
                >
                  <X size={12} /> Remove upload
                </button>
              )}
              {uploadError && (
                <p className="text-xs text-accent-red">{uploadError}</p>
              )}
              <p className="text-[11px] text-text-muted">
                Images are resized to 800×400 and stored locally in your browser.
              </p>
            </div>
          )}
        </Field>
      </div>

      <footer className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border-subtle">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="h-10 px-4 rounded-xl bg-brand-purple text-white text-sm font-semibold hover:bg-brand-purple/90 disabled:bg-bg-elevated disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
        >
          {existing ? "Save changes" : "Create project"}
        </button>
      </footer>
    </Modal>
  );
}

const inputCls =
  "w-full h-10 bg-bg-elevated border border-border-subtle rounded-xl px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <Eyebrow as="span" className="flex items-center justify-between">
        {label}
        {hint && <span className="text-text-muted normal-case tracking-normal">{hint}</span>}
      </Eyebrow>
      {children}
    </label>
  );
}
