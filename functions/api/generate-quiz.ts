// Cloudflare Pages Function: POST /api/generate-quiz

interface Env {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body: any = await context.request.json().catch(() => ({}));
    const { tribe = 'Bugis', region = 'Sulawesi Selatan' } = body;
    const apiKey = context.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Buatkan 3 soal kuis interaktif pilihan ganda tentang budaya dan kearifan suku ${tribe} di wilayah ${region}.
Topik mencakup: kuliner khas, bahasa/falsafah daerah, kerajinan tangan, teknik tani/bahari, atau permainan tradisional.
Format JSON: Array of objects dengan format:
[
  {
    "question": "string",
    "options": ["opsi A", "opsi B", "opsi C", "opsi D"],
    "answerIndex": 0,
    "explanation": "string penjelasan"
  }
]`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData: any = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleanText = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const questions = JSON.parse(cleanText);
            return new Response(
              JSON.stringify({ success: true, questions, source: 'gemini-cloudflare-edge' }),
              { status: 200, headers: corsHeaders }
            );
          }
        }
      } catch (err) {
        console.warn('Gemini edge quiz error:', err);
      }
    }

    // Curated default response
    const questions = [
      {
        question: `Apakah falsafah luhur suku Bugis yang berarti saling memanusiakan, menghormati, dan mengingatkan?`,
        options: [
          'Siri na Pacce',
          'Sipakatau, Sipakalebbi, Sipakainge',
          'Nosarara Nosabatutu',
          'Kalo Sara',
        ],
        answerIndex: 1,
        explanation:
          'Sipakatau (memanusiakan manusia), Sipakalebbi (saling menghargai martabat), dan Sipakainge (saling mengingatkan dalam kebaikan) adalah pilar adab luhur masyarakat Bugis.',
      },
      {
        question: `Perahu layar tradisional legendaris karya pelaut Mandar dan Bugis-Makassar yang menjelajah samudera hingga Madagaskar dan Australia adalah...`,
        options: ['Sandeq & Pinisi', 'Lepa-lepa', 'Jolloro', 'Soppe'],
        answerIndex: 0,
        explanation:
          'Pinisi (Sul-Sel) dan Sandeq (Sul-Bar) merupakan mahakarya teknologi maritim tradisional warisan dunia UNESCO.',
      },
    ];

    return new Response(JSON.stringify({ success: true, questions, source: 'curated' }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Gagal membuat kuis: ' + e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
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
