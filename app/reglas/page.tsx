"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";

export default function ReglasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      
      // Si hay usuario, quitamos el estado de carga y mostramos las reglas
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Pantalla de carga mientras verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-animated-gradient">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 sm:p-6 md:p-8 bg-animated-gradient">

      {/* Fondos decorativos */}
      <div className="absolute top-0 right-0 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-[var(--primary)] opacity-10 rounded-full translate-x-[30%] -translate-y-[30%] pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[var(--accent)] opacity-10 rounded-full -translate-x-[30%] translate-y-[30%] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">

        {/* Header */}
        <Card className="p-8 text-center">
          <p className="uppercase tracking-widest text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 inline-block px-4 py-1.5 rounded-full mb-4">
            Mundial 2026
          </p>

          <h1 className="text-4xl md:text-5xl font-black text-[var(--primary)]">
            Sistema de <span className="text-[var(--accent)]">Puntuación</span>
          </h1>

          <p className="mt-4 text-[var(--text-secondary)]">
            Cada pronóstico se evalúa automáticamente una vez que el partido finaliza.
          </p>
        </Card>

        {/* 3 puntos */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">
                3 puntos: Marcador Exacto
              </h2>
              <p className="text-[var(--text-secondary)]">
                Obtienes 3 puntos si aciertas exactamente el resultado del partido.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-[var(--surface-border)] rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="p-4 text-left">Pronóstico</th>
                  <th className="p-4 text-left">Resultado Real</th>
                  <th className="p-4 text-center">Puntos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">México 1 - 1 Sudáfrica</td>
                  <td className="p-4">México 1 - 1 Sudáfrica</td>
                  <td className="p-4 text-center font-bold text-green-400">3</td>
                </tr>

                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">Ecuador 2 - 0 Japón</td>
                  <td className="p-4">Ecuador 2 - 0 Japón</td>
                  <td className="p-4 text-center font-bold text-green-400">3</td>
                </tr>

                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">Brasil 3 - 2 España</td>
                  <td className="p-4">Brasil 3 - 2 España</td>
                  <td className="p-4 text-center font-bold text-green-400">3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* 1 punto */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl">
              ⚽
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                1 punto: Acertar el resultado
              </h2>
              <p className="text-[var(--text-secondary)]">
                Obtienes 1 punto si no aciertas el marcador exacto, pero sí el resultado final.
              </p>
            </div>
          </div>

          {/* Empates */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[var(--accent)] mb-4">
              Empate correcto
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--surface-border)]">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="p-4 text-left">Pronóstico</th>
                    <th className="p-4 text-left">Resultado Real</th>
                    <th className="p-4 text-center">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">México 2 - 2 Sudáfrica</td>
                    <td className="p-4">México 1 - 1 Sudáfrica</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>

                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">Francia 0 - 0 Alemania</td>
                    <td className="p-4">Francia 3 - 3 Alemania</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Local */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[var(--accent)] mb-4">
              Gana el local
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--surface-border)]">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="p-4 text-left">Pronóstico</th>
                    <th className="p-4 text-left">Resultado Real</th>
                    <th className="p-4 text-center">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">Ecuador 2 - 1 Japón</td>
                    <td className="p-4">Ecuador 1 - 0 Japón</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>

                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">Brasil 4 - 2 España</td>
                    <td className="p-4">Brasil 2 - 1 España</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visitante */}
          <div>
            <h3 className="text-xl font-bold text-[var(--accent)] mb-4">
              Gana el visitante
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--surface-border)]">
                <thead>
                  <tr className="bg-[var(--surface)]">
                    <th className="p-4 text-left">Pronóstico</th>
                    <th className="p-4 text-left">Resultado Real</th>
                    <th className="p-4 text-center">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">Ecuador 0 - 2 Japón</td>
                    <td className="p-4">Ecuador 1 - 3 Japón</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>

                  <tr className="border-t border-[var(--surface-border)]">
                    <td className="p-4">Francia 1 - 2 Alemania</td>
                    <td className="p-4">Francia 0 - 1 Alemania</td>
                    <td className="p-4 text-center text-yellow-400 font-bold">1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* 0 puntos */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl">
              ❌
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-400">
                0 puntos
              </h2>
              <p className="text-[var(--text-secondary)]">
                No obtienes puntos si el resultado pronosticado no coincide con el resultado real.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-[var(--surface-border)]">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="p-4 text-left">Pronóstico</th>
                  <th className="p-4 text-left">Resultado Real</th>
                  <th className="p-4 text-center">Puntos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">Ecuador 2 - 1 Japón</td>
                  <td className="p-4">Ecuador 0 - 2 Japón</td>
                  <td className="p-4 text-center text-red-400 font-bold">0</td>
                </tr>

                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">México 1 - 1 Sudáfrica</td>
                  <td className="p-4">México 2 - 1 Sudáfrica</td>
                  <td className="p-4 text-center text-red-400 font-bold">0</td>
                </tr>

                <tr className="border-t border-[var(--surface-border)]">
                  <td className="p-4">Francia 0 - 1 Alemania</td>
                  <td className="p-4">Francia 1 - 1 Alemania</td>
                  <td className="p-4 text-center text-red-400 font-bold">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Consideraciones */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">
            📌 Consideraciones
          </h2>

          <div className="space-y-4 text-[var(--text-secondary)]">
            <div className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">✓</span>
              <p>Los pronósticos pueden modificarse únicamente antes del inicio del partido.</p>
            </div>

            <div className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">✓</span>
              <p>Una vez iniciado el encuentro, el pronóstico queda bloqueado.</p>
            </div>

            <div className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">✓</span>
              <p>Los puntos se calculan automáticamente cuando el partido finaliza y se registra el resultado oficial.</p>
            </div>

            <div className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">✓</span>
              <p>El ranking general se actualiza automáticamente con los puntos acumulados de cada participante.</p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-center">
            <h3 className="text-2xl font-black text-[var(--primary)]">
              ¡Buena suerte! ⚽🏆
            </h3>
            <p className="text-[var(--text-secondary)] mt-2">
              Que gane el mejor pronosticador del Mundial 2026.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}