"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0); // 0-3

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[^a-zA-Z0-9]/.test(pw) || /[A-Z]/.test(pw)) s++;
    setStrength(pw ? s : 0);
  };

  const strengthLabel = ["", "Débil", "Regular", "Fuerte"][strength];
  const strengthColor = ["", "#e05252", "#e0a832", "#52c97a"][strength];

  const register = async () => {
    if (!fullName.trim()) { toast.error("Ingrese su nombre completo"); return; }
    if (!email.trim())    { toast.error("Ingrese su correo electrónico"); return; }
    if (password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Usuario registrado. Revise su correo para activar la cuenta.");
    setTimeout(() => { window.location.href = "/login"; }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") register();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .reg-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .reg-bg {
          position: absolute;
          inset: 0;
          background-image: url('/fondo login mundial.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        .reg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.75) 0%,
            rgba(5,30,10,0.68) 50%,
            rgba(0,0,0,0.80) 100%
          );
          z-index: 1;
        }

        .reg-accent-strip {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            transparent 0%,
            transparent 55%,
            rgba(212,175,55,0.07) 55%,
            rgba(212,175,55,0.07) 58%,
            transparent 58%
          );
          z-index: 2;
          pointer-events: none;
        }

        .reg-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 1.5rem;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 2.8rem 2.5rem 2.4rem;
          box-shadow:
            0 32px 64px rgba(0,0,0,0.55),
            0 0 0 1px rgba(212,175,55,0.14) inset;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .reg-icon {
          text-align: center;
          font-size: 2.4rem;
          margin-bottom: 0.4rem;
          animation: fadeUp 0.6s 0.08s ease both;
          opacity: 0;
        }

        .reg-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.06em;
          text-align: center;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 0.25rem;
          animation: fadeUp 0.6s 0.13s ease both;
          opacity: 0;
        }

        .reg-title span { color: #D4AF37; }

        .reg-subtitle {
          text-align: center;
          color: rgba(255,255,255,0.45);
          font-size: 0.8rem;
          font-weight: 300;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s 0.18s ease both;
          opacity: 0;
        }

        .reg-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
          margin-bottom: 1.8rem;
          animation: fadeUp 0.6s 0.2s ease both;
          opacity: 0;
        }

        .reg-field {
          margin-bottom: 1.15rem;
          animation: fadeUp 0.6s ease both;
          opacity: 0;
        }

        .reg-field:nth-child(1) { animation-delay: 0.26s; }
        .reg-field:nth-child(2) { animation-delay: 0.32s; }
        .reg-field:nth-child(3) { animation-delay: 0.38s; }

        .reg-label {
          display: block;
          font-size: 0.71rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.42rem;
        }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 10px;
          padding: 0.76rem 1rem;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .reg-input::placeholder { color: rgba(255,255,255,0.28); }

        .reg-input:focus {
          border-color: rgba(212,175,55,0.6);
          background: rgba(255,255,255,0.10);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.11);
        }

        /* Password strength bar */
        .strength-bar-wrap {
          margin-top: 0.55rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }

        .strength-label-text {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          min-width: 44px;
          text-align: right;
          transition: color 0.3s;
        }

        /* Steps indicator */
        .reg-steps {
          display: flex;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 1.6rem;
          animation: fadeUp 0.6s 0.22s ease both;
          opacity: 0;
        }

        .reg-step-dot {
          width: 28px;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.15);
          transition: background 0.3s;
        }

        .reg-step-dot.filled {
          background: #D4AF37;
        }

        /* Button */
        .reg-btn {
          width: 100%;
          padding: 0.88rem;
          margin-top: 0.5rem;
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
          box-shadow: 0 4px 24px rgba(212,175,55,0.32);
          animation: fadeUp 0.6s 0.44s ease both;
          opacity: 0;
        }

        .reg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(212,175,55,0.48);
          filter: brightness(1.08);
        }

        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .reg-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s;
        }
        .reg-btn:hover::after { left: 150%; }

        .btn-spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          border: 2px solid rgba(0,0,0,0.25);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .reg-login-link {
          text-align: center;
          margin-top: 1.5rem;
          animation: fadeUp 0.6s 0.5s ease both;
          opacity: 0;
        }

        .reg-login-link a {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.2s;
        }

        .reg-login-link a:hover { color: #D4AF37; }
        .reg-login-link a span { color: #D4AF37; font-weight: 600; }

        .ball {
          position: absolute;
          border-radius: 50%;
          opacity: 0.065;
          pointer-events: none;
          z-index: 3;
          background: radial-gradient(circle at 35% 35%, #ffffff, #888);
          animation: floatBall linear infinite;
        }

        @keyframes floatBall {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-120vh) rotate(720deg); }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-bg" />
        <div className="reg-overlay" />
        <div className="reg-accent-strip" />

        {/* Floating balls */}
        {[
          { size: 55, left: "12%",  bottom: "-80px",  dur: "20s", delay: "1s"  },
          { size: 35, left: "35%",  bottom: "-55px",  dur: "26s", delay: "5s"  },
          { size: 75, left: "72%",  bottom: "-100px", dur: "18s", delay: "3s"  },
          { size: 28, left: "88%",  bottom: "-45px",  dur: "16s", delay: "8s"  },
        ].map((b, i) => (
          <div
            key={i}
            className="ball"
            style={{ width: b.size, height: b.size, left: b.left, bottom: b.bottom, animationDuration: b.dur, animationDelay: b.delay }}
          />
        ))}

        <div className="reg-card">
          <div className="reg-icon">⚽</div>

          <h1 className="reg-title">
            Crear <span>Cuenta</span>
          </h1>
          <p className="reg-subtitle">USA · Canada · México 2026</p>

          {/* Progress dots — fill as user completes fields */}
          <div className="reg-steps">
            {[0,1,2].map((i) => {
              const filled =
                (i === 0 && fullName.trim().length > 0) ||
                (i === 1 && email.trim().length > 0) ||
                (i === 2 && password.length >= 6);
              return <div key={i} className={`reg-step-dot${filled ? " filled" : ""}`} />;
            })}
          </div>

          <div className="reg-divider" />

          {/* Fields */}
          <div className="reg-field">
            <label className="reg-label">Nombre completo</label>
            <input
              className="reg-input"
              type="text"
              placeholder="Ej. Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="name"
            />
          </div>

          <div className="reg-field">
            <label className="reg-label">Correo electrónico</label>
            <input
              className="reg-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
          </div>

          <div className="reg-field">
            <label className="reg-label">Contraseña</label>
            <input
              className="reg-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => { setPassword(e.target.value); calcStrength(e.target.value); }}
              onKeyDown={handleKeyDown}
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="strength-bar-wrap">
                <div className="strength-bars">
                  {[1,2,3].map((seg) => (
                    <div
                      key={seg}
                      className="strength-seg"
                      style={{ background: strength >= seg ? strengthColor : undefined }}
                    />
                  ))}
                </div>
                <span className="strength-label-text" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <button className="reg-btn" onClick={register} disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>

          <div className="reg-login-link">
            <Link href="/login">
              ¿Ya tienes cuenta? <span>Inicia sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}