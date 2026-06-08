"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Prediction = {
  id: number;
  predicted_home: number;
  predicted_away: number;
  points: number;
  matches: {
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    stage: string;
    match_date: string;
    finished: boolean;
  }
};

export default function MisPronosticosPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [exactHits, setExactHits] = useState(0);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { count } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true });

    setTotalMatches(count || 0);

    const { data, error } = await supabase
      .from("predictions")
      .select(`
        id,
        predicted_home,
        predicted_away,
        points,
        matches (
          home_team,
          away_team,
          home_score,
          away_score,
          stage,
          match_date,
          finished
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Error cargando pronósticos");
      console.error(error);
      setLoading(false);
      return;
    }

    const predictionData = (data as unknown as Prediction[]) || [];
    setPredictions(predictionData);

    const total = predictionData.reduce((sum, item) => sum + (item.points || 0), 0);
    setTotalPoints(total);
    setTotalPredictions(predictionData.length);
    setExactHits(predictionData.filter((p) => p.points === 3).length);
    setPendingMatches(predictionData.filter((p) => !p.matches?.finished).length);
    setLoading(false);
    
  }

  function generatePDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Polla Mundial 2026", 14, 15);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-EC")}`, 14, 25);
    doc.text(`Total de puntos: ${totalPoints}`, 14, 33);

    const rows = predictions.map((prediction) => [
      `${prediction.matches?.home_team} vs ${prediction.matches?.away_team}`,
      `${prediction.predicted_home} - ${prediction.predicted_away}`,
      prediction.matches?.finished
        ? `${prediction.matches?.home_score} - ${prediction.matches?.away_score}`
        : "Pendiente",
      prediction.points.toString(),
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Partido", "Mi Pronóstico", "Resultado Oficial", "Puntos"]],
      body: rows,
    });

    doc.save("mis-pronosticos-mundial-2026.pdf");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-animated-gradient">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6 md:p-8 bg-animated-gradient pb-24">
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6 md:space-y-8">
        
        {/* HERO SECTION */}
        <Card className="text-center p-6 md:p-10">
          <p className="uppercase tracking-widest text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 inline-block px-4 py-1.5 rounded-full mb-3">
            Resumen Personal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary)]">
            Mi <span className="text-[var(--accent)]">Historial</span>
          </h1>
        </Card>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-5 text-center transition-transform hover:-translate-y-1">
            <div className="text-xs uppercase font-bold text-[var(--text-secondary)]">Puntos Totales</div>
            <div className="text-3xl font-bold text-[var(--primary)] mt-2">{totalPoints}</div>
          </Card>

          <Card className="p-5 text-center transition-transform hover:-translate-y-1">
            <div className="text-xs uppercase font-bold text-[var(--text-secondary)]">Pronósticos</div>
            <div className="text-3xl font-bold text-[var(--primary)] mt-2">{totalPredictions}/{totalMatches}</div>
          </Card>

          <Card className="p-5 text-center transition-transform hover:-translate-y-1">
            <div className="text-xs uppercase font-bold text-[var(--text-secondary)]">Marcadores Exactos</div>
            <div className="text-3xl font-bold text-[var(--primary)] mt-2">{exactHits}</div>
          </Card>

          <Card className="p-5 text-center transition-transform hover:-translate-y-1">
            <div className="text-xs uppercase font-bold text-[var(--text-secondary)]">Pendientes</div>
            <div className="text-3xl font-bold text-[var(--primary)] mt-2">{pendingMatches}</div>
          </Card>
        </div>

        {/* TABLA DE PRONÓSTICOS */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-[var(--surface-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-[var(--primary)]">
              Detalle de Partidos
            </h2>
            <Button onClick={generatePDF} className="!w-auto !p-0 px-5 h-10 text-sm flex items-center gap-2">
              📄 Descargar PDF
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-[var(--primary)]/5 border-b border-[var(--surface-border)] text-[var(--text-secondary)]">
                  <th className="px-6 py-4 font-bold">Partido</th>
                  <th className="px-6 py-4 font-bold text-center">Mi Pronóstico</th>
                  <th className="px-6 py-4 font-bold text-center">Resultado Oficial</th>
                  <th className="px-6 py-4 font-bold text-center">Puntos</th>
                </tr>
              </thead>

              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.id} className="border-b border-[var(--surface-border)] last:border-none hover:bg-[var(--primary)]/5 transition-colors">
                    
                    {/* Equipo vs Equipo */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--foreground)]">
                        {prediction.matches?.home_team} <span className="text-[var(--text-secondary)] font-normal text-sm mx-1">VS</span> {prediction.matches?.away_team}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1 font-medium uppercase tracking-wider">
                        {prediction.matches?.stage}
                      </div>
                    </td>

                    {/* Mi Pronóstico */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-[var(--surface-border)]/50 px-3 py-1 rounded-lg font-bold text-[var(--foreground)] tracking-widest">
                        {prediction.predicted_home} - {prediction.predicted_away}
                      </span>
                    </td>

                    {/* Resultado Oficial */}
                    <td className="px-6 py-4 text-center">
                      {prediction.matches?.finished ? (
                        <span className="font-bold text-[var(--foreground)]">
                          {prediction.matches?.home_score} - {prediction.matches?.away_score}
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)] text-sm italic">Pendiente</span>
                      )}
                    </td>

                    {/* Puntos Ganados */}
                    <td className="px-6 py-4 text-center">
                      {prediction.matches?.finished ? (
                        <span className="inline-block rounded-full bg-[var(--accent)]/10 px-3 py-1 font-bold text-[var(--accent)] border border-[var(--accent)]/20">
                          +{prediction.points} pts
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)]">-</span>
                      )}
                    </td>

                  </tr>
                ))}

                {predictions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">
                      No has realizado pronósticos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}