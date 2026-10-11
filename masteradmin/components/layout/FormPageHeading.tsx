"use client";

import { ArrowLeft } from "lucide-react";

type FormPageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  backLabel: string;
  onBack: () => void;
};

export default function FormPageHeading({
  eyebrow,
  title,
  description,
  backLabel,
  onBack,
}: FormPageHeadingProps) {
  return (
    <header className="mb-7 flex items-start gap-4">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-admin-border bg-white text-admin-text transition hover:bg-admin-surface-muted hover:text-admin-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="min-w-0">
        <div className="admin-eyebrow mb-2">{eyebrow}</div>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-description max-w-xl">{description}</p>
      </div>
    </header>
  );
}