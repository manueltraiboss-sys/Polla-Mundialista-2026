"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import styles from "./ranking.module.css";

type RankingUser = {
  id: string;
  full_name: string | null;
  total_points: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      const { data, error } = await supabase
        .from("ranking_view")
        .select("*")
        .order("total_points", { ascending: false });

      if (error) {
        toast.error("Error cargando ranking");
        setLoading(false);
        return;
      }

      setRanking(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const podium = ranking.slice(0, 3);
  const maxPts = ranking[0]?.total_points || 1;

  const podiumOrder = [1, 0, 2];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.rkRoot}>
      <div className={styles.topDecoration}></div>
      <div className={styles.bottomDecoration}></div>

      <div className={styles.container}>
        {/* HERO */}
        <div className={styles.hero}>
          <p className={styles.label}>Mundial 2026</p>

          <h1 className={styles.title}>
            Ranking <span>General</span>
          </h1>
        </div>

        {ranking.length === 0 ? (
          <div className={styles.tableCard}>
            Aún no hay participantes en el ranking.
          </div>
        ) : (
          <>
            {/* PODIO */}
            <div className={styles.podiumCard}>
              <div className={styles.podiumWrap}>
                {podiumOrder.map((dataIdx) => {
                  const user = podium[dataIdx];

                  if (!user) {
                    return (
                      <div
                        key={dataIdx}
                        style={{ flex: 1 }}
                      />
                    );
                  }

                  const initials = (user.full_name || "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const medal =
                    dataIdx === 0
                      ? "🥇"
                      : dataIdx === 1
                      ? "🥈"
                      : "🥉";

                  return (
                    <div
                      key={user.id}
                      className={styles.podiumItem}
                    >
                      <div
                        className={`${styles.avatar} ${
                          dataIdx === 0
                            ? styles.gold
                            : dataIdx === 1
                            ? styles.silver
                            : styles.bronze
                        }`}
                      >
                        {initials}
                      </div>

                      <div className={styles.name}>
                        {user.full_name || "Sin nombre"}
                      </div>

                      <div className={styles.points}>
                        {user.total_points} pts
                      </div>

                      <div className={styles.medal}>
                        {medal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TABLA */}
            <div className={styles.tableCard}>
              <p className={styles.sectionTitle}>
                Clasificación completa
              </p>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Participante</th>
                    <th>Progreso</th>
                    <th style={{ textAlign: "right" }}>
                      Puntos
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((user, idx) => {
                    const isMe =
                      user.id === currentUserId;

                    const initials = (
                      user.full_name || "?"
                    )
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    const pct = Math.round(
                      (user.total_points / maxPts) *
                        100
                    );

                    return (
                      <tr
                        key={user.id}
                        className={
                          isMe ? styles.me : ""
                        }
                      >
                        <td className={styles.position}>
                          {idx === 0
                            ? "🥇"
                            : idx === 1
                            ? "🥈"
                            : idx === 2
                            ? "🥉"
                            : idx + 1}
                        </td>

                        <td>
  <div className={styles.participantInfo}>
    <div className={styles.tableAvatar}>
      {initials}
    </div>

    <div className={styles.participantText}>
      <span className={styles.participantName}>
        {user.full_name || "Sin nombre"}
      </span>

      {isMe && (
        <span className={styles.badge}>
          Tú
        </span>
      )}
    </div>
  </div>
</td>

                        <td>
                          <div
                            className={
                              styles.progressBg
                            }
                          >
                            <div
                              className={
                                styles.progressFill
                              }
                              style={{
                                width: `${pct}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td className={styles.pointsCell}>
                          {user.total_points} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}