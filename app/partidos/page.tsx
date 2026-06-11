"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type Match = {
  id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  stage: string;
  home_score: number | null;
  away_score: number | null;
  finished: boolean;
};

type Prediction = {
  match_id: number;
  predicted_home: number;
  predicted_away: number;
  points: number;
};

type PredictionInputs = {
  [key: number]: { predicted_home: string; predicted_away: string };
};

// Helper: Mapeo de selecciones a códigos ISO para FlagCDN
const getCountryCode = (teamName: string): string => {
  const codes: Record<string, string> = {
    // Sudamérica (CONMEBOL)
    Ecuador: "ec",
    Argentina: "ar",
    Brasil: "br",
    Colombia: "co",
    Uruguay: "uy",
    Perú: "pe",
    Chile: "cl",
    Venezuela: "ve",
    Paraguay: "py",
    Bolivia: "bo",

    // Norte/Centro América (CONCACAF)
    México: "mx",
    "Estados Unidos": "us",
    Canadá: "ca",
    "Costa Rica": "cr",
    Panamá: "pa",
    Haití: "ht",
    Curazao: "cw",

    // Europa (UEFA)
    España: "es",
    Francia: "fr",
    Alemania: "de",
    Inglaterra: "gb-eng",
    Italia: "it",
    Portugal: "pt",
    "Países Bajos": "nl",
    Bélgica: "be",
    Croacia: "hr",
    "República Checa": "cz",
    "Bosnia y Herzegovina": "ba",
    Suiza: "ch",
    Escocia: "gb-sct", // Código especial en FlagCDN
    Turquía: "tr",
    Suecia: "se",
    Noruega: "no",
    Austria: "at",

    // Asia (AFC)
    Japón: "jp",
    "Corea del Sur": "kr",
    Catar: "qa",
    Irán: "ir",
    "Arabia Saudita": "sa",
    Irak: "iq",
    Jordania: "jo",
    Uzbekistán: "uz",

    // África (CAF)
    Marruecos: "ma",
    Senegal: "sn",
    Sudáfrica: "za",
    "Costa de Marfil": "ci",
    Túnez: "tn",
    Egipto: "eg",
    "Cabo Verde": "cv",
    Argelia: "dz",
    "RD Congo": "cd",
    Ghana: "gh",

    // Oceanía (OFC / AFC)
    Australia: "au",
    "Nueva Zelanda": "nz",
  };

  // Normalizamos espacios y buscamos. Si no existe, usamos "un" (ONU) como fallback.
  return codes[teamName.trim()] || "un";
};

// Helper: Construye la URL de FlagCDN
const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;

