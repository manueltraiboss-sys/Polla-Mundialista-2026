import Image from "next/image";

type MatchCardProps = {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  countdown: string;
  getFlagUrl: (team: string) => string;
};

export default function MatchCard({
  homeTeam,
  awayTeam,
  matchDate,
  countdown,
  getFlagUrl,
}: MatchCardProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--surface-border)] rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-[var(--primary)]/20 text-[var(--primary-hover)]">
            ⏰ Próximo partido
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-secondary)]">
            📅{" "}
            {new Date(matchDate).toLocaleString("es-EC", {
              timeZone: "America/Guayaquil",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>

          {countdown && (
            <span className="bg-[var(--primary)] text-white text-xs font-semibold px-3 py-1 rounded-full">
              {countdown}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
        
        {/* LOCAL */}
        <div className="text-center flex flex-col items-center">
          <div className="relative w-24 h-16 mb-3">
            <Image
              src={getFlagUrl(homeTeam)}
              alt={homeTeam}
              fill
              className="object-cover rounded-lg border border-[var(--surface-border)] shadow-md"
            />
          </div>

          <div className="font-semibold text-[var(--foreground)]">
            {homeTeam}
          </div>
        </div>

        {/* VS */}
        <div className="text-[var(--accent)] text-3xl font-black">
          VS
        </div>

        {/* VISITANTE */}
        <div className="text-center flex flex-col items-center">
          <div className="relative w-24 h-16 mb-3">
            <Image
              src={getFlagUrl(awayTeam)}
              alt={awayTeam}
              fill
              className="object-cover rounded-lg border border-[var(--surface-border)] shadow-md"
            />
          </div>

          <div className="font-semibold text-[var(--foreground)]">
            {awayTeam}
          </div>
        </div>

      </div>
    </div>
  );
}