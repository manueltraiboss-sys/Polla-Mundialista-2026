type StatCardProps = {
  label: string;
  value: string | number;
  sub: string;
  progress?: number;
};

export default function StatCard({
  label,
  value,
  sub,
  progress,
}: StatCardProps) {
  return (
    <div className="bg-surface border border-surface-border rounded-[20px] p-6 shadow-lg">
      <div className="text-xs uppercase font-bold text-[var(--text-secondary)]">
        {label}
      </div>

      <div className="text-3xl font-bold text-primary mt-2">
        {value}
      </div>

      <div className="mt-2 text-[var(--text-secondary)]">
        {sub}
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-2 rounded-full bg-surface-border overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg,var(--accent),var(--accent-dark))",
            }}
          />
        </div>
      )}
    </div>
  );
}