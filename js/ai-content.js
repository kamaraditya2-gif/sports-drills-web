/**
 * SPORTS DRILLS WEB - AI Content Generator
 * Integrasi dengan Google Gemini API untuk generate konten
 * Bisa di-override via admin panel
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'sportsDrillsGeminiKey';
  const DEFAULT_MODEL = 'gemini-2.0-flash-lite';

  // ============================================
  // API KEY MANAGEMENT
  // ============================================
  window.getGeminiKey = function() {
    return localStorage.getItem(STORAGE_KEY) || '';
  };

  window.setGeminiKey = function(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  window.hasGeminiKey = function() {
    return !!getGeminiKey();
  };

  // ============================================
  // GEMINI API CALL
  // ============================================
  window.generateWithGemini = async function(prompt, options = {}) {
    const apiKey = getGeminiKey();
    if (!apiKey) {
      throw new Error('API key Gemini belum di-setting. Masukkan di Admin Panel.');
    }

    const model = options.model || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 2048,
        topP: 0.9
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
  "tips": "Tips profesional 1-2 kalimat"
}

Gunakan bahasa Indonesia yang natural dan sporty. Langkah-langkah harus praktis dan actionable.`;
  };

  window.buildNewsPrompt = function(category, topic) {
    const now = new Date().toISOString().split('T')[0];
    return `Tulis berita olahraga kategori ${category} dengan topik "${topic}".

Format output HARUS JSON valid dengan struktur berikut (tanpa markdown code block):
{
  "title": "Judul berita menarik dan click-worthy",
  "category": "${category}",
  "excerpt": "Ringkasan singkat 1-2 kalimat",
  "readTime": "Perkiraan waktu baca, contoh: 4 menit",
  "content": "Konten artikel panjang minimal 4 paragraf dalam HTML paragraph tags <p>...</p>. Gunakan bahasa Indonesia yang engaging dan informatif."
}

Gunakan gaya penulisan sports journalism profesional. Tanggal: ${now}.`;
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
  // PARSE GEMINI JSON RESPONSE
  // ============================================
  window.parseGeminiJson = function(text) {
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
    const text = await generateWithGemini(prompt, { temperature: 0.8 });
    const data = parseGeminiJson(text);

    const id = `drill-${sport}-${Date.now()}`;
    return {
      id,
      title: data.title || topic,
      sport: data.sport || sport,
      difficulty: data.difficulty || difficulty,
      duration: data.duration || '20 menit',
      equipment: data.equipment || 'Bola, cones',
      image: `https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600`,
      excerpt: data.excerpt || '',
      description: data.description || '',
      steps: Array.isArray(data.steps) ? data.steps : [],
      tips: data.tips || '',
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
    const text = await generateWithGemini(prompt, { temperature: 0.75 });
    const data = parseGeminiJson(text);

    const id = `news-${Date.now()}`;
    return {
      id,
      title: data.title || topic,
      category: data.category || category,
      excerpt: data.excerpt || '',
      image: `https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=600`,
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
  window.testGeminiKey = async function() {
    try {
      updateAiStatus('loading', 'Menghubungi Gemini API...');
      const res = await generateWithGemini('Halo! Berikan respons singkat: "API key valid"', {
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
