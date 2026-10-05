export type Screen = 'home' | 'input' | 'result';
export type InputMethod = 'url' | 'fotos' | 'manual';
export type ReportLevel = 'gratuito' | 'premium' | 'profesional';

export interface CarFormData {
  url: string;
  textoAnuncio: string;
  marca: string;
  modelo: string;
  version: string;
  anio: string;
  kilometros: string;
  precio: string;
  precioReferencia: string;
  combustible: string;
  cambio: string;
  potencia: string;
  traccion: string;
  metodo: InputMethod;
  fotos: string[];
}

export type Recommendation = 'COMPRAR' | 'NEGOCIAR' | 'PRECAUCIÓN' | 'NO RECOMENDADO';
export type ConfidenceLevel = 'Alta' | 'Media' | 'Baja';
export type DataSourceType = 'user' | 'verified' | 'estimated' | 'unavailable';
export type CategoryStatus = 'verificado' | 'introducido' | 'estimacion' | 'no-disponible';

export interface ScoreCategory {
  label: string;
  value: number;
  max: number;
  estado: CategoryStatus;
}

export interface ScoreBreakdown {
  precio: number;
  kilometraje: number;
  antiguedad: number;
  motorTransmision: number;
  equipamiento: number;
  historialMantenimiento: number;
  riesgos: number;
  categories: ScoreCategory[];
}

export interface CostItem {
  categoria: string;
  icon: string;
  estado: string;
  estimacion: string;
}

export interface DataAvailabilityItem {
  label: string;
  tipo: DataSourceType;
}

export interface InfoFaltanteItem {
  label: string;
  detalle: string;
}

export interface AnuncioDatoItem {
  label: string;
  valor: string;
  fuente: DataSourceType;
}

export interface AnalysisResult {
  puntuacion: number;
  scoreBreakdown: ScoreBreakdown;
  confianzaPorcentaje: number;
  confianza: ConfidenceLevel;
  confianzaExplicacion: string;
  puntuacionExplicacion: string;
  recomendacion: Recommendation;
  recomendacionExplicacion: string;

  datosDisponibles: DataAvailabilityItem[];
  datosAnuncio: AnuncioDatoItem[];

  datosVerificados: number;
  datosIntroducidos: number;
  datosEstimados: number;
  datosNoDisponibles: number;

  puntosPositivos: string[];
  aspectosRevisar: string[];
  posiblesRiesgos: string[];
  infoFaltante: InfoFaltanteItem[];
  detectadoAnuncio: string[];
  relacionCalidadPrecio: string;
  conclusion: string;
  inconsistencias: string[];
  estrategiaNegociacion: { precioObjetivo: number | null; precioMaximo: number | null; descuentoSugerido: number; argumentoPrincipal: string; argumentos: string[]; };

  precioAnunciado: number;
  valoracionMercado: string;

  posiblesGastos: CostItem[];

  metodoUsado: InputMethod;
  urlAnuncio: string;
  nivelInforme: ReportLevel;
}

export const combustibleOptions = [
  'Gasolina',
  'Diésel',
  'Híbrido',
  'Eléctrico',
  'GLP',
] as const;

export const cambioOptions = [
  'Manual',
  'Automático',
  'Automático DSG',
  'CVT',
] as const;

export const traccionOptions = [
  'Delantera',
  'Trasera',
  'Total (4x4)',
] as const;
