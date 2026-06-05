"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

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
    { href: "/partidos",  label: "Partidos",  icon: "🗓️" },
    { href: "/ranking",   label: "Ranking",   icon: "🏅" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: "⚙️" }] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Outfit', sans-serif;
        }

        /* Glass bar */
        .nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 64px;
          background: rgba(6, 14, 6, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.22);
          box-shadow: 0 4px 32px rgba(0,0,0,0.45);
        }

        /* Logo / brand */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
        }

        .nav-brand-trophy {
          font-size: 1.4rem;
          line-height: 1;
        }

        .nav-brand-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.35rem;
          letter-spacing: 0.08em;
          color: #ffffff;
          line-height: 1;
        }

        .nav-brand-text span {
          color: #D4AF37;
        }

        /* Links group */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          position: relative;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 0.9rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.6);
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .nav-link-icon {
          font-size: 0.95rem;
          line-height: 1;
        }

        .nav-link:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.07);
        }

        /* Active state */
        .nav-link.active {
          color: #D4AF37;
          background: rgba(212,175,55,0.1);
        }

        /* Active underline bar */
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          border-radius: 99px;
          background: linear-gradient(90deg, #D4AF37, #f0d060);
        }

        /* Admin link special style */
        .nav-link.admin-link {
          border: 1px solid rgba(212,175,55,0.3);
          color: #D4AF37;
          padding: 0.38rem 0.85rem;
        }

        .nav-link.admin-link:hover {
          background: rgba(212,175,55,0.12);
          border-color: rgba(212,175,55,0.55);
        }

        /* Logout button */
        .nav-logout {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.42rem 0.9rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.4);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          font-family: 'Outfit', sans-serif;
        }

        .nav-logout:hover {
          color: #ff6b6b;
          background: rgba(255,80,80,0.08);
        }

        /* Divider between links and logout */
        .nav-divider {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,0.12);
          margin: 0 0.5rem;
          flex-shrink: 0;
        }

        /* Hamburger (mobile) */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }

        .nav-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: rgba(255,255,255,0.75);
          border-radius: 99px;
          transition: transform 0.25s, opacity 0.25s;
        }

        .nav-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .nav-hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        .nav-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile dropdown */
        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          background: rgba(6,14,6,0.97);
          border-bottom: 1px solid rgba(212,175,55,0.18);
          padding: 0.75rem 1.5rem 1rem;
          gap: 0.3rem;
        }

        .nav-mobile-menu.open {
          display: flex;
        }

        .nav-mobile-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          transition: color 0.2s, background 0.2s;
        }

        .nav-mobile-link:hover,
        .nav-mobile-link.active {
          color: #D4AF37;
          background: rgba(212,175,55,0.09);
        }

        .nav-mobile-logout {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.75rem;
          margin-top: 0.25rem;
          border-radius: 8px;
          border: none;
          background: none;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255,100,100,0.7);
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          text-align: left;
        }

        .nav-mobile-logout:hover {
          color: #ff6b6b;
          background: rgba(255,80,80,0.08);
        }

        /* Thin gold accent bar at very top */
        .nav-top-bar {
          height: 3px;
          background: linear-gradient(90deg, #b8962e, #D4AF37, #f0d060, #D4AF37, #b8962e);
          background-size: 200% 100%;
          animation: shimmerBar 3s linear infinite;
        }

        @keyframes shimmerBar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .nav-links-group { display: none; }
          .nav-hamburger   { display: flex; }
        }
      `}</style>

      <nav className="nav-root">
        {/* Animated gold top bar */}
        <div className="nav-top-bar" />

        <div className="nav-bar">
          {/* Brand */}
          <Link href="/dashboard" className="nav-brand">
            <span className="nav-brand-trophy">🏆</span>
            <span className="nav-brand-text">
              Polla <span>Mundial</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links-group" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ul className="nav-links">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`nav-link${link.href === "/admin" ? " admin-link" : ""}${pathname === link.href ? " active" : ""}`}
                  >
                    <span className="nav-link-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="nav-divider" />

            <button
              className="nav-logout"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>↩</span>
              Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`nav-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`nav-mobile-menu${menuOpen ? " open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-mobile-link${pathname === link.href ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <button
            className="nav-mobile-logout"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            <span>↩</span>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </>
  );
}