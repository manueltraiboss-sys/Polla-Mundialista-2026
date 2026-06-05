"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

// ── Flag emoji lookup ──────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  // Americas
  "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴",
  "Chile": "🇨🇱", "Ecuador": "🇪🇨", "Paraguay": "🇵🇾", "Bolivia": "🇧🇴",
  "Perú": "🇵🇪", "Peru": "🇵🇪", "Venezuela": "🇻🇪",
  "México": "🇲🇽", "Mexico": "🇲🇽", "Estados Unidos": "🇺🇸", "USA": "🇺🇸",
  "Canadá": "🇨🇦", "Canada": "🇨🇦", "Costa Rica": "🇨🇷", "Panamá": "🇵🇦",
  "Panama": "🇵🇦", "Honduras": "🇭🇳", "Jamaica": "🇯🇲",
  "El Salvador": "🇸🇻", "Guatemala": "🇬🇹",
  // Europe
  "España": "🇪🇸", "Espana": "🇪🇸", "Francia": "🇫🇷", "Alemania": "🇩🇪",
  "Italia": "🇮🇹", "Portugal": "🇵🇹", "Países Bajos": "🇳🇱",
  "Holanda": "🇳🇱", "Bélgica": "🇧🇪", "Belgica": "🇧🇪",
  "Inglaterra": "🇬🇧", "Croacia": "🇭🇷", "Suiza": "🇨🇭",
  "Austria": "🇦🇹", "Dinamarca": "🇩🇰", "Suecia": "🇸🇪",
  "Noruega": "🇳🇴", "Polonia": "🇵🇱", "Serbia": "🇷🇸",
  "Turquía": "🇹🇷", "Turquia": "🇹🇷", "Ucrania": "🇺🇦",
  "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "República Checa": "🇨🇿",
  "Eslovaquia": "🇸🇰", "Hungría": "🇭🇺", "Hungria": "🇭🇺",
  "Grecia": "🇬🇷", "Rumania": "🇷🇴", "Bulgaria": "🇧🇬",
  "Albania": "🇦🇱", "Eslovenia": "🇸🇮",
  // Africa
  "Marruecos": "🇲🇦", "Senegal": "🇸🇳", "Nigeria": "🇳🇬",
  "Ghana": "🇬🇭", "Camerún": "🇨🇲", "Camerun": "🇨🇲",
  "Costa de Marfil": "🇨🇮", "Egipto": "🇪🇬", "Argelia": "🇩🇿",
  "Túnez": "🇹🇳", "Tunez": "🇹🇳", "Sudáfrica": "🇿🇦", "Sudafrica": "🇿🇦",
  "Mali": "🇲🇱", "Guinea": "🇬🇳",
  // Asia
  "Japón": "🇯🇵", "Japon": "🇯🇵", "Corea del Sur": "🇰🇷",
  "Australia": "🇦🇺", "Arabia Saudita": "🇸🇦", "Irán": "🇮🇷", "Iran": "🇮🇷",
  "Qatar": "🇶🇦", "China": "🇨🇳", "Indonesia": "🇮🇩",
  "Uzbekistán": "🇺🇿", "Iraq": "🇮🇶",
};

function getFlag(team: string): string {
  return FLAG_MAP[team] ?? "🏳️";
}

// ── Stage sort order ───────────────────────────────────────────────
const STAGE_ORDER = [
  "Fase de Grupos", "Grupo A", "Grupo B", "Grupo C", "Grupo D",
  "Grupo E", "Grupo F", "Grupo G", "Grupo H",
  "Octavos de Final", "Cuartos de Final",
  "Semifinal", "Semifinales", "Tercer Puesto",
  "Final",
];

