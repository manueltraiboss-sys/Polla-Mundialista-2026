"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import "./PartidosPage.css";

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

export default function PartidosPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [inputs, setInputs] = useState<PredictionInputs>({});
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Debe iniciar sesión");

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

    const stages = [...new Set((matchesData || []).map((m) => m.stage))];
    if (stages.length > 0) setActiveStage(stages[0]);
  }

  const isMatchClosed = (date: string) =>
    new Date() >= new Date(date);

  const savePrediction = async (matchId: number) => {
    const match = matches.find((m) => m.id === matchId);
    if (match && isMatchClosed(match.match_date))
      return toast.error("El partido ya inició.");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const prediction = inputs[matchId];
    if (!prediction) return toast.error("Ingrese marcador");

    setSaving(matchId);

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        predicted_home: Number(prediction.predicted_home),
        predicted_away: Number(prediction.predicted_away),
      },
      { onConflict: "user_id,match_id" }
    );

    setSaving(null);

    if (error) return toast.error(error.message);

    toast.success("Pronóstico guardado ✓");
    loadData();
  };

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.stage]) acc[match.stage] = [];
    acc[match.stage].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const visibleMatches = activeStage
    ? groupedMatches[activeStage] || []
    : [];

  return (
    <div className="pt-root">
      <div className="pt-hero">
        <p className="pt-hero-label">Mundial 2026</p>
        <h1 className="pt-hero-title">
          Mis <span>Pronósticos</span>
        </h1>
        <div className="pt-hero-line" />
      </div>

      <div className="pt-tabs">
        {Object.keys(groupedMatches).map((stage) => (
          <button
            key={stage}
            className={`pt-tab ${activeStage === stage ? "active" : ""}`}
            onClick={() => setActiveStage(stage)}
          >
            {stage}
          </button>
        ))}
      </div>

      <div className="pt-grid">
        {visibleMatches.map((match) => {
          const closed = isMatchClosed(match.match_date);
          const pred = predictions[match.id];

          return (
            <div 
              key={match.id}
              className={`pt-card ${match.finished ? "finished" : ""}`}
            >
              <div className="pt-teams">
                <span>{match.home_team}</span>
                <span className="pt-vs">VS</span>
                <span>{match.away_team}</span>
              </div>

              <div className="pt-meta">
                <span>
                  {new Date(match.match_date).toLocaleString()}
                </span>
                <span className={`pt-status ${closed ? "closed" : "open"}`}>
                  {closed ? "Cerrado" : "Abierto"}
                </span>
              </div>

              <div className="pt-input-row">
                <input
                  type="number"
                  className="pt-score-input"
                  disabled={closed}
                  value={inputs[match.id]?.predicted_home ?? ""}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [match.id]: {
                        ...prev[match.id],
                        predicted_home: e.target.value,
                      },
                    }))
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  className="pt-score-input"
                  disabled={closed}
                  value={inputs[match.id]?.predicted_away ?? ""}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      [match.id]: {
                        ...prev[match.id],
                        predicted_away: e.target.value,
                      },
                    }))
                  }
                />
                <button
                  className="pt-save-btn"
                  disabled={closed || saving === match.id}
                  onClick={() => savePrediction(match.id)}
                >
                  {saving === match.id ? "Guardando..." : "Guardar"}
                </button>
              </div>

              {pred && (
                <div className="pt-points">
                  ⭐ Puntos: <strong>{pred.points}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}