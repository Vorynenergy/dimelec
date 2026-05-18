// ============================================================
// Voryn Energy — Auth Layer SDK v1.0
// Archivo: voryn-auth.js
// Uso: incluir en el <head> de cada módulo antes del cierre </head>
// NO modifica lógica técnica. Solo gestiona auth + plan + UI.
// ============================================================

(function () {
  'use strict';

  // ── CONFIGURACIÓN ─────────────────────────────────────────
  const VORYN = {
    API_URL: 'https://api.vorynenergy.com',
    TOKEN_KEY: 'voryn_token',
    USER_KEY:  'voryn_user',
    PLAN_KEY:  'voryn_plan',
    // Funciones bloqueadas por plan — personalizar por módulo
    // Se sobreescribe con window.VORYN_MODULE_CONFIG antes de cargar este script
    PRO_FEATURES: [],
    MODULE_NAME: 'voryn',
    UPGRADE_URL: 'https://app.vorynenergy.com/upgrade',
    APP_URL:     'https://app.vorynenergy.com',
  };

  // Permitir configuración por módulo
  if (window.VORYN_MODULE_CONFIG) {
    Object.assign(VORYN, window.VORYN_MODULE_CONFIG);
  }

  // ── ESTADO GLOBAL ─────────────────────────────────────────
  let _currentUser = null;
  let _currentPlan = 'free';
  let _authReady   = false;

  // ── API CLIENT ────────────────────────────────────────────

  async function apiGet(path) {
    const token = localStorage.getItem(VORYN.TOKEN_KEY);
    const res = await fetch(`${VORYN.API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return { status: res.status, data: await res.json() };
  }

  async function apiPost(path, body) {
    const token = localStorage.getItem(VORYN.TOKEN_KEY);
    const res = await fetch(`${VORYN.API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return { status: res.status, data: await res.json() };
  }

  // ── SESIÓN ────────────────────────────────────────────────

  function saveSession(token, user, plan) {
    localStorage.setItem(VORYN.TOKEN_KEY, token);
    localStorage.setItem(VORYN.USER_KEY,  JSON.stringify(user));
    localStorage.setItem(VORYN.PLAN_KEY,  plan);
    _currentUser = user;
    _currentPlan = plan;
  }

  function clearSession() {
    localStorage.removeItem(VORYN.TOKEN_KEY);
    localStorage.removeItem(VORYN.USER_KEY);
    localStorage.removeItem(VORYN.PLAN_KEY);
    _currentUser = null;
    _currentPlan = 'free';
  }

  async function validateSession() {
    const token = localStorage.getItem(VORYN.TOKEN_KEY);
    if (!token) return false;

    try {
      const { status, data } = await apiGet('/auth/me');
      if (status === 200 && data.success) {
        _currentUser = data.data;
        _currentPlan = data.data.plan || 'free';
        localStorage.setItem(VORYN.USER_KEY, JSON.stringify(_currentUser));
        localStorage.setItem(VORYN.PLAN_KEY, _currentPlan);
        return true;
      }
    } catch (_) {}

    clearSession();
    return false;
  }

  // ── CONTROL DE ACCESO ─────────────────────────────────────

  function isPro()      { return _currentPlan === 'pro' || _currentPlan === 'enterprise'; }
  function isFree()     { return _currentPlan === 'free'; }
  function isInactive() { return _currentPlan === 'inactive'; }

  // Bloquear elementos del DOM que requieren plan Pro
  function applyPlanRestrictions() {
    // Elementos marcados con data-voryn-pro="true"
    document.querySelectorAll('[data-voryn-pro]').forEach(el => {
      if (!isPro()) {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.45';
        el.title = 'Función disponible en plan Pro';
        el.setAttribute('data-locked', 'true');
      } else {
        el.style.pointerEvents = '';
        el.style.opacity = '';
        el.removeAttribute('data-locked');
      }
    });

    // Botones marcados con data-voryn-export (exportación PDF)
    document.querySelectorAll('[data-voryn-export]').forEach(btn => {
      if (!isPro()) {
        btn.addEventListener('click', interceptExport, true);
        btn.setAttribute('data-locked-export', 'true');
      }
    });

    // Badge de plan en el header
    updatePlanBadge();
  }

  function interceptExport(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    showUpgradeModal('exportar memorias técnicas en PDF');
    return false;
  }

  // ── UI: BADGE DE PLAN ─────────────────────────────────────

  function updatePlanBadge() {
    const badge = document.getElementById('voryn-plan-badge');
    if (!badge) return;
    const labels = { pro: 'Pro', enterprise: 'Enterprise', free: 'Free', inactive: 'Inactivo' };
    const colors = { pro: '#22c55e', enterprise: '#a855f7', free: '#6b7280', inactive: '#ef4444' };
    badge.textContent = labels[_currentPlan] || 'Free';
    badge.style.background = colors[_currentPlan] || '#6b7280';
  }

  // ── ESTILOS ───────────────────────────────────────────────

  function injectStyles() {
    if (document.getElementById('voryn-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'voryn-auth-styles';
    style.textContent = `
      /* ── Voryn Auth Layer Styles ── */
      #voryn-overlay {
        position:fixed;inset:0;background:rgba(8,10,16,.92);
        backdrop-filter:blur(8px);z-index:99999;
        display:flex;align-items:center;justify-content:center;
        font-family:'Inter','Segoe UI',system-ui,sans-serif;
      }
      #voryn-overlay * { box-sizing:border-box; }
      .voryn-card {
        background:#0f1117;border:1px solid #1e2535;border-radius:16px;
        padding:40px 36px;width:100%;max-width:420px;
        box-shadow:0 24px 64px rgba(0,0,0,.6);
        animation:vorynFadeIn .25s ease;
      }
      @keyframes vorynFadeIn {
        from{opacity:0;transform:translateY(12px)}
        to{opacity:1;transform:translateY(0)}
      }
      .voryn-logo {
        font-size:20px;font-weight:800;letter-spacing:-.5px;
        color:#fff;margin-bottom:6px;
      }
      .voryn-logo span { color:#d4ff00; }
      .voryn-module-tag {
        font-size:11px;color:#5a6a8a;font-family:monospace;
        text-transform:uppercase;letter-spacing:.1em;margin-bottom:28px;
      }
      .voryn-title {
        font-size:22px;font-weight:700;color:#fff;
        letter-spacing:-.4px;margin-bottom:6px;
      }
      .voryn-sub {
        font-size:13px;color:#6b7280;margin-bottom:28px;line-height:1.6;
      }
      .voryn-field {
        width:100%;background:#161b27;border:1px solid #1e2535;
        border-radius:8px;padding:12px 14px;color:#e0e6f0;
        font-size:14px;outline:none;transition:.15s;margin-bottom:12px;
      }
      .voryn-field:focus { border-color:#d4ff00;box-shadow:0 0 0 3px rgba(212,255,0,.1); }
      .voryn-field::placeholder { color:#374151; }
      .voryn-btn {
        width:100%;padding:13px;border:none;border-radius:8px;
        font-size:14px;font-weight:600;cursor:pointer;
        transition:.15s;margin-bottom:10px;
      }
      .voryn-btn-primary {
        background:#d4ff00;color:#0a0a0a;
      }
      .voryn-btn-primary:hover { background:#c8f000; }
      .voryn-btn-primary:disabled {
        opacity:.5;cursor:not-allowed;
      }
      .voryn-btn-ghost {
        background:transparent;color:#9ca3af;border:1px solid #1e2535;
      }
      .voryn-btn-ghost:hover { border-color:#374151;color:#fff; }
      .voryn-error {
        background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);
        border-radius:6px;padding:10px 12px;
        font-size:12px;color:#f87171;margin-bottom:12px;display:none;
      }
      .voryn-switch {
        font-size:12px;color:#6b7280;text-align:center;margin-top:14px;
      }
      .voryn-switch a {
        color:#d4ff00;cursor:pointer;text-decoration:none;
      }
      .voryn-switch a:hover { text-decoration:underline; }
      .voryn-divider {
        height:1px;background:#1e2535;margin:20px 0;
      }
      /* Upgrade modal */
      .voryn-upgrade-card {
        text-align:center;padding:48px 36px;
      }
      .voryn-upgrade-icon { font-size:40px;margin-bottom:16px; }
      .voryn-upgrade-title {
        font-size:20px;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-.3px;
      }
      .voryn-upgrade-desc {
        font-size:13px;color:#6b7280;line-height:1.7;margin-bottom:28px;
      }
      .voryn-plan-badge-wrap {
        display:inline-flex;align-items:center;gap:8px;
        padding:6px 14px;border:1px solid #1e2535;border-radius:20px;
        font-size:12px;color:#9ca3af;cursor:pointer;
        transition:.15s;
      }
      .voryn-plan-badge-wrap:hover { border-color:#374151; }
      #voryn-plan-badge {
        display:inline-block;padding:2px 8px;border-radius:10px;
        font-size:10px;font-weight:700;color:#0a0a0a;
        font-family:monospace;letter-spacing:.05em;
      }
      .voryn-spinner {
        display:inline-block;width:16px;height:16px;
        border:2px solid rgba(0,0,0,.2);border-top-color:#0a0a0a;
        border-radius:50%;animation:vorynSpin .6s linear infinite;
        vertical-align:middle;margin-right:6px;
      }
      @keyframes vorynSpin { to { transform:rotate(360deg); } }
      /* Barra de estado flotante */
      #voryn-status-bar {
        position:fixed;top:0;left:0;right:0;z-index:9998;
        background:#0f1117;border-bottom:1px solid #1e2535;
        height:42px;display:flex;align-items:center;
        padding:0 20px;gap:12px;font-family:'Inter','Segoe UI',system-ui,sans-serif;
        font-size:12px;color:#6b7280;
        transform:translateY(-100%);transition:transform .3s ease;
      }
      #voryn-status-bar.visible { transform:translateY(0); }
      #voryn-status-bar .voryn-sb-brand {
        font-weight:700;color:#fff;font-size:13px;
        letter-spacing:-.3px;margin-right:4px;
      }
      #voryn-status-bar .voryn-sb-brand span { color:#d4ff00; }
      #voryn-status-bar .voryn-sb-sep { color:#1e2535; }
      #voryn-status-bar .voryn-sb-right {
        margin-left:auto;display:flex;align-items:center;gap:10px;
      }
      #voryn-status-bar .voryn-sb-upgrade {
        background:#d4ff00;color:#0a0a0a;border:none;
        border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;
        cursor:pointer;transition:.15s;
      }
      #voryn-status-bar .voryn-sb-upgrade:hover { background:#c8f000; }
      #voryn-status-bar .voryn-sb-logout {
        color:#374151;cursor:pointer;font-size:11px;
      }
      #voryn-status-bar .voryn-sb-logout:hover { color:#9ca3af; }
    `;
    document.head.appendChild(style);
  }

  // ── UI: OVERLAY ───────────────────────────────────────────

  function createOverlay() {
    const existing = document.getElementById('voryn-overlay');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.id = 'voryn-overlay';
    document.body.appendChild(div);
    return div;
  }

  function removeOverlay() {
    const overlay = document.getElementById('voryn-overlay');
    if (overlay) overlay.remove();
  }

  // ── UI: MODAL DE LOGIN/REGISTRO ───────────────────────────

  function showAuthModal(mode = 'login') {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="voryn-card">
        <div class="voryn-logo">Voryn<span>Energy</span></div>
        <div class="voryn-module-tag">${VORYN.MODULE_NAME}</div>

        <div id="voryn-login-form">
          <div class="voryn-title">${mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</div>
          <div class="voryn-sub">
            ${mode === 'login'
              ? 'Accede a tu espacio de trabajo de ingeniería eléctrica.'
              : 'Crea tu cuenta gratuita. Sin tarjeta de crédito.'}
          </div>
          <div id="voryn-auth-error" class="voryn-error"></div>
          <input id="voryn-email" class="voryn-field" type="email"
            placeholder="correo@empresa.com" autocomplete="email" />
          <input id="voryn-password" class="voryn-field" type="password"
            placeholder="Contraseña (mín. 8 caracteres)" autocomplete="current-password" />
          <button id="voryn-submit-btn" class="voryn-btn voryn-btn-primary">
            ${mode === 'login' ? 'Ingresar' : 'Crear cuenta gratis'}
          </button>
          <div class="voryn-switch">
            ${mode === 'login'
              ? '¿No tienes cuenta? <a id="voryn-switch-mode">Regístrate gratis</a>'
              : '¿Ya tienes cuenta? <a id="voryn-switch-mode">Inicia sesión</a>'}
          </div>
        </div>
      </div>
    `;

    let currentMode = mode;
    const emailInput    = document.getElementById('voryn-email');
    const passwordInput = document.getElementById('voryn-password');
    const submitBtn     = document.getElementById('voryn-submit-btn');
    const errorBox      = document.getElementById('voryn-auth-error');
    const switchLink    = document.getElementById('voryn-switch-mode');

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    }
    function hideError() {
      errorBox.style.display = 'none';
    }
    function setLoading(loading) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="voryn-spinner"></span>Procesando...'
        : (currentMode === 'login' ? 'Ingresar' : 'Crear cuenta gratis');
    }

    switchLink.addEventListener('click', () => {
      currentMode = currentMode === 'login' ? 'register' : 'login';
      hideError();
      passwordInput.value = '';
      submitBtn.innerHTML  = currentMode === 'login' ? 'Ingresar' : 'Crear cuenta gratis';
      document.querySelector('.voryn-title').textContent =
        currentMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta';
      document.querySelector('.voryn-sub').textContent =
        currentMode === 'login'
          ? 'Accede a tu espacio de trabajo de ingeniería eléctrica.'
          : 'Crea tu cuenta gratuita. Sin tarjeta de crédito.';
      switchLink.parentElement.innerHTML =
        currentMode === 'login'
          ? '¿No tienes cuenta? <a id="voryn-switch-mode">Regístrate gratis</a>'
          : '¿Ya tienes cuenta? <a id="voryn-switch-mode">Inicia sesión</a>';
      document.getElementById('voryn-switch-mode').addEventListener('click', () => {
        currentMode = currentMode === 'login' ? 'register' : 'login';
        showAuthModal(currentMode);
      });
    });

    async function handleSubmit() {
      hideError();
      const email    = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showError('Por favor completa todos los campos.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Formato de email inválido.');
        return;
      }
      if (password.length < 8) {
        showError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      setLoading(true);
      try {
        const endpoint = currentMode === 'login' ? '/auth/login' : '/auth/register';
        const { status, data } = await apiPost(endpoint, { email, password });

        if (status === 200 || status === 201) {
          saveSession(data.data.token, data.data.user, data.data.plan || 'free');
          removeOverlay();
          onAuthSuccess();
        } else {
          showError(data.error || 'Error al procesar la solicitud.');
        }
      } catch (err) {
        showError('Error de conexión. Verifica tu internet.');
      } finally {
        setLoading(false);
      }
    }

    submitBtn.addEventListener('click', handleSubmit);
    emailInput.addEventListener('keydown', e => e.key === 'Enter' && passwordInput.focus());
    passwordInput.addEventListener('keydown', e => e.key === 'Enter' && handleSubmit());

    // Focus automático
    setTimeout(() => emailInput.focus(), 100);
  }

  // ── UI: MODAL DE UPGRADE ──────────────────────────────────

  function showUpgradeModal(feature = 'esta función') {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="voryn-card voryn-upgrade-card">
        <div class="voryn-upgrade-icon">⚡</div>
        <div class="voryn-logo" style="justify-content:center;display:flex;margin-bottom:4px">
          Voryn<span style="color:#d4ff00">Energy</span>
        </div>
        <div class="voryn-upgrade-title">Función Pro</div>
        <div class="voryn-upgrade-desc">
          Para <strong style="color:#e0e6f0">${feature}</strong> necesitas el plan Pro.<br>
          Acceso completo a los 3 módulos, IA técnica ilimitada,<br>
          memorias técnicas PDF y normativa LATAM completa.
        </div>
        <button id="voryn-upgrade-btn" class="voryn-btn voryn-btn-primary">
          Activar Plan Pro — $49/mes
        </button>
        <button id="voryn-upgrade-close" class="voryn-btn voryn-btn-ghost">
          Continuar con plan Free
        </button>
        <div class="voryn-divider"></div>
        <div style="font-size:11px;color:#374151">
          Garantía de 30 días · Cancela cuando quieras · Sin permanencia
        </div>
      </div>
    `;

    document.getElementById('voryn-upgrade-btn').addEventListener('click', async () => {
      const btn = document.getElementById('voryn-upgrade-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="voryn-spinner"></span>Redirigiendo a Stripe...';
      try {
        const { status, data } = await apiPost('/billing/checkout', {});
        if (status === 200 && data.data?.checkout_url) {
          window.location.href = data.data.checkout_url;
        } else {
          btn.disabled = false;
          btn.textContent = 'Activar Plan Pro — $49/mes';
          alert(data.error || 'Error al crear sesión de pago.');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Activar Plan Pro — $49/mes';
        alert('Error de conexión.');
      }
    });

    document.getElementById('voryn-upgrade-close').addEventListener('click', removeOverlay);
  }

  // ── UI: BARRA DE ESTADO ───────────────────────────────────

  function showStatusBar() {
    if (document.getElementById('voryn-status-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'voryn-status-bar';
    bar.innerHTML = `
      <span class="voryn-sb-brand">Voryn<span>Energy</span></span>
      <span class="voryn-sb-sep">|</span>
      <span>${VORYN.MODULE_NAME}</span>
      <div class="voryn-sb-right">
        <span id="voryn-sb-email" style="color:#9ca3af"></span>
        <div class="voryn-plan-badge-wrap" title="Plan activo">
          <span id="voryn-plan-badge">Free</span>
        </div>
        ${!isPro() ? `<button class="voryn-sb-upgrade" id="voryn-sb-upgrade-btn">Upgrade Pro</button>` : ''}
        <span class="voryn-sb-logout" id="voryn-sb-logout">Salir</span>
      </div>
    `;

    document.body.prepend(bar);

    // Compensar el alto de la barra en el contenido
    document.body.style.paddingTop = '42px';
    setTimeout(() => bar.classList.add('visible'), 50);

    // Email del usuario
    const emailEl = document.getElementById('voryn-sb-email');
    if (emailEl && _currentUser?.email) {
      emailEl.textContent = _currentUser.email;
    }

    // Badge de plan
    updatePlanBadge();

    // Botón upgrade
    const upgradeBtn = document.getElementById('voryn-sb-upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => showUpgradeModal('acceso completo a Voryn Pro'));
    }

    // Logout
    document.getElementById('voryn-sb-logout').addEventListener('click', () => {
      clearSession();
      window.location.reload();
    });
  }

  // ── FLUJO PRINCIPAL ───────────────────────────────────────

  function onAuthSuccess() {
    showStatusBar();
    applyPlanRestrictions();
    // Disparar evento para que el módulo pueda reaccionar si necesita
    window.dispatchEvent(new CustomEvent('voryn:auth:ready', {
      detail: { user: _currentUser, plan: _currentPlan }
    }));
    _authReady = true;
  }

  async function init() {
    injectStyles();

    // Bloquear interacción visual mientras se valida
    document.body.style.visibility = 'hidden';

    const isValid = await validateSession();

    document.body.style.visibility = '';

    if (!isValid) {
      showAuthModal('login');
      return;
    }

    onAuthSuccess();
  }

  // ── API PÚBLICA ───────────────────────────────────────────
  // Accesible desde el módulo como window.VorynAuth.*

  window.VorynAuth = {
    getUser:    () => _currentUser,
    getPlan:    () => _currentPlan,
    isPro:      isPro,
    isFree:     isFree,
    isInactive: isInactive,
    isReady:    () => _authReady,
    logout:     () => { clearSession(); window.location.reload(); },
    showUpgrade: showUpgradeModal,
    // Para uso futuro: registrar uso de feature
    trackUsage: async (action) => {
      try {
        await apiPost('/usage/log', {
          product: VORYN.MODULE_NAME,
          action,
        });
      } catch (_) {}
    },
  };

  // ── ARRANQUE ──────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
