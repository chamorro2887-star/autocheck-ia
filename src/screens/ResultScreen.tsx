import {
  ArrowLeft,
  Car,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Lightbulb,
  RotateCcw,
  Info,
  Calculator,
  Wrench,
  Database,
  CircleSlash,
  HelpCircle,
  FileText,
  Eye,
  Search,
  ShieldX,
  PlusCircle,
  Crown,
  Briefcase,
  Gauge,
  Printer,
} from 'lucide-react';
import type {
  AnalysisResult,
  CarFormData,
  CategoryStatus,
  ConfidenceLevel,
  DataSourceType,
  Recommendation,
} from '@/types';

interface ResultScreenProps {
  result: AnalysisResult;
  formData: CarFormData;
  onBack: () => void;
  onNewAnalysis: () => void;
}

const NOT_AVAILABLE_LABEL = 'N/D';

const recommendationConfig: Record<Recommendation, { bg: string; text: string; border: string; dot: string }> = {
  COMPRAR: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30', dot: 'bg-success-500' },
  NEGOCIAR: { bg: 'bg-brand-500/15', text: 'text-brand-400', border: 'border-brand-500/30', dot: 'bg-brand-500' },
  'PRECAUCIÓN': { bg: 'bg-warning-500/15', text: 'text-warning-400', border: 'border-warning-500/30', dot: 'bg-warning-500' },
  'NO RECOMENDADO': { bg: 'bg-danger-500/15', text: 'text-danger-400', border: 'border-danger-500/30', dot: 'bg-danger-500' },
};

const confidenceConfig: Record<ConfidenceLevel, { color: string; bg: string; label: string }> = {
  Alta: { color: 'text-success-400', bg: 'bg-success-500/15', label: '🟢 Alta' },
  Media: { color: 'text-warning-400', bg: 'bg-warning-500/15', label: '🟡 Media' },
  Baja: { color: 'text-danger-400', bg: 'bg-danger-500/15', label: '🔴 Baja' },
};

const dataSourceVisual: Record<DataSourceType, { icon: string; color: string; bg: string }> = {
  user: { icon: '✓', color: 'text-brand-300', bg: 'bg-brand-500/15' },
  verified: { icon: '✓', color: 'text-success-300', bg: 'bg-success-500/15' },
  estimated: { icon: '⚠', color: 'text-warning-300', bg: 'bg-warning-500/15' },
  unavailable: { icon: '—', color: 'text-ink-400', bg: 'bg-ink-700/40' },
};

