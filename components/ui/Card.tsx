import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        w-full bg-[var(--surface)] border rounded-3xl border-[var(--surface-border)] shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}