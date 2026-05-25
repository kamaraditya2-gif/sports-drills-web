/**
 * SPORTS DRILLS WEB - AI Content Generator
 * Integrasi dengan Deepseek API untuk generate konten
 * Bisa di-override via admin panel
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'sportsDrillsAIKey';
  const DEFAULT_MODEL = 'deepseek-chat';
  const API_BASE = 'https://api.deepseek.com/v1';

  // ============================================
  // API KEY MANAGEMENT
  // ============================================
  window.getAIKey = function() {
    return localStorage.getItem(STORAGE_KEY) || '';
  };

  window.setAIKey = function(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  window.hasAIKey = function() {
    return !!getAIKey();
  };

  // ============================================
  // DEEPSEEK API CALL (OpenAI-compatible)
  // ============================================
  window.generateWithAI = async function(prompt, options = {}) {
    const apiKey = getAIKey();
    if (!apiKey) {
      throw new Error('API key Deepseek belum di-setting. Masukkan di Admin Panel.');
    }

    const model = options.model || DEFAULT_MODEL;
    const url = `${API_BASE}/chat/completions`;

    const body = {
      model: model,
      messages: [
        { role: 'system', content: 'Anda adalah asisten AI yang selalu merespons dalam bahasa Indonesia.' },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      top_p: 0.9
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Deepseek API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return text.trim();
  };

  // ============================================
  // PROMPT BUILDERS
  // ============================================
  window.buildDrillPrompt = function(sport, topic, difficulty) {
    const sportName = window.sportNames?.[sport] || sport;
    return `Tulis artikel latihan ${sportName} berjudul "${topic}" dengan tingkat kesulitan ${difficulty}.

Format output HARUS JSON valid dengan struktur berikut (tanpa markdown code block):
{
  "title": "Judul latihan",
  "sport": "${sport}",
  "difficulty": "${difficulty}",
  "duration": "Durasi dalam menit, contoh: 20 menit",
  "equipment": "Peralatan yang dibutuhkan",
  "excerpt": "Ringkasan singkat 1-2 kalimat",
  "description": "Deskripsi detail 2-3 paragraf",
  "steps": ["Langkah 1", "Langkah 2", "... minimal 6 langkah"],
  "tips": "Tips profesional 1-2 kalimat",
  "image": "URL gambar Unsplash yang menampilkan wanita atlet sedang bermain ${sportName}. Gunakan format: https://images.unsplash.com/photo-{ID}?w=600",
  "youtubeUrl": "URL video YouTube yang valid dan relevan dengan drill ini. Jika tidak yakin linknya valid, isi dengan string kosong."
}

Gunakan bahasa Indonesia yang natural dan sporty. Langkah-langkah harus praktis dan actionable.
Untuk youtubeUrl, hanya isi jika Anda benar-benar yakin link YouTube tersebut valid dan bisa diakses publik. Jika ragu, biarkan kosong.`;
  };

  window.buildNewsPrompt = function(category, topic) {
    const now = new Date().toISOString().split('T')[0];
    return `Tulis berita olahraga kategori ${category} dengan topik "${topic}".

PENTING: Seluruh konten HARUS dalam bahasa Indonesia yang baik dan benar. Gunakan gaya penulisan sports journalism profesional yang engaging dan informatif.

Format output HARUS JSON valid dengan struktur berikut (tanpa markdown code block):
{
  "title": "Judul berita menarik dan click-worthy",
  "category": "${category}",
  "excerpt": "Ringkasan singkat 1-2 kalimat",
  "readTime": "Perkiraan waktu baca, contoh: 4 menit",
  "image": "URL gambar Unsplash yang menampilkan wanita atlet sedang bermain olahraga ${category}. Gunakan format: https://images.unsplash.com/photo-{ID}?w=600",
  "content": "Konten artikel panjang minimal 4 paragraf dalam HTML paragraph tags <p>...</p>. Gunakan bahasa Indonesia yang engaging dan informatif."
}

Tanggal: ${now}.`;
  };

  window.buildSeoDescription = function(title, content) {
    return `Buatkan meta description SEO-friendly untuk artikel berjudul "${title}".

Konten artikel: ${content.substring(0, 500)}

Rules:
- Maksimal 160 karakter
- Mengandung keyword utama
- Call to action yang jelas
- Bahasa Indonesia

Output hanya plain text description, tanpa formatting.`;
  };

  // ============================================
  // PARSE AI JSON RESPONSE
  // ============================================
  window.parseAIJson = function(text) {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Find JSON object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('Format JSON tidak ditemukan dalam response');
    cleaned = cleaned.slice(start, end + 1);
    return JSON.parse(cleaned);
  };

  // ============================================
  // GENERATE DRILL
  // ============================================
  window.generateDrill = async function(sport, topic, difficulty) {
    const prompt = buildDrillPrompt(sport, topic, difficulty);
    const text = await generateWithAI(prompt, { temperature: 0.8 });
    const data = parseAIJson(text);

    const id = `drill-${sport}-${Date.now()}`;
    return {
      id,
      title: data.title || topic,
      sport: data.sport || sport,
      difficulty: data.difficulty || difficulty,
      duration: data.duration || '20 menit',
      equipment: data.equipment || 'Bola, cones',
      image: data.image || `https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600`,
      excerpt: data.excerpt || '',
      description: data.description || '',
      steps: Array.isArray(data.steps) ? data.steps : [],
      tips: data.tips || '',
      youtubeUrl: data.youtubeUrl || '',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      _aiGenerated: true
    };
  };

  // ============================================
  // GENERATE NEWS
  // ============================================
  window.generateNews = async function(category, topic) {
    const prompt = buildNewsPrompt(category, topic);
    const text = await generateWithAI(prompt, { temperature: 0.75 });
    const data = parseAIJson(text);

    const id = `news-${Date.now()}`;
    return {
      id,
      title: data.title || topic,
      category: data.category || category,
      excerpt: data.excerpt || '',
      image: data.image || `https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=600`,
      date: new Date().toISOString().split('T')[0],
      readTime: data.readTime || '3 menit',
      views: 0,
      content: data.content || `<p>${data.excerpt || ''}</p>`,
      _aiGenerated: true
    };
  };

  // ============================================
  // AI STATUS INDICATOR
  // ============================================
  window.updateAiStatus = function(status, message) {
    document.querySelectorAll('.ai-status').forEach(el => {
      el.className = `ai-status ${status}`;
      el.innerHTML = `<span class="status-dot"></span>${message}`;
    });
  };

  // ============================================
  // TEST API KEY
  // ============================================
  window.testAIKey = async function() {
    try {
      updateAiStatus('loading', 'Menghubungi Deepseek API...');
      const res = await generateWithAI('Halo! Berikan respons singkat: "API key valid"', {
        temperature: 0,
        maxTokens: 10
      });
      updateAiStatus('ready', 'API Key valid - AI siap digunakan');
      return true;
    } catch (e) {
      updateAiStatus('error', 'API Key invalid: ' + e.message);
      return false;
    }
  };

})();
