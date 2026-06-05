"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
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
  const rest   = ranking.slice(3);
  const maxPts = ranking[0]?.total_points || 1;

  const podiumOrder = [1, 0, 2]; // silver · gold · bronze visual order

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .rk-root {
          min-height: 100vh;
          background: #07100a;
          font-family: 'Outfit', sans-serif;
          color: #fff;
          padding-bottom: 4rem;
        }

        /* ── Hero header ── */
        .rk-hero {
          position: relative;
          padding: 3rem 2rem 2.5rem;
          text-align: center;
          overflow: hidden;
        }

        .rk-hero-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .rk-hero-label {
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(212,175,55,0.7);
          margin-bottom: 0.4rem;
        }

        .rk-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          letter-spacing: 0.06em;
          color: #fff;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .rk-hero-title span { color: #D4AF37; }

        .rk-hero-line {
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
          margin: 0 auto;
        }

        /* ── Podium ── */
        .rk-podium-wrap {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 0.75rem;
          padding: 0 1.5rem 2.5rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .rk-podium-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          animation: fadeUp 0.6s ease both;
        }

        .rk-podium-col:nth-child(1) { animation-delay: 0.15s; }
        .rk-podium-col:nth-child(2) { animation-delay: 0s;    }
        .rk-podium-col:nth-child(3) { animation-delay: 0.3s;  }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rk-podium-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.04em;
          border: 2px solid;
          flex-shrink: 0;
        }

        .rk-podium-col.gold   .rk-podium-avatar { width: 64px; height: 64px; font-size: 1.5rem; background: rgba(212,175,55,0.15); border-color: #D4AF37; color: #D4AF37; }
        .rk-podium-col.silver .rk-podium-avatar { background: rgba(180,180,180,0.12); border-color: #b0b0b0; color: #c8c8c8; }
        .rk-podium-col.bronze .rk-podium-avatar { background: rgba(176,120,60,0.12);  border-color: #b07840; color: #c8945a; }

        .rk-podium-name {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          color: rgba(255,255,255,0.85);
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rk-podium-col.gold .rk-podium-name { font-size: 0.9rem; color: #fff; }

        .rk-podium-pts {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.05rem;
          letter-spacing: 0.06em;
        }

        .rk-podium-col.gold   .rk-podium-pts { color: #D4AF37; font-size: 1.25rem; }
        .rk-podium-col.silver .rk-podium-pts { color: #b0b0b0; }
        .rk-podium-col.bronze .rk-podium-pts { color: #c8945a; }

        .rk-podium-block {
          width: 100%;
          border-radius: 10px 10px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rk-podium-col.gold   .rk-podium-block { height: 80px; background: linear-gradient(180deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08)); border: 1px solid rgba(212,175,55,0.35); }
        .rk-podium-col.silver .rk-podium-block { height: 56px; background: linear-gradient(180deg, rgba(180,180,180,0.15), rgba(180,180,180,0.05)); border: 1px solid rgba(180,180,180,0.25); }
        .rk-podium-col.bronze .rk-podium-block { height: 40px; background: linear-gradient(180deg, rgba(176,120,60,0.15),  rgba(176,120,60,0.05));  border: 1px solid rgba(176,120,60,0.25);  }

        .rk-podium-block-medal {
          font-size: 1.4rem;
        }

        /* ── Table section ── */
        .rk-table-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1.5rem;
          animation: fadeUp 0.6s 0.3s ease both;
          opacity: 0;
        }

        .rk-section-label {
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 0.8rem;
          padding-left: 0.25rem;
        }

        .rk-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
        }

        .rk-thead th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .rk-thead th:last-child { text-align: right; }

        .rk-row {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.18s;
          animation: fadeUp 0.4s ease both;
        }

        .rk-row:last-child { border-bottom: none; }
        .rk-row:hover { background: rgba(255,255,255,0.04); }

        .rk-row.me {
          background: rgba(212,175,55,0.08);
          border-left: 3px solid #D4AF37;
        }

        .rk-row.me:hover { background: rgba(212,175,55,0.12); }

        .rk-td {
          padding: 0.85rem 1rem;
          vertical-align: middle;
        }

        .rk-pos {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.4);
          width: 40px;
        }

        .rk-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .rk-mini-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          flex-shrink: 0;
        }

        .rk-me-badge {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(212,175,55,0.2);
          color: #D4AF37;
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 4px;
          padding: 1px 5px;
          margin-left: 6px;
        }

        /* Progress bar */
        .rk-bar-cell { width: 120px; }

        .rk-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
          overflow: hidden;
        }

        .rk-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #b8962e, #D4AF37);
          transition: width 0.6s ease;
        }

        .rk-pts {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.15rem;
          letter-spacing: 0.06em;
          color: #D4AF37;
          text-align: right;
        }

        .rk-pts-label {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.06em;
        }

        /* Empty / loading */
        .rk-empty {
          text-align: center;
          padding: 3rem;
          color: rgba(255,255,255,0.3);
          font-size: 0.9rem;
        }

        .rk-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(212,175,55,0.2);
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 4rem auto;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .rk-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent);
          max-width: 720px;
          margin: 2rem auto;
        }

        @media (max-width: 500px) {
          .rk-bar-cell { display: none; }
          .rk-hero-title { font-size: 2.4rem; }
        }
      `}</style>

      <div className="rk-root">

        {/* Hero */}
        <div className="rk-hero">
          <div className="rk-hero-glow" />
          <p className="rk-hero-label">Mundial 2026</p>
          <h1 className="rk-hero-title">Ranking <span>General</span></h1>
          <div className="rk-hero-line" />
        </div>

        {loading ? (
          <div className="rk-spinner" />
        ) : ranking.length === 0 ? (
          <div className="rk-empty">Aún no hay participantes en el ranking.</div>
        ) : (
          <>
            {/* ── Podium top 3 ── */}
            {podium.length >= 1 && (
              <div className="rk-podium-wrap">
                {podiumOrder.map((dataIdx) => {
                  const user = podium[dataIdx];
                  if (!user) return <div key={dataIdx} style={{ flex: 1 }} />;
                  const cls = dataIdx === 0 ? "gold" : dataIdx === 1 ? "silver" : "bronze";
                  const medal = ["🥇","🥈","🥉"][dataIdx];
                  const initials = (user.full_name || "?")
                    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={user.id} className={`rk-podium-col ${cls}`}>
                      <div className="rk-podium-avatar">{initials}</div>
                      <div className="rk-podium-name">{user.full_name || "Sin nombre"}</div>
                      <div className="rk-podium-pts">{user.total_points} pts</div>
                      <div className="rk-podium-block">
                        <span className="rk-podium-block-medal">{medal}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rk-divider" />

            {/* ── Full table ── */}
            <div className="rk-table-wrap">
              <p className="rk-section-label">Clasificación completa</p>
              <table className="rk-table">
                <thead className="rk-thead">
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Participante</th>
                    <th className="rk-bar-cell" style={{ textAlign: "center" }}>Progreso</th>
                    <th style={{ textAlign: "right" }}>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((user, idx) => {
                    const isMe = user.id === currentUserId;
                    const initials = (user.full_name || "?")
                      .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    const pct = Math.round((user.total_points / maxPts) * 100);

                    return (
                      <tr
                        key={user.id}
                        className={`rk-row${isMe ? " me" : ""}`}
                        style={{ animationDelay: `${0.35 + idx * 0.04}s` }}
                      >
                        <td className="rk-td rk-pos">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                        </td>
                        <td className="rk-td">
                          <div className="rk-name-cell">
                            <div className="rk-mini-avatar">{initials}</div>
                            <span style={{ fontWeight: 500, fontSize: "0.92rem" }}>
                              {user.full_name || "Sin nombre"}
                            </span>
                            {isMe && <span className="rk-me-badge">Tú</span>}
                          </div>
                        </td>
                        <td className="rk-td rk-bar-cell">
                          <div className="rk-bar-bg">
                            <div className="rk-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="rk-td" style={{ textAlign: "right" }}>
                          <span className="rk-pts">{user.total_points}</span>
                          <span className="rk-pts-label"> pts</span>
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
    </>
  );
}