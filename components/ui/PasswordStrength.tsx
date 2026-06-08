interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength++;

  const label = strength === 1 ? "Débil" : strength === 2 ? "Regular" : "Fuerte";

  const color = strength === 1 ? "bg-red-500" : strength === 2 ? "bg-yellow-500" : "bg-green-500";
  const textColor = strength === 1 ? "text-red-500" : strength === 2 ? "text-yellow-500" : "text-green-500";

  return (
    <div className="mt-2 mb-4">
      <div className="flex gap-2">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`
              flex-1 h-1.5 rounded-full transition-all duration-300
              ${strength >= seg ? color : "bg-[var(--surface-border)]"}
            `}
          />
        ))}
      </div>
      <small className={`mt-1.5 block text-sm font-medium ${textColor}`}>
        {label}
      </small>
    </div>
  );
}