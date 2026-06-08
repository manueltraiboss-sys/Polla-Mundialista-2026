import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`
        w-full p-3 sm:p-4 rounded-xl text-white font-semibold cursor-pointer
        transition-all duration-200
        bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]
        hover:-translate-y-0.5 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}