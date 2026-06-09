"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Card from "@/components/ui/Card"; // Ajusta la ruta si es necesario
import { useRouter } from "next/navigation";

type RankingUser = {
  id: string;
  full_name: string | null;
  points: number;
  ranking: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, points, ranking")
        .order("ranking", { ascending: true })
        .limit(10);

      if (!user) {
        router.push("/login");
        return;
      }

      setRanking(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const podium = ranking.slice(0, 3);
  const maxPts = ranking[0]?.points || 1;

  // Orden para mostrar el podio: 2do, 1ro, 3ro
  const podiumOrder = [1, 0, 2];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-animated-gradient">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6 md:p-8 bg-animated-gradient">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6 md:space-y-8">
        
        {/* HERO SECTION */}
        <Card className="text-center p-6 md:p-10">
          <p className="uppercase tracking-widest text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 inline-block px-4 py-1.5 rounded-full mb-3">
            Mundial 2026
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--primary)]">
            Ranking <span className="text-[var(--accent)]">General</span>
          </h1>
          <p className="mt-3 text-xs text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
            <span>🕐</span>
            <span>
              El ranking se actualiza automáticamente todos los días a las{" "}
              <span className="font-semibold text-[var(--foreground)]">7:00 AM</span> y{" "}
              <span className="font-semibold text-[var(--foreground)]">7:00 PM</span>
            </span>
          </p>
        </Card>

        {ranking.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-secondary)]">
            Aún no hay participantes en el ranking.
          </Card>
        ) : (
          <>
            {/* PODIO */}
            <Card className="p-6 md:p-10">
              <div className="flex justify-center items-end gap-2 sm:gap-6">
                {podiumOrder.map((dataIdx) => {
                  const user = podium[dataIdx];

                  if (!user) {
                    return <div key={dataIdx} className="flex-1" />;
                  }

                  const initials = (user.full_name || "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const isFirst = dataIdx === 0;
                  const medal = isFirst ? "🥇" : dataIdx === 1 ? "🥈" : "🥉";
                  const avatarColor = isFirst
                    ? "bg-[#d4af37]"
                    : dataIdx === 1
                    ? "bg-[#b0b0b0]"
                    : "bg-[#c8945a]";

                  return (
                    <div
                      key={user.id}
                      className={`flex-1 flex flex-col items-center text-center transition-transform hover:-translate-y-2 ${
                        isFirst ? "mb-4 md:mb-6" : ""
                      }`}
                    >
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center font-bold text-white text-xl md:text-2xl shadow-lg border-4 border-[var(--surface)] ${avatarColor}`}
                      >
                        {initials}
                      </div>

                      <div className="mt-3 font-semibold text-[var(--foreground)] text-sm md:text-base line-clamp-1">
                        {user.full_name || "Sin nombre"}
                      </div>

                      <div className="text-[var(--accent)] font-bold text-sm md:text-base">
                        {user.points} pts
                      </div>

                      <div className="text-3xl md:text-4xl mt-1 drop-shadow-md">
                        {medal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* TABLA */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-[var(--surface-border)]">
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Clasificación completa
                </h2>
              </div>
              
              {/* Contenedor con overflow-x-auto para responsividad móvil */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--primary)]/5 border-b border-[var(--surface-border)] text-[var(--text-secondary)]">
                      <th className="px-6 py-4 font-bold w-16 text-center">#</th>
                      <th className="px-6 py-4 font-bold">Participante</th>
                      <th className="px-6 py-4 font-bold w-1/3">Progreso</th>
                      <th className="px-6 py-4 font-bold text-right w-32">Puntos</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranking.map((user, idx) => {
                      const isMe = user.id === currentUserId;
                      const initials = (user.full_name || "?")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      const pct = Math.round((user.points / maxPts) * 100);

                      return (
                        <tr
                          key={user.id}
                          className={`
                            border-b border-[var(--surface-border)] last:border-none transition-colors
                            ${isMe ? "bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15" : "hover:bg-[var(--primary)]/5"}
                          `}
                        >
                          {/* Posición / Medallas */}
                          <td className="px-6 py-4 font-bold text-center text-lg">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (
                              <span className="text-[var(--primary)]">{idx + 1}</span>
                            )}
                          </td>

                          {/* Participante */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[var(--foreground)]">
                                  {user.full_name || "Sin nombre"}
                                </span>
                                {isMe && (
                                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold shadow-sm">
                                    Tú
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Barra de Progreso */}
                          <td className="px-6 py-4">
                            <div className="w-full h-2.5 bg-[var(--surface-border)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>

                          {/* Puntos */}
                          <td className="px-6 py-4 font-bold text-[var(--accent)] text-right">
                            {user.points} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}