function sortStages(stages: string[]): string[] {
  return [...stages].sort((a, b) => {
    const ia = STAGE_ORDER.findIndex((s) => a.toLowerCase().includes(s.toLowerCase()));
    const ib = STAGE_ORDER.findIndex((s) => b.toLowerCase().includes(s.toLowerCase()));
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export default function PartidosPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [inputs, setInputs] = useState<PredictionInputs>({});
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Debe iniciar sesión"); return; }

    const { data: matchesData, error: matchesError } = await supabase
      .from("matches").select("*").order("match_date");
    if (matchesError) { toast.error("Error cargando partidos"); return; }

    const { data: predictionsData, error: predictionsError } = await supabase
      .from("predictions").select("*").eq("user_id", user.id);
    if (predictionsError) { toast.error("Error cargando pronósticos"); return; }

    const predictionMap: PredictionInputs = {};
    const predictionsDataMap: Record<number, Prediction> = {};
    predictionsData?.forEach((p) => {
      predictionMap[p.match_id] = {
        predicted_home: p.predicted_home.toString(),
        predicted_away: p.predicted_away.toString(),
      };
      predictionsDataMap[p.match_id] = {
        match_id: p.match_id,
        predicted_home: p.predicted_home,
        predicted_away: p.predicted_away,
        points: p.points ?? 0,
      };
    });

    setInputs(predictionMap);
    setPredictions(predictionsDataMap);
    setMatches(matchesData || []);

    // Default to first stage
    const stages = [...new Set((matchesData || []).map((m: Match) => m.stage))];
    if (stages.length > 0 && activeStage === null) {
      setActiveStage(sortStages(stages)[0]);
    }
  }

  const isMatchClosed = (matchDate: string) => new Date() >= new Date(matchDate);

  const savePrediction = async (matchId: number) => {
    const match = matches.find((m) => m.id === matchId);
    if (match && isMatchClosed(match.match_date)) {
      toast.error("El partido ya inició. No puede modificar el pronóstico.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Debe iniciar sesión"); return; }
    const prediction = inputs[matchId];
    if (!prediction) { toast.error("Ingrese un marcador"); return; }

    setSaving(matchId);
    const { error } = await supabase.from("predictions").upsert(
      { user_id: user.id, match_id: matchId,
        predicted_home: Number(prediction.predicted_home),
        predicted_away: Number(prediction.predicted_away) },
      { onConflict: "user_id,match_id" }
    );
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Pronóstico guardado ✓");
    await loadData();
  };

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.stage]) acc[match.stage] = [];
    acc[match.stage].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const stages = sortStages(Object.keys(groupedMatches));
  const visibleMatches = activeStage ? (groupedMatches[activeStage] || []) : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .pt-root {
          min-height: 100vh;
          background: #07100a;
          font-family: 'Outfit', sans-serif;
          color: #fff;
          padding-bottom: 4rem;
        }

        /* Hero */
        .pt-hero {
          position: relative;
          padding: 2.8rem 2rem 2rem;
          text-align: center;
          overflow: hidden;
        }
        .pt-hero-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(212,175,55,0.17) 0%, transparent 70%);
          pointer-events: none;
        }
        .pt-hero-label {
          font-size: 0.7rem; letter-spacing: 0.24em;
          text-transform: uppercase; color: rgba(212,175,55,0.7); margin-bottom: 0.3rem;
        }
        .pt-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          letter-spacing: 0.06em; color: #fff; line-height: 1; margin-bottom: 0.5rem;
        }
        .pt-hero-title span { color: #D4AF37; }
        .pt-hero-line {
          width: 70px; height: 2px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          margin: 0 auto;
        }

        /* Stage tabs */
        .pt-tabs-wrap {
          max-width: 900px; margin: 0 auto;
          padding: 1.5rem 1.5rem 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pt-tabs-wrap::-webkit-scrollbar { display: none; }
        .pt-tabs {
          display: flex; gap: 0.5rem; width: max-content; padding-bottom: 0.5rem;
        }
        .pt-tab {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em;
          padding: 0.45rem 1rem; border-radius: 99px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
        }
        .pt-tab:hover { color: #fff; border-color: rgba(255,255,255,0.22); }
        .pt-tab.active {
          background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.5);
          color: #D4AF37; font-weight: 600;
        }

        /* Cards grid */
        .pt-grid {
          max-width: 900px; margin: 0 auto;
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1rem;
        }

        /* Match card */
        .pt-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 1.4rem 1.5rem 1.2rem;
          transition: border-color 0.2s, background 0.2s;
          animation: cardIn 0.4s ease both;
          position: relative;
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pt-card.finished {
          border-color: rgba(82,201,122,0.25);
        }

        .pt-card:hover {
          border-color: rgba(212,175,55,0.25);
          background: rgba(255,255,255,0.06);
        }

        /* Subtle top gradient per card */
        .pt-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .pt-card:hover::before { opacity: 1; }
        .pt-card.finished::before { background: linear-gradient(90deg, transparent, rgba(82,201,122,0.4), transparent); opacity: 1; }

        /* Match header: teams */
        .pt-teams {
          display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .pt-team {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          flex: 1; min-width: 0;
        }

        .pt-team-flag { font-size: 2.2rem; line-height: 1; }
        .pt-team-name {
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.03em;
          color: rgba(255,255,255,0.85); text-align: center;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 100%;
        }

        .pt-vs {
          display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
          flex-shrink: 0;
        }
        .pt-vs-text {
          font-family: 'Bebas Neue', sans-serif; font-size: 1rem;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.25);
        }
        .pt-result-score {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem;
          letter-spacing: 0.08em; color: #52c97a; line-height: 1;
        }

        /* Meta row */
        .pt-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.9rem;
        }

        .pt-date {
          font-size: 0.73rem; color: rgba(255,255,255,0.4); letter-spacing: 0.03em;
        }

        .pt-status {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 0.22rem 0.6rem; border-radius: 99px;
        }
        .pt-status.open {
          background: rgba(82,201,122,0.12); color: #52c97a;
          border: 1px solid rgba(82,201,122,0.25);
        }
        .pt-status.closed {
          background: rgba(255,80,80,0.1); color: rgba(255,100,100,0.8);
          border: 1px solid rgba(255,80,80,0.2);
        }

        /* Divider */
        .pt-card-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 0.9rem;
        }

        /* Prediction info boxes */
        .pt-info-row {
          display: flex; gap: 0.6rem; margin-bottom: 0.85rem; flex-wrap: wrap;
        }

        .pt-info-box {
          flex: 1; min-width: 120px;
          border-radius: 8px; padding: 0.5rem 0.75rem;
          font-size: 0.78rem;
        }

        .pt-info-box.my-pred {
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.2);
          color: rgba(255,255,255,0.75);
        }
        .pt-info-box.my-pred strong { color: #D4AF37; }

        .pt-info-box.pts {
          background: rgba(212,175,55,0.06);
          border: 1px solid rgba(212,175,55,0.15);
          color: rgba(255,255,255,0.65);
        }
        .pt-info-box.pts strong {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem; letter-spacing: 0.06em; color: #D4AF37;
        }

        /* Input row */
        .pt-input-row {
          display: flex; align-items: center; gap: 0.5rem;
        }

        .pt-score-input {
          width: 52px; padding: 0.5rem;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; color: #fff;
          font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
          text-align: center; outline: none;
          transition: border-color 0.18s, background 0.18s;
          -moz-appearance: textfield;
        }
        .pt-score-input::-webkit-outer-spin-button,
        .pt-score-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .pt-score-input:focus {
          border-color: rgba(212,175,55,0.55);
          background: rgba(255,255,255,0.1);
        }
        .pt-score-input:disabled {
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.06); cursor: not-allowed;
        }

        .pt-dash {
          font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
          color: rgba(255,255,255,0.25);
        }

        .pt-save-btn {
          margin-left: auto;
          padding: 0.5rem 1.1rem;
          border: none; border-radius: 8px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem; letter-spacing: 0.08em;
          cursor: pointer; transition: all 0.18s;
          background: linear-gradient(135deg, #D4AF37, #f0d060, #b8962e);
          color: #0a0a0a;
          box-shadow: 0 2px 12px rgba(212,175,55,0.25);
        }
        .pt-save-btn:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(212,175,55,0.4);
          filter: brightness(1.08);
        }
        .pt-save-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.25); cursor: not-allowed;
          box-shadow: none;
        }

        .pt-spinner {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(0,0,0,0.25); border-top-color: #0a0a0a;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 4px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty */
        .pt-empty {
          text-align: center; padding: 3rem;
          color: rgba(255,255,255,0.3); font-size: 0.9rem;
        }

        @media (max-width: 500px) {
          .pt-grid { grid-template-columns: 1fr; padding: 1rem; }
          .pt-team-flag { font-size: 1.8rem; }
        }
      `}</style>

      <div className="pt-root">

        {/* Hero */}
        <div className="pt-hero">
          <div className="pt-hero-glow" />
          <p className="pt-hero-label">Mundial 2026</p>
          <h1 className="pt-hero-title">Mis <span>Pronósticos</span></h1>
          <div className="pt-hero-line" />
        </div>

        {/* Stage tabs */}
        {stages.length > 0 && (
          <div className="pt-tabs-wrap">
            <div className="pt-tabs">
              {stages.map((stage) => (
                <button
                  key={stage}
                  className={`pt-tab${activeStage === stage ? " active" : ""}`}
                  onClick={() => setActiveStage(stage)}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="pt-grid">
          {visibleMatches.length === 0 ? (
            <div className="pt-empty" style={{ gridColumn: "1/-1" }}>
              No hay partidos en esta fase.
            </div>
          ) : (
            visibleMatches.map((match, idx) => {
              const closed = isMatchClosed(match.match_date);
              const pred   = predictions[match.id];
              const homeFlag = getFlag(match.home_team);
              const awayFlag = getFlag(match.away_team);
              const dateStr  = new Date(match.match_date).toLocaleString("es-EC", {
                timeZone: "America/Guayaquil",
                dateStyle: "medium", timeStyle: "short",
              });

              return (
                <div
                  key={match.id}
                  className={`pt-card${match.finished ? " finished" : ""}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Teams */}
                  <div className="pt-teams">
                    <div className="pt-team">
                      <span className="pt-team-flag">{homeFlag}</span>
                      <span className="pt-team-name">{match.home_team}</span>
                    </div>

                    <div className="pt-vs">
                      {match.finished ? (
                        <span className="pt-result-score">
                          {match.home_score} – {match.away_score}
                        </span>
                      ) : (
                        <span className="pt-vs-text">VS</span>
                      )}
                    </div>

                    <div className="pt-team">
                      <span className="pt-team-flag">{awayFlag}</span>
                      <span className="pt-team-name">{match.away_team}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="pt-meta">
                    <span className="pt-date">📅 {dateStr}</span>
                    <span className={`pt-status ${closed ? "closed" : "open"}`}>
                      {closed ? "🔒 Cerrado" : "🔓 Abierto"}
                    </span>
                  </div>

                  <div className="pt-card-divider" />

                  {/* Info boxes */}
                  {(pred || (match.finished && pred)) && (
                    <div className="pt-info-row">
                      {pred && (
                        <div className="pt-info-box my-pred">
                          ⚽ Tu pronóstico:{" "}
                          <strong>{pred.predicted_home} – {pred.predicted_away}</strong>
                        </div>
                      )}
                      {match.finished && pred && (
                        <div className="pt-info-box pts">
                          ⭐ Puntos: <strong>{pred.points}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input row */}
                  <div className="pt-input-row">
                    <input
                      type="number" min="0"
                      disabled={closed}
                      value={inputs[match.id]?.predicted_home ?? ""}
                      className="pt-score-input"
                      placeholder="0"
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [match.id]: { ...prev[match.id], predicted_home: e.target.value },
                        }))
                      }
                    />
                    <span className="pt-dash">—</span>
                    <input
                      type="number" min="0"
                      disabled={closed}
                      value={inputs[match.id]?.predicted_away ?? ""}
                      className="pt-score-input"
                      placeholder="0"
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [match.id]: { ...prev[match.id], predicted_away: e.target.value },
                        }))
                      }
                    />
                    <button
                      className="pt-save-btn"
                      disabled={closed || saving === match.id}
                      onClick={() => savePrediction(match.id)}
                    >
                      {saving === match.id && <span className="pt-spinner" />}
                      {saving === match.id ? "Guardando" : "Guardar"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}