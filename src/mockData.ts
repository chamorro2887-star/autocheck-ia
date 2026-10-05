import type {
  AnalysisResult,
  CarFormData,
  CategoryStatus,
  ConfidenceLevel,
  CostItem,
  DataAvailabilityItem,
  InfoFaltanteItem,
  AnuncioDatoItem,
  Recommendation,
  ScoreBreakdown,
  ScoreCategory,
} from '@/types';

export const emptyForm: CarFormData = {
  url: '',
  textoAnuncio: '',
  marca: '',
  modelo: '',
  version: '',
  anio: '',
  kilometros: '',
  precio: '',
  precioReferencia: '',
  combustible: '',
  cambio: '',
  potencia: '',
  traccion: '',
  metodo: 'manual',
  fotos: [],
};

const NOT_AVAILABLE = 'Información no disponible';
const NEEDS_SOURCE = 'Necesitamos una fuente externa para verificar este dato.';
const NOT_PROVIDED = 'Información no proporcionada en el anuncio.';


export function parseAdText(text: string, base: CarFormData = emptyForm): CarFormData {
  const clean = text.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const next = { ...base, textoAnuncio: text, metodo: 'url' as const };
  if (!clean) return next;

  const pick = (patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return '';
  };

  const price = pick([/(?:precio|price|pvp)\s*[:\-]?\s*([0-9][0-9. ]{2,})\s*€?/i, /([0-9]{2,3}(?:[. ]?[0-9]{3})?)\s*€/i]);
  const km = pick([/(?:kil[oó]metros?|kms?|km)\s*[:\-]?\s*([0-9][0-9. ]*)/i, /([0-9]{2,3}(?:[. ]?[0-9]{3})?)\s*km\b/i]);
  const year = pick([/(?:a[nñ]o|matriculaci[oó]n|first registration)\s*[:\-]?\s*(19[8-9]\d|20\d{2})/i, /\b(19[8-9]\d|20\d{2})\b/]);
  const power = pick([/(?:potencia|power)\s*[:\-]?\s*(\d{2,3})\s*(?:cv|hp|ps)?/i, /\b(\d{2,3})\s*(?:cv|hp|ps)\b/i]);

  if (price) next.precio = price.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '');
  if (km) next.kilometros = km.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '');
  if (year) next.anio = year;
  if (power) next.potencia = power;

  const lower = clean.toLowerCase();
  if (!next.combustible) {
    if (/\bh[ií]brido|phev\b/.test(lower)) next.combustible = 'Híbrido';
    else if (/\bel[eé]ctrico|\bev\b/.test(lower)) next.combustible = 'Eléctrico';
    else if (/\bdi[eé]sel|diesel|\btdi\b|\bdci\b|\bcdti\b/.test(lower)) next.combustible = 'Diésel';
    else if (/\bgasolina|\btsi\b|\btfsi\b|\btce\b/.test(lower)) next.combustible = 'Gasolina';
  }
  if (!next.cambio) {
    if (/autom[aá]tic|dsg|s tronic|steptronic|cvt/.test(lower)) next.cambio = /dsg/.test(lower) ? 'Automático DSG' : /cvt/.test(lower) ? 'CVT' : 'Automático';
    else if (/manual/.test(lower)) next.cambio = 'Manual';
  }
  if (!next.traccion && /(4x4|4wd|awd|quattro|xdrive|4matic)/i.test(clean)) next.traccion = 'Total (4x4)';

  const title = clean.split(/\n|\.|\|/)[0].trim();
  if (!next.marca || !next.modelo) {
    const known = title.match(/\b(Mercedes[- ]?Benz|BMW|Audi|Volkswagen|SEAT|Skoda|Toyota|Ford|Peugeot|Renault|Hyundai|Kia|Volvo|Nissan|Mazda|Honda|Opel|Citro[eë]n|Dacia|Tesla|Cupra|Porsche|Lexus|Land Rover|Jeep|Fiat)\b\s+([^,|\n]+)/i);
    if (known) {
      next.marca = next.marca || known[1];
      if (!next.modelo) next.modelo = known[2].replace(/\s+(?:\d{2,3}\s*(?:cv|hp)|19[8-9]\d|20\d{2}).*$/i, '').trim();
    }
  }
  if (!next.version && /\b(amg|m sport|s line|fr|st line|gti|rs|cupra|allure|style|avantgarde|exclusive)\b/i.test(clean)) {
    const v = clean.match(/\b(amg(?: line)?|m sport|s line|fr|st line|gti|rs|cupra|allure|style|avantgarde|exclusive)\b/i);
    if (v) next.version = v[1];
  }
  return next;
}

