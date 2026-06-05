"use client";

import "./Navbar.css";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

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
    ...(isAdmin
      ? [{ href: "/admin", label: "Admin", icon: "⚙️" }]
      : []),
  ];

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="nav-root">
      <div className="nav-top-bar" />

      <div className="nav-bar">
        <Link href="/dashboard" className="nav-brand">
          <span className="nav-brand-trophy">🏆</span>

          <span className="nav-brand-text">
            Polla <span>Mundial</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="nav-links-group">
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link ${
                    link.href === "/admin" ? "admin-link" : ""
                  } ${
                    pathname === link.href ? "active" : ""
                  }`}
                >
                  <span className="nav-link-icon">
                    {link.icon}
                  </span>

                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-divider" />

          {
            <button
              className="nav-logout"
              onClick={logout}
            >
              <span>↩</span>
              Salir
            </button>
          }
        </div>

        {/* Mobile Button */}
        <button
          className={`nav-hamburger ${
            menuOpen ? "open" : ""
          }`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`nav-mobile-menu ${
          menuOpen ? "open" : ""
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-mobile-link ${
              pathname === link.href ? "active" : ""
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}

        {isLoggedIn && (
          <button
            className="nav-mobile-logout"
            onClick={logout}
          >
            <span>↩</span>
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}