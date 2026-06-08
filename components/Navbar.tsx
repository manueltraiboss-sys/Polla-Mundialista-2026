"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
    };

    loadUser();
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "⚽" },
    { href: "/partidos", label: "Partidos", icon: "🗓️" },
    { href: "/ranking", label: "Ranking", icon: "🏅" },
    { href: "/mis-pronosticos", label: "Mis Pronósticos", icon: "📝" },
    {href: "/reglas", label: "Reglas", icon: "📜"},
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // ✅ Cambiado para navegación SPA fluida
  };

  return (
    <nav className="w-full relative z-50 font-sans">
      {/* Barra superior con gradiente animado reutilizando la utilidad global */}
      <div className="h-[5px] w-full bg-animated-gradient" />

      {/* Navbar principal */}
      <div className="flex justify-between items-center px-4 py-3 sm:px-8 bg-[var(--surface)] border-b border-[var(--surface-border)] shadow-md">
        
        {/* Marca / Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🏆</span>
          <span className="text-xl font-bold text-[var(--primary)]">
            Polla <span className="text-[var(--accent)]">Mundial</span>
          </span>
        </Link>

        {/* Links Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const isAdminLink = link.href === "/admin";

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md"
                          : isAdminLink
                          ? "text-[var(--accent)] hover:bg-[var(--accent)]/10"
                          : "text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                      }
                    `}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divisor vertical */}
          <div className="w-[1px] h-6 bg-[var(--surface-border)]" />

          {isLoggedIn && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-white font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(178,130,71,0.2)]"
            >
              <span>↩</span>
              Salir
            </button>
          )}
        </div>

        {/* Botón Menú Mobile (Hamburguesa animada) */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 p-2 rounded-lg hover:bg-[var(--surface-border)]/50 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`w-6 h-[3px] bg-[var(--primary)] rounded-full transition-transform duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[9px]" : ""}`} />
          <span className={`w-6 h-[3px] bg-[var(--primary)] rounded-full transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-[3px] bg-[var(--primary)] rounded-full transition-transform duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
        </button>
      </div>

      {/* Menú Desplegable Mobile */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[var(--surface)] border-b border-[var(--surface-border)] shadow-xl transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-md"
                      : "text-[var(--text-secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
                  }
                `}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          {isLoggedIn && (
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-white font-semibold active:scale-95 transition-transform"
            >
              <span>↩</span>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}