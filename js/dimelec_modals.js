/**
 * dimelec_modals.js
 * DimElec LATAM — Modales: debug, ayuda, exportación
 */

'use strict';

const DimelecModals = (() => {

  function _overlay(content) {
    const div = document.createElement('div');
    div.className = 'dimelec-modal-overlay';
    div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    div.innerHTML = content;
    div.addEventListener('click', e => { if (e.target === div) div.remove(); });
    document.body.appendChild(div);
    return div;
  }

  function showDebug(resultado) {
    const json = JSON.stringify(resultado, null, 2)
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
    _overlay(`
      <div style="background:var(--dimelec-bg2,#161b27);border:1px solid var(--dimelec-border,#2a3550);border-radius:12px;padding:1.5rem;width:90vw;max-width:800px;max-height:80vh;overflow:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h3 style="color:#60a5fa;font-size:14px;font-weight:600">🐛 Debug — Resultado completo</h3>
          <button onclick="this.closest('.dimelec-modal-overlay').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px">✕</button>
        </div>
        <pre style="font-family:monospace;font-size:11px;color:#94a3b8;white-space:pre-wrap;word-break:break-word">${json}</pre>
      </div>`);
  }

  function showError(msg) {
    _overlay(`
      <div style="background:#1e1f23;border:1px solid #dc2626;border-radius:12px;padding:1.5rem;max-width:480px;width:90vw">
        <div style="color:#f87171;font-weight:600;margin-bottom:.75rem">⚠ Error</div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6">${msg}</div>
        <button onclick="this.closest('.dimelec-modal-overlay').remove()" 
                style="margin-top:1rem;padding:7px 18px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px">Cerrar</button>
      </div>`);
  }

  function showInfo(title, content) {
    _overlay(`
      <div style="background:#161b27;border:1px solid #2a3550;border-radius:12px;padding:1.5rem;max-width:560px;width:90vw">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
          <div style="color:#60a5fa;font-weight:600;font-size:14px">${title}</div>
          <button onclick="this.closest('.dimelec-modal-overlay').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px">✕</button>
        </div>
        <div style="color:#e2e8f0;font-size:13px;line-height:1.6">${content}</div>
      </div>`);
  }

  return { showDebug, showError, showInfo };
})();

if (typeof module !== 'undefined') module.exports = DimelecModals;
