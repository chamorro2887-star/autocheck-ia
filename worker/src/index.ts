interface Env {
  OCR_SPACE_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const jsonHeaders = (env: Env, extra: Record<string, string> = {}) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  ...extra,
});

function json(env: Env, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders(env),
  });
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (
    host === 'localhost' ||
    host === 'localhost.localdomain' ||
    host === '::1'
  ) return true;

  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;

  const m = host.match(/^172\.(\d{1,3})\./);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;

  if (host === '169.254.169.254') return true;

  return false;
}

async function fetchAd(request: Request, env: Env) {
  const body = await request.json().catch(() => null) as {
    url?: string;
  } | null;

  const target = String(body?.url || '').trim();

  if (!/^https?:\/\//i.test(target)) {
    return json(env, { error: 'URL no válida' }, 400);
  }

  let parsed: URL;

  try {
    parsed = new URL(target);
  } catch {
    return json(env, { error: 'URL no válida' }, 400);
  }

  if (isBlockedHost(parsed.hostname)) {
    return json(env, { error: 'Destino no permitido' }, 400);
  }

  const upstream = await fetch(`https://r.jina.ai/${parsed.toString()}`, {
    headers: {
      Accept: 'text/plain',
      'User-Agent': 'AutoCheckIA/1.0',
    },
  });

  if (!upstream.ok) {
    return json(
      env,
      { error: `No se pudo leer el anuncio (HTTP ${upstream.status})` },
      502
    );
  }

  const text = await upstream.text();

  if (!text.trim()) {
    return json(
      env,
      { error: 'El anuncio no devolvió contenido legible' },
      422
    );
  }

  return json(env, {
    text: text.slice(0, 250_000),
    source: parsed.hostname,
  });
}

async function ocr(request: Request, env: Env) {
  if (!env.OCR_SPACE_API_KEY) {
    return json(
      env,
      {
        error:
          'OCR no configurado. Añade OCR_SPACE_API_KEY al Worker.',
      },
      503
    );
  }

  const incoming = await request.formData();
  const file = incoming.get('file');

  if (!(file instanceof File)) {
    return json(env, { error: 'Falta el archivo' }, 400);
  }

  if (file.size > 8 * 1024 * 1024) {
    return json(env, { error: 'La imagen supera 8 MB' }, 413);
  }

  const form = new FormData();

  form.append(
    'file',
    file,
    file.name || 'captura.jpg'
  );

  form.append('language', 'spa');
  form.append('isOverlayRequired', 'false');
  form.append('OCREngine', '2');

  const upstream = await fetch(
    'https://api.ocr.space/parse/image',
    {
      method: 'POST',
      headers: {
        apikey: env.OCR_SPACE_API_KEY,
      },
      body: form,
    }
  );

  if (!upstream.ok) {
    return json(
      env,
      { error: `OCR no disponible (HTTP ${upstream.status})` },
      502
    );
  }

  const payload = await upstream.json().catch(() => null) as any;

  const text = Array.isArray(payload?.ParsedResults)
    ? payload.ParsedResults
        .map((x: any) => x?.ParsedText || '')
        .join('\n')
        .trim()
    : '';

  if (!text) {
    return json(
      env,
      {
        error:
          payload?.ErrorMessage ||
          'No se detectó texto',
      },
      422
    );
  }

  return json(env, {
    text: text.slice(0, 100_000),
  });
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: jsonHeaders(env),
      });
    }

    const url = new URL(request.url);

    try {
      if (
        request.method === 'POST' &&
        url.pathname === '/fetch-ad'
      ) {
        return await fetchAd(request, env);
      }

      if (
        request.method === 'POST' &&
        url.pathname === '/ocr'
      ) {
        return await ocr(request, env);
      }

      if (
        request.method === 'GET' &&
        url.pathname === '/health'
      ) {
        return json(env, {
          ok: true,
          service: 'autocheck-ia-api',
        });
      }

      return json(
        env,
        { error: 'Ruta no encontrada' },
        404
      );
    } catch (error) {
      console.error(error);

      return json(
        env,
        { error: 'Error interno del servicio' },
        500
      );
    }
  },
};
