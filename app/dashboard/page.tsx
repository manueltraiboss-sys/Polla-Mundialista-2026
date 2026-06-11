"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Componentes modulares
import HeroCard from "@/components/dashboard/HeroCard";
import StatCard from "@/components/dashboard/StatCard";
import MatchCard from "@/components/dashboard/MatchCard";
import QuickLinkCard from "@/components/dashboard/QuickLinkCard";
import IframeCard from "@/components/dashboard/IframeCard";

type DashboardData = {
  fullName: string;
  points: number;
  position: number;
  predictions: number;
  totalMatches: number;
  totalUsers: number;
  isAdmin: boolean;
};

type NextMatch = {
  home_team: string;
  away_team: string;
  match_date: string;
};

const getCountryCode = (teamName: string): string => {
  const codes: Record<string, string> = {
    // Sudamérica (CONMEBOL)
    "Ecuador": "ec",
    "Argentina": "ar",
    "Brasil": "br",
    "Colombia": "co",
    "Uruguay": "uy",
    "Perú": "pe",
    "Chile": "cl",
    "Venezuela": "ve",
    "Paraguay": "py",
    "Bolivia": "bo",
    
    // Norte/Centro América (CONCACAF)
    "México": "mx",
    "Estados Unidos": "us",
    "Canadá": "ca",
    "Costa Rica": "cr",
    "Panamá": "pa",
    "Haití": "ht",
    "Curazao": "cw",
    
    // Europa (UEFA)
    "España": "es",
    "Francia": "fr",
    "Alemania": "de",
    "Inglaterra": "gb-eng", 
    "Italia": "it",
    "Portugal": "pt",
    "Países Bajos": "nl",
    "Bélgica": "be",
    "Croacia": "hr",
    "República Checa": "cz",
    "Bosnia y Herzegovina": "ba",
    "Suiza": "ch",
    "Escocia": "gb-sct",
    "Turquía": "tr",
    "Suecia": "se",
    "Noruega": "no",
    "Austria": "at",
    
    // Asia (AFC)
    "Japón": "jp",
    "Corea del Sur": "kr",
    "Catar": "qa",
    "Irán": "ir",
    "Arabia Saudita": "sa",
    "Irak": "iq",
    "Jordania": "jo",
    "Uzbekistán": "uz",
    
    // África (CAF)
    "Marruecos": "ma",
    "Senegal": "sn",
    "Sudáfrica": "za",
    "Costa de Marfil": "ci",
    "Túnez": "tn",
    "Egipto": "eg",
    "Cabo Verde": "cv",
    "Argelia": "dz",
    "RD Congo": "cd",
    "Ghana": "gh",
    
    // Oceanía (OFC / AFC)
    "Australia": "au",
    "Nueva Zelanda": "nz",
  };

  return codes[teamName.trim()] || "un"; 
};

const getFlagUrl = (teamName: string) =>
  `https://flagcdn.com/w160/${getCountryCode(teamName)}.png`;

function getPositionLabel(pos: number) {
  if (pos === 1) return { emoji: "🥇", color: "#D4AF37" };
  if (pos === 2) return { emoji: "🥈", color: "#b0b0b0" };
  if (pos === 3) return { emoji: "🥉", color: "#c8945a" };
  return { emoji: "🏅", color: "#06368c" };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_admin, points, ranking")
        .eq("id", user.id)
        .single();

      const { count: predictionsCount } = await supabase
        .from("predictions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: matchesCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true });

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Mostrar el partido que comienza en los próximos 60 minutos o el siguiente en el futuro
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: upcomingMatch } = await supabase
        .from("matches")
        .select("home_team, away_team, match_date")
        .gte("match_date", oneHourAgo)
        .order("match_date")
        .limit(1)
        .single();

      setNextMatch(upcomingMatch);

      setData({
        fullName: profile?.full_name || user.email || "Usuario",
        points: profile?.points || 0,
        position: profile?.ranking || 0,
        predictions: predictionsCount || 0,
        totalMatches: matchesCount || 0,
        totalUsers: usersCount || 0,
        isAdmin: profile?.is_admin || false,
      });
    }

    loadDashboard();
  }, [router]);

  useEffect(() => {
    if (!nextMatch) return;

    const updateCountdown = () => {
      const diff = new Date(nextMatch.match_date).getTime() - Date.now();

      if (diff <= 0) {
        setCountdown("¡Comenzó!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setCountdown(`En ${days}d ${hours}h`);
      else if (hours > 0) setCountdown(`En ${hours}h ${minutes}m`);
      else setCountdown(`En ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  const progress = data && data.totalMatches > 0
    ? Math.round((data.predictions / data.totalMatches) * 100)
    : 0;

  const posLabel = data ? getPositionLabel(data.position) : null;

  if (!data) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-animated-gradient">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6 md:p-8 bg-animated-gradient">
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6 md:space-y-8">
        
        {/* HERO SECTION */}
        <HeroCard
          fullName={data.fullName}
          position={data.position}
          points={data.points}
          emoji={posLabel?.emoji || "🏅"}
        />

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            label="Posición"
            value={`${data.position}/${data.totalUsers} ${posLabel?.emoji || ""}`}
            sub={`participantes`}
          />
          <StatCard
            label="Puntos"
            value={data.points}
            sub="acumulados"
          />
          <StatCard
            label="Pronósticos"
            value={`${data.predictions}/${data.totalMatches}`}
            sub="partidos"
          />
          <StatCard
            label="Avance"
            value={`${progress}%`}
            sub="completado"
            progress={progress}
          />
        </div>

        {/* MATCH SECTION */}
        {nextMatch && (
          <MatchCard
            homeTeam={nextMatch.home_team}
            awayTeam={nextMatch.away_team}
            matchDate={nextMatch.match_date}
            countdown={countdown}
            getFlagUrl={getFlagUrl}
          />
        )}

        {/* QUICK LINKS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <QuickLinkCard
            href="/partidos"
            icon="⚽"
            title="Pronósticos"
            description="Ver y editar tus pronósticos."
          />
          <QuickLinkCard
            href="/ranking"
            icon="🏆"
            title="Ranking"
            description="Consulta la tabla general."
          />
          {data.isAdmin && (
            <QuickLinkCard
              href="/admin"
              icon="⚙️"
              title="Administración"
              description="Gestión de partidos y resultados."
            />
          )}
        </div>
      </div>
    </div>
  );
}