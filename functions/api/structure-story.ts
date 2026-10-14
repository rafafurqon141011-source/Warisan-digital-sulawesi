// Cloudflare Pages Function: POST /api/structure-story

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
    const {
      rawStory,
      elderName = 'Tetua Komunitas',
      elderAge = '',
      studentName = 'Pewaris Muda',
      region = 'Sulawesi Selatan',
      tribe = 'Bugis',
      categoryHint = 'resep',
    } = body;

    if (!rawStory || typeof rawStory !== 'string' || rawStory.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cerita atau transkrip lisan tidak boleh kosong.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = context.env.GEMINI_API_KEY;

    // If Gemini API Key is configured in Cloudflare Pages Environment Variables
    if (apiKey) {
      try {
        const prompt = `Anda adalah kurator dan arsiparis antropologi budaya Sulawesi untuk platform "Warisan Digital".
Tugas Anda adalah mentransformasikan rekaman cerita lisan bebas seorang tetua (kakek/nenek/tokoh adat) yang dicatat/diwawancarai oleh pelajar ke dalam format dokumentasi arsip terstruktur yang sangat rapi, mendalam, dan kaya nilai kearifan lokal.

Data Narasumber & Pewawancara:
- Tetua (Narasumber): ${elderName} ${elderAge ? `(${elderAge} tahun)` : ''}
- Pewawancara/Pencatat: ${studentName}
- Daerah: ${region}
- Suku: ${tribe}
- Dugaan Kategori: ${categoryHint}

Cerita / Transkrip Lisan Bebas:
"""
${rawStory}
"""

Kembalikan respon dalam format JSON murni TANPA markdown block (tidak perlu \`\`\`json) dengan schema:
{
  "title": "string",
  "category": "resep|bahasa|kerajinan|tani_bahari|permainan|cerita_sejarah",
  "summary": "string",
  "philosophicalMeaning": "string",
  "localTerms": [{"term": "string", "meaning": "string", "language": "string"}],
  "ingredientsOrMaterials": ["string"],
  "toolsUsed": ["string"],
  "stepsOrNarrative": [{"stepNumber": 1, "title": "string", "description": "string"}],
  "preservationAdvice": "string",
  "estimatedEra": "string"
}`;

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
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleanText = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
            const parsed = JSON.parse(cleanText);
            return new Response(
              JSON.stringify({
                success: true,
                data: parsed,
                source: 'gemini-cloudflare-edge',
              }),
              { status: 200, headers: corsHeaders }
            );
          }
        }
      } catch (geminiError) {
        console.warn('Gemini edge structuring warning:', geminiError);
      }
    }

    // Heuristic Fallback
    const lines = rawStory.split(/\n+/).map((l: string) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || 'Warisan Tradisional';
    const title = firstLine.length < 60 ? firstLine : `Penuturan ${elderName}: Tradisi ${tribe}`;

    const fallbackStructured = {
      title: title.replace(/^[#\-\*\d\.\s]+/, ''),
      category: categoryHint || 'resep',
      summary: `Dokumentasi pengetahuan lokal dari ${elderName} (${region}, Suku ${tribe}) yang dicatat oleh ${studentName}. Menarasikan tradisi luhur yang diwariskan secara turun temurun.`,
      philosophicalMeaning: `Memegang teguh nilai kejujuran, kegotong-royongan (sintuwu/sipakatau), dan rasa hormat kepada alam serta para leluhur.`,
      localTerms: [
        { term: tribe, meaning: `Masyarakat adat suku ${tribe} di kawasan ${region}`, language: `Bahasa ${tribe}` },
        { term: 'Pamali / Pasang', meaning: 'Petuah atau pantangan leluhur yang wajib dihormati', language: `Bahasa ${tribe}` },
      ],
      ingredientsOrMaterials: lines.slice(1, 4).map((l: string) => l.replace(/^[#\-\*\d\.\s]+/, '')),
      toolsUsed: ['Peralatan tradisional bambu / gerabah / kayu'],
      stepsOrNarrative: lines.map((line: string, idx: number) => ({
        stepNumber: idx + 1,
        title: `Bagian ${idx + 1}`,
        description: line,
      })),
      preservationAdvice: `Pesan ${elderName}: "Jangan biarkan kearifan ini hilang ditelan zaman modern. Catat, praktikkan, dan ceritakan kepada anak cucu."`,
      estimatedEra: 'Diwariskan secara lisan selama beberapa generasi',
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: fallbackStructured,
        source: 'heuristic-cloudflare-edge',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Gagal memproses cerita ke format terstruktur: ' + err.message }),
      { status: 500, headers: corsHeaders }
    );
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
