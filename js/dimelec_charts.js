/**
 * dimelec_charts.js
 * DimElec LATAM — Visualización con Chart.js
 * Gráficas: ΔV vs Longitud, Perfil de tensión, Comparación conductores, Análisis económico
 */

'use strict';

const DimelecCharts = (() => {

  const COLORS = {
    blue:   '#3b82f6', blue_bg:  'rgba(59,130,246,0.08)',
    green:  '#10b981', green_bg: 'rgba(16,185,129,0.15)',
    red:    '#ef4444', red_bg:   'rgba(239,68,68,0.15)',
    amber:  '#f59e0b', amber_bg: 'rgba(245,158,11,0.15)',
    text:   '#94a3b8', grid:     'rgba(255,255,255,0.05)',
  };

  const BASE_OPTIONS = {
    responsive: true,
    animation: { duration: 400 },
    plugins: { legend: { labels: { color: COLORS.text, font: { size: 11 } } } },
    scales: {
      x: { ticks:{ color: '#64748b' }, grid:{ color: COLORS.grid } },
      y: { ticks:{ color: '#64748b' }, grid:{ color: COLORS.grid } },
    },
  };

  const _charts = {};

  function _destroy(id) {
    if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
  }

  // ── GRÁFICA 1: ΔV% vs Longitud ───────────────────────────────
  function renderDvCurve(canvasId, dvCurveData, limPct, conductorLabel) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx || !dvCurveData?.length) return;

    _charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dvCurveData.map(p => p.L_m),
        datasets: [
          {
            label: `ΔV% — ${conductorLabel || 'Conductor'}`,
            data: dvCurveData.map(p => p.pct),
            borderColor: COLORS.blue, backgroundColor: COLORS.blue_bg,
            tension: 0.4, borderWidth: 2, pointRadius: 0, fill: true,
          },
          {
            label: `Límite ${limPct}%`,
            data: dvCurveData.map(() => limPct),
            borderColor: COLORS.red, borderDash: [6,3], borderWidth: 1.5,
            pointRadius: 0, fill: false,
          },
        ],
      },
      options: {
        ...BASE_OPTIONS,
        scales: {
          ...BASE_OPTIONS.scales,
          x: { ...BASE_OPTIONS.scales.x, title: { display:true, text:'Longitud (m)', color:'#64748b' } },
          y: { ...BASE_OPTIONS.scales.y, title: { display:true, text:'Caída ΔV (%)', color:'#64748b' } },
        },
      },
    });
  }

  // ── GRÁFICA 2: Perfil de tensión ─────────────────────────────
  function renderVoltageProfile(canvasId, profileData, nominalKv) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx || !profileData?.length) return;

    const minPu = Math.min(...profileData.map(p=>p.v_pu));
    const warnColor = minPu < 0.95 ? COLORS.amber : COLORS.green;

    _charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: profileData.map(p => `${p.L_km??p.L_m??0}`),
        datasets: [
          {
            label: 'Tensión (pu)',
            data: profileData.map(p => p.v_pu),
            borderColor: warnColor, backgroundColor: warnColor.replace(')',',0.1)').replace('rgb','rgba'),
            tension: 0.3, borderWidth: 2, pointRadius: 3, fill: true,
          },
          {
            label: '0.95 pu (límite inferior)',
            data: profileData.map(() => 0.95),
            borderColor: COLORS.red, borderDash:[5,3], borderWidth:1.5, pointRadius:0, fill:false,
          },
        ],
      },
      options: {
        ...BASE_OPTIONS,
        scales: {
          ...BASE_OPTIONS.scales,
          x: { ...BASE_OPTIONS.scales.x, title:{ display:true, text:'Longitud (km)', color:'#64748b'} },
          y: {
            ...BASE_OPTIONS.scales.y,
            min: Math.max(0.88, minPu - 0.02),
            max: 1.02,
            title: { display:true, text:'Tensión (pu)', color:'#64748b' },
          },
        },
      },
    });
  }

  // ── GRÁFICA 3: Comparación de conductores evaluados ──────────
  function renderConductorComparison(canvasId, evals) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx || !evals?.length) return;

    const colors = evals.map(e =>
      (e.cumT && e.cumV) ? 'rgba(16,185,129,0.7)'
      : e.cumT ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.5)'
    );

    _charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: evals.map(e => e.cal || e.calibre),
        datasets: [
          {
            label: 'Caída ΔV%',
            data: evals.map(e => e.caida),
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('.7','1').replace('.5','1')),
            borderWidth: 1, yAxisID: 'y',
          },
          {
            label: 'Ampacidad corr. (A)',
            data: evals.map(e => e.ampC || e.amp_c || e.amp || 0),
            backgroundColor: 'rgba(96,165,250,0.3)',
            borderColor: 'rgba(96,165,250,0.8)',
            borderWidth: 1, type: 'line', yAxisID: 'y2',
          },
        ],
      },
      options: {
        ...BASE_OPTIONS,
        scales: {
          x:  { ticks:{ color:'#64748b', maxRotation:45 }, grid:{ color: COLORS.grid } },
          y:  { ...BASE_OPTIONS.scales.y, title:{ display:true, text:'ΔV (%)', color:'#64748b' } },
          y2: { position:'right', ticks:{ color:'#64748b' }, grid:{ display:false },
                title:{ display:true, text:'Ampacidad (A)', color:'#64748b' } },
        },
      },
    });
  }

  // ── GRÁFICA 4: Análisis económico ────────────────────────────
  function renderEconomicComparison(canvasId, econData) {
    _destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx || !econData?.comparison?.length) return;

    const cmp = econData.comparison.slice(0, 8);

    _charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cmp.map(e => e.cal),
        datasets: [
          { label: 'Conductor (USD)', data: cmp.map(e=>e.c_cond),  backgroundColor:'rgba(59,130,246,0.7)', stack:'total' },
          { label: 'Instalación (USD)',data:cmp.map(e=>e.c_inst), backgroundColor:'rgba(16,185,129,0.7)', stack:'total' },
          { label: 'VPN Pérdidas (USD)',data:cmp.map(e=>e.vpn_loss),backgroundColor:'rgba(239,68,68,0.7)', stack:'total' },
        ],
      },
      options: {
        ...BASE_OPTIONS,
        scales: {
          x: { stacked:true, ticks:{ color:'#64748b', maxRotation:35 }, grid:{ color:COLORS.grid } },
          y: { stacked:true, ticks:{ color:'#64748b' }, grid:{ color:COLORS.grid },
               title:{ display:true, text:'Costo ciclo de vida (USD)', color:'#64748b' } },
        },
      },
    });
  }

  function destroyAll() {
    Object.keys(_charts).forEach(_destroy);
  }

  return { renderDvCurve, renderVoltageProfile, renderConductorComparison, renderEconomicComparison, destroyAll };

})();

if (typeof module !== 'undefined') module.exports = DimelecCharts;