const categoryStatusConfig: Record<CategoryStatus, { label: string; color: string; bg: string }> = {
  verificado: { label: 'Verificado', color: 'text-success-400', bg: 'bg-success-500/10' },
  introducido: { label: 'Introducido por usuario', color: 'text-brand-300', bg: 'bg-brand-500/10' },
  estimacion: { label: 'Estimación IA', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  'no-disponible': { label: 'No disponible', color: 'text-ink-400', bg: 'bg-ink-700/30' },
};

const metodoLabels: Record<string, string> = {
  url: 'Enlace del anuncio',
  fotos: 'Fotos y capturas',
  manual: 'Introducción manual',
};

function SectionCard({
  icon: Icon,
  iconColor,
  title,
  items,
  itemColor,
}: {
  icon: typeof CheckCircle2;
  iconColor: string;
  title: string;
  items: string[];
  itemColor: string;
}) {
  return (
    <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-white text-base">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink-200 leading-relaxed">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${itemColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultScreen({ result, formData, onBack, onNewAnalysis }: ResultScreenProps) {
  const rec = recommendationConfig[result.recomendacion];
  const conf = confidenceConfig[result.confianza];
  const scoreColor = result.puntuacion >= 65 ? 'text-success-400' : result.puntuacion >= 45 ? 'text-warning-400' : 'text-danger-400';
  const ringColor = result.puntuacion >= 65 ? '#10b981' : result.puntuacion >= 45 ? '#f59e0b' : '#ef4444';
  const confColor = result.confianzaPorcentaje >= 60 ? 'text-success-400' : result.confianzaPorcentaje >= 35 ? 'text-warning-400' : 'text-danger-400';
  const confRingColor = result.confianzaPorcentaje >= 60 ? '#10b981' : result.confianzaPorcentaje >= 35 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <header className="sticky top-0 z-10 bg-ink-950/90 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0" aria-label="Volver">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Resultado</h1>
            <p className="text-xs text-ink-400">{formData.marca || 'Vehículo'} {formData.modelo || ''} · {formData.anio || ''}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-12">
        <div className="max-w-md mx-auto space-y-5">
          {/* Demo banner */}
          <div className="flex items-start gap-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3 animate-fade-in">
            <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-200 leading-relaxed">
              <strong>DEMO.</strong> Análisis basado en {metodoLabels[result.metodoUsado]}. No se han consultado registros oficiales, ITV, DGT ni historial del vehículo. Los datos no disponibles se muestran como tales.
            </p>
          </div>

          {/* ===== SCORE + CONFIDENCE DUAL DISPLAY ===== */}
          <div className="bg-gradient-to-br from-ink-800/60 to-ink-900/60 border border-white/[0.08] rounded-3xl p-6 text-center animate-scale-in shadow-card-lg">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4">Puntuación del vehículo</p>

            {/* Score Circle */}
            <div className="relative w-36 h-36 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="80" cy="80" r="68" fill="none" stroke={ringColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(result.puntuacion / 100) * 427} 427`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{result.puntuacion}</span>
                <span className="text-sm text-ink-400 font-medium">/ 100</span>
              </div>
            </div>

            <p className="text-xs text-ink-400 leading-relaxed px-4 mb-4">{result.puntuacionExplicacion}</p>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] my-4" />

            {/* Confidence */}
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Confianza del análisis</p>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={confRingColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(result.confianzaPorcentaje / 100) * 314} 314`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${confColor}`}>{result.confianzaPorcentaje}%</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${conf.bg} ${conf.color}`}>
              {conf.label}
            </div>
          </div>

          {/* ===== DATOS DEL ANUNCIO ===== */}
          {result.datosAnuncio.length > 0 && (
            <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-bold text-white text-base">📋 Datos del anuncio</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {result.datosAnuncio.map((dato, i) => {
                  const vis = dataSourceVisual[dato.fuente];
                  return (
                    <div key={i} className={`rounded-lg px-3 py-2.5 ${vis.bg}`}>
                      <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-0.5">{dato.label}</p>
                      <p className="text-sm font-semibold text-white truncate">{dato.valor}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== CALIDAD DEL ANÁLISIS ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-bold text-white text-base">Calidad del análisis</h3>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center bg-success-500/10 rounded-lg py-3">
                <p className="text-xl font-extrabold text-success-400">{result.datosVerificados}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Verificados</p>
              </div>
              <div className="text-center bg-brand-500/10 rounded-lg py-3">
                <p className="text-xl font-extrabold text-brand-400">{result.datosIntroducidos}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Introducidos</p>
              </div>
              <div className="text-center bg-warning-500/10 rounded-lg py-3">
                <p className="text-xl font-extrabold text-warning-400">{result.datosEstimados}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">Estim. IA</p>
              </div>
              <div className="text-center bg-ink-700/40 rounded-lg py-3">
                <p className="text-xl font-extrabold text-ink-400">{result.datosNoDisponibles}</p>
                <p className="text-[10px] text-ink-400 mt-0.5">No disp.</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-ink-200 font-semibold">Confianza del análisis</span>
                <span className={`text-sm font-bold ${confColor}`}>{result.confianzaPorcentaje}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-ink-700/50 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${result.confianzaPorcentaje >= 60 ? 'bg-success-500' : result.confianzaPorcentaje >= 35 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${result.confianzaPorcentaje}%` }} />
              </div>
            </div>

            <p className="text-xs text-ink-400 mt-3 leading-relaxed">{result.confianzaExplicacion}</p>
          </div>

          {/* ===== SCORE BREAKDOWN WITH CATEGORY STATUS ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-bold text-white text-base">¿Por qué obtiene esta puntuación?</h3>
            </div>

            <div className="space-y-3">
              {result.scoreBreakdown.categories.map((cat) => {
                const statusCfg = categoryStatusConfig[cat.estado];
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink-200">{cat.label}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{cat.value}<span className="text-ink-500">/{cat.max}</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-700/50 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700" style={{ width: `${(cat.value / cat.max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total</span>
                <span className={`text-lg font-extrabold ${scoreColor}`}>{result.puntuacion}<span className="text-sm text-ink-500 font-medium">/100</span></span>
              </div>
            </div>

            <p className="text-xs text-ink-400 mt-4 leading-relaxed">
              La puntuación valora solo los datos disponibles. Los datos que faltan no penalizan al vehículo — reducen la confianza del análisis.
            </p>
          </div>

          {/* ===== ANÁLISIS DEL PRECIO (no invented estimates) ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-bold text-white text-base">💰 Análisis del precio</h3>
            </div>

            {result.precioAnunciado > 0 ? (
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04] mb-4">
                <span className="text-sm text-ink-300">Precio anunciado</span>
                <span className="text-base font-bold text-white">{result.precioAnunciado.toLocaleString('es-ES')} €</span>
              </div>
            ) : (
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04] mb-4">
                <span className="text-sm text-ink-300">Precio anunciado</span>
                <span className="text-base font-bold text-ink-500">{NOT_AVAILABLE_LABEL}</span>
              </div>
            )}

            <div className="bg-ink-900/40 rounded-xl px-4 py-3.5">
              <p className="text-sm text-ink-200 leading-relaxed">{result.valoracionMercado}</p>
            </div>
          </div>

          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4"><div className="w-8 h-8 rounded-lg bg-warning-500/15 flex items-center justify-center"><Search className="w-5 h-5 text-warning-400" /></div><div><h3 className="font-bold text-white text-base">🔎 Señales del anuncio</h3><p className="text-xs text-ink-400">Coherencia de los datos aportados</p></div></div>
            <div className="space-y-2.5">{result.inconsistencias.map((item, i) => <div key={i} className="flex items-start gap-2.5 bg-ink-900/40 rounded-lg px-3.5 py-2.5"><span className="text-warning-400 mt-0.5">⚠️</span><p className="text-sm text-ink-200 leading-relaxed">{item}</p></div>)}</div>
          </div>

          {result.estrategiaNegociacion.precioObjetivo !== null && (
            <div className="bg-gradient-to-br from-brand-600/15 to-ink-800/40 border border-brand-500/20 rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center gap-2.5 mb-4"><div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-brand-400" /></div><div><h3 className="font-bold text-white text-base">🤝 Estrategia de negociación</h3><p className="text-xs text-ink-400">Punto de partida, no una tasación oficial</p></div></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-ink-900/50 rounded-xl p-3"><p className="text-[11px] text-ink-400 uppercase tracking-wide">Precio objetivo</p><p className="text-xl font-extrabold text-brand-300 mt-1">{result.estrategiaNegociacion.precioObjetivo.toLocaleString('es-ES')} €</p></div>
                <div className="bg-ink-900/50 rounded-xl p-3"><p className="text-[11px] text-ink-400 uppercase tracking-wide">Máximo orientativo</p><p className="text-xl font-extrabold text-white mt-1">{result.estrategiaNegociacion.precioMaximo?.toLocaleString('es-ES')} €</p></div>
              </div>
              <p className="text-sm text-ink-200 leading-relaxed mb-3">{result.estrategiaNegociacion.argumentoPrincipal}</p>
              <div className="flex items-center justify-between mb-3"><span className="text-xs text-ink-400">Descuento sugerido</span><span className="text-sm font-bold text-brand-300">{result.estrategiaNegociacion.descuentoSugerido}%</span></div>
              <ul className="space-y-2">{result.estrategiaNegociacion.argumentos.map((item, i) => <li key={i} className="text-sm text-ink-200 flex items-start gap-2"><span className="text-brand-400">•</span>{item}</li>)}</ul>
            </div>
          )}

          {/* ===== ANÁLISIS DEL VEHÍCULO ===== */}
          <SectionCard icon={CheckCircle2} iconColor="bg-success-500/15 text-success-400" title="🔧 Análisis del vehículo · Puntos positivos" items={result.puntosPositivos} itemColor="bg-success-400" />
          <SectionCard icon={AlertTriangle} iconColor="bg-warning-500/15 text-warning-400" title="🔧 Análisis del vehículo · Aspectos a revisar" items={result.aspectosRevisar} itemColor="bg-warning-400" />
          <SectionCard icon={ShieldAlert} iconColor="bg-danger-500/15 text-danger-400" title="🔧 Análisis del vehículo · Posibles riesgos" items={result.posiblesRiesgos} itemColor="bg-danger-400" />

          {/* ===== INFORMACIÓN QUE FALTA ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning-500/15 flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-warning-400" />
              </div>
              <h3 className="font-bold text-white text-base">⚠️ Información que falta</h3>
            </div>
            <p className="text-xs text-ink-400 mb-4 leading-relaxed">La siguiente información importante no aparece en los datos disponibles.</p>
            <div className="space-y-2">
              {result.infoFaltante.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-ink-900/40 rounded-lg px-3.5 py-2.5">
                  <span className="text-warning-400 text-sm shrink-0 mt-0.5">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-ink-100">{item.label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{item.detalle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== QUÉ NECESITAMOS PARA MEJORAR EL INFORME ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-bold text-white text-base">¿Qué necesitamos para mejorar el informe?</h3>
            </div>
            <div className="space-y-2 mb-4">
              {result.infoFaltante.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-ink-200">
                  <span className="text-warning-400 shrink-0">⚠</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 font-semibold text-sm py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Completar información
            </button>
            <p className="text-xs text-ink-500 mt-3 text-center">Próximamente: conectar fuentes externas para verificar datos automáticamente.</p>
          </div>

          {/* ===== DETECTADO EN EL ANUNCIO ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-danger-500/15 flex items-center justify-center">
                <Search className="w-5 h-5 text-danger-400" />
              </div>
              <h3 className="font-bold text-white text-base">🕵️ Posibles puntos de atención</h3>
            </div>
            <p className="text-xs text-ink-400 mb-4 leading-relaxed">Posibles incoherencias, información poco clara o aspectos que conviene comprobar. No se acusa al vendedor de fraude ni se afirma que exista una avería sin pruebas.</p>
            <ul className="space-y-2.5">
              {result.detectadoAnuncio.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink-200 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-danger-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ===== RELACIÓN CALIDAD/PRECIO ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-bold text-white text-base">📊 Relación calidad/precio</h3>
            </div>
            <p className="text-sm text-ink-200 leading-relaxed">{result.relacionCalidadPrecio}</p>
          </div>

          {/* ===== POSIBLES GASTOS ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-warning-500/15 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-warning-400" />
              </div>
              <h3 className="font-bold text-white text-base">Posibles gastos a corto plazo</h3>
            </div>
            <div className="space-y-3">
              {result.posiblesGastos.map((gasto, i) => (
                <div key={i} className="flex items-start gap-3 bg-ink-900/40 rounded-xl px-3.5 py-3">
                  <span className="text-xl shrink-0">{gasto.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{gasto.categoria}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gasto.estado === 'Pendiente de inspección' ? 'bg-ink-700/50 text-ink-400' : 'bg-warning-500/15 text-warning-400'}`}>{gasto.estado}</span>
                    </div>
                    <p className="text-xs text-ink-300 mt-1 leading-relaxed">{gasto.estimacion}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-400 mt-4 leading-relaxed">No se afirma que ninguna pieza necesite cambiarse. Solo se indican elementos que <strong>conviene revisar</strong> según el kilometraje y la antigüedad.</p>
          </div>

          {/* ===== CONCLUSIÓN ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-accent-400" />
              </div>
              <h3 className="font-bold text-white text-base">🤖 Conclusión AutoCheck IA</h3>
            </div>
            <p className="text-sm text-ink-200 leading-relaxed">{result.conclusion}</p>
          </div>

          {/* ===== RECOMMENDATION ===== */}
          <div className={`rounded-2xl p-6 text-center border-2 ${rec.border} ${rec.bg} animate-scale-in`}>
            <p className="text-xs text-ink-300 font-semibold uppercase tracking-wider mb-2">Recomendación</p>
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <span className={`w-3 h-3 rounded-full ${rec.dot}`} />
              <p className={`text-2xl font-extrabold ${rec.text}`}>{result.recomendacion}</p>
            </div>
            <p className="text-xs text-ink-200 leading-relaxed">{result.recomendacionExplicacion}</p>
          </div>

          {/* ===== REPORT LEVELS ===== */}
          <div className="bg-ink-800/40 border border-white/[0.06] rounded-2xl p-5 animate-slide-up">
            <h3 className="font-bold text-white text-base mb-4">Niveles de informe</h3>

            {/* Gratuito (current) */}
            <div className="flex items-start gap-3 bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-3.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">Gratuito</span>
                  <span className="text-[10px] font-bold text-brand-300 bg-brand-500/20 px-2 py-0.5 rounded-full">ACTUAL</span>
                </div>
                <p className="text-xs text-ink-300 leading-relaxed">Datos básicos, puntuación provisional, confianza y algunos riesgos.</p>
              </div>
            </div>

            {/* Premium */}
            <div className="flex items-start gap-3 bg-ink-900/40 border border-white/[0.06] rounded-xl px-4 py-3.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-warning-500/15 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-warning-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">Premium</span>
                  <span className="text-[10px] font-bold text-warning-400 bg-warning-500/10 px-2 py-0.5 rounded-full">PRÓXIMAMENTE</span>
                </div>
                <p className="text-xs text-ink-300 leading-relaxed">Informe completo, análisis IA, negociación recomendada, riesgos, gastos potenciales y checklist de inspección.</p>
              </div>
            </div>

            {/* Profesional */}
            <div className="flex items-start gap-3 bg-ink-900/40 border border-white/[0.06] rounded-xl px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">Profesional</span>
                  <span className="text-[10px] font-bold text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">PRÓXIMAMENTE</span>
                </div>
                <p className="text-xs text-ink-300 leading-relaxed">Comparación con otros vehículos, análisis avanzado, historial de informes y exportación PDF.</p>
              </div>
            </div>
          </div>

          {/* ===== FUTURE FEATURES ===== */}
          <div className="bg-ink-800/30 border border-white/[0.04] rounded-2xl p-5 animate-slide-up">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-ink-700/50 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-ink-400" />
              </div>
              <h3 className="font-bold text-ink-200 text-sm">Próximas funciones</h3>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">Conectores de plataformas de compraventa, API de información de vehículos, API VIN, datos DGT/ITV, bases de datos de precios, IA para analizar fotografías y descripciones, sistema de usuarios y pagos. Estas funciones no están activas en esta demo.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 print:hidden">
            <button onClick={() => window.print()} className="bg-brand-500 hover:bg-brand-400 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5">
              <Printer className="w-5 h-5" />
              Guardar / PDF
            </button>
            <button onClick={onNewAnalysis} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5">
            <RotateCcw className="w-5 h-5" />
              Analizar otro coche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
