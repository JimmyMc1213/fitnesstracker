import { useState, type ChangeEvent } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type PasswordInputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  "aria-label": string;
  className?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete,
  "aria-label": ariaLabel,
  className = "onboarding-input-pill",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        type={visible ? "text" : "password"}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="password-input-toggle tap"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <IconEyeOff size={20} stroke={1.75} aria-hidden /> : <IconEye size={20} stroke={1.75} aria-hidden />}
      </button>
    </div>
  );
}