export default function PartidosPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [inputs, setInputs] = useState<PredictionInputs>({});
  const [predictions, setPredictions] = useState<Record<number, Prediction>>(
    {},
  );
  const [saving, setSaving] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  // null = sin filtro de fecha; string "YYYY-MM-DD" = fecha seleccionada
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const dateScrollRef = useRef<HTMLDivElement>(null);
  const [canDateScrollLeft, setCanDateScrollLeft] = useState(false);
  const [canDateScrollRight, setCanDateScrollRight] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("match_date");

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", user.id);

    const predictionMap: PredictionInputs = {};
    const predictionsDataMap: Record<number, Prediction> = {};

    predictionsData?.forEach((p) => {
      predictionMap[p.match_id] = {
        predicted_home: p.predicted_home.toString(),
        predicted_away: p.predicted_away.toString(),
      };
      predictionsDataMap[p.match_id] = p;
    });

    setInputs(predictionMap);
    setPredictions(predictionsDataMap);
    setMatches(matchesData || []);

    const stages = [...new Set((matchesData || []).map((m) => m.stage))].sort(
      (a, b) => a.localeCompare(b),
    );
    if (stages.length > 0 && !activeStage) {
      setActiveStage(stages[0]);
    }
  }

  const checkDateScroll = () => {
    if (dateScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dateScrollRef.current;
      setCanDateScrollLeft(scrollLeft > 0);
      setCanDateScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const scrollDate = (direction: "left" | "right") => {
    if (dateScrollRef.current) {
      const shift = direction === "left" ? -250 : 250;
      dateScrollRef.current.scrollBy({ left: shift, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkDateScroll();
    window.addEventListener("resize", checkDateScroll);
    return () => window.removeEventListener("resize", checkDateScroll);
  }, [matches]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [matches, activeStage]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const shift = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: shift, behavior: "smooth" });
    }
  };

  const isMatchClosed = (date: string) => new Date() >= new Date(date);

  const handleScoreChange = (
    matchId: number,
    team: "home" | "away",
    value: string,
  ) => {
    if (!/^\d*$/.test(value)) return;
    setInputs((prev) => ({
      ...prev,
      [matchId]: {
        predicted_home: prev[matchId]?.predicted_home ?? "0",
        predicted_away: prev[matchId]?.predicted_away ?? "0",
        [team === "home" ? "predicted_home" : "predicted_away"]: value,
      },
    }));
  };

  const adjustScore = (
    matchId: number,
    team: "home" | "away",
    delta: number,
  ) => {
    setInputs((prev) => {
      const field = team === "home" ? "predicted_home" : "predicted_away";
      const currentVal = prev[matchId]?.[field] ?? "0";
      const num = parseInt(currentVal, 10) || 0;
      const nextVal = Math.max(0, num + delta);

      return {
        ...prev,
        [matchId]: {
          predicted_home: prev[matchId]?.predicted_home ?? "0",
          predicted_away: prev[matchId]?.predicted_away ?? "0",
          [field]: nextVal.toString(),
        },
      };
    });
  };

  const savePrediction = async (matchId: number) => {
  const match = matches.find((m) => m.id === matchId);
  if (match && isMatchClosed(match.match_date))
    return toast.error("El partido ya inició.");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Obtenemos el pronóstico, usando "0" como fallback si no se ha tocado
  const prediction = inputs[matchId];
  const homeVal = prediction?.predicted_home ?? "0";
  const awayVal = prediction?.predicted_away ?? "0";

  // Validación estricta: solo falla si el input está literalmente vacío
  if (homeVal === "" || awayVal === "") {
    return toast.error("Ingrese ambos marcadores. No pueden estar vacíos.");
  }

  // Convertimos a número de forma segura
  const homeScore = Number(homeVal);
  const awayScore = Number(awayVal);

  setSaving(matchId);

  const { error } = await supabase
    .from("predictions")
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home: homeScore,
        predicted_away: awayScore,
      },
      {
        onConflict: "user_id,match_id",
      }
    );

  setSaving(null);

  if (error) return toast.error(error.message);

  toast.success("Pronóstico guardado ✓");
  loadData();
};

  const groupedMatches = matches.reduce(
    (acc, match) => {
      if (!acc[match.stage]) acc[match.stage] = [];
      acc[match.stage].push(match);
      return acc;
    },
    {} as Record<string, Match[]>,
  );

  // Zona horaria Ecuador
  const TZ = "America/Guayaquil";

  const toDateStr = (iso: string) =>
    new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: TZ });

  // Todas las fechas únicas con partidos, ordenadas ascendente
  const allMatchDates = [
    ...new Set(matches.map((m) => toDateStr(m.match_date))),
  ].sort();

  // Stages que tienen al menos un partido en la fecha seleccionada
  const stagesForDate = selectedDate
    ? new Set(
        matches
          .filter((m) => toDateStr(m.match_date) === selectedDate)
          .map((m) => m.stage),
      )
    : null;

  const allStages = Object.keys(groupedMatches).sort((a, b) =>
    a.localeCompare(b),
  );

  const visibleStages =
    stagesForDate ? allStages.filter((s) => stagesForDate.has(s)) : allStages;

  // Partidos visibles: si hay fecha activa, sólo los de esa fecha dentro del stage
  const visibleMatches = activeStage
    ? (groupedMatches[activeStage] || []).filter((m) =>
        selectedDate ? toDateStr(m.match_date) === selectedDate : true,
      )
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6 md:p-8 bg-animated-gradient pb-24">
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6 md:space-y-8">
        <Card className="text-center p-6 md:p-10 border border-[var(--surface-border)] shadow-sm">
          <p className="uppercase tracking-widest text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 inline-block px-4 py-1.5 rounded-full mb-3">
            Mundial 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--primary)] tracking-tight">
            <span className="text-[var(--accent)]">Pronósticos</span>
          </h1>
        </Card>

        {/* CONTROLES DE NAVEGACIÓN Y FASES */}
        <div className="flex flex-col gap-3">
          {/* ── Selector de fechas ── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Filtrar por fecha
              </p>
              {selectedDate && (
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    // restaurar primer stage general
                    if (allStages.length > 0) setActiveStage(allStages[0]);
                  }}
                  className="text-xs text-[var(--text-secondary)] hover:underline font-semibold"
                >
                  Limpiar filtro ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => scrollDate("left")}
                disabled={!canDateScrollLeft}
                className={`
                  hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center
                  bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--primary)]
                  transition-all duration-300 z-10 hover:bg-[var(--primary)]/10 shadow-sm
                  ${!canDateScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
                `}
                aria-label="Desplazar fechas a la izquierda"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div
                className="relative w-full overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)",
                }}
              >
                <div
                  ref={dateScrollRef}
                  onScroll={checkDateScroll}
                  className="flex gap-2 overflow-x-auto pb-1 px-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
              {allMatchDates.map((dateStr) => {
                const isToday = dateStr === todayStr;
                const isSelected = selectedDate === dateStr;
                const dateObj = new Date(dateStr + "T12:00:00");
                const label = dateObj.toLocaleDateString("es-EC", {
                  timeZone: TZ,
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const stagesCount = new Set(
                  matches
                    .filter((m) => toDateStr(m.match_date) === dateStr)
                    .map((m) => m.stage),
                ).size;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                        if (allStages.length > 0) setActiveStage(allStages[0]);
                      } else {
                        setSelectedDate(dateStr);
                        // auto-seleccionar primer stage de esa fecha
                        const firstStage = allStages.find((s) =>
                          matches.some(
                            (m) =>
                              m.stage === s && toDateStr(m.match_date) === dateStr,
                          ),
                        );
                        if (firstStage) setActiveStage(firstStage);
                      }
                    }}
                    className={`
                      relative flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all duration-200
                      ${
                        isSelected
                          ? "bg-gradient-to-b from-[var(--accent)] to-[var(--accent-dark)] text-[var(--foreground)] border-transparent shadow-lg scale-105"
                          : isToday
                          ? "bg-[var(--primary)]/10 border-[var(--primary)]/40 text-[var(--primary)] hover:scale-105"
                          : "bg-[var(--surface)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      }
                    `}
                  >
                    {isToday && (
                      <span
                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/30 text-white"
                            : "bg-[var(--primary)] text-white"
                        }`}
                      >
                        Hoy
                      </span>
                    )}
                    <span className="capitalize mt-1">{label}</span>
                    <span
                      className={`text-[10px] mt-0.5 font-medium ${
                        isSelected
                          ? "text-white/70"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {stagesCount} {stagesCount === 1 ? "grupo" : "grupos"}
                    </span>
                  </button>
                );
              })}
                </div>
              </div>

              <button
                onClick={() => scrollDate("right")}
                disabled={!canDateScrollRight}
                className={`
                  hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center
                  bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--primary)]
                  transition-all duration-300 z-10 hover:bg-[var(--primary)]/10 shadow-sm
                  ${!canDateScrollRight ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
                `}
                aria-label="Desplazar fechas a la derecha"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Fases scrollables */}
          <div className="flex items-center gap-2 relative">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`
              hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center
              bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--primary)]
              transition-all duration-300 z-10 hover:bg-[var(--primary)]/10 shadow-sm
              ${!canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
            `}
            aria-label="Desplazar a la izquierda"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div
            className="relative w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)",
            }}
          >
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {visibleStages.map((stage) => {
                  const isActive = activeStage === stage;
                  return (
                    <button
                      key={stage}
                      className={`
                        snap-center whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm border
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-[var(--foreground)] border-transparent shadow-md scale-105"
                            : "bg-[var(--surface)] border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }
                      `}
                      onClick={() => setActiveStage(stage)}
                    >
                      {stage}
                    </button>
                  );
                })}
            </div>
          </div>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`
              hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center
              bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--primary)]
              transition-all duration-300 z-10 hover:bg-[var(--primary)]/10 shadow-sm
              ${!canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}
            `}
            aria-label="Desplazar a la derecha"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        </div>

        {/* LISTA DE PARTIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleMatches.map((match) => {
            const closed = isMatchClosed(match.match_date);

            return (
              <Card
                key={match.id}
                className={`group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-[var(--surface-border)] flex flex-col justify-between bg-gradient-to-b from-[var(--surface)] to-[var(--background)] ${
                  match.finished ? "opacity-70 grayscale-[20%]" : ""
                }`}
              >
                {/* Indicador superior de color decorativo */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${closed ? "bg-red-500/50" : "bg-[var(--primary)]"}`}
                />

                <div>
                  {/* HEADER: Fecha y Estado */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--surface-border)] shadow-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {new Date(match.match_date).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                        closed
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-[var(--primary)]/10 text-[var(--primary-hover)] border-[var(--primary)]/20 animate-pulse"
                      }`}
                    >
                      {closed ? "Cerrado" : "Abierto"}
                    </span>
                  </div>

                  {/* BODY: Enfrentamiento Cara a Cara con Banderas */}
                  <div className="flex items-center justify-between mb-8 relative px-2">
                    {/* Equipo Local */}
                    <div className="flex flex-col items-center flex-1 z-10 w-1/3">
                      <div className="relative w-16 h-12 sm:w-20 sm:h-14 mb-4 drop-shadow-md transform transition-transform group-hover:scale-110 duration-300">
                        <Image
                          src={getFlagUrl(getCountryCode(match.home_team))}
                          alt={`Bandera de ${match.home_team}`}
                          fill
                          sizes="(max-width: 768px) 64px, 80px"
                          className="object-cover rounded-md border border-[var(--surface-border)]"
                        />
                      </div>
                      <span className="text-[var(--foreground)] text-center font-bold text-sm sm:text-base leading-tight">
                        {match.home_team}
                      </span>
                    </div>

                    {/* Insignia VS Central */}
                    <div className="px-2 flex flex-col items-center justify-center z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--background)] border border-[var(--surface-border)] shadow-inner flex items-center justify-center">
                        <span className="text-[11px] sm:text-xs font-black text-[var(--text-secondary)] opacity-70">
                          VS
                        </span>
                      </div>
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex flex-col items-center flex-1 z-10 w-1/3">
                      <div className="relative w-16 h-12 sm:w-20 sm:h-14 mb-4 drop-shadow-md transform transition-transform group-hover:scale-110 duration-300">
                        <Image
                          src={getFlagUrl(getCountryCode(match.away_team))}
                          alt={`Bandera de ${match.away_team}`}
                          fill
                          sizes="(max-width: 768px) 64px, 80px"
                          className="object-cover rounded-md border border-[var(--surface-border)]"
                        />
                      </div>
                      <span className="text-[var(--foreground)] text-center font-bold text-sm sm:text-base leading-tight">
                        {match.away_team}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER: Inputs de Pronóstico */}
                <div className="pt-5 border-t border-[var(--surface-border)]/50 mt-auto">
                  <p className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-3 text-center">
                    Tu Pronóstico
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--background)] p-3 rounded-2xl border border-[var(--surface-border)] shadow-sm">
                    <div className="flex justify-center items-center gap-3 w-full sm:w-auto">
                      {/* Control Local */}
                      <div className="flex items-center bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl p-1 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all shadow-sm">
                        <button
                          className="w-8 h-8 rounded-lg text-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors flex items-center justify-center"
                          onClick={() => adjustScore(match.id, "home", -1)}
                          disabled={closed}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-10 text-center font-black text-xl bg-transparent text-[var(--foreground)] outline-none disabled:opacity-50"
                          disabled={closed}
                          value={inputs[match.id]?.predicted_home ?? "0"}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(match.id, "home", e.target.value)
                          }
                        />
                        <button
                          className="w-8 h-8 rounded-lg text-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors flex items-center justify-center"
                          onClick={() => adjustScore(match.id, "home", 1)}
                          disabled={closed}
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[var(--text-secondary)] font-black text-lg opacity-50">
                        -
                      </span>

                      {/* Control Visitante */}
                      <div className="flex items-center bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl p-1 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all shadow-sm">
                        <button
                          className="w-8 h-8 rounded-lg text-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors flex items-center justify-center"
                          onClick={() => adjustScore(match.id, "away", -1)}
                          disabled={closed}
                        >
                          −
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-10 text-center font-black text-xl bg-transparent text-[var(--foreground)] outline-none disabled:opacity-50"
                          disabled={closed}
                          value={inputs[match.id]?.predicted_away ?? "0"}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(match.id, "away", e.target.value)
                          }
                        />
                        <button
                          className="w-8 h-8 rounded-lg text-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors flex items-center justify-center"
                          onClick={() => adjustScore(match.id, "away", 1)}
                          disabled={closed}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <Button
                      className={`!w-full sm:!w-auto !p-0 px-8 h-12 text-sm font-bold shrink-0 shadow-md hover:shadow-lg transition-all ${closed ? "opacity-50" : ""}`}
                      disabled={closed || saving === match.id}
                      onClick={() => savePrediction(match.id)}
                    >
                      {saving === match.id ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {visibleMatches.length === 0 && activeStage && (
          <div className="text-center bg-[var(--surface)] border border-[var(--surface-border)] rounded-2xl py-16 px-4 shadow-sm">
            <span className="text-4xl block mb-4">📅</span>
            <p className="text-[var(--text-secondary)] font-medium text-lg">
              {selectedDate
                ? "No hay partidos para esta fase en la fecha seleccionada."
                : "No hay partidos programados para esta fase."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}