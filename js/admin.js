/**
 * SPORTS DRILLS WEB - Admin Panel Logic
 * Kelola konten via localStorage untuk static site
 */

(function() {
  'use strict';

  const ADMIN_KEY = 'sportsDrillsAdminSession';
  const DEFAULT_PASS = 'admin123';

  // ============================================
  // AUTH
  // ============================================
  window.isAdminLoggedIn = function() {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  };

  window.adminLogin = function(password) {
    const stored = localStorage.getItem('sportsDrillsAdminPass') || DEFAULT_PASS;
    if (password === stored) {
      localStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  };

  window.adminLogout = function() {
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = 'admin.html';
  };

  window.changeAdminPass = function(oldPass, newPass) {
    const stored = localStorage.getItem('sportsDrillsAdminPass') || DEFAULT_PASS;
    if (oldPass !== stored) return false;
    localStorage.setItem('sportsDrillsAdminPass', newPass);
    return true;
  };

  // ============================================
  // GUARD
  // ============================================
  window.requireAdmin = function() {
    if (!isAdminLoggedIn()) {
      window.location.href = 'admin.html';
    }
  };

  // ============================================
  // CONTENT CRUD HELPERS
  // ============================================
  function getContent() {
    return window.SportsDrillsData?.loadContent() || DEFAULT_CONTENT;
  }

  function saveContent(content) {
    return window.SportsDrillsData?.saveContent(content) || false;
  }

  // ============================================
  // DRILL MANAGEMENT
  // ============================================
  window.addDrill = function(drill) {
    const content = getContent();
    drill.id = drill.id || `drill-${drill.sport}-${Date.now()}`;
    drill.date = drill.date || new Date().toISOString().split('T')[0];
    drill.views = drill.views || 0;
    content.drills.unshift(drill);
    saveContent(content);
    return drill;
  };

  window.updateDrill = function(id, updates) {
    const content = getContent();
    const idx = content.drills.findIndex(d => d.id === id);
    if (idx === -1) return null;
    content.drills[idx] = { ...content.drills[idx], ...updates };
    saveContent(content);
    return content.drills[idx];
  };

  window.deleteDrill = function(id) {
    const content = getContent();
    content.drills = content.drills.filter(d => d.id !== id);
    saveContent(content);
    return true;
  };

  // ============================================
  // NEWS MANAGEMENT
  // ============================================
  window.addNews = function(item) {
    const content = getContent();
    item.id = item.id || `news-${Date.now()}`;
    item.date = item.date || new Date().toISOString().split('T')[0];
    item.views = item.views || 0;
    content.news.unshift(item);
    saveContent(content);
    return item;
  };

  window.updateNews = function(id, updates) {
    const content = getContent();
    const idx = content.news.findIndex(n => n.id === id);
    if (idx === -1) return null;
    content.news[idx] = { ...content.news[idx], ...updates };
    saveContent(content);
    return content.news[idx];
  };

  window.deleteNews = function(id) {
    const content = getContent();
    content.news = content.news.filter(n => n.id !== id);
    saveContent(content);
    return true;
  };

  // ============================================
  // COACH MANAGEMENT
  // ============================================
  window.addCoach = function(coach) {
    const content = getContent();
    coach.id = coach.id || `coach-${Date.now()}`;
    content.coaches.push(coach);
    saveContent(content);
    return coach;
  };

  window.updateCoach = function(id, updates) {
    const content = getContent();
    const idx = content.coaches.findIndex(c => c.id === id);
    if (idx === -1) return null;
    content.coaches[idx] = { ...content.coaches[idx], ...updates };
    saveContent(content);
    return content.coaches[idx];
  };

  window.deleteCoach = function(id) {
    const content = getContent();
    content.coaches = content.coaches.filter(c => c.id !== id);
    saveContent(content);
    return true;
  };

  // ============================================
  // EXPORT / IMPORT
  // ============================================
  window.exportContent = function() {
    const content = getContent();
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sports-drills-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  window.importContent = function(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.drills || !data.news || !data.coaches) {
        throw new Error('Format JSON tidak valid');
      }
      saveContent(data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  window.resetToDefault = function() {
    if (!confirm('Yakin ingin reset semua konten ke default? Data custom akan hilang.')) return false;
    localStorage.removeItem('sportsDrillsContent');
    return true;
  };

  // ============================================
  // STATS
  // ============================================
  window.getAdminStats = function() {
    const content = getContent();
    const totalViews = content.drills.reduce((s, d) => s + (d.views || 0), 0)
                     + content.news.reduce((s, n) => s + (n.views || 0), 0);
    return {
      drills: content.drills.length,
      news: content.news.length,
      coaches: content.coaches.length,
      totalViews,
      aiGenerated: {
        drills: content.drills.filter(d => d._aiGenerated).length,
        news: content.news.filter(n => n._aiGenerated).length
      }
    };
  };

  // ============================================
  // RENDER ADMIN TABLES
  // ============================================
  window.renderAdminDrillsTable = function(container) {
    if (!container) return;
    const content = getContent();
    container.innerHTML = content.drills.map(d => `
      <tr>
        <td><strong>${d.title}</strong><br><small class="text-muted">${d.id}</small></td>
        <td><span class="badge ${getSportBadgeClass(d.sport)}">${sportNames[d.sport] || d.sport}</span></td>
        <td><span class="badge ${getDifficultyBadgeClass(d.difficulty)}">${d.difficulty}</span></td>
        <td>${d.date}</td>
        <td>${formatNumber(d.views || 0)}</td>
        <td class="actions">
          <button onclick="editDrill('${d.id}')" title="Edit">✎</button>
          <button onclick="deleteDrillConfirm('${d.id}')" title="Hapus">🗑</button>
        </td>
      </tr>
    `).join('');
  };

  window.renderAdminNewsTable = function(container) {
    if (!container) return;
    const content = getContent();
    container.innerHTML = content.news.map(n => `
      <tr>
        <td><strong>${n.title}</strong><br><small class="text-muted">${n.id}</small></td>
        <td><span class="badge ${getSportBadgeClass(n.category)}">${n.category}</span></td>
        <td>${n.date}</td>
        <td>${formatNumber(n.views || 0)}</td>
        <td class="actions">
          <button onclick="editNews('${n.id}')" title="Edit">✎</button>
          <button onclick="deleteNewsConfirm('${n.id}')" title="Hapus">🗑</button>
        </td>
      </tr>
    `).join('');
  };

  // ============================================
  // CONFIRM HELPERS
  // ============================================
  window.deleteDrillConfirm = function(id) {
    if (confirm('Yakin ingin menghapus drill ini?')) {
      deleteDrill(id);
      showToast('Drill dihapus', 'success');
      document.querySelector('#drills-table') && renderAdminDrillsTable(document.querySelector('#drills-table tbody'));
    }
  };

  window.deleteNewsConfirm = function(id) {
    if (confirm('Yakin ingin menghapus berita ini?')) {
      deleteNews(id);
      showToast('Berita dihapus', 'success');
      document.querySelector('#news-table') && renderAdminNewsTable(document.querySelector('#news-table tbody'));
    }
  };

  // ============================================
  // AI GENERATE FROM ADMIN
  // ============================================
  window.adminGenerateDrill = async function(sport, topic, difficulty) {
    if (!hasAIKey()) {
      showToast('API Key Deepseek belum di-setting', 'error');
      return null;
    }
    try {
      showToast('Generating drill...', 'warning');
      const drill = await generateDrill(sport, topic, difficulty);
      addDrill(drill);
      showToast('Drill berhasil dibuat!', 'success');
      return drill;
    } catch (e) {
      showToast('Gagal: ' + e.message, 'error');
      return null;
    }
  };

  window.adminGenerateNews = async function(category, topic) {
    if (!hasAIKey()) {
      showToast('API Key Deepseek belum di-setting', 'error');
      return null;
    }
    try {
      showToast('Generating news...', 'warning');
      const item = await generateNews(category, topic);
      addNews(item);
      showToast('Berita berhasil dibuat!', 'success');
      return item;
    } catch (e) {
      showToast('Gagal: ' + e.message, 'error');
      return null;
    }
  };

})();
