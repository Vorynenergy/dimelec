/**
 * dimelec_ui.js
 * DimElec LATAM — Renderizadores de pasos del wizard
 */

'use strict';

const DimelecUI = (() => {

  function render() { updateSidebar(); renderStep(); _updateNavTags(); }

  function updateSidebar() {
    const S = DimelecApp.getState();
    for (let i = 0; i < 9; i++) {
      const el = document.getElementById(`dimelec-sn-${i}`);
      if (!el) continue;
      el.className = 'dimelec-step-item' +
        (i === S.step ? ' active' : (S.resultado && i >= 5 ? ' done' : ''));
    }
  }

  function _updateNavTags() {
    const S = DimelecApp.getState();
    const c = DimelecStandards.getAllCountries()[S.pais] || {};
    const elP = document.getElementById('dimelec-nav-pais');
    const elN = document.getElementById('dimelec-nav-nivel');
    if (elP) elP.textContent = `${(c.name||'').split(' ')[0]} — ${(c.std||'').split('/')[0].trim()}`;
    if (elN) elN.textContent = S.nivel;
  }

  function showLoading(msg='Calculando...') {
    const mc = document.getElementById('dimelec-main-content');
    if (mc) mc.innerHTML = `<div class="dimelec-loading"><div class="dimelec-spinner"></div><span>${msg}</span></div>`;
  }

  function renderStep() {
    const S = DimelecApp.getState();
    const mc = document.getElementById('dimelec-main-content');
    if (!mc) return;
    const steps = [step0, step1, step2, step3, step4, step5, step6, step7, step8];
    mc.innerHTML = (steps[S.step] || step0)();
    mc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── PASO 0 — País ────────────────────────────────────────────
  function step0() {
    const S = DimelecApp.getState();
    const c = DimelecStandards.getAllCountries()[S.pais] || {};
    const vOpts = (S.nivel==='MT' ? (c.vmt||[]) : (c.vbt||[])).map(v =>
      `<option value="${v}"${S.voltageV===v?' selected':''}>${v}V${S.nivel==='MT'?` (${v/1000}kV)`:''}</option>`).join('');
    return `
    <div class="dimelec-sec-title">País y normativa</div>
    <div class="dimelec-sec-sub">Configuración normativa LATAM — criterios cargados automáticamente.</div>
    <div class="dimelec-card">
      <div class="dimelec-form-grid">
        <div class="dimelec-fg"><label>País</label>
          <select onchange="DimelecApp.setState({pais:this.value,norm:DimelecStandards.getCountry(this.value).std,unit:DimelecStandards.getCountry(this.value).unit});DimelecUI.render()">
            ${Object.entries(DimelecStandards.getAllCountries()).map(([k,v])=>`<option value="${k}"${S.pais===k?' selected':''}>${v.name}</option>`).join('')}
          </select></div>
        <div class="dimelec-fg"><label>Normativa</label><input type="text" value="${S.norm}" oninput="DimelecApp.setState({norm:this.value})"/></div>
        <div class="dimelec-fg"><label>Tipo instalación</label>
          <select onchange="DimelecApp.setState({tipoInst:this.value})">
            ${['residencial','comercial','industrial','hospitalaria','educativa','data center','bombeo','alumbrado público'].map(t=>`<option${S.tipoInst===t?' selected':''}>${t}</option>`).join('')}
          </select></div>
        <div class="dimelec-fg"><label>Tipo circuito</label>
          <select onchange="DimelecApp.setState({tipoCir:this.value})">
            <option value="alimentador"${S.tipoCir==='alimentador'?' selected':''}>Alimentador</option>
            <option value="terminal"${S.tipoCir==='terminal'?' selected':''}>Terminal / Ramal</option>
          </select></div>
        <div class="dimelec-fg"><label>Nivel de tensión</label>
          <select onchange="DimelecApp.setState({nivel:this.value,voltageV:this.value==='MT'?(DimelecStandards.getCountry(DimelecApp.getState().pais).vmt||[])[0]:(DimelecStandards.getCountry(DimelecApp.getState().pais).vbt||[])[0]});DimelecUI.render()">
            <option value="BT"${S.nivel==='BT'?' selected':''}>BT — Baja tensión</option>
            <option value="MT"${S.nivel==='MT'?' selected':''}>MT — Media tensión</option>
          </select></div>
        <div class="dimelec-fg"><label>Tensión nominal (V)</label>
          <select onchange="DimelecApp.setState({voltageV:parseInt(this.value)})">${vOpts}</select></div>
      </div>
      <div class="dimelec-info-box">ℹ <span><span class="dimelec-tag ${S.nivel==='MT'?'dimelec-tag-mt':'dimelec-tag-bt'}">${S.nivel}</span> ${c.std||''} — Límite: <strong>${S.tipoCir==='terminal'?c.dvT:c.dvF}%</strong> caída de tensión · f=${c.freq||60} Hz · Unidad preferida: ${c.unit||'AWG'}</span></div>
      <div class="dimelec-actions"><span></span><button class="dimelec-btn primary" onclick="DimelecApp.next()">Siguiente →</button></div>
    </div>`;
  }

  // ── PASO 1 — Sistema ─────────────────────────────────────────
  function step1() {
    const S = DimelecApp.getState();
    return `
    <div class="dimelec-sec-title">Sistema eléctrico</div>
    <div class="dimelec-sec-sub">Parámetros básicos del circuito.</div>
    <div class="dimelec-card">
      <div class="dimelec-form-grid">
        <div class="dimelec-fg"><label>Sistema</label>
          <select onchange="DimelecApp.setState({system:this.value})">
            <option value="monofasico"${S.system==='monofasico'?' selected':''}>Monofásico 1φ</option>
            <option value="bifasico"${S.system==='bifasico'?' selected':''}>Bifásico 2φ</option>
            <option value="trifasico"${S.system==='trifasico'?' selected':''}>Trifásico 3φ</option>
          </select></div>
        <div class="dimelec-fg"><label>Longitud circuito (m)</label>
          <input type="number" value="${S.lengthM}" min="1" max="10000" oninput="DimelecApp.setState({lengthM:parseFloat(this.value)||1})"/></div>
      </div>
      <div class="dimelec-eq">${S.system==='trifasico'?'I = S / (√3 × V)    [A]  — NEC / IEC 60364':'I = S / V    [A]  — NEC / IEC 60364'}</div>
      <div class="dimelec-actions">
        <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
        <button class="dimelec-btn primary" onclick="DimelecApp.next()">Siguiente →</button>
      </div>
    </div>`;
  }

  // ── PASO 2 — Conductor ───────────────────────────────────────
  function step2() {
    const S = DimelecApp.getState();
    const Ft = DimelecStandards.factorTemp(S.tAmb);
    const Fa = DimelecStandards.factorGroup(S.nCirc);
    return `
    <div class="dimelec-sec-title">Condiciones del conductor</div>
    <div class="dimelec-sec-sub">Corrección de ampacidad — NEC 310.15 / IEC 60502.</div>
    <div class="dimelec-card">
      <div class="dimelec-form-grid">
        <div class="dimelec-fg"><label>Material</label>
          <select onchange="DimelecApp.setState({mat:this.value})">
            <option value="cobre"${S.mat==='cobre'?' selected':''}>Cobre</option>
            <option value="aluminio"${S.mat==='aluminio'?' selected':''}>Aluminio</option>
          </select></div>
        <div class="dimelec-fg"><label>Unidad calibre</label>
          <select onchange="DimelecApp.setState({unit:this.value})">
            <option value="AWG"${S.unit==='AWG'?' selected':''}>AWG / kcmil</option>
            <option value="mm2"${S.unit==='mm2'?' selected':''}>mm² (IEC)</option>
          </select></div>
        <div class="dimelec-fg"><label>Método instalación</label>
          <select onchange="DimelecApp.setState({method:this.value})">
            ${['tuberia','bandeja_perforada','bandeja_cerrada','enterrado','ducto_banco','aereo','superficial'].map(m=>`<option value="${m}"${S.method===m?' selected':''}>${m.replace(/_/g,' ')}</option>`).join('')}
          </select></div>
        <div class="dimelec-fg"><label>Temperatura ambiente (°C)</label>
          <input type="number" value="${S.tAmb}" min="10" max="60" step="5" oninput="DimelecApp.setState({tAmb:parseFloat(this.value)||30});DimelecUI.render()"/></div>
        <div class="dimelec-fg"><label>Circuitos agrupados</label>
          <input type="number" value="${S.nCirc}" min="1" max="20" step="1" oninput="DimelecApp.setState({nCirc:parseInt(this.value)||1});DimelecUI.render()"/></div>
        <div class="dimelec-fg"><label>T° operación conductor (°C)</label>
          <input type="number" value="${S.tOper}" min="30" max="90" step="5" oninput="DimelecApp.setState({tOper:parseFloat(this.value)||50})"/></div>
        <div class="dimelec-fg"><label>THD armónicos (%)</label>
          <input type="number" value="${S.thd}" min="0" max="60" step="5" oninput="DimelecApp.setState({thd:parseFloat(this.value)||0})"/></div>
        <div class="dimelec-fg"><label>Reserva futura (%)</label>
          <input type="number" value="${S.reserva}" min="0" max="50" step="5" oninput="DimelecApp.setState({reserva:parseFloat(this.value)||0})"/></div>
      </div>
      <div class="dimelec-info-box">⚡ Ft(${S.tAmb}°C) = <strong>${Ft.toFixed(3)}</strong> · Fa(${S.nCirc} circ.) = <strong>${Fa.toFixed(3)}</strong> · F_total = <strong>${(Ft*Fa).toFixed(3)}</strong> · Iz_corr = Iz_base × ${(Ft*Fa).toFixed(3)}</div>
      <div class="dimelec-eq">Regulación: ΔV = k × I × L × (R·cosφ + X·sinφ)  —  IEC 60364 / RETIE</div>
      <div class="dimelec-actions">
        <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
        <button class="dimelec-btn primary" onclick="DimelecApp.next()">Siguiente →</button>
      </div>
    </div>`;
  }

  // ── PASO 3 — Cargas ──────────────────────────────────────────
  function step3() {
    const S = DimelecApp.getState();
    const tipos = ['iluminacion','tomas','motor','especial','electronico','alumbrado','bombeo'];
    const rows = S.loads.map((c,i) => `<tr>
      <td><input type="text" value="${c.nombre}" oninput="DimelecApp.getState().loads[${i}].nombre=this.value"/></td>
      <td><select onchange="DimelecApp.getState().loads[${i}].tipo=this.value">${tipos.map(t=>`<option value="${t}"${c.tipo===t?' selected':''}>${t}</option>`).join('')}</select></td>
      <td><input type="number" value="${c.kw}" min="0.01" step="0.5" oninput="DimelecApp.getState().loads[${i}].kw=parseFloat(this.value)||0"/></td>
      <td><input type="number" value="${c.cant}" min="1" step="1" oninput="DimelecApp.getState().loads[${i}].cant=parseInt(this.value)||1"/></td>
      <td><input type="number" value="${c.fp}" min="0.1" max="1" step="0.01" oninput="DimelecApp.getState().loads[${i}].fp=parseFloat(this.value)||0.9"/></td>
      <td><input type="number" value="${c.ef}" min="0.5" max="1" step="0.01" oninput="DimelecApp.getState().loads[${i}].ef=parseFloat(this.value)||1"/></td>
      <td><input type="number" value="${c.fd}" min="0.01" max="1" step="0.05" oninput="DimelecApp.getState().loads[${i}].fd=parseFloat(this.value)||1"/></td>
      <td><input type="number" value="${c.fs}" min="0.01" max="1" step="0.05" oninput="DimelecApp.getState().loads[${i}].fs=parseFloat(this.value)||1"/></td>
      <td style="text-align:center"><input type="checkbox" ${c.cont?'checked':''} onchange="DimelecApp.getState().loads[${i}].cont=this.checked"/></td>
      <td><button class="dimelec-btn danger sm" onclick="DimelecApp.getState().loads.splice(${i},1);DimelecUI.render()">✕</button></td>
    </tr>`).join('');
    return `
    <div class="dimelec-sec-title">Cargas eléctricas</div>
    <div class="dimelec-sec-sub">Criterio motor NEC 430.24 aplicado automáticamente.</div>
    <div class="dimelec-card">
      <div class="dimelec-tbl-wrap">
        <table class="dimelec-table">
          <thead><tr><th>Nombre</th><th>Tipo</th><th>kW</th><th>Cant.</th><th>FP</th><th>Efic.</th><th>F.Dem</th><th>F.Sim</th><th>Cont.</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:.75rem">
        <button class="dimelec-btn sm" onclick="DimelecApp.getState().loads.push({nombre:'Nueva carga',tipo:'iluminacion',kw:1,fp:0.9,ef:1,cant:1,fd:1,fs:1,cont:false});DimelecUI.render()">+ Agregar</button>
        <button class="dimelec-btn sm" onclick="if(DimelecApp.getState().loads.length){const l={...DimelecApp.getState().loads[DimelecApp.getState().loads.length-1],nombre:DimelecApp.getState().loads[DimelecApp.getState().loads.length-1].nombre+' 2'};DimelecApp.getState().loads.push(l);DimelecUI.render()}">⎘ Duplicar</button>
        <button class="dimelec-btn sm" onclick="DimelecApp.cargarEjemplo('motor')">📂 Motor industrial</button>
        <button class="dimelec-btn sm" onclick="DimelecApp.cargarEjemplo('comercial')">📂 Local comercial</button>
        <button class="dimelec-btn sm" onclick="DimelecApp.cargarEjemplo('vivienda')">📂 Vivienda</button>
      </div>
      <div class="dimelec-actions">
        <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
        <button class="dimelec-btn primary" onclick="DimelecApp.calcular()">⚡ Calcular →</button>
      </div>
    </div>`;
  }

  // ── PASO 4 — Avanzado ────────────────────────────────────────
  function step4() {
    const S = DimelecApp.getState();
    return `
    <div class="dimelec-sec-title">Parámetros avanzados</div>
    <div class="dimelec-sec-sub">Cortocircuito, transformador, selectividad y empresa.</div>
    <div class="dimelec-card">
      <div class="dimelec-card-title">Cortocircuito y transformador</div>
      <div class="dimelec-form-grid-3">
        <div class="dimelec-fg"><label>Trafo kVA (0=omitir)</label><input type="number" value="${S.trafoKva}" min="0" step="25" oninput="DimelecApp.setState({trafoKva:parseFloat(this.value)||0})"/></div>
        <div class="dimelec-fg"><label>Z% trafo</label><input type="number" value="${S.trafoZ}" min="0" max="10" step="0.5" oninput="DimelecApp.setState({trafoZ:parseFloat(this.value)||0})"/></div>
        <div class="dimelec-fg"><label>R% trafo</label><input type="number" value="${S.trafoR}" min="0" max="5" step="0.1" oninput="DimelecApp.setState({trafoR:parseFloat(this.value)||0})"/></div>
        <div class="dimelec-fg"><label>Icc disponible (kA, 0=omitir)</label><input type="number" value="${S.iccKa}" min="0" max="200" step="0.5" oninput="DimelecApp.setState({iccKa:parseFloat(this.value)||0})"/></div>
        <div class="dimelec-fg"><label>Tiempo despeje t_cc (s)</label><input type="number" value="${S.tDesp}" min="0.02" max="5" step="0.02" oninput="DimelecApp.setState({tDesp:parseFloat(this.value)||0.1})"/></div>
        <div class="dimelec-fg"><label>Curva protección</label>
          <select onchange="DimelecApp.setState({curva:this.value})">
            <option value="B"${S.curva==='B'?' selected':''}>Curva B (3–5×In)</option>
            <option value="C"${S.curva==='C'?' selected':''}>Curva C (5–10×In)</option>
            <option value="D"${S.curva==='D'?' selected':''}>Curva D (10–20×In)</option>
          </select></div>
      </div>
      <div class="dimelec-sep"></div>
      <div class="dimelec-card-title">Selectividad (protección aguas arriba)</div>
      <div class="dimelec-form-grid">
        <div class="dimelec-fg"><label>In aguas arriba (A, 0=omitir)</label><input type="number" value="${S.protUpA||0}" min="0" step="5" oninput="DimelecApp.setState({protUpA:parseFloat(this.value)||null})"/></div>
        <div class="dimelec-fg"><label>t despeje aguas arriba (s)</label><input type="number" value="${S.tUp}" min="0.05" max="5" step="0.05" oninput="DimelecApp.setState({tUp:parseFloat(this.value)||0.2})"/></div>
      </div>
      <div class="dimelec-sep"></div>
      <div class="dimelec-card-title">Empresa y profesional</div>
      <div class="dimelec-form-grid">
        <div class="dimelec-fg dimelec-full"><label>Empresa / Proyecto</label><input type="text" value="${S.empresa}" oninput="DimelecApp.setState({empresa:this.value})" placeholder="Nombre empresa o proyecto"/></div>
        <div class="dimelec-fg"><label>Profesional responsable</label><input type="text" value="${S.profesional}" oninput="DimelecApp.setState({profesional:this.value})" placeholder="Ing. Nombre Apellido"/></div>
        <div class="dimelec-fg"><label>Matrícula profesional</label><input type="text" value="${S.matricula}" oninput="DimelecApp.setState({matricula:this.value})" placeholder="CON-XXXXX"/></div>
      </div>
      <div class="dimelec-check-wrap">
        <input type="checkbox" id="dimelec-debug-chk" ${S.debug?'checked':''} onchange="DimelecApp.setState({debug:this.checked})"/>
        <label for="dimelec-debug-chk">Modo debug técnico (ecuaciones, factores, JSON completo)</label>
      </div>
      <div class="dimelec-actions">
        <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
        <button class="dimelec-btn primary" onclick="DimelecApp.calcular()">⚡ Calcular</button>
      </div>
    </div>`;
  }

  // ── PASO 5 — Resultados ──────────────────────────────────────
  function step5() {
    const S = DimelecApp.getState();
    if (!S.resultado) return `<div class="dimelec-loading"><div class="dimelec-spinner"></div>Sin cálculo. Vuelve al paso 4 y presiona Calcular.</div>`;
    if (S.resultado.error) return `<div class="dimelec-err-box">⚠ ${S.resultado.msg}</div>`;
    const r = S.resultado.resumen;
    const cond = S.resultado.conductor || {};
    const prot = S.resultado.proteccion || {};
    const cc   = S.resultado.cortocircuito;
    const cum  = S.resultado.cumplimiento || {};
    const reg  = cond.reg || {};
    const ok   = r.cumple;

    const checks = (cum.detalle||[]).map(d => `
      <div class="dimelec-chk-row">
        <span>${d.criterio}</span>
        <span class="dimelec-badge-${d.cumple?'ok':'fail'}">${d.cumple?'✔ Cumple':'✘ No cumple'}${!d.cumple&&d.recomendacion?` — ${d.recomendacion}`:''}</span>
      </div>`).join('');

    return `
    <div class="dimelec-sec-title">Resultados del dimensionamiento</div>
    <div class="dimelec-sec-sub"><span class="dimelec-tag dimelec-tag-bt">BT</span> ${DimelecStandards.getCountry(S.pais).std}</div>
    <div class="${ok?'dimelec-result-ok':'dimelec-result-fail'}">
      ${ok?'✔':'✘'} <div><strong>${ok?'Circuito dimensionado correctamente':'No cumple todos los criterios'}</strong><br>
      <span style="font-size:12px;font-weight:400">${ok?`Conductor ${r.conductor} cumple ampacidad y regulación (${r.caida_pct}% ≤ ${r.limite_pct}%)`:
      `${cum.n_fallidos} criterio(s) fallaron. Ver detalle abajo.`}</span></div>
    </div>
    <div class="dimelec-metrics">
      <div class="dimelec-metric"><div class="dimelec-metric-label">P. demanda</div><div class="dimelec-metric-value">${r.potencia_demanda_kw}</div><div class="dimelec-metric-unit">kW</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">kVA demanda</div><div class="dimelec-metric-value">${r.kva_demanda}</div><div class="dimelec-metric-unit">kVA</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">I diseño</div><div class="dimelec-metric-value">${r.corriente_diseno_a}</div><div class="dimelec-metric-unit">A</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">FP promedio</div><div class="dimelec-metric-value">${r.fp_promedio}</div><div class="dimelec-metric-unit">cos(φ)</div></div>
    </div>
    <div class="dimelec-metrics">
      <div class="dimelec-metric"><div class="dimelec-metric-label">Conductor</div><div class="dimelec-metric-value" style="font-size:16px">${r.conductor||'—'}</div><div class="dimelec-metric-unit">${r.seccion_mm2} mm²</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">Ampacidad corr.</div><div class="dimelec-metric-value">${r.ampacidad_corr_a}</div><div class="dimelec-metric-unit">A</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">Caída ΔV</div><div class="dimelec-metric-value" style="color:${parseFloat(r.caida_pct||100)<=r.limite_pct?'var(--dimelec-green2)':'var(--dimelec-red2)'}">${r.caida_pct}</div><div class="dimelec-metric-unit">% (lím. ${r.limite_pct}%)</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">Protección</div><div class="dimelec-metric-value">${r.proteccion_a||'—'}</div><div class="dimelec-metric-unit">A — ${r.tipo_proteccion||''}</div></div>
    </div>
    <div class="dimelec-metrics">
      <div class="dimelec-metric"><div class="dimelec-metric-label">Pérdidas</div><div class="dimelec-metric-value">${r.perdidas_kw}</div><div class="dimelec-metric-unit">kW</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">Tierra EGC</div><div class="dimelec-metric-value" style="font-size:14px">${r.tierra_calibre||'—'}</div><div class="dimelec-metric-unit">NEC 250.122</div></div>
      <div class="dimelec-metric"><div class="dimelec-metric-label">I neutro</div><div class="dimelec-metric-value">${r.corriente_neutro_a}</div><div class="dimelec-metric-unit">A</div></div>
    </div>
    <div class="dimelec-card" style="margin-top:.5rem">
      <div class="dimelec-card-title">Verificación técnica</div>
      <div class="dimelec-chk-list">${checks}</div>
    </div>
    ${S.debug?`<div class="dimelec-card"><div class="dimelec-card-title">🐛 Debug</div><div class="dimelec-debug">${JSON.stringify(S.resultado,null,2).replace(/</g,'&lt;')}</div></div>`:''}
    <div class="dimelec-adv">⚠ Resultados preliminares. Validar con profesional habilitado conforme a normativa vigente.</div>
    <div class="dimelec-actions">
      <button class="dimelec-btn" onclick="DimelecApp.goStep(3)">← Editar cargas</button>
      <button class="dimelec-btn primary" onclick="DimelecApp.next()">Ver gráficas →</button>
    </div>`;
  }

  // ── PASO 6 — Gráficas ────────────────────────────────────────
  function step6() {
    const S = DimelecApp.getState();
    if (!S.resultado || S.resultado.error) return `<div class="dimelec-loading">Primero calcula (paso 4).</div>`;
    setTimeout(() => {
      const r = S.resultado;
      const cond = r.conductor || {};
      DimelecCharts.renderDvCurve('dimelec-chart-dv', r.curva_dv, r.resumen?.limite_pct||5, cond.cal||'');
      if (r.perfil_tension?.length) DimelecCharts.renderVoltageProfile('dimelec-chart-profile', r.perfil_tension);
      if (cond.evals?.length) DimelecCharts.renderConductorComparison('dimelec-chart-conds', cond.evals);
      if (r.econ?.comparison?.length) DimelecCharts.renderEconomicComparison('dimelec-chart-econ', r.econ);
    }, 100);
    return `
    <div class="dimelec-sec-title">Gráficas técnicas</div>
    <div class="dimelec-chart-wrap"><div class="dimelec-chart-title">Caída de tensión ΔV% vs Longitud (m)</div><canvas id="dimelec-chart-dv" height="220"></canvas></div>
    <div class="dimelec-chart-wrap"><div class="dimelec-chart-title">Perfil de tensión V(pu) vs Longitud</div><canvas id="dimelec-chart-profile" height="220"></canvas></div>
    <div class="dimelec-chart-wrap"><div class="dimelec-chart-title">Comparación de conductores evaluados</div><canvas id="dimelec-chart-conds" height="220"></canvas></div>
    <div class="dimelec-chart-wrap"><div class="dimelec-chart-title">Análisis económico — Costo ciclo de vida (USD)</div><canvas id="dimelec-chart-econ" height="220"></canvas></div>
    <div class="dimelec-actions">
      <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
      <button class="dimelec-btn primary" onclick="DimelecApp.next()">Trazabilidad →</button>
    </div>`;
  }

  // ── PASO 7 — Trazabilidad ────────────────────────────────────
  function step7() {
    const S = DimelecApp.getState();
    if (!S.resultado || S.resultado.error) return `<div class="dimelec-loading">Primero calcula.</div>`;
    const r = S.resultado;
    const cond = r.conductor || {}; const tr = cond.trace || {};
    const trc  = r.trazabilidad_cargas || {}; const cc = r.cortocircuito || {};
    const icc  = r.icc || {}; const sel = r.selectividad;
    const prot = r.proteccion || {};
    return `
    <div class="dimelec-sec-title">Trazabilidad matemática</div>
    <div class="dimelec-sec-sub">Ecuaciones, normas y factores aplicados en cada módulo.</div>
    <div class="dimelec-card"><div class="dimelec-card-title">Módulo 1 — Cálculo de cargas</div>
      <div class="dimelec-eq">${trc.eq||'—'}</div>
      <div class="dimelec-eq">${trc.fpEq||'—'}</div>
      <div class="dimelec-eq">${trc.neutroEq||'—'}</div>
      <div style="font-size:12px;color:var(--dimelec-text2)">Norma: <strong>${trc.norma||'—'}</strong></div>
    </div>
    <div class="dimelec-card"><div class="dimelec-card-title">Módulo 2 — Ampacidad del conductor</div>
      <div class="dimelec-eq">${tr.ampEq||'—'}</div>
      ${(tr.factors||[]).map(f=>`<div class="dimelec-eq">${f.n}: ${f.src}</div>`).join('')}
    </div>
    <div class="dimelec-card"><div class="dimelec-card-title">Módulo 3 — Regulación de tensión (R+X)</div>
      <div class="dimelec-eq">${tr.regEq||'—'}</div>
      <div style="font-size:12px;color:var(--dimelec-text2)">Norma: <strong>${tr.normaReg||'—'}</strong></div>
    </div>
    ${cc.trace?`<div class="dimelec-card"><div class="dimelec-card-title">Módulo 4 — CC térmico</div>
      <div class="dimelec-eq">${cc.trace.eq||'—'}</div>
      <div style="font-size:12px;color:var(--dimelec-text2)">Tabla: ${cc.trace.tabla||'—'} | Norma: <strong>${cc.trace.norma||'—'}</strong></div>
      <div style="font-size:13px;margin-top:.5rem">Resultado: <span class="dimelec-badge-${cc.ok?'ok':'fail'}">${cc.ok?'✔ Cumple':'✘ No cumple'}</span>${!cc.ok?`<br><em style="font-size:12px;color:var(--dimelec-amber2)">${cc.rec||''}</em>`:''}</div>
    </div>`:''}
    ${icc.trace?`<div class="dimelec-card"><div class="dimelec-card-title">Módulo 5 — Cortocircuito IEC 60909</div>
      <div class="dimelec-eq">${icc.trace.eq_max||'—'}</div>
      <div class="dimelec-eq">${icc.trace.eq_min||'—'}</div>
      <div class="dimelec-metrics">
        <div class="dimelec-metric"><div class="dimelec-metric-label">Icc máx</div><div class="dimelec-metric-value">${icc.icc_max_ka}</div><div class="dimelec-metric-unit">kA</div></div>
        <div class="dimelec-metric"><div class="dimelec-metric-label">Icc mín</div><div class="dimelec-metric-value">${icc.icc_min_ka}</div><div class="dimelec-metric-unit">kA</div></div>
        <div class="dimelec-metric"><div class="dimelec-metric-label">X/R</div><div class="dimelec-metric-value">${icc.xr}</div><div class="dimelec-metric-unit">—</div></div>
      </div>
    </div>`:''}
    ${prot.trace?`<div class="dimelec-card"><div class="dimelec-card-title">Módulo 6 — Protección eléctrica</div>
      <div class="dimelec-eq">${prot.validacion||'—'}</div>
      <div class="dimelec-eq">${prot.validacion_icu||'—'}</div>
      <div style="font-size:12px;color:var(--dimelec-text2)">Norma: <strong>${prot.trace.norma||'—'}</strong></div>
    </div>`:''}
    ${sel?`<div class="dimelec-card"><div class="dimelec-card-title">Módulo 7 — Selectividad</div>
      <div class="dimelec-eq">Nivel: ${sel.level} | In_arriba=${sel.In_u}A | In_abajo=${sel.In_d}A | Ratio=${sel.ratio}</div>
      <div style="font-size:12px;color:var(--dimelec-text2)">Norma: <strong>${sel.trace?.norma||'—'}</strong></div>
      ${sel.rec?`<div class="dimelec-warn-box">⚠ ${sel.rec}</div>`:''}
    </div>`:''}
    <div class="dimelec-actions">
      <button class="dimelec-btn" onclick="DimelecApp.prev()">← Atrás</button>
      <button class="dimelec-btn primary" onclick="DimelecApp.next()">Memoria →</button>
    </div>`;
  }

  // ── PASO 8 — Memoria / Exportar ──────────────────────────────
  function step8() {
    const S = DimelecApp.getState();
    if (!S.resultado) return `<div class="dimelec-loading">Primero calcula.</div>`;
    const r  = S.resultado.resumen || {};
    const cn = DimelecStandards.getAllCountries()[S.pais] || {};
    const payload = DimelecApp.buildPayload();
    return `
    <div class="dimelec-sec-title">Memoria de cálculo y exportación</div>
    <div class="dimelec-sec-sub">Genera la memoria técnica DOCX y exporta datos.</div>
    <div class="dimelec-card">
      <div class="dimelec-card-title">Resumen ejecutivo</div>
      <table class="dimelec-kv-table">
        ${[['País / Normativa',`${cn.name||S.pais} — ${cn.std||S.norm}`],['Sistema',`${S.nivel} — ${S.system} ${S.voltageV}V`],['Longitud',`${S.lengthM} m`],['Corriente diseño',`${r.corriente_diseno_a} A`],['Conductor',`${r.conductor||'—'} (${r.seccion_mm2} mm²)`],['Factores',`Ft×Fa=${S.resultado.conductor?.Ftotal||'—'}`],['Caída ΔV',`${r.caida_pct}% / límite ${r.limite_pct}%`],['Protección',`${r.proteccion_a||'—'} A — ${r.tipo_proteccion||''}`],['Tierra EGC',`${r.tierra_calibre||'—'}`],['Pérdidas',`${r.perdidas_kw} kW`],['Resultado',`${r.cumple?'✔ CUMPLE':'✘ NO CUMPLE'}`]].map(([l,v])=>`<tr><td>${l}</td><td style="color:var(--dimelec-text)">${v}</td></tr>`).join('')}
      </table>
    </div>
    <div class="dimelec-card">
      <div class="dimelec-card-title">Exportar</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        <button class="dimelec-btn success" onclick="DimelecBackend.generarMemoriaBT(DimelecApp.buildPayload()).catch(e=>DimelecModals.showError('Backend no disponible.<br>'+e.message))">📄 Memoria DOCX (backend)</button>
        <button class="dimelec-btn" onclick="DimelecExports.exportPayloadJSON(DimelecApp.buildPayload(),DimelecApp.getState().pais)">⬇ JSON payload</button>
        <button class="dimelec-btn" onclick="DimelecExports.exportResultJSON(DimelecApp.getState().resultado,DimelecApp.getState().pais)">⬇ JSON resultado</button>
        <button class="dimelec-btn" onclick="DimelecExports.exportLoadsCSV(DimelecApp.getState().loads,DimelecApp.getState().pais)">⬇ CSV cargas</button>
        <button class="dimelec-btn warning" onclick="DimelecExports.exportXLSX()">⬇ XLSX — PENDIENTE</button>
        <button class="dimelec-btn warning" onclick="DimelecExports.exportPDF()">⬇ PDF — PENDIENTE</button>
        <button class="dimelec-btn" onclick="DimelecApp.goStep(0);DimelecApp.getState().resultado=null">🔄 Nuevo cálculo</button>
      </div>
      ${S.debug?`<div class="dimelec-card-title" style="margin-top:1rem">Payload API</div><pre class="dimelec-debug">${JSON.stringify(payload,null,2).replace(/</g,'&lt;')}</pre>`:''}
    </div>
    <div class="dimelec-card">
      <div class="dimelec-card-title">Backend API — DimElec LATAM v5</div>
      <div style="font-family:monospace;font-size:11px;color:var(--dimelec-text2);display:flex;flex-direction:column;gap:3px">
        <span><span style="color:var(--dimelec-green2)">GET</span>  /api/v1/paises</span>
        <span><span style="color:var(--dimelec-amber2)">POST</span> /api/v1/dimensionar-bt</span>
        <span><span style="color:var(--dimelec-amber2)">POST</span> /api/v1/dimensionar-mt</span>
        <span><span style="color:var(--dimelec-amber2)">POST</span> /api/v1/generar-memoria-bt → .docx</span>
        <span><span style="color:var(--dimelec-amber2)">POST</span> /api/v1/generar-memoria-mt → .docx</span>
      </div>
      <div style="margin-top:.5rem;font-size:11px;color:var(--dimelec-text3)">URL: <code>${DimelecBackend.API_URL}</code> | Configurar: <code>window.VORYN_API_URL</code></div>
    </div>
    <div class="dimelec-adv">ADVERTENCIA: Resultados de ayuda técnica preliminar. La validación final debe realizarse por un Ingeniero Electricista habilitado conforme a normativa vigente del país y requerimientos del operador de red.</div>`;
  }

  return { render, updateSidebar, showLoading, renderStep };

})();

if (typeof module !== 'undefined') module.exports = DimelecUI;
