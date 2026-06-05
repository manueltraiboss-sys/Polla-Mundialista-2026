"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
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
  "Argentina": "🇦🇷",
  "Brasil": "🇧🇷",
  "Uruguay": "🇺🇾",
  "Colombia": "🇨🇴",
  "Chile": "🇨🇱",
  "Ecuador": "🇪🇨",
  "México": "🇲🇽",
  "Mexico": "🇲🇽",
  "Estados Unidos": "🇺🇸",
  "USA": "🇺🇸",
  "Canadá": "🇨🇦",
  "Canada": "🇨🇦",
  "España": "🇪🇸",
  "Francia": "🇫🇷",
  "Alemania": "🇩🇪",
  "Italia": "🇮🇹",
  "Portugal": "🇵🇹",
  "Inglaterra": "🇬🇧",
  "Marruecos": "🇲🇦",
  "Japón": "🇯🇵",
  "Corea del Sur": "🇰🇷",
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
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", user.id)
        .single();

      const { data: ranking } = await supabase
        .from("ranking_positions")
        .select("*")
        .eq("id", user.id)
        .single();

      const { count: predictionsCount } = await supabase
        .from("predictions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: matchesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true });

      const { data: upcomingMatch } = await supabase
        .from("matches")
        .select("home_team, away_team, match_date")
        .gte("match_date", new Date().toISOString())
        .order("match_date")
        .limit(1)
        .single();

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

  const progress = useMemo(() => {
    if (!data || data.totalMatches === 0) return 0;
    return Math.round((data.predictions / data.totalMatches) * 100);
  }, [data]);

  const posLabel = data ? getPositionLabel(data.position) : null;

  const countdown = useMemo(() => {
    if (!nextMatch) return null;

    const diff = new Date(nextMatch.match_date).getTime() - Date.now();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);

    if (d > 0) return `En ${d}d ${h % 24}h`;
    if (h > 0) return `En ${h}h`;
    return "¡Pronto!";
  }, [nextMatch]);

  return (
    <>
      <style>{`/* (tu CSS sin cambios, lo puedes dejar igual) */`}</style>

      {!data ? (
        <div className="db-loading">
          <div className="db-spinner" />
        </div>
      ) : (
        <div className="db-root">

          {/* HERO */}
          <div className="db-hero">
            <div className="db-hero-glow" />
            <p className="db-greeting-label">
              Polla Mundialista · USA · Canadá · México 2026
            </p>

            <h1 className="db-greeting-name">
              Hola, <span>{data.fullName.split(" ")[0]}</span> 👋
            </h1>

            <p className="db-greeting-sub">
              Aquí está tu resumen de la competencia
            </p>

            <div className="db-position-headline">
              <span className="db-pos-emoji">{posLabel?.emoji}</span>
              <span className="db-pos-text">
                Estás en la posición <strong>#{data.position}</strong>{" "}
                con{" "}
                <strong style={{ color: posLabel?.color }}>
                  {data.points} pts
                </strong>
              </span>
            </div>
          </div>

          <div className="db-divider" />

          {/* STATS */}
          <div className="db-stats">
            {[
              {
                label: "Posición",
                value: `#${data.position}`,
                sub: posLabel?.emoji,
                delay: "0.2s",
              },
              {
                label: "Puntos",
                value: data.points,
                sub: "acumulados",
                delay: "0.25s",
              },
              {
                label: "Pronósticos",
                value: `${data.predictions}/${data.totalMatches}`,
                sub: "partidos",
                delay: "0.3s",
                progress: true,
              },
              {
                label: "Avance",
                value: `${progress}%`,
                sub: "completado",
                delay: "0.35s",
                progress: true,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="db-stat-card"
                style={{ animationDelay: s.delay }}
              >
                <div className="db-stat-label">{s.label}</div>
                <div className="db-stat-value">{s.value}</div>
                <div className="db-stat-sub">{s.sub}</div>

                {s.progress && s.label === "Avance" && (
                  <div className="db-progress-bar-bg">
                    <div
                      className="db-progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* NEXT MATCH */}
          {nextMatch && (
            <div className="db-next-wrap">
              <div className="db-next-card">
                <div style={{ flex: 1 }}>
                  <p className="db-next-label">⏰ Próximo partido</p>

                  <div className="db-next-teams">
                    <div className="db-next-team">
                      <span className="db-next-flag">
                        {getFlag(nextMatch.home_team)}
                      </span>
                      <span className="db-next-team-name">
                        {nextMatch.home_team}
                      </span>
                    </div>

                    <span className="db-next-vs">VS</span>

                    <div className="db-next-team">
                      <span className="db-next-flag">
                        {getFlag(nextMatch.away_team)}
                      </span>
                      <span className="db-next-team-name">
                        {nextMatch.away_team}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignItems: "flex-end",
                  }}
                >
                  <span className="db-next-date">
                    📅{" "}
                    <strong>
                      {new Date(nextMatch.match_date).toLocaleString(
                        "es-EC",
                        {
                          timeZone: "America/Guayaquil",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </strong>
                  </span>

                  <span className="db-countdown">{countdown}</span>
                </div>
              </div>
            </div>
          )}

          {/* LINKS */}
          <div className="db-links">
            <Link href="/partidos" className="db-link-card">
              <div className="db-link-icon">⚽</div>
              <div className="db-link-title">Pronósticos</div>
              <div className="db-link-desc">
                Ver y editar tus pronósticos de cada partido.
              </div>
            </Link>

            <Link href="/ranking" className="db-link-card">
              <div className="db-link-icon">🏆</div>
              <div className="db-link-title">Ranking</div>
              <div className="db-link-desc">
                Consulta la tabla de posiciones general.
              </div>
            </Link>

            {data.isAdmin && (
              <Link href="/admin" className="db-link-card admin">
                <div className="db-link-icon">⚙️</div>
                <div className="db-link-title">Administración</div>
                <div className="db-link-desc">
                  Gestión de resultados y partidos oficiales.
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}