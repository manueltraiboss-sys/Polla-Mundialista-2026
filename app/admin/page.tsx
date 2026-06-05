"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Match = {
  id: number;
  home_team: string;
  away_team: string;
  stage: string;
  stadium: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  finished: boolean;
};

type ScoreInputs = {
  [key: number]: { home: string; away: string };
};

const FLAG_MAP: Record<string, string> = {
  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴",
  "Chile": "🇨🇱", "Ecuador": "🇪🇨", "México": "🇲🇽", "Mexico": "🇲🇽",
  "Estados Unidos": "🇺🇸", "USA": "🇺🇸", "Canadá": "🇨🇦", "Canada": "🇨🇦",
  "Costa Rica": "🇨🇷", "Panamá": "🇵🇦", "Honduras": "🇭🇳", "Jamaica": "🇯🇲",
  "España": "🇪🇸", "Francia": "🇫🇷", "Alemania": "🇩🇪", "Italia": "🇮🇹",
  "Portugal": "🇵🇹", "Países Bajos": "🇳🇱", "Holanda": "🇳🇱", "Bélgica": "🇧🇪",
  "Inglaterra": "🇬🇧", "Croacia": "🇭🇷", "Suiza": "🇨🇭", "Dinamarca": "🇩🇰",
  "Polonia": "🇵🇱", "Serbia": "🇷🇸", "Turquía": "🇹🇷", "Ucrania": "🇺🇦",
  "Marruecos": "🇲🇦", "Senegal": "🇸🇳", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
  "Camerún": "🇨🇲", "Egipto": "🇪🇬", "Japón": "🇯🇵", "Corea del Sur": "🇰🇷",
  "Australia": "🇦🇺", "Arabia Saudita": "🇸🇦", "Irán": "🇮🇷", "Qatar": "🇶🇦",
  "Paraguay": "🇵🇾", "Bolivia": "🇧🇴", "Perú": "🇵🇪", "Venezuela": "🇻🇪",
};
const getFlag = (t: string) => FLAG_MAP[t] ?? "🏳️";

const STAGE_ORDER = [
  "Fase de Grupos","Grupo A","Grupo B","Grupo C","Grupo D",
  "Grupo E","Grupo F","Grupo G","Grupo H",
  "Octavos de Final","Cuartos de Final","Semifinal","Semifinales","Tercer Puesto","Final",
];

