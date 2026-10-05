import { Car, ShieldCheck, AlertTriangle, ThumbsUp, ScanLine, ChevronRight, Link2, PlayCircle } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
  onDemo: () => void;
}

const advantages = [
  { icon: ScanLine, title: 'Analiza el vehículo' },
  { icon: AlertTriangle, title: 'Detecta posibles riesgos' },
  { icon: ThumbsUp, title: 'Te ayuda a decidir' },
];

export default function HomeScreen({ onStart, onDemo }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-brand-950/60 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <header className="relative px-6 pt-14 pb-4 flex items-center justify-center gap-2.5 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow">
          <Car className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          AutoCheck <span className="text-brand-400">IA</span>
        </span>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-sm mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-slide-up">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-ink-200">Análisis inteligente de coches</span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight animate-slide-up" style={{ animationDelay: '0.05s' }}>
            Antes de comprar un coche<br />de segunda mano,<br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">compruébalo.</span>
          </h1>

          <p className="text-ink-300 text-base leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Pega el anuncio, completa los datos disponibles y obtén una valoración clara, señales de riesgo y una estrategia de negociación.
          </p>

          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={onStart}
              className="group w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-glow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Analizar un coche
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onDemo}
              className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-ink-100 font-semibold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5 text-brand-400" />
              Ver un informe de ejemplo
            </button>
          </div>

          <div className="space-y-3 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {advantages.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3.5 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-success-400 font-bold">✓</span>
                  <span className="text-sm font-medium text-ink-100">{title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative px-6 pb-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <p className="text-xs text-ink-500">
          AutoCheck IA · Informe orientativo · Los análisis no sustituyen una inspección profesional ni una verificación documental
        </p>
      </footer>
    </div>
  );
}
