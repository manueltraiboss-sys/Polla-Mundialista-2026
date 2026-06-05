"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

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
  Argentina: "🇦🇷",
  Brasil: "🇧🇷",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Ecuador: "🇪🇨",
  México: "🇲🇽",
  Mexico: "🇲🇽",
  "Estados Unidos": "🇺🇸",
  USA: "🇺🇸",
  Canadá: "🇨🇦",
  Canada: "🇨🇦",
  España: "🇪🇸",
  Francia: "🇫🇷",
  Alemania: "🇩🇪",
  Italia: "🇮🇹",
  Portugal: "🇵🇹",
  Inglaterra: "🇬🇧",
  Marruecos: "🇲🇦",
  Japón: "🇯🇵",
  "Corea del Sur": "🇰🇷",
};

const getFlag = (t: string) => FLAG_MAP[t] ?? "🏳️";

function getPositionLabel(pos: number) {
  if (pos === 1) return { emoji: "🥇", color: "#D4AF37" };
  if (pos === 2) return { emoji: "🥈", color: "#b0b0b0" };
  if (pos === 3) return { emoji: "🥉", color: "#c8945a" };
  return { emoji: "🏅", color: "#06368c" };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

  const progress =
    data && data.totalMatches > 0
      ? Math.round((data.predictions / data.totalMatches) * 100)
      : 0;

  const posLabel = data ? getPositionLabel(data.position) : null;

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.dbRoot}>
      <div className={styles.topDecoration}></div>
      <div className={styles.bottomDecoration}></div>

      <div className={styles.container}>
        {/* HERO */}
<div className={styles.hero}>
  <div className={styles.heroContent}>
    {/* Texto */}
    <div className={styles.heroText}>
      <p className={styles.label}>
        Polla Mundialista · USA · Canadá · México 2026
      </p>

      <h1 className={styles.title}>
        Hola, <span>{data.fullName.split(" ")[0]}</span> 👋
      </h1>

      <p className={styles.subtitle}>
        Aquí está tu resumen de la competencia
      </p>

      <div className={styles.position}>
        <span>{posLabel?.emoji}</span>
        <span>
          Estas en la posición #{data.position} con {data.points} pts
        </span>
      </div>
    </div>

    {/* Imagen derecha */}
    <div className={styles.heroImage}>
      <img
        src="/Boxi Mundialista.png"
        alt="Boxi Mundialista"
      />
    </div>
  </div>
</div>

        {/* STATS */}
        <div className={styles.stats}>
          {[
            {
              label: "Posición",
              value: `#${data.position}`,
              sub: posLabel?.emoji,
            },
            {
              label: "Puntos",
              value: data.points,
              sub: "acumulados",
            },
            {
              label: "Pronósticos",
              value: `${data.predictions}/${data.totalMatches}`,
              sub: "partidos",
            },
            {
              label: "Avance",
              value: `${progress}%`,
              sub: "completado",
              progress: true,
            },
          ].map((s, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardLabel}>{s.label}</div>

              <div className={styles.cardValue}>{s.value}</div>

              <div className={styles.cardSub}>{s.sub}</div>

              {s.progress && (
                <div className={styles.progressBg}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PRÓXIMO PARTIDO */}
        {nextMatch && (
  <div className={styles.nextMatch}>
    <div className={styles.nextMatchHeader}>
      <p className={styles.nextLabel}>
        <span className={styles.nextBadge}>
          <span>⏰</span> Próximo partido
        </span>
      </p>
      <div className={styles.nextMeta}>
        <span className={styles.nextDate}>
          📅 {new Date(nextMatch.match_date).toLocaleString("es-EC", {
            timeZone: "America/Guayaquil",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
        <span className={styles.nextCountdown}>En 5d 22h</span>
      </div>
    </div>

    <div className={styles.teams}>
      <div className={styles.team}>
        <div className={styles.flagWrap}>
          <div className={styles.flag}>{getFlag(nextMatch.home_team)}</div>
        </div>
        <div className={styles.teamName}>{nextMatch.home_team}</div>
      </div>

      <div className={styles.vsCol}>
        <div className={styles.vsDivider} />
        <div className={styles.vs}>VS</div>
        <div className={styles.vsDivider} />
      </div>

      <div className={styles.team}>
        <div className={styles.flagWrap}>
          <div className={styles.flag}>{getFlag(nextMatch.away_team)}</div>
        </div>
        <div className={styles.teamName}>{nextMatch.away_team}</div>
      </div>
    </div>
  </div>
)}
        

        {/* ACCESOS */}
        <div className={styles.links}>
          <Link href="/partidos" className={styles.linkCard}>
            <div className={styles.linkIcon}>⚽</div>
            <div className={styles.linkTitle}>Pronósticos</div>
            <div className={styles.linkDesc}>
              Ver y editar tus pronósticos.
            </div>
          </Link>

          <Link href="/ranking" className={styles.linkCard}>
            <div className={styles.linkIcon}>🏆</div>
            <div className={styles.linkTitle}>Ranking</div>
            <div className={styles.linkDesc}>
              Consulta la tabla general.
            </div>
          </Link>

          {data.isAdmin && (
            <Link href="/admin" className={styles.linkCard}>
              <div className={styles.linkIcon}>⚙️</div>
              <div className={styles.linkTitle}>Administración</div>
              <div className={styles.linkDesc}>
                Gestión de partidos y resultados.
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}