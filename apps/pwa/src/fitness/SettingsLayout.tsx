import type { ReactNode } from "react";

import { IconChevR } from "./icons";

export function SettingsHubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-hub-section">
      <h3 className="settings-hub-section__title">{title}</h3>
      <div className="card settings-group">{children}</div>
    </section>
  );
}

export function SettingsRow({
  icon,
  label,
  trailing,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const interactive = Boolean(onClick) && !disabled;
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      className={`settings-row${disabled ? " settings-row--disabled" : ""}`}
      onClick={interactive ? onClick : undefined}
      disabled={interactive ? false : undefined}
    >
      <span className="settings-row__icon" aria-hidden>
        {icon}
      </span>
      <span className="settings-row__label">{label}</span>
      <span className="settings-row__trailing">
        {trailing !== undefined ? trailing : interactive ? <IconChevR size={16} stroke={2} /> : null}
      </span>
    </Tag>
  );
}

export function SettingsComingSoonRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <SettingsRow
      icon={icon}
      label={label}
      trailing={<span className="settings-coming-soon">Coming soon</span>}
      disabled
    />
  );
}

export function SettingsProfileCard({ name, onClick }: { name: string; onClick: () => void }) {
  const trimmed = name.trim();
  const initial = (trimmed[0] ?? "?").toUpperCase();
  const displayName = trimmed || "Add your name";

  return (
    <button type="button" className="card settings-profile-card tap" onClick={onClick}>
      <span className="settings-profile-card__avatar" aria-hidden>
        {initial}
      </span>
      <span className="settings-profile-card__text">
        <span className="settings-profile-card__name">{displayName}</span>
        <span className="settings-profile-card__hint">Personal details</span>
      </span>
      <IconChevR size={18} stroke={2} />
    </button>
  );
}
