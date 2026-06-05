"use client";

import Link from "next/link";
import { useEffect, useState, useMemo  } from "react";
import { supabase } from "@/lib/supabase";

type DashboardData = {
  fullName: string;
  points: number;
  position: number;
  predictions: number;
  totalMatches: number;
  isAdmin: boolean;
};

type NextMatch = {
  home_team: string;
  away_team: string;
  match_date: string;
};

const FLAG_MAP: Record<string, string> = {
  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴",
  "Chile": "🇨🇱", "Ecuador": "🇪🇨", "México": "🇲🇽", "Mexico": "🇲🇽",
  "Estados Unidos": "🇺🇸", "USA": "🇺🇸", "Canadá": "🇨🇦", "Canada": "🇨🇦",
  "España": "🇪🇸", "Francia": "🇫🇷", "Alemania": "🇩🇪", "Italia": "🇮🇹",
  "Portugal": "🇵🇹", "Inglaterra": "🇬🇧", "Marruecos": "🇲🇦",
  "Japón": "🇯🇵", "Corea del Sur": "🇰🇷",
};
const getFlag = (t: string) => FLAG_MAP[t] ?? "🏳️";

function getPositionLabel(pos: number) {
  if (pos === 1) return { emoji: "🥇", color: "#D4AF37" };
  if (pos === 2) return { emoji: "🥈", color: "#b0b0b0" };
  if (pos === 3) return { emoji: "🥉", color: "#c8945a" };
  return { emoji: "🏅", color: "rgba(255,255,255,0.55)" };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: profile } = await supabase
        .from("profiles").select("full_name, is_admin").eq("id", user.id).single();

      const { data: ranking } = await supabase
        .from("ranking_positions").select("*").eq("id", user.id).single();

      const { count: predictionsCount } = await supabase
        .from("predictions").select("*", { count: "exact", head: true }).eq("user_id", user.id);

      const { count: matchesCount } = await supabase
        .from("matches").select("*", { count: "exact", head: true });

      const { data: upcomingMatch } = await supabase
        .from("matches").select("home_team, away_team, match_date")
        .gte("match_date", new Date().toISOString())
        .order("match_date").limit(1).single();

      setNextMatch(upcomingMatch);
      setData({
        fullName: profile?.full_name || user.email || "Usuario",
        points: ranking?.total_points || 0,
        position: ranking?.position || 0,
        predictions: predictionsCount || 0,
        totalMatches: matchesCount || 0,
        isAdmin: profile?.is_admin || false,
      });
    }
    loadDashboard();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const progress = data && data.totalMatches > 0
    ? Math.round((data.predictions / data.totalMatches) * 100) : 0;

  const posLabel = data ? getPositionLabel(data.position) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .db-root {
          min-height: 100vh;
          background: #07100a;
          font-family: 'Outfit', sans-serif;
          color: #fff;
          padding-bottom: 4rem;
        }

        /* ── Hero welcome ── */
        .db-hero {
          position: relative;
          padding: 3rem 2rem 2.5rem;
          max-width: 1000px;
          margin: 0 auto;
          overflow: hidden;
        }

        .db-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 50% at 20% 50%, rgba(212,175,55,0.13) 0%, transparent 70%);
          pointer-events: none;
        }

        .db-greeting-label {
          font-size: 0.7rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(212,175,55,0.65);
          margin-bottom: 0.4rem;
          animation: dbFadeUp 0.5s ease both;
        }

        .db-greeting-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          letter-spacing: 0.05em; color: #fff; line-height: 1;
          margin-bottom: 0.5rem;
          animation: dbFadeUp 0.5s 0.07s ease both; opacity: 0;
        }

        .db-greeting-name span { color: #D4AF37; }

        .db-greeting-sub {
          font-size: 0.9rem; font-weight: 300;
          color: rgba(255,255,255,0.45); letter-spacing: 0.04em;
          animation: dbFadeUp 0.5s 0.13s ease both; opacity: 0;
        }

        /* Position headline */
        .db-position-headline {
          display: inline-flex; align-items: center; gap: 0.6rem;
          margin-top: 1.2rem;
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 10px; padding: 0.6rem 1.1rem;
          animation: dbFadeUp 0.5s 0.18s ease both; opacity: 0;
        }

        .db-pos-emoji { font-size: 1.4rem; }

        .db-pos-text {
          font-size: 0.88rem; color: rgba(255,255,255,0.7);
        }

        .db-pos-text strong {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: 0.06em; color: #D4AF37;
        }

        @keyframes dbFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Divider ── */
        .db-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent);
          max-width: 1000px; margin: 0 auto 2rem;
        }

        /* ── Stats grid ── */
        .db-stats {
          max-width: 1000px; margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .db-stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 1.2rem 1.3rem;
          position: relative; overflow: hidden;
          animation: dbFadeUp 0.5s ease both; opacity: 0;
          transition: border-color 0.2s, background 0.2s;
        }

        .db-stat-card:hover {
          border-color: rgba(212,175,55,0.22);
          background: rgba(255,255,255,0.06);
        }

        .db-stat-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .db-stat-card:hover::before { opacity: 1; }

        .db-stat-label {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(255,255,255,0.35); margin-bottom: 0.75rem;
        }

        .db-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem; letter-spacing: 0.04em;
          color: #D4AF37; line-height: 1;
        }

        .db-stat-sub {
          font-size: 0.72rem; color: rgba(255,255,255,0.3);
          margin-top: 0.3rem;
        }

        /* Progress bar inside stat card */
        .db-progress-bar-bg {
          height: 4px; border-radius: 99px;
          background: rgba(255,255,255,0.07);
          margin-top: 0.75rem; overflow: hidden;
        }

        .db-progress-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #b8962e, #D4AF37);
          transition: width 1s ease;
        }

        /* ── Next match banner ── */
        .db-next-wrap {
          max-width: 1000px; margin: 0 auto 1.5rem;
          padding: 0 2rem;
          animation: dbFadeUp 0.5s 0.35s ease both; opacity: 0;
        }

        .db-next-card {
          border-radius: 14px; padding: 1.4rem 1.8rem;
          background: rgba(212,175,55,0.07);
          border: 1px solid rgba(212,175,55,0.22);
          display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;
        }

        .db-next-label {
          font-size: 0.65rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(212,175,55,0.65);
          margin-bottom: 0.3rem;
        }

        .db-next-teams {
          display: flex; align-items: center; gap: 0.8rem; flex: 1;
        }

        .db-next-team {
          display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
        }

        .db-next-flag { font-size: 2rem; line-height: 1; }

        .db-next-team-name {
          font-size: 0.75rem; font-weight: 600;
          color: rgba(255,255,255,0.7); text-align: center;
        }

        .db-next-vs {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.2);
        }

        .db-next-date {
          font-size: 0.82rem; color: rgba(255,255,255,0.5);
          display: flex; align-items: center; gap: 0.4rem;
        }

        .db-next-date strong {
          color: rgba(255,255,255,0.8); font-weight: 600;
        }

        /* Countdown badge */
        .db-countdown {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.85rem; letter-spacing: 0.08em;
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          color: #D4AF37; border-radius: 8px;
          padding: 0.35rem 0.75rem; white-space: nowrap;
        }

        /* ── Quick links ── */
        .db-links {
          max-width: 1000px; margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          animation: dbFadeUp 0.5s 0.42s ease both; opacity: 0;
        }

        .db-link-card {
          display: block; text-decoration: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 1.4rem 1.5rem;
          transition: all 0.2s; position: relative; overflow: hidden;
        }

        .db-link-card:hover {
          border-color: rgba(212,175,55,0.3);
          background: rgba(212,175,55,0.06);
          transform: translateY(-2px);
        }

        .db-link-card::after {
          content: '→';
          position: absolute; right: 1.2rem; top: 50%;
          transform: translateY(-50%);
          font-size: 1rem; color: rgba(212,175,55,0);
          transition: color 0.2s, right 0.2s;
        }

        .db-link-card:hover::after {
          color: rgba(212,175,55,0.6); right: 1rem;
        }

        .db-link-icon { font-size: 1.8rem; margin-bottom: 0.6rem; }

        .db-link-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem; letter-spacing: 0.06em; color: #fff;
          margin-bottom: 0.25rem;
        }

        .db-link-desc {
          font-size: 0.78rem; color: rgba(255,255,255,0.38);
          line-height: 1.4;
        }

        /* Admin card special */
        .db-link-card.admin {
          border-color: rgba(212,175,55,0.18);
          background: rgba(212,175,55,0.06);
        }

        .db-link-card.admin:hover {
          border-color: rgba(212,175,55,0.4);
          background: rgba(212,175,55,0.1);
        }

        /* ── Loading ── */
        .db-loading {
          min-height: 100vh; background: #07100a;
          display: flex; align-items: center; justify-content: center;
        }

        .db-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(212,175,55,0.2);
          border-top-color: #D4AF37;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); }
          .db-next-card { gap: 1rem; }
        }

        @media (max-width: 420px) {
          .db-stats { grid-template-columns: repeat(2, 1fr); padding: 0 1rem; }
          .db-next-wrap, .db-links { padding: 0 1rem; }
          .db-hero { padding: 2rem 1rem 2rem; }
        }
      `}</style>

      {!data ? (
        <div className="db-loading">
          <div className="db-spinner" />
        </div>
      ) : (
        <div className="db-root">

          {/* ── Hero ── */}
          <div className="db-hero">
            <div className="db-hero-glow" />
            <p className="db-greeting-label">Polla Mundialista · USA · Canadá · México 2026</p>
            <h1 className="db-greeting-name">
              Hola, <span>{data.fullName.split(" ")[0]}</span> 👋
            </h1>
            <p className="db-greeting-sub">Aquí está tu resumen de la competencia</p>

            <div className="db-position-headline">
              <span className="db-pos-emoji">{posLabel!.emoji}</span>
              <span className="db-pos-text">
                Estás en la posición{" "}
                <strong>#{data.position}</strong>{" "}
                con <strong style={{ color: posLabel!.color }}>{data.points} pts</strong>
              </span>
            </div>
          </div>

          <div className="db-divider" />

          {/* ── Stats ── */}
          <div className="db-stats">
            {[
              { label: "Posición", value: `#${data.position}`, sub: posLabel!.emoji, delay: "0.2s" },
              { label: "Puntos",   value: data.points,          sub: "acumulados",    delay: "0.25s" },
              { label: "Pronósticos", value: `${data.predictions}/${data.totalMatches}`, sub: "partidos", delay: "0.3s", progress: true },
              { label: "Avance",   value: `${progress}%`,       sub: "completado",   delay: "0.35s", progress: true },
            ].map((s, i) => (
              <div key={i} className="db-stat-card" style={{ animationDelay: s.delay }}>
                <div className="db-stat-label">{s.label}</div>
                <div className="db-stat-value">{s.value}</div>
                <div className="db-stat-sub">{s.sub}</div>
                {s.progress && s.label === "Avance" && (
                  <div className="db-progress-bar-bg">
                    <div className="db-progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Next match ── */}
          {nextMatch && (
            <div className="db-next-wrap">
              <div className="db-next-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="db-next-label">⏰ Próximo partido</p>
                  <div className="db-next-teams">
                    <div className="db-next-team">
                      <span className="db-next-flag">{getFlag(nextMatch.home_team)}</span>
                      <span className="db-next-team-name">{nextMatch.home_team}</span>
                    </div>
                    <span className="db-next-vs">VS</span>
                    <div className="db-next-team">
                      <span className="db-next-flag">{getFlag(nextMatch.away_team)}</span>
                      <span className="db-next-team-name">{nextMatch.away_team}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                  <span className="db-next-date">
                    📅 <strong>
                      {new Date(nextMatch.match_date).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                        dateStyle: "medium", timeStyle: "short",
                      })}
                    </strong>
                  </span>
                  <span className="db-countdown">
                    {(() => {
                      const diff = new Date(nextMatch.match_date).getTime() - Date.now();
                      const h = Math.floor(diff / 3600000);
                      const d = Math.floor(h / 24);
                      if (d > 0) return `En ${d}d ${h % 24}h`;
                      if (h > 0) return `En ${h}h`;
                      return "¡Pronto!";
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Quick links ── */}
          <div className="db-links">
            <Link href="/partidos" className="db-link-card">
              <div className="db-link-icon">⚽</div>
              <div className="db-link-title">Pronósticos</div>
              <div className="db-link-desc">Ver y editar tus pronósticos de cada partido.</div>
            </Link>

            <Link href="/ranking" className="db-link-card">
              <div className="db-link-icon">🏆</div>
              <div className="db-link-title">Ranking</div>
              <div className="db-link-desc">Consulta la tabla de posiciones general.</div>
            </Link>

            {data.isAdmin && (
              <Link href="/admin" className="db-link-card admin">
                <div className="db-link-icon">⚙️</div>
                <div className="db-link-title">Administración</div>
                <div className="db-link-desc">Gestión de resultados y partidos oficiales.</div>
              </Link>
            )}
          </div>

        </div>
      )}
    </>
  );
}