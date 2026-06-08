type HeroCardProps = {
  fullName: string;
  position: number;
  points: number;
  emoji: string;
};

export default function HeroCard({
  fullName,
  position,
  points,
  emoji,
}: HeroCardProps) {
  return (
    <div className="bg-surface border border-surface-border rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <p className="uppercase tracking-widest text-xs font-bold text-primary">
            Polla Mundialista · USA · Canadá · México 2026
          </p>

          <h1 className="text-4xl font-bold text-primary mt-2">
            Hola,{" "}
            <span className="text-accent">
              {fullName.split(" ")[0]}
            </span>{" "}
            👋
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Aquí está tu resumen de la competencia
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 bg-[color:var(--accent)]/10">
            <span>{emoji}</span>

            <span className="font-semibold text-primary">
              Estás en la posición #{position} con {points} pts
            </span>
          </div>
        </div>

        <div className="w-[220px] flex justify-center">
          <img
            src="/Boxi Mundialista.png"
            alt="Boxi Mundialista"
            className="max-h-[220px] object-contain"
          />
        </div>
      </div>
    </div>
  );
}