function hasValue(val: string | undefined): boolean {
  return !!val && val.trim() !== '';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function generateMockResult(data: CarFormData): AnalysisResult {
  const precio = parseFloat(data.precio) || 0;
  const precioReferencia = parseFloat(data.precioReferencia) || 0;
  const km = parseInt(data.kilometros) || 0;
  const anio = parseInt(data.anio) || 0;
  const potencia = parseInt(data.potencia) || 0;
  const currentYear = new Date().getFullYear();

  const hasPrecio = hasValue(data.precio);
  const hasPrecioReferencia = hasValue(data.precioReferencia) && precioReferencia > 0;
  const hasKm = hasValue(data.kilometros);
  const hasAnio = hasValue(data.anio);
  const hasCombustible = hasValue(data.combustible);
  const hasCambio = hasValue(data.cambio);
  const hasPotencia = hasValue(data.potencia);
  const hasTraccion = hasValue(data.traccion);
  const hasMarca = hasValue(data.marca);
  const hasModelo = hasValue(data.modelo);
  const hasVersion = hasValue(data.version);
  const hasUrl = hasValue(data.url);
  const hasFotos = data.fotos.length > 0;

  const isAutomatic =
    hasCambio &&
    (data.cambio === 'Automático' || data.cambio === 'Automático DSG' || data.cambio === 'CVT');

  // ===== DATA AVAILABILITY =====
  const datosDisponibles: DataAvailabilityItem[] = [
    { label: 'Marca y modelo', tipo: hasMarca && hasModelo ? 'user' : 'unavailable' },
    { label: 'Versión', tipo: hasVersion ? 'user' : 'unavailable' },
    { label: 'Año', tipo: hasAnio ? 'user' : 'unavailable' },
    { label: 'Kilometraje', tipo: hasKm ? 'user' : 'unavailable' },
    { label: 'Precio anunciado', tipo: hasPrecio ? 'user' : 'unavailable' },
    { label: 'Referencia de mercado', tipo: hasPrecioReferencia ? 'user' : 'unavailable' },
    { label: 'Combustible', tipo: hasCombustible ? 'user' : 'unavailable' },
    { label: 'Tipo de cambio', tipo: hasCambio ? 'user' : 'unavailable' },
    { label: 'Potencia (CV)', tipo: hasPotencia ? 'user' : 'unavailable' },
    { label: 'Tracción', tipo: hasTraccion ? 'user' : 'unavailable' },
    { label: 'URL del anuncio', tipo: hasUrl ? 'user' : 'unavailable' },
    { label: 'Fotografías', tipo: hasFotos ? 'user' : 'unavailable' },
    { label: 'ITV', tipo: 'unavailable' },
    { label: 'Historial de mantenimiento', tipo: 'unavailable' },
    { label: 'Accidentes / siniestros', tipo: 'unavailable' },
    { label: 'Número de propietarios', tipo: 'unavailable' },
    { label: 'Cargas y embargos', tipo: 'unavailable' },
  ];

  const datosVerificados = 0; // no external sources in this prototype
  const datosIntroducidos = datosDisponibles.filter((d) => d.tipo === 'user').length;
  const datosEstimados = 0; // no AI estimates presented as data
  const datosNoDisponibles = datosDisponibles.filter((d) => d.tipo === 'unavailable').length;
  const totalDatos = datosDisponibles.length;

  // ===== ANUNCIO DATA =====
  const datosAnuncio: AnuncioDatoItem[] = [];
  if (hasMarca) datosAnuncio.push({ label: 'Marca', valor: data.marca, fuente: 'user' });
  if (hasModelo) datosAnuncio.push({ label: 'Modelo', valor: data.modelo, fuente: 'user' });
  if (hasVersion) datosAnuncio.push({ label: 'Versión', valor: data.version, fuente: 'user' });
  if (hasAnio) datosAnuncio.push({ label: 'Año', valor: data.anio, fuente: 'user' });
  if (hasKm) datosAnuncio.push({ label: 'Kilómetros', valor: `${km.toLocaleString('es-ES')} km`, fuente: 'user' });
  if (hasPrecio) datosAnuncio.push({ label: 'Precio', valor: `${precio.toLocaleString('es-ES')} €`, fuente: 'user' });
  if (hasPrecioReferencia) datosAnuncio.push({ label: 'Referencia mercado', valor: `${precioReferencia.toLocaleString('es-ES')} €`, fuente: 'user' });
  if (hasCombustible) datosAnuncio.push({ label: 'Combustible', valor: data.combustible, fuente: 'user' });
  if (hasPotencia) datosAnuncio.push({ label: 'Potencia', valor: `${potencia} CV`, fuente: 'user' });
  if (hasCambio) datosAnuncio.push({ label: 'Cambio', valor: data.cambio, fuente: 'user' });
  if (hasTraccion) datosAnuncio.push({ label: 'Tracción', valor: data.traccion, fuente: 'user' });
  if (hasUrl) datosAnuncio.push({ label: 'Fuente', valor: data.url, fuente: 'user' });

  // ===== SCORING (only from available data, doesn't penalize for missing) =====
  const score = computeScore({
    precio, precioReferencia, km, anio, potencia, currentYear, isAutomatic,
    hasPrecio, hasPrecioReferencia, hasKm, hasAnio, hasCombustible, hasCambio, hasPotencia, hasTraccion, hasVersion,
  });

  const totalScore = score.precio + score.kilometraje + score.antiguedad + score.motorTransmision + score.equipamiento + score.historialMantenimiento + score.riesgos;

  // ===== CONFIDENCE PERCENTAGE =====
  // Confidence is based on how much data is available, NOT on the vehicle's quality
  // Verified data counts more than user-introduced data
  const confidenceWeight =
    (datosVerificados * 1.0 + datosIntroducidos * 0.6 + datosEstimados * 0.3) / totalDatos;
  const confianzaPorcentaje = Math.round(confidenceWeight * 100);

  let confianza: ConfidenceLevel;
  if (confianzaPorcentaje >= 60) confianza = 'Alta';
  else if (confianzaPorcentaje >= 35) confianza = 'Media';
  else confianza = 'Baja';

  const confianzaExplicacion =
    `Confianza del análisis: ${confianzaPorcentaje}%. ${datosVerificados} dato(s) verificado(s), ${datosIntroducidos} introducido(s) por el usuario, ${datosEstimados} estimación(es) IA, ${datosNoDisponibles} no disponible(s). La confianza aumenta cuando disponemos de historial, ITV, kilometraje verificado, mantenimiento y otros datos.`;

  const puntuacionExplicacion =
    'Puntuación provisional basada en precio comparable introducido, kilometraje, antigüedad, datos del motor/transmisión, versión y señales de riesgo. Las categorías sin información verificable quedan sin puntuar; no debe interpretarse como una valoración definitiva del vehículo.';

  // ===== PRICE VALUATION (no invented market prices) =====
  let valoracionMercado = 'No hay una referencia de mercado introducida. El precio anunciado se muestra, pero no se etiqueta como barato o caro sin una comparación real.';
  if (hasPrecio && hasPrecioReferencia) {
    const diferencia = ((precio - precioReferencia) / precioReferencia) * 100;
    const abs = Math.abs(diferencia);
    const lectura = diferencia <= -10 ? 'por debajo' : diferencia >= 10 ? 'por encima' : 'muy próximo';
    valoracionMercado = `Precio anunciado: ${precio.toLocaleString('es-ES')} €. Referencia introducida: ${precioReferencia.toLocaleString('es-ES')} €. El anuncio está ${lectura} de la referencia (${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(1)}%). Esta comparación usa el dato que has introducido y no sustituye una valoración de mercado profesional.`;
  } else if (!hasPrecio) {
    valoracionMercado = 'No se ha proporcionado un precio. No es posible evaluar la relación calidad/precio sin este dato.';
  }

  // ===== POSITIVE POINTS =====
  const puntosPositivos: string[] = [];

  if (hasKm && hasAnio) {
    const kmPerYear = km / Math.max(currentYear - anio, 1);
    if (kmPerYear < 15000) {
      puntosPositivos.push(`El kilometraje (${km.toLocaleString('es-ES')} km) equivale a aproximadamente ${Math.round(kmPerYear).toLocaleString('es-ES')} km/año, por debajo de la media.`);
    }
  }
  if (hasAnio && anio >= currentYear - 3) {
    puntosPositivos.push(`El año (${anio}) corresponde a un vehículo relativamente reciente.`);
  }
  if (hasCombustible && (data.combustible === 'Híbrido' || data.combustible === 'Eléctrico')) {
    puntosPositivos.push(`El tipo de combustible (${data.combustible}) puede implicar menores costes de combustible y beneficios fiscales.`);
  }
  if (hasVersion) {
    puntosPositivos.push(`Se ha identificado la versión del vehículo (${data.version}), lo que permite una valoración más precisa.`);
  }
  if (hasPrecio && hasPrecioReferencia) {
    const diferencia = ((precio - precioReferencia) / precioReferencia) * 100;
    if (diferencia <= -10) puntosPositivos.push(`El precio anunciado está ${Math.abs(diferencia).toFixed(1)}% por debajo de la referencia introducida.`);
    else if (diferencia < 5) puntosPositivos.push('El precio anunciado está cerca de la referencia introducida.');
  }
  if (hasKm && hasAnio && km > 0 && currentYear > anio) {
    const kmPerYear = km / Math.max(currentYear - anio, 1);
    if (kmPerYear <= 15000) puntosPositivos.push(`El uso estimado es de ${Math.round(kmPerYear).toLocaleString('es-ES')} km/año, un nivel moderado para la antigüedad indicada.`);
  }
  if (puntosPositivos.length === 0) {
    puntosPositivos.push('No hay datos suficientes para identificar puntos positivos destacables.');
  }

  // ===== ASPECTS TO REVIEW =====
  const aspectosRevisar: string[] = [];

  if (hasKm && km > 100000) {
    aspectosRevisar.push(`Con ${km.toLocaleString('es-ES')} km, conviene revisar el estado de elementos de desgaste como neumáticos, frenos y amortiguadores.`);
  }
  if (hasKm && km > 80000 && !isAutomatic) {
    aspectosRevisar.push('Si el cambio es manual y el kilometraje es elevado, conviene comprobar el estado del embrague. No se puede afirmar que necesite reemplazo sin inspección.');
  }
  if (hasKm && km > 60000 && isAutomatic) {
    aspectosRevisar.push('Si el cambio es automático, conviene verificar que la caja de cambios tiene el aceite en buen estado y la revisión al día.');
  }
  if (hasAnio && anio < currentYear - 4) {
    aspectosRevisar.push('Conviene revisar el estado de la ITV y confirmar que está al día. No hay datos de ITV disponibles en este análisis.');
  }
  aspectosRevisar.push('Debe comprobarse el estado de la pintura y carrocería para descartar reparaciones no declaradas.');
  if (hasFotos) {
    aspectosRevisar.push('Se han recibido fotografías. En futuras versiones, la IA podrá analizar visualmente el estado de carrocería, neumáticos e interior.');
  }

  // ===== RISKS =====
  const posiblesRiesgos: string[] = [];
  posiblesRiesgos.push(`${NEEDS_SOURCE} No hay historial de mantenimiento conectado.`);
  posiblesRiesgos.push(`${NEEDS_SOURCE} No hay datos de ITV disponibles.`);
  posiblesRiesgos.push(`${NEEDS_SOURCE} No se puede verificar el número de propietarios anteriores.`);
  posiblesRiesgos.push(`${NEEDS_SOURCE} No hay datos de accidentes o siniestros disponibles.`);
  if (hasKm && km > 250000) posiblesRiesgos.push(`Kilometraje elevado (${km.toLocaleString('es-ES')} km): aumenta la importancia de revisar transmisión, suspensión, refrigeración y sistemas auxiliares.`);
  if (hasKm && hasAnio && anio > 0 && currentYear - anio > 0) {
    const kmPerYear = km / Math.max(currentYear - anio, 1);
    if (kmPerYear > 40000) posiblesRiesgos.push(`Uso anual estimado alto (${Math.round(kmPerYear).toLocaleString('es-ES')} km/año). Conviene pedir documentación que respalde el kilometraje.`);
  }

  // ===== INFO FALTANTE =====
  const infoFaltante: InfoFaltanteItem[] = [
    { label: 'Historial de mantenimiento', detalle: NOT_PROVIDED },
    { label: 'ITV', detalle: NOT_PROVIDED },
    { label: 'Accidentes/siniestros', detalle: NOT_PROVIDED },
    { label: 'Número de propietarios', detalle: NOT_PROVIDED },
    { label: 'Kilometraje verificado', detalle: NOT_PROVIDED },
    { label: 'Última revisión', detalle: NOT_PROVIDED },
  ];
  if (!hasFotos) infoFaltante.push({ label: 'Fotografías', detalle: NOT_PROVIDED });
  if (!hasVersion) infoFaltante.unshift({ label: 'Versión específica del vehículo', detalle: 'No se ha identificado la versión. Esto dificulta la valoración precisa.' });
  if (!hasPotencia) infoFaltante.unshift({ label: 'Potencia', detalle: NOT_PROVIDED });
  if (!hasTraccion) infoFaltante.unshift({ label: 'Tipo de tracción', detalle: NOT_PROVIDED });
  if (!hasPrecioReferencia) infoFaltante.push({ label: 'Referencia de mercado', detalle: 'Opcional: puedes introducir un precio comparable para mejorar la comparación de precio.' });

  // ===== DETECTADO EN EL ANUNCIO =====
  const detectadoAnuncio: string[] = [];
  detectadoAnuncio.push('El anuncio no especifica el historial de mantenimiento.');
  detectadoAnuncio.push('El kilometraje debe comprobarse documentalmente.');
  if (hasPrecio) {
    detectadoAnuncio.push('El precio anunciado no ha podido contrastarse con una base de datos de mercado en tiempo real.');
  }
  if (!hasVersion) {
    detectadoAnuncio.push('No se ha identificado la versión exacta del vehículo, lo que puede afectar a la valoración.');
  }

  // ===== QUALITY/PRICE =====
  const relacionCalidadPrecio = hasPrecio && hasPrecioReferencia
    ? valoracionMercado
    : hasPrecio
      ? `El precio indicado es ${precio.toLocaleString('es-ES')} €. Falta una referencia comparable para determinar si está bien posicionado. Puedes introducir una referencia de mercado para mejorar este apartado.`
      : 'No se ha proporcionado un precio. No es posible evaluar la relación calidad/precio sin este dato.';

  // ===== POSSIBLE COSTS =====
  const posiblesGastos: CostItem[] = computeCosts(km, anio, currentYear, isAutomatic, hasKm, hasAnio, hasCambio);

  // ===== RECOMMENDATION =====
  // Never "COMPRAR" without verified history/documentation
  let recomendacion: Recommendation;
  let recomendacionExplicacion: string;

  if (totalScore < 30 || datosIntroducidos < 4) {
    recomendacion = 'NO RECOMENDADO';
    recomendacionExplicacion = 'No hay información suficiente para emitir una valoración favorable. Faltan datos importantes del vehículo y no hay fuentes externas verificadas.';
  } else if (datosVerificados === 0 || confianzaPorcentaje < 50) {
    recomendacion = 'PRECAUCIÓN';
    recomendacionExplicacion = 'No hay información suficiente para recomendar la compra con un nivel de confianza alto. El historial, la documentación y la ITV no han podido verificarse. Se recomienda obtener un informe con fuentes externas antes de decidir.';
  } else if (totalScore >= 65 && hasPrecio && confianzaPorcentaje >= 50) {
    recomendacion = 'NEGOCIAR';
    recomendacionExplicacion = 'Los datos disponibles sugieren que el vehículo podría ser una opción interesante, pero sin verificar el historial y la documentación no se puede recomendar la compra directa. Se recomienda negociar el precio y completar la verificación antes de decidir.';
  } else {
    recomendacion = 'PRECAUCIÓN';
    recomendacionExplicacion = 'No hay información suficiente para recomendar la compra con un nivel de confianza alto.';
  }

  // ===== CONCLUSION =====
  const metodoLabel = data.metodo === 'url' ? 'enlace del anuncio' : data.metodo === 'fotos' ? 'fotos/capturas' : 'introducción manual';
  const conclusion = `La puntuación del vehículo es ${totalScore}/100, basada exclusivamente en los datos disponibles (${metodoLabel}). La confianza del análisis es ${confianzaPorcentaje}%. No se han consultado fuentes externas (DGT, ITV, historial). Una puntuación provisional no significa que el vehículo sea malo. Recomendación: ${recomendacion}. ${recomendacionExplicacion}`;

  const inconsistencias: string[] = [];
  const adLower = data.textoAnuncio.toLowerCase();
  if (hasKm && km > 300000 && !/historial|mantenimiento|factura|revisi[oó]n/.test(adLower)) inconsistencias.push(`El kilometraje es muy elevado (${km.toLocaleString('es-ES')} km) y el texto no menciona documentación de mantenimiento.`);
  if (hasAnio && anio > currentYear + 1) inconsistencias.push('El año indicado está fuera de un rango razonable.');
  if (hasPrecio && hasPrecioReferencia && precioReferencia > 0) { const diff = ((precio - precioReferencia) / precioReferencia) * 100; if (diff >= 25) inconsistencias.push(`El precio anunciado está ${diff.toFixed(0)}% por encima de la referencia introducida.`); }
  if (hasCombustible && /di[eé]sel/.test(adLower) && /gasolina|tsi|tfsi/.test(adLower)) inconsistencias.push('El texto contiene indicios de combustible contradictorios; revisa la ficha técnica.');
  if (hasCambio && data.cambio === 'Manual' && /autom[aá]tic|dsg|s tronic|cvt/.test(adLower)) inconsistencias.push('El cambio indicado en los campos no coincide con lo mencionado en el texto del anuncio.');
  if (!inconsistencias.length) inconsistencias.push('No se han detectado contradicciones evidentes con los datos introducidos. Esto no sustituye una verificación documental.');

  let precioObjetivo: number | null = null; let precioMaximo: number | null = null; let descuentoSugerido = 0;
  let argumentoPrincipal = 'Solicita documentación y una inspección antes de cerrar el precio.'; const argumentos: string[] = [];
  if (hasPrecio) {
    let base = hasPrecioReferencia && precioReferencia > 0 ? Math.min(precio, precioReferencia) : precio;
    let reduction = 0.04; if (hasKm && km > 180000) reduction += 0.04; if (hasKm && km > 250000) reduction += 0.05; if (hasAnio && age > 10) reduction += 0.02; if (datosNoDisponibles >= 7) reduction += 0.03; if (inconsistencias.some(x => x.includes('por encima'))) reduction += 0.04;
    reduction = clamp(reduction, 0.03, 0.20); descuentoSugerido = Math.round(reduction * 100); precioObjetivo = Math.round((base * (1-reduction))/100)*100; precioMaximo = Math.round((base * (1-reduction/2))/100)*100;
    if (hasKm && km > 250000) argumentos.push(`Kilometraje elevado (${km.toLocaleString('es-ES')} km): úsalo como argumento para ajustar el precio.`);
    if (datosNoDisponibles >= 7) argumentos.push('Faltan historial, ITV, propietarios y siniestros: pide documentación antes de aceptar el precio solicitado.');
    if (hasPrecioReferencia && precio > precioReferencia) argumentos.push(`La referencia introducida es ${precioReferencia.toLocaleString('es-ES')} €, por debajo del precio anunciado.`);
    if (inconsistencias.length && !inconsistencias[0].startsWith('No se han detectado')) argumentos.push('Hay puntos que conviene aclarar antes de hacer una oferta definitiva.');
    argumentoPrincipal = `Precio objetivo orientativo: ${precioObjetivo.toLocaleString('es-ES')} €. No es una tasación; es un punto de partida para negociar con los riesgos y datos disponibles.`;
  }

  return {
    puntuacion: totalScore,
    scoreBreakdown: score,
    confianzaPorcentaje,
    confianza,
    confianzaExplicacion,
    puntuacionExplicacion,
    recomendacion,
    recomendacionExplicacion,
    datosDisponibles,
    datosAnuncio,
    datosVerificados,
    datosIntroducidos,
    datosEstimados,
    datosNoDisponibles,
    puntosPositivos,
    aspectosRevisar,
    posiblesRiesgos,
    infoFaltante,
    detectadoAnuncio,
    relacionCalidadPrecio,
    conclusion,
    inconsistencias,
    estrategiaNegociacion: { precioObjetivo, precioMaximo, descuentoSugerido, argumentoPrincipal, argumentos },
    precioAnunciado: precio,
    valoracionMercado,
    posiblesGastos,
    metodoUsado: data.metodo,
    urlAnuncio: data.url,
    nivelInforme: 'gratuito',
  };
}

function computeScore(ctx: {
  precio: number; precioReferencia: number; km: number; anio: number; potencia: number; currentYear: number;
  isAutomatic: boolean;
  hasPrecio: boolean; hasPrecioReferencia: boolean; hasKm: boolean; hasAnio: boolean; hasCombustible: boolean;
  hasCambio: boolean; hasPotencia: boolean; hasTraccion: boolean; hasVersion: boolean;
}): ScoreBreakdown {
  // Motor de valoración provisional: cada bloque mide una dimensión distinta.
  // Importante: los datos ausentes NO se convierten automáticamente en "malos".
  // Esta versión añade señales de riesgo y coherencia sin inventar datos externos.

  const age = ctx.hasAnio ? Math.max(0, ctx.currentYear - ctx.anio) : 0;
  const kmPerYear = ctx.hasKm && ctx.hasAnio && age > 0 ? ctx.km / age : 0;

  // --- Precio (20): solo evaluable con comparable introducido ---
  let precioScore = 0;
  let precioEstado: CategoryStatus = 'no-disponible';
  if (ctx.hasPrecio && ctx.precio > 0 && ctx.hasPrecioReferencia && ctx.precioReferencia > 0) {
    precioEstado = 'introducido';
    const diferencia = ((ctx.precio - ctx.precioReferencia) / ctx.precioReferencia) * 100;
    if (diferencia <= -20) precioScore = 20;
    else if (diferencia <= -12) precioScore = 19;
    else if (diferencia <= -5) precioScore = 17;
    else if (diferencia < 5) precioScore = 15;
    else if (diferencia < 12) precioScore = 11;
    else if (diferencia < 20) precioScore = 8;
    else precioScore = 5;
  }

  // --- Kilometraje (15): combina km/año cuando es posible y km absolutos ---
  let kilometrajeScore = 0;
  let kmEstado: CategoryStatus = 'no-disponible';
  if (ctx.hasKm && ctx.km >= 0) {
    kmEstado = 'introducido';
    if (ctx.hasAnio && age > 0) {
      if (kmPerYear <= 10000) kilometrajeScore = 15;
      else if (kmPerYear <= 15000) kilometrajeScore = 13;
      else if (kmPerYear <= 20000) kilometrajeScore = 11;
      else if (kmPerYear <= 25000) kilometrajeScore = 9;
      else if (kmPerYear <= 35000) kilometrajeScore = 6;
      else kilometrajeScore = 3;
    } else {
      if (ctx.km <= 50000) kilometrajeScore = 14;
      else if (ctx.km <= 100000) kilometrajeScore = 11;
      else if (ctx.km <= 150000) kilometrajeScore = 8;
      else if (ctx.km <= 250000) kilometrajeScore = 5;
      else kilometrajeScore = 2;
    }
  }

  // --- Antigüedad (10) ---
  let antiguedadScore = 0;
  let antiguedadEstado: CategoryStatus = 'no-disponible';
  if (ctx.hasAnio && ctx.anio > 0) {
    antiguedadEstado = 'introducido';
    if (age <= 2) antiguedadScore = 10;
    else if (age <= 5) antiguedadScore = 9;
    else if (age <= 8) antiguedadScore = 7;
    else if (age <= 12) antiguedadScore = 5;
    else if (age <= 16) antiguedadScore = 3;
    else antiguedadScore = 1;
  }

  // --- Motor/Transmisión (15): calidad del dato + señales mecánicas observables ---
  let motorScore = 0;
  let motorEstado: CategoryStatus = 'no-disponible';
  const motorDataPoints = [ctx.hasCombustible, ctx.hasCambio, ctx.hasPotencia, ctx.hasTraccion].filter(Boolean).length;
  if (motorDataPoints > 0) {
    motorEstado = 'introducido';
    motorScore = Math.round((motorDataPoints / 4) * 15);
    if (ctx.hasPotencia && ctx.potencia > 0) {
      if (ctx.potencia < 70) motorScore -= 1;
      if (ctx.potencia >= 300) motorScore += 1;
    }
    motorScore = clamp(motorScore, 0, 15);
  }

  // --- Equipamiento (10): versión identificada permite puntuar parcialmente ---
  let equipamientoScore = 0;
  let equipamientoEstado: CategoryStatus = 'no-disponible';
  if (ctx.hasVersion) {
    equipamientoEstado = 'introducido';
    const version = ctx.hasVersion ? 1 : 0;
    equipamientoScore = version ? 7 : 0;
  }

  // --- Historial/Mantenimiento (15): no disponible hasta conectar fuentes/documentos ---
  const historialScore = 0;
  const historialEstado: CategoryStatus = 'no-disponible';

  // --- Riesgos (15): parte positiva por coherencia, penalización por señales objetivas ---
  let riesgosScore = 0;
  let riesgosEstado: CategoryStatus = 'no-disponible';
  if (ctx.hasKm || ctx.hasAnio || ctx.hasCambio) {
    riesgosEstado = 'introducido';
    riesgosScore = 12;
    if (ctx.hasKm && ctx.km > 250000) riesgosScore -= 4;
    else if (ctx.hasKm && ctx.km > 180000) riesgosScore -= 2;
    if (ctx.hasAnio && age > 15) riesgosScore -= 2;
    if (ctx.hasKm && ctx.hasAnio && age > 0 && kmPerYear > 40000) riesgosScore -= 2;
    if (ctx.hasKm && ctx.hasCambio && ctx.isAutomatic && ctx.km > 150000) riesgosScore -= 1;
    riesgosScore = clamp(riesgosScore, 0, 15);
  }

  const categories: ScoreCategory[] = [
    { label: 'Precio', value: clamp(precioScore, 0, 20), max: 20, estado: precioEstado },
    { label: 'Kilometraje', value: clamp(kilometrajeScore, 0, 15), max: 15, estado: kmEstado },
    { label: 'Antigüedad', value: clamp(antiguedadScore, 0, 10), max: 10, estado: antiguedadEstado },
    { label: 'Motor/Transmisión', value: clamp(motorScore, 0, 15), max: 15, estado: motorEstado },
    { label: 'Equipamiento', value: clamp(equipamientoScore, 0, 10), max: 10, estado: equipamientoEstado },
    { label: 'Historial/Mantenimiento', value: historialScore, max: 15, estado: historialEstado },
    { label: 'Riesgos', value: clamp(riesgosScore, 0, 15), max: 15, estado: riesgosEstado },
  ];

  return {
    precio: categories[0].value,
    kilometraje: categories[1].value,
    antiguedad: categories[2].value,
    motorTransmision: categories[3].value,
    equipamiento: categories[4].value,
    historialMantenimiento: categories[5].value,
    riesgos: categories[6].value,
    categories,
  };
}

function computeCosts(km: number, anio: number, currentYear: number, isAutomatic: boolean, hasKm: boolean, hasAnio: boolean, hasCambio: boolean): CostItem[] {
  return [
    { categoria: 'Mantenimiento', icon: '🔧', estado: 'Pendiente de inspección', estimacion: NOT_AVAILABLE },
    {
      categoria: 'Neumáticos', icon: '🛞',
      estado: hasKm && km > 40000 ? 'Conviene revisar' : 'Pendiente de inspección',
      estimacion: hasKm && km > 40000 ? 'Podría ser necesario reemplazar los neumáticos según el kilometraje. Debe comprobarse visualmente.' : NOT_AVAILABLE,
    },
    {
      categoria: 'Frenos', icon: '🛑',
      estado: hasKm && km > 60000 ? 'Conviene revisar' : 'Pendiente de inspección',
      estimacion: hasKm && km > 60000 ? 'Conviene revisar pastillas y discos. No se puede afirmar que necesiten reemplazo sin inspección.' : NOT_AVAILABLE,
    },
    {
      categoria: 'Batería', icon: '🔋',
      estado: hasAnio && currentYear - anio > 4 ? 'Conviene revisar' : 'Pendiente de inspección',
      estimacion: hasAnio && currentYear - anio > 4 ? 'La batería podría estar al final de su vida útil. Debe comprobarse su estado.' : NOT_AVAILABLE,
    },
    {
      categoria: 'Mecánica', icon: '⚙️',
      estado: 'Pendiente de inspección',
      estimacion: hasCambio && isAutomatic ? 'Conviene verificar el estado del aceite de la caja de cambios automática.' : NOT_AVAILABLE,
    },
    { categoria: 'Otros', icon: '📄', estado: 'Pendiente de inspección', estimacion: NOT_AVAILABLE },
  ];
}
