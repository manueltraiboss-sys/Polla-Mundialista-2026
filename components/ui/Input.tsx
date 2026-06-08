import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-1.5 text-sm font-semibold text-[var(--foreground)]">
          {label}
        </label>
      )}

      <input
        className={`
          w-full px-4 py-3 rounded-xl border border-[var(--input-border)]
          bg-transparent text-[var(--foreground)] placeholder:text-[var(--text-secondary)]
          outline-none transition-all
          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}