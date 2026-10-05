import { useState, useRef } from 'react';
import {
  ArrowLeft,
  Car,
  Link2,
  Camera,
  PencilLine,
  Sparkles,
  Info,
  X,
  ChevronRight,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { CarFormData, InputMethod } from '@/types';
import { combustibleOptions, cambioOptions, traccionOptions } from '@/types';
import { emptyForm, parseAdText } from '@/mockData';

interface InputScreenProps {
  onBack: () => void;
  onAnalyze: (data: CarFormData) => void;
}

type UrlStatus = 'idle' | 'loading' | 'failed';

export default function InputScreen({ onBack, onAnalyze }: InputScreenProps) {
  const [metodo, setMetodo] = useState<InputMethod | null>(null);
  const [form, setForm] = useState<CarFormData>(emptyForm);
  const [urlStatus, setUrlStatus] = useState<UrlStatus>('idle');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof CarFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim() && !form.textoAnuncio.trim()) return;

    if (form.textoAnuncio.trim()) {
      const parsed = parseAdText(form.textoAnuncio, { ...form, metodo: 'url' });
      setForm(parsed);
      setUrlStatus('idle');
      setMetodo('manual');
      setFormError('');
      return;
    }

    setUrlStatus('loading');
    setTimeout(() => setUrlStatus('failed'), 900);
  };

  const handleAnalyzePastedText = () => {
    if (!form.textoAnuncio.trim()) return;
    const parsed = parseAdText(form.textoAnuncio, { ...form, metodo: 'url' });
    setForm(parsed);
    setMetodo('manual');
    setFormError('');
  };

  const handleUrlFallback = (target: 'fotos' | 'manual') => {
    setMetodo(target);
    setUrlStatus('idle');
    setForm((prev) => ({ ...prev, metodo: target }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setForm((prev) => ({
      ...prev,
      fotos: [...prev.fotos, ...names],
      metodo: 'fotos',
    }));
  };

  const removeFoto = (index: number) => {
    setForm((prev) => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = [
      ['marca', 'marca'],
      ['modelo', 'modelo'],
      ['anio', 'año'],
      ['kilometros', 'kilómetros'],
      ['precio', 'precio'],
    ] as const;
    const missing = required.find(([key]) => !String(form[key]).trim());
    if (missing) {
      setFormError(`Completa ${missing[1]} para generar un análisis útil.`);
      return;
    }
    if (Number(form.anio) < 1950 || Number(form.anio) > new Date().getFullYear() + 1) {
      setFormError('Revisa el año del vehículo.');
      return;
    }
    if (Number(form.kilometros) < 0 || Number(form.precio) <= 0) {
      setFormError('Kilómetros y precio deben ser valores válidos.');
      return;
    }
    setFormError('');
    setForm((prev) => ({ ...prev, metodo: 'manual' }));
    onAnalyze({ ...form, metodo: 'manual' });
  };

  const inputClass =
    'w-full bg-ink-800/60 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-ink-500 text-base focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all';
  const labelClass = 'block text-sm font-semibold text-ink-200 mb-1.5';
  const selectClass = `${inputClass} appearance-none pr-10`;

  const manualFields = [
    { key: 'marca' as const, label: 'Marca', placeholder: 'Volkswagen', type: 'text' },
    { key: 'modelo' as const, label: 'Modelo', placeholder: 'Golf', type: 'text' },
    { key: 'version' as const, label: 'Versión', placeholder: '1.5 TSI 150 CV Style', type: 'text' },
    { key: 'anio' as const, label: 'Año', placeholder: '2021', type: 'number' },
    { key: 'kilometros' as const, label: 'Kilómetros', placeholder: '85000', type: 'number' },
    { key: 'precio' as const, label: 'Precio anunciado (€)', placeholder: '18900', type: 'number' },
    { key: 'precioReferencia' as const, label: 'Precio de referencia (opcional)', placeholder: '20000', type: 'number' },
    { key: 'potencia' as const, label: 'Potencia (CV)', placeholder: '150', type: 'number' },
  ];

  // ===== METHOD SELECTION SCREEN =====
  if (metodo === null) {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex flex-col">
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-brand-950/40 to-transparent pointer-events-none" />

        <header className="relative sticky top-0 z-10 bg-ink-950/90 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">¿Qué coche quieres analizar?</h1>
              <p className="text-xs text-ink-400">Pásanos el anuncio y AutoCheck IA lo analizará por ti.</p>
            </div>
          </div>
        </header>

        <div className="relative flex-1 px-4 py-6">
          <div className="max-w-md mx-auto space-y-4">
            {/* Method cards */}
            <button
              onClick={() => { setMetodo('url'); setForm((prev) => ({ ...prev, metodo: 'url' })); }}
              className="group w-full bg-gradient-to-br from-brand-600/20 to-brand-800/10 border border-brand-500/30 hover:border-brand-500/50 rounded-2xl p-5 text-left transition-all active:scale-[0.98] animate-slide-up"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                  <Link2 className="w-6 h-6 text-brand-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-base flex items-center gap-2">
                    Pegar enlace del anuncio
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">La forma más rápida. Pega la URL del anuncio.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => { setMetodo('fotos'); setForm((prev) => ({ ...prev, metodo: 'fotos' })); }}
              className="group w-full bg-ink-800/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 text-left transition-all active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: '0.05s' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-accent-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-base">Subir fotos o capturas</p>
                  <p className="text-xs text-ink-400 mt-0.5">Sube capturas del anuncio o fotos del vehículo.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <button
              onClick={() => { setMetodo('manual'); setForm((prev) => ({ ...prev, metodo: 'manual' })); }}
              className="group w-full bg-ink-800/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 text-left transition-all active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ink-600/30 flex items-center justify-center shrink-0">
                  <PencilLine className="w-6 h-6 text-ink-300" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-base">Introducir datos manualmente</p>
                  <p className="text-xs text-ink-400 mt-0.5">Rellena los campos tú mismo.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-500 group-hover:text-ink-300 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Demo notice */}
            <div className="flex items-start gap-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3 mt-6 animate-fade-in">
              <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-xs text-ink-200 leading-relaxed">
                <strong>DEMO:</strong> Esta versión no se conecta a plataformas de compraventa. La extracción automática de anuncios estará disponible cuando se integren conectores autorizados. Mientras tanto, puedes introducir los datos manualmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== URL INPUT SCREEN =====
  if (metodo === 'url') {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex flex-col">
        <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => { setMetodo(null); setUrlStatus('idle'); }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold leading-tight">Pegar enlace</h1>
          </div>
        </header>

        <div className="flex-1 px-4 py-6">
          <div className="max-w-md mx-auto">
            {urlStatus === 'idle' && (
              <form onSubmit={handleUrlSubmit} className="space-y-5 animate-fade-in">
                <div>
                  <label className={labelClass}>Pega aquí el enlace del anuncio</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => update('url', e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={labelClass}>O pega el texto del anuncio</label>
                  <textarea
                    value={form.textoAnuncio}
                    onChange={(e) => update('textoAnuncio', e.target.value)}
                    placeholder="Ej.: Mercedes-Benz GLC 220d 4MATIC AMG Line, 2016, 370.000 km, 16.900 €, diésel, automático, 170 CV..."
                    rows={6}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-ink-500 mt-1.5">AutoCheck IA detectará automáticamente precio, km, año, potencia, combustible y cambio cuando aparezcan en el texto.</p>
                </div>

                <button
                  type="submit"
                  disabled={!form.url.trim() && !form.textoAnuncio.trim()}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl shadow-glow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Analizar anuncio
                </button>

                <div className="flex items-start gap-2.5 bg-ink-800/40 border border-white/[0.06] rounded-xl px-4 py-3">
                  <Info className="w-5 h-5 text-ink-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-300 leading-relaxed">
                    AutoCheck IA está preparado para analizar anuncios de diferentes plataformas. No realizará scraping que incumpla las condiciones de una fuente. Cuando un conector autorizado esté disponible, la extracción será automática.
                  </p>
                </div>
              </form>
            )}

            {urlStatus === 'loading' && (
              <div className="text-center py-12 animate-fade-in">
                <Loader2 className="w-12 h-12 text-brand-400 mx-auto mb-4 animate-spin" />
                <p className="text-white font-semibold text-lg">Analizando anuncio…</p>
                <p className="text-ink-400 text-sm mt-2">Intentando obtener la información disponible.</p>
              </div>
            )}

            {urlStatus === 'failed' && (
              <div className="space-y-5 animate-fade-in">
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-2xl p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-danger-400 mx-auto mb-3" />
                  <p className="text-white font-bold text-base mb-1">No hemos podido obtener todos los datos del anuncio.</p>
                  <p className="text-ink-400 text-sm">El enlace no se puede leer automáticamente desde este navegador. Puedes pegar el texto del anuncio y AutoCheck IA extraerá los datos principales.</p>
                </div>

                {form.textoAnuncio.trim() && (
                  <button
                    onClick={handleAnalyzePastedText}
                    className="w-full bg-brand-500/15 border border-brand-500/30 hover:border-brand-500/50 rounded-2xl p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-brand-400" />
                    <div>
                      <p className="font-semibold text-white text-sm">Analizar texto pegado</p>
                      <p className="text-xs text-ink-400">Extraer datos del anuncio sin conectarse a la plataforma.</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleUrlFallback('fotos')}
                  className="w-full bg-ink-800/60 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-accent-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">Subir capturas</p>
                    <p className="text-xs text-ink-400">Haz capturas del anuncio y súbelas.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink-500" />
                </button>

                <button
                  onClick={() => handleUrlFallback('manual')}
                  className="w-full bg-ink-800/60 border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-4 text-left transition-all active:scale-[0.98] flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-ink-600/30 flex items-center justify-center shrink-0">
                    <PencilLine className="w-5 h-5 text-ink-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">Introducir los datos manualmente</p>
                    <p className="text-xs text-ink-400">Rellena los campos tú mismo.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== PHOTOS INPUT SCREEN =====
  if (metodo === 'fotos') {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex flex-col">
        <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMetodo(null)}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold leading-tight">Subir fotos o capturas</h1>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 pb-32">
          <div className="max-w-md mx-auto space-y-5">
            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/[0.12] hover:border-brand-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-ink-800/30"
            >
              <Upload className="w-10 h-10 text-ink-400 mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">Toca para subir imágenes</p>
              <p className="text-ink-400 text-xs mt-1">Capturas del anuncio, ficha del vehículo o fotos del coche</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Uploaded files */}
            {form.fotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink-200">{form.fotos.length} imagen(es) subida(s)</p>
                {form.fotos.map((foto, i) => (
                  <div key={i} className="flex items-center gap-3 bg-ink-800/40 border border-white/[0.06] rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/15 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-accent-400" />
                    </div>
                    <span className="text-sm text-ink-200 flex-1 truncate">{foto}</span>
                    <button
                      onClick={() => removeFoto(i)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-danger-500/20 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="w-4 h-4 text-ink-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2.5 bg-ink-800/40 border border-white/[0.06] rounded-xl px-4 py-3">
              <Info className="w-5 h-5 text-ink-400 shrink-0 mt-0.5" />
              <p className="text-xs text-ink-300 leading-relaxed">
                En esta demo, el reconocimiento visual de imágenes no está activo. En futuras versiones, la IA podrá identificar información visible en las capturas (precio, kilómetros, año, equipamiento) y analizar el estado visual del vehículo (carrocería, pintura, neumáticos, interior, testigos del cuadro).
              </p>
            </div>

            {/* Link to manual */}
            <div className="pt-2">
              <p className="text-sm text-ink-400 mb-2">¿Quieres añadir los datos tú mismo?</p>
              <button
                onClick={() => setMetodo('manual')}
                className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Introducir datos manualmente →
              </button>
            </div>
          </div>

          {/* Sticky CTA */}
          {form.fotos.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950 via-ink-950 to-transparent pt-8 pb-5 px-4">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => onAnalyze({ ...form, metodo: 'fotos' })}
                  className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-bold text-lg py-4 rounded-2xl shadow-glow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Analizar con IA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== MANUAL INPUT SCREEN =====
  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setMetodo(null)}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Introducir datos</h1>
            <p className="text-xs text-ink-400">Rellena los campos del vehículo</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleManualSubmit} className="flex-1 px-4 py-6 pb-32">
        <div className="max-w-md mx-auto space-y-5">
          <div className="flex items-start gap-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3">
            <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-200 leading-relaxed">
              Introduce los datos que veas en el anuncio. Cuantos más campos completes, más precisa será la valoración.
            </p>
          </div>

          <div className="flex items-start gap-2.5 bg-ink-800/40 border border-white/[0.06] rounded-xl px-4 py-3">
            <Info className="w-5 h-5 text-ink-400 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-300 leading-relaxed">
              <strong className="text-ink-100">Nuevo:</strong> si conoces el precio de un vehículo equivalente, introdúcelo como referencia. AutoCheck IA podrá comparar ambos precios sin inventar una valoración de mercado.
            </p>
          </div>

          {manualFields.map(({ key, label, placeholder, type }) => (
            <div key={key} className="animate-slide-up">
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                inputMode={type === 'number' ? 'numeric' : 'text'}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}

          <div className="animate-slide-up">
            <label className={labelClass}>Combustible</label>
            <select value={form.combustible} onChange={(e) => update('combustible', e.target.value)} className={selectClass}>
              <option value="" disabled>Selecciona…</option>
              {combustibleOptions.map((opt) => <option key={opt} value={opt} className="bg-ink-800">{opt}</option>)}
            </select>
          </div>

          <div className="animate-slide-up">
            <label className={labelClass}>Cambio</label>
            <select value={form.cambio} onChange={(e) => update('cambio', e.target.value)} className={selectClass}>
              <option value="" disabled>Selecciona…</option>
              {cambioOptions.map((opt) => <option key={opt} value={opt} className="bg-ink-800">{opt}</option>)}
            </select>
          </div>

          <div className="animate-slide-up">
            <label className={labelClass}>Tracción</label>
            <select value={form.traccion} onChange={(e) => update('traccion', e.target.value)} className={selectClass}>
              <option value="" disabled>Selecciona…</option>
              {traccionOptions.map((opt) => <option key={opt} value={opt} className="bg-ink-800">{opt}</option>)}
            </select>
          </div>
          {formError && (
            <div className="bg-danger-500/10 border border-danger-500/25 text-danger-200 rounded-xl px-4 py-3 text-sm" role="alert">
              {formError}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950 via-ink-950 to-transparent pt-8 pb-5 px-4">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-bold text-lg py-4 rounded-2xl shadow-glow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5" />
              Analizar con IA
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