function sortStages(stages: string[]): string[] {
  return [...stages].sort((a, b) => {
    const ia = STAGE_ORDER.findIndex((s) => a.toLowerCase().includes(s.toLowerCase()));
    const ib = STAGE_ORDER.findIndex((s) => b.toLowerCase().includes(s.toLowerCase()));
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<ScoreInputs>({});
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "finished">("all");

  const loadMatches = useCallback(async () => {
    const { data, error } = await supabase
      .from("matches").select("*").order("match_date");
    if (error) { toast.error("Error cargando partidos"); return; }

    const scoreMap: ScoreInputs = {};
    data?.forEach((match) => {
      scoreMap[match.id] = {
        home: match.home_score?.toString() ?? "",
        away: match.away_score?.toString() ?? "",
      };
    });
    setScores(scoreMap);
    setMatches(data || []);

    if (data && data.length > 0 && activeStage === null) {
      const stages = [...new Set(data.map((m: Match) => m.stage))];
      setActiveStage(sortStages(stages)[0]);
    }
  }, [activeStage]);

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data, error } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).single();

    if (error || !data?.is_admin) {
      setAuthorized(false); setLoading(false); return;
    }
    setAuthorized(true); setLoading(false);
    await loadMatches();
  }, [router, loadMatches]);

  if (loading) { void (async () => { await checkAdmin(); })(); }

  async function saveResult(matchId: number) {
    const score = scores[matchId];
    if (!score || score.home === "" || score.away === "") {
      toast.error("Debe ingresar ambos marcadores"); return;
    }
    setSaving(matchId);
    const { error } = await supabase.from("matches").update({
      home_score: Number(score.home),
      away_score: Number(score.away),
      finished: true,
    }).eq("id", matchId);

    if (error) { toast.error(error.message); setSaving(null); return; }

    const { error: calcError } = await supabase.rpc("calculate_match_points", { p_match_id: matchId });
    setSaving(null);
    if (calcError) { toast.error("Resultado guardado, pero falló el cálculo de puntos"); return; }
    toast.success("✓ Resultado guardado y puntos calculados");
    loadMatches();
  }

  // ── Derived data ──
  const grouped = matches.reduce((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {} as Record<string, Match[]>);
  const stages = sortStages(Object.keys(grouped));

  const stageMatches = activeStage ? (grouped[activeStage] || []) : [];
  const filteredMatches = stageMatches.filter((m) => {
    if (filter === "pending")  return !m.finished;
    if (filter === "finished") return m.finished;
    return true;
  });

  const totalFinished = matches.filter((m) => m.finished).length;
  const totalPending  = matches.filter((m) => !m.finished).length;

  // ── Render states ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#07100a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(212,175,55,0.2)", borderTopColor: "#D4AF37", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!authorized) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600&display=swap');
        body { background: #07100a; }
      `}</style>
      <div style={{ minHeight: "100vh", background: "#07100a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚫</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", color: "#fff", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Acceso Denegado</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .ad-root {
          min-height: 100vh;
          background: #07100a;
          font-family: 'Outfit', sans-serif;
          color: #fff;
          padding-bottom: 4rem;
        }

        /* Hero */
        .ad-hero {
          position: relative; padding: 2.8rem 2rem 2rem;
          max-width: 1000px; margin: 0 auto; overflow: hidden;
        }
        .ad-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 50% at 15% 50%, rgba(212,175,55,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .ad-hero-label {
          font-size: 0.68rem; letter-spacing: 0.24em; text-transform: uppercase;
          color: rgba(212,175,55,0.65); margin-bottom: 0.35rem;
        }
        .ad-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          letter-spacing: 0.06em; color: #fff; line-height: 1; margin-bottom: 0.5rem;
        }
        .ad-hero-title span { color: #D4AF37; }

        /* Summary chips */
        .ad-chips {
          display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem;
        }
        .ad-chip {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.05em;
          padding: 0.35rem 0.85rem; border-radius: 99px; border: 1px solid;
        }
        .ad-chip.total    { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); }
        .ad-chip.finished { background: rgba(82,201,122,0.08);  border-color: rgba(82,201,122,0.25);  color: #52c97a; }
        .ad-chip.pending  { background: rgba(212,175,55,0.08);  border-color: rgba(212,175,55,0.25);  color: #D4AF37; }
        .ad-chip strong   { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; letter-spacing: 0.06em; }

        /* Divider */
        .ad-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent);
          max-width: 1000px; margin: 0 auto 1.5rem;
        }

        /* Stage tabs */
        .ad-tabs-wrap {
          max-width: 1000px; margin: 0 auto;
          padding: 0 2rem 0; overflow-x: auto; scrollbar-width: none;
        }
        .ad-tabs-wrap::-webkit-scrollbar { display: none; }
        .ad-tabs { display: flex; gap: 0.45rem; width: max-content; padding-bottom: 0.75rem; }

        .ad-tab {
          font-size: 0.76rem; font-weight: 500; letter-spacing: 0.05em;
          padding: 0.42rem 0.95rem; border-radius: 99px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.45);
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
          font-family: 'Outfit', sans-serif;
        }
        .ad-tab:hover { color: #fff; border-color: rgba(255,255,255,0.22); }
        .ad-tab.active { background: rgba(212,175,55,0.14); border-color: rgba(212,175,55,0.5); color: #D4AF37; font-weight: 600; }

        /* Filter bar */
        .ad-filter-bar {
          max-width: 1000px; margin: 0 auto;
          padding: 0.5rem 2rem 1rem;
          display: flex; gap: 0.4rem;
        }
        .ad-filter-btn {
          font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0.32rem 0.8rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: rgba(255,255,255,0.38); cursor: pointer;
          transition: all 0.15s; font-family: 'Outfit', sans-serif;
        }
        .ad-filter-btn:hover { color: rgba(255,255,255,0.7); }
        .ad-filter-btn.active { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); color: #fff; }

        /* Cards grid */
        .ad-grid {
          max-width: 1000px; margin: 0 auto; padding: 0 2rem;
          display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1rem;
        }

        /* Match card */
        .ad-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 1.3rem 1.4rem 1.2rem;
          animation: adCardIn 0.35s ease both;
          transition: border-color 0.2s;
          position: relative; overflow: hidden;
        }
        .ad-card.done { border-color: rgba(82,201,122,0.2); }
        .ad-card:hover { border-color: rgba(212,175,55,0.22); }

        .ad-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 0.2s;
        }
        .ad-card.done::before  { background: linear-gradient(90deg, transparent, rgba(82,201,122,0.5), transparent); opacity: 1; }
        .ad-card:hover::before { background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent); opacity: 1; }

        @keyframes adCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Teams row */
        .ad-teams {
          display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
          margin-bottom: 0.85rem;
        }
        .ad-team {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
        }
        .ad-team-flag { font-size: 2rem; line-height: 1; }
        .ad-team-name {
          font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.8);
          text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
        }
        .ad-vs {
          font-family: 'Bebas Neue', sans-serif; font-size: 0.95rem;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.2); flex-shrink: 0;
        }
        .ad-official-score {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
          letter-spacing: 0.08em; color: #52c97a; line-height: 1;
        }

        /* Meta */
        .ad-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.9rem;
        }
        .ad-date { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
        .ad-stadium { font-size: 0.68rem; color: rgba(255,255,255,0.25); }

        .ad-status {
          font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 99px;
        }
        .ad-status.done    { background: rgba(82,201,122,0.1); color: #52c97a; border: 1px solid rgba(82,201,122,0.25); }
        .ad-status.pending { background: rgba(212,175,55,0.1); color: #D4AF37; border: 1px solid rgba(212,175,55,0.25); }

        /* Card divider */
        .ad-card-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 0.9rem; }

        /* Score input row */
        .ad-input-row { display: flex; align-items: center; gap: 0.5rem; }

        .ad-score-input {
          width: 52px; padding: 0.5rem;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; color: #fff;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; text-align: center;
          outline: none; transition: border-color 0.18s, background 0.18s;
          -moz-appearance: textfield;
        }
        .ad-score-input::-webkit-outer-spin-button,
        .ad-score-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .ad-score-input:focus {
          border-color: rgba(212,175,55,0.55);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
        }

        .ad-dash {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
          color: rgba(255,255,255,0.2);
        }

        .ad-save-btn {
          margin-left: auto; padding: 0.5rem 1.1rem;
          border: none; border-radius: 8px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem; letter-spacing: 0.08em;
          cursor: pointer; transition: all 0.18s;
          background: linear-gradient(135deg, #D4AF37, #f0d060, #b8962e);
          color: #0a0a0a;
          box-shadow: 0 2px 12px rgba(212,175,55,0.22);
        }
        .ad-save-btn:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(212,175,55,0.4); filter: brightness(1.08);
        }
        .ad-save-btn:disabled {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2);
          cursor: not-allowed; box-shadow: none;
        }

        /* Re-edit note for finished */
        .ad-reedit-note {
          font-size: 0.68rem; color: rgba(255,255,255,0.28);
          margin-top: 0.5rem; text-align: right;
        }

        .ad-spinner {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(0,0,0,0.25); border-top-color: #0a0a0a;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 4px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ad-empty {
          grid-column: 1/-1; text-align: center;
          padding: 3rem; color: rgba(255,255,255,0.25); font-size: 0.88rem;
        }

        @media (max-width: 500px) {
          .ad-grid { grid-template-columns: 1fr; padding: 0 1rem; }
          .ad-tabs-wrap, .ad-filter-bar { padding-left: 1rem; padding-right: 1rem; }
          .ad-hero { padding: 2rem 1rem; }
        }
      `}</style>

      <div className="ad-root">

        {/* Hero */}
        <div className="ad-hero">
          <div className="ad-hero-glow" />
          <p className="ad-hero-label">Panel de control · Mundial 2026</p>
          <h1 className="ad-hero-title">⚙️ <span>Administración</span></h1>

          <div className="ad-chips">
            <div className="ad-chip total">
              <strong>{matches.length}</strong> partidos
            </div>
            <div className="ad-chip finished">
              <span>✓</span><strong>{totalFinished}</strong> finalizados
            </div>
            <div className="ad-chip pending">
              <span>◷</span><strong>{totalPending}</strong> pendientes
            </div>
          </div>
        </div>

        <div className="ad-divider" />

        {/* Stage tabs */}
        <div className="ad-tabs-wrap">
          <div className="ad-tabs">
            {stages.map((stage) => (
              <button
                key={stage}
                className={`ad-tab${activeStage === stage ? " active" : ""}`}
                onClick={() => setActiveStage(stage)}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="ad-filter-bar">
          {(["all", "pending", "finished"] as const).map((f) => (
            <button
              key={f}
              className={`ad-filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Finalizados"}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="ad-grid">
          {filteredMatches.length === 0 ? (
            <div className="ad-empty">No hay partidos en esta vista.</div>
          ) : (
            filteredMatches.map((match, idx) => (
              <div
                key={match.id}
                className={`ad-card${match.finished ? " done" : ""}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Teams */}
                <div className="ad-teams">
                  <div className="ad-team">
                    <span className="ad-team-flag">{getFlag(match.home_team)}</span>
                    <span className="ad-team-name">{match.home_team}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", flexShrink: 0 }}>
                    {match.finished ? (
                      <span className="ad-official-score">
                        {match.home_score} – {match.away_score}
                      </span>
                    ) : (
                      <span className="ad-vs">VS</span>
                    )}
                  </div>
                  <div className="ad-team">
                    <span className="ad-team-flag">{getFlag(match.away_team)}</span>
                    <span className="ad-team-name">{match.away_team}</span>
                  </div>
                </div>

                {/* Meta */}
                <div className="ad-meta">
                  <div>
                    <div className="ad-date">
                      📅 {new Date(match.match_date).toLocaleString("es-EC", {
                        timeZone: "America/Guayaquil",
                        dateStyle: "medium", timeStyle: "short",
                      })}
                    </div>
                    {match.stadium && (
                      <div className="ad-stadium">🏟️ {match.stadium}</div>
                    )}
                  </div>
                  <span className={`ad-status ${match.finished ? "done" : "pending"}`}>
                    {match.finished ? "✓ Finalizado" : "◷ Pendiente"}
                  </span>
                </div>

                <div className="ad-card-divider" />

                {/* Score inputs */}
                <div className="ad-input-row">
                  <input
                    type="number" min="0"
                    value={scores[match.id]?.home ?? ""}
                    className="ad-score-input"
                    placeholder="0"
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], home: e.target.value },
                      }))
                    }
                  />
                  <span className="ad-dash">—</span>
                  <input
                    type="number" min="0"
                    value={scores[match.id]?.away ?? ""}
                    className="ad-score-input"
                    placeholder="0"
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], away: e.target.value },
                      }))
                    }
                  />
                  <button
                    className="ad-save-btn"
                    disabled={saving === match.id}
                    onClick={() => saveResult(match.id)}
                  >
                    {saving === match.id && <span className="ad-spinner" />}
                    {saving === match.id ? "Guardando" : match.finished ? "Actualizar" : "Guardar"}
                  </button>
                </div>

                {match.finished && (
                  <p className="ad-reedit-note">
                    Puedes corregir el resultado y recalcular puntos.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}