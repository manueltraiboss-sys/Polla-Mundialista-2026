import Link from "next/link";

type QuickLinkCardProps = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

export default function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="
        bg-surface
        border
        border-surface-border
        rounded-[20px]
        p-6
        shadow-lg
        transition-all
        hover:-translate-y-1
      "
    >
      <div className="text-3xl">{icon}</div>

      <div className="mt-3 text-xl font-bold text-primary">
        {title}
      </div>

      <div className="mt-1 text-[var(--text-secondary)]">
        {description}
      </div>
    </Link>
  );
}