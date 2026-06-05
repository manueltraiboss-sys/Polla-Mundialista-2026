"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    toast.success("Bienvenido");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        /* Background image */
        .login-bg {
          position: absolute;
          inset: 0;
          background-image: url('/fondo login mundial.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        /* Dark gradient overlay for readability */
        .login-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.72) 0%,
            rgba(5, 30, 10, 0.65) 50%,
            rgba(0, 0, 0, 0.78) 100%
          );
          z-index: 1;
        }

        /* Decorative diagonal accent strip */
        .login-accent-strip {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            transparent 0%,
            transparent 55%,
            rgba(212, 175, 55, 0.08) 55%,
            rgba(212, 175, 55, 0.08) 58%,
            transparent 58%
          );
          z-index: 2;
          pointer-events: none;
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          margin: 1.5rem;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 20px;
          padding: 2.8rem 2.5rem 2.4rem;
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.55),
            0 0 0 1px rgba(212, 175, 55, 0.15) inset;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Trophy icon area */
        .login-icon {
          text-align: center;
          margin-bottom: 0.5rem;
          font-size: 2.6rem;
          animation: fadeUp 0.6s 0.1s ease both;
          opacity: 0;
        }

        /* Title */
        .login-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          letter-spacing: 0.06em;
          text-align: center;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 0.3rem;
          animation: fadeUp 0.6s 0.15s ease both;
          opacity: 0;
        }

        .login-title span {
          color: #D4AF37;
        }

        /* Subtitle */
        .login-subtitle {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.82rem;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 2.2rem;
          animation: fadeUp 0.6s 0.2s ease both;
          opacity: 0;
        }

        /* Divider line */
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent);
          margin-bottom: 2rem;
          animation: fadeUp 0.6s 0.22s ease both;
          opacity: 0;
        }

        /* Label */
        .login-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.45rem;
        }

        /* Input */
        .login-input-wrap {
          margin-bottom: 1.2rem;
          animation: fadeUp 0.6s 0.28s ease both;
          opacity: 0;
        }

        .login-input-wrap:last-of-type {
          animation-delay: 0.34s;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          padding: 0.78rem 1rem;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .login-input::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .login-input:focus {
          border-color: rgba(212, 175, 55, 0.6);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
        }

        /* Button */
        .login-btn {
          width: 100%;
          padding: 0.88rem;
          margin-top: 0.6rem;
          border: none;
          border-radius: 10px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.15rem;
          letter-spacing: 0.12em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #D4AF37 0%, #f0d060 45%, #b8962e 100%);
          color: #0a0a0a;
          transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
          box-shadow: 0 4px 24px rgba(212,175,55,0.35);
          animation: fadeUp 0.6s 0.4s ease both;
          opacity: 0;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212,175,55,0.5);
          filter: brightness(1.08);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Shimmer on button */
        .login-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s;
        }

        .login-btn:hover::after {
          left: 150%;
        }

        /* Register link */
        .login-register {
          text-align: center;
          margin-top: 1.6rem;
          animation: fadeUp 0.6s 0.46s ease both;
          opacity: 0;
        }

        .login-register a {
          color: rgba(255,255,255,0.55);
          font-size: 0.85rem;
          font-weight: 400;
          text-decoration: none;
          transition: color 0.2s;
        }

        .login-register a:hover {
          color: #D4AF37;
        }

        .login-register a span {
          color: #D4AF37;
          font-weight: 600;
        }

        /* Spinner */
        .btn-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.25);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Floating balls decoration */
        .ball {
          position: absolute;
          border-radius: 50%;
          opacity: 0.07;
          pointer-events: none;
          z-index: 3;
          background: radial-gradient(circle at 35% 35%, #ffffff, #888);
          animation: float linear infinite;
        }

        @keyframes float {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-120vh) rotate(720deg); }
        }
      `}</style>

      <div className="login-root">
        {/* Background image */}
        <div className="login-bg" />
        <div className="login-overlay" />
        <div className="login-accent-strip" />

        {/* Floating soccer ball decorations */}
        {[
          { size: 60, left: "8%",  bottom: "-80px", dur: "18s", delay: "0s"  },
          { size: 40, left: "22%", bottom: "-60px", dur: "24s", delay: "4s"  },
          { size: 80, left: "78%", bottom: "-100px",dur: "20s", delay: "2s"  },
          { size: 30, left: "90%", bottom: "-50px", dur: "15s", delay: "7s"  },
          { size: 50, left: "55%", bottom: "-70px", dur: "22s", delay: "10s" },
        ].map((b, i) => (
          <div
            key={i}
            className="ball"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              bottom: b.bottom,
              animationDuration: b.dur,
              animationDelay: b.delay,
            }}
          />
        ))}

        {/* Card */}
        <div className="login-card">
          <div className="login-icon">🏆</div>

          <h1 className="login-title">
            Polla <span>Mundialista</span>
          </h1>
          <p className="login-subtitle">USA · Canada · México 2026</p>

          <div className="login-divider" />

          <div className="login-input-wrap">
            <label className="login-label">Correo electrónico</label>
            <input
              className="login-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
          </div>

          <div className="login-input-wrap">
            <label className="login-label">Contraseña</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          <button
            className="login-btn"
            onClick={login}
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>

          <div className="login-register">
            <Link href="/register">
              ¿No tienes cuenta? <span>Regístrate aquí</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}