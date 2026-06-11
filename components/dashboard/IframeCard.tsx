"use client";

export default function IframeCard() {
  return (
    <a
      href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/standings"
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-8">
        
        {/* Icono / decoración */}
        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
          🏆
        </div>

        {/* Texto */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
            FIFA World Cup 2026 · Canadá · México · EE.UU.
          </p>
          <h2 className="text-white font-bold text-xl sm:text-2xl mb-2">
            Tabla de Posiciones Oficial
          </h2>
          <p className="text-white/60 text-sm">
            Consulta los grupos, puntos y clasificados directamente en FIFA.com
          </p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)]/30 border border-[var(--primary)]/40 group-hover:bg-[var(--primary)]/50 transition-colors duration-300">
          <span className="text-white font-semibold text-sm whitespace-nowrap">Ver tabla</span>
          <span className="text-white text-lg group-hover:translate-x-1 transition-transform duration-200">→</span>
        </div>

      </div>
    </a>
  );
}