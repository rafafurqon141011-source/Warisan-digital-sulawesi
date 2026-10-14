// Cloudflare Pages Function: GET /api/health

interface Env {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const hasGemini = Boolean(context.env.GEMINI_API_KEY);

  const payload = {
    status: 'ok',
    runtime: 'cloudflare-pages-edge',
    hasGemini,
    appName: 'Warisan Digital Sulawesi',
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
