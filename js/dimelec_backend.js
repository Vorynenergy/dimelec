/**
 * dimelec_backend.js
 * DimElec LATAM — Conector API con fallback offline
 * URL configurable vía variable global para integración Voryn Energy
 */

'use strict';

const DimelecBackend = (() => {

  // Configurable para integración Voryn Energy
  // Prioridad: window.VORYN_API_URL > window.DIMELEC_API_URL > localhost
  const API_URL = (() => {
    if (typeof window !== 'undefined') {
      return window.VORYN_API_URL
          || window.DIMELEC_API_URL
          || 'http://localhost:8000';
    }
    return 'http://localhost:8000';
  })();

  const ENDPOINTS = {
    health:    '/',
    paises:    '/api/v1/paises',
    dimBT:     '/api/v1/dimensionar-bt',
    dimMT:     '/api/v1/dimensionar-mt',
    memoriaBT: '/api/v1/generar-memoria-bt',
    memoriaMT: '/api/v1/generar-memoria-mt',
    ejemplos:  '/api/v1/ejemplos',
  };

  let _backendOnline = null;  // null = not checked yet

  /** Verifica si el backend está disponible */
  async function checkHealth() {
    try {
      const r = await fetch(`${API_URL}${ENDPOINTS.health}`, { signal: AbortSignal.timeout(2000) });
      _backendOnline = r.ok;
    } catch {
      _backendOnline = false;
    }
    return _backendOnline;
  }

  function isOnline() { return _backendOnline; }

  /** POST genérico con manejo de errores */
  async function post(endpoint, payload) {
    const r = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: r.statusText }));
      throw new Error(err.detail || `HTTP ${r.status}`);
    }
    return r.json();
  }

  /** GET genérico */
  async function get(endpoint) {
    const r = await fetch(`${API_URL}${endpoint}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  /** Descarga binario (DOCX) */
  async function download(endpoint, payload, filename) {
    const r = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: r.statusText }));
      throw new Error(err.detail || `HTTP ${r.status}`);
    }
    const blob = await r.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ── OPERACIONES PRINCIPALES ───────────────────────────────────

  async function dimensionarBT(payload) {
    return post(ENDPOINTS.dimBT, payload);
  }

  async function dimensionarMT(payload) {
    return post(ENDPOINTS.dimMT, payload);
  }

  async function generarMemoriaBT(payload) {
    const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,16);
    return download(ENDPOINTS.memoriaBT, payload, `memoria_BT_${payload.pais}_${ts}.docx`);
  }

  async function generarMemoriaMT(payload) {
    const ts = new Date().toISOString().replace(/[:.]/g,'-').slice(0,16);
    return download(ENDPOINTS.memoriaMT, payload, `memoria_MT_${payload.pais}_${ts}.docx`);
  }

  async function getPaises() {
    return get(ENDPOINTS.paises);
  }

  async function getEjemplos() {
    return get(ENDPOINTS.ejemplos);
  }

  // ── EXPORTACIÓN LOCAL (offline) ───────────────────────────────

  function exportJSON(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || `dimelec_payload_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportResultsJSON(resultado, filename) {
    exportJSON(resultado, filename || `dimelec_resultado_${Date.now()}.json`);
  }

  // ── INFO ──────────────────────────────────────────────────────

  function getInfo() {
    return {
      api_url: API_URL,
      online:  _backendOnline,
      endpoints: ENDPOINTS,
      note: 'Configurar window.VORYN_API_URL o window.DIMELEC_API_URL para producción.',
    };
  }

  return {
    checkHealth, isOnline, getInfo,
    dimensionarBT, dimensionarMT,
    generarMemoriaBT, generarMemoriaMT,
    getPaises, getEjemplos,
    exportJSON, exportResultsJSON,
    API_URL, ENDPOINTS,
  };

})();

if (typeof module !== 'undefined') module.exports = DimelecBackend;
