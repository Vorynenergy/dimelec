/**
 * dimelec_app.js
 * DimElec LATAM — Orquestador principal
 * Maneja estado global, flujo de pasos y coordinación de módulos
 */

'use strict';

const DimelecApp = (() => {

  // ── ESTADO GLOBAL ─────────────────────────────────────────────
  let state = {
    step: 0,
    pais: 'CO', norm: 'RETIE 2024 / NTC 2050',
    tipoInst: 'industrial', tipoCir: 'alimentador',
    nivel: 'BT', system: 'trifasico', voltageV: 480, lengthM: 120,
    mat: 'cobre', unit: 'AWG', tAmb: 35, nCirc: 3,
    method: 'tuberia', tOper: 55, reserva: 0,
    curva: 'D', thd: 0,
    iccKa: 0, tDesp: 0.05,
    trafoKva: 500, trafoZ: 5.0, trafoR: 0.8,
    protUpA: null, tUp: 0.2,
    empresa: '', profesional: '', matricula: '',
    debug: false,
    loads: [
      {nombre:'Motor bomba',  tipo:'motor',      kw:22,  fp:0.85,ef:0.93,cant:1,fd:1,  fs:1,  cont:true},
      {nombre:'Iluminación',  tipo:'iluminacion',kw:4,   fp:0.95,ef:1,   cant:1,fd:0.9,fs:1,  cont:true},
    ],
    resultado: null,
  };

  // ── ACCESO AL ESTADO ─────────────────────────────────────────
  function getState()        { return state; }
  function setState(updates) { Object.assign(state, updates); }
  function getStep()         { return state.step; }

  function goStep(n) { state.step = n; DimelecUI.render(); }
  function next()    { if (state.step < 8) { state.step++; DimelecUI.render(); } }
  function prev()    { if (state.step > 0) { state.step--; DimelecUI.render(); } }

  // ── CÁLCULO PRINCIPAL ─────────────────────────────────────────
  async function calcular() {
    DimelecUI.showLoading('Calculando...');
    state.step = 5;
    DimelecUI.updateSidebar();

    const payload = buildPayload();

    // Intentar backend primero
    const online = await DimelecBackend.checkHealth();
    if (online) {
      try {
        state.resultado = await DimelecBackend.dimensionarBT(payload);
        DimelecUI.render();
        return;
      } catch (err) {
        console.warn('[DimElec] Backend error, fallback local:', err.message);
      }
    }

    // Fallback — cálculo local
    state.resultado = calcularLocal();
    DimelecUI.render();
  }

  function calcularLocal() {
    const S     = state;
    const rules = DimelecStandards.getCountry(S.pais);

    // 1. Cargas
    const cr = DimelecCalc.calcLoads(S.loads, S.system, S.voltageV, {fm: rules.fm}, S.thd);
    S.fpProm = cr.fpProm;

    // 2. Conductor BT
    const condParams = {
      unit: S.unit, mat: S.mat, tAmb: S.tAmb, nCirc: S.nCirc,
      system: S.system, lengthM: S.lengthM, voltageV: S.voltageV,
      fp: cr.fpProm, circuitType: S.tipoCir, tOper: S.tOper, method: S.method,
    };
    const cond = DimelecConductorSelection.selectBT(cr.Idis, condParams, rules, cr.fArmAmpcity);

    if (!cond.ok) {
      return { error: true, msg: cond.msg, detalle_cargas: cr.detail };
    }

    // 3. ICC
    let iccInfo = null;
    if (S.trafoKva > 0 && S.trafoZ > 0) {
      iccInfo = DimelecCalc.calcIccBT(S.trafoKva, S.trafoZ, S.trafoR, S.voltageV, S.lengthM, cond.r75, cond.x);
    }
    const iccMax = iccInfo?.icc_max_ka || (S.iccKa > 0 ? S.iccKa : null);

    // 4. Protección
    const prot = DimelecConductorSelection.selectProtection(
      cr.Idis, cond.ampCorr, S.unit,
      cr.hasMotor ? 'motor' : 'general', S.curva, iccMax
    );

    // 5. CC térmico
    const tDesp = S.tDesp || prot.t_desp || 0.1;
    const cc = iccMax ? DimelecCalc.calcThermalCC(cond.s, S.mat, cond.ais, iccMax, tDesp) : null;

    // 6. Tierra / neutro
    const tierra = DimelecStandards.minGroundConductor(prot.prot_a || 50, S.mat, S.unit);

    // 7. Perfil tensión + curva ΔV
    const perfil  = DimelecCalc.voltageProfile(cr.Idis, S.system, S.voltageV, cr.fpProm, cond.rCorr, cond.x, S.lengthM);
    const curvaDv = DimelecCalc.dvCurve(cr.Idis, S.system, S.voltageV, cr.fpProm, cond.rCorr, cond.x);

    // 8. Selectividad
    const sel = S.protUpA ? DimelecCalc.evalSelectivity(
      { prot_a: prot.prot_a, t_s: prot.t_desp },
      { prot_a: S.protUpA,   t_s: S.tUp }
    ) : null;

    // 9. Análisis económico
    const btCands = (S.unit==='AWG'
      ? DimelecConductorSelection._tables.BT_AWG
      : DimelecConductorSelection._tables.BT_MM2
    ).filter(c=>c.mat===S.mat);
    const econ = DimelecCalc.economicAnalysis(btCands, cr.Idis, S.lengthM, null);

    // 10. Validación global
    const cum = DimelecValidations.validarBT(
      { Idis: cr.Idis },
      { ok: cond.ok, ampCorr: cond.ampCorr, trace: cond.trace,
        reg: { pct: cond.reg?.pct, lim: cond.reg?.lim } },
      { ok: prot.ok, cumIz: prot.cumIz, cumIcu: prot.cumIcu,
        prot_a: prot.prot_a, icu: prot.icu, icc_max_ka: iccMax,
        validacion: prot.validacion, validacion_icu: prot.validacion_icu },
      cc, tierra, rules
    );

    const lim = S.tipoCir==='terminal' ? rules.dvT : rules.dvF;

    return {
      resumen: {
        potencia_instalada_kw:  cr.potInst,
        potencia_demanda_kw:    cr.potDem,
        potencia_reactiva_kvar: cr.kvar,
        kva_demanda:            cr.kva,
        fp_promedio:            cr.fpProm,
        corriente_nominal_a:    cr.Inom,
        corriente_diseno_a:     cr.Idis,
        corriente_neutro_a:     cr.Ineutro,
        conductor:              cond.cal,
        seccion_mm2:            cond.s,
        ampacidad_corr_a:       cond.ampCorr,
        caida_pct:              cond.reg?.pct,
        dv_v:                   cond.reg?.dv_v,
        limite_pct:             lim,
        proteccion_a:           prot.prot_a,
        tipo_proteccion:        prot.tipo,
        perdidas_kw:            cond.loss?.kw,
        tierra_calibre:         tierra.calibre,
        cumple:                 cum.cumple_global,
        estado:                 cum.estado,
      },
      detalle_cargas:    cr.detail,
      trazabilidad_cargas: cr.trace,
      conductor:         cond,
      proteccion:        prot,
      cortocircuito:     cc,
      icc:               iccInfo,
      tierra_neutro:     { tierra, neutro: { corriente_a: cr.Ineutro, thd: S.thd } },
      perfil_tension:    perfil,
      curva_dv:          curvaDv,
      selectividad:      sel,
      econ:              econ,
      cumplimiento:      cum,
      pais_info:         rules,
      recomendaciones:   _buildRecs(cum, rules, lim, S.tipoCir),
    };
  }

  function _buildRecs(cum, rules, lim, tipoCir) {
    const recs = [
      `Normativa aplicada: ${rules.std}.`,
      `Límite ΔV: ${lim}% (${tipoCir}).`,
      'Verificar condiciones reales de instalación.',
      'Memoria debe ser firmada por profesional habilitado.',
    ];
    for (const f of cum.causas_fallo || []) {
      recs.push(`⚠ ${f.criterio}: ${f.recomendacion}`);
    }
    return recs;
  }

  function buildPayload() {
    const S = state;
    return {
      pais: S.pais, normativa: S.norm,
      tipo_instalacion: S.tipoInst, tipo_circuito: S.tipoCir,
      nivel_tension: S.nivel, sistema: S.system,
      tension_v: S.voltageV, longitud_m: S.lengthM,
      material_conductor: S.mat, temperatura_ambiente: S.tAmb,
      temp_operacion_cond_C: S.tOper,
      numero_circuitos_agrupados: S.nCirc,
      metodo_instalacion: S.method,
      unidad_conductor: S.unit,
      reserva_pct: S.reserva, curva_proteccion: S.curva,
      icc_disponible_ka: S.iccKa > 0 ? S.iccKa : null,
      t_despeje_s: S.tDesp,
      trafo_kva: S.trafoKva > 0 ? S.trafoKva : null,
      trafo_z_pct: S.trafoZ > 0 ? S.trafoZ : null,
      trafo_r_pct: S.trafoR > 0 ? S.trafoR : null,
      thd_pct: S.thd,
      prot_aguas_arriba_a: S.protUpA || null,
      t_aguas_arriba_s: S.tUp,
      cargas: S.loads.map(c => ({
        nombre:c.nombre, tipo:c.tipo, potencia_kw:c.kw,
        fp:c.fp, eficiencia:c.ef, cantidad:c.cant,
        factor_demanda:c.fd, factor_simultaneidad:c.fs, carga_continua:c.cont,
      })),
      empresa: {
        nombre:      S.empresa      || 'Proyecto',
        profesional: S.profesional  || '__________',
        matricula:   S.matricula    || '__________',
      },
      modo_debug: S.debug,
    };
  }

  function cargarEjemplo(tipo) {
    if (tipo === 'motor') {
      state.loads = [
        {nombre:'Motor bomba 1', tipo:'motor',      kw:22,  fp:0.85,ef:0.93,cant:1,fd:1,  fs:1,  cont:true},
        {nombre:'Motor ventilador',tipo:'motor',    kw:7.5, fp:0.85,ef:0.91,cant:2,fd:0.8,fs:0.9,cont:false},
        {nombre:'Iluminación planta',tipo:'iluminacion',kw:4,fp:0.95,ef:1,cant:1,fd:0.9,fs:1,cont:true},
      ];
      Object.assign(state, {system:'trifasico',voltageV:480,lengthM:120,mat:'cobre',unit:'AWG',tAmb:35,nCirc:3,trafoKva:500,trafoZ:5,trafoR:0.8});
    } else if (tipo === 'comercial') {
      state.loads = [
        {nombre:'Iluminación',tipo:'iluminacion',kw:5, fp:0.95,ef:1,   cant:1,fd:0.9,fs:1,  cont:true},
        {nombre:'Tomas',       tipo:'tomas',       kw:8, fp:0.85,ef:1,   cant:1,fd:0.7,fs:0.8,cont:false},
        {nombre:'Climatización',tipo:'especial',   kw:6, fp:0.85,ef:0.9, cant:2,fd:0.8,fs:0.7,cont:false},
      ];
      Object.assign(state, {system:'trifasico',voltageV:208,lengthM:45,mat:'cobre',unit:'AWG',tAmb:30,nCirc:2,trafoKva:150,trafoZ:4,trafoR:1});
    } else if (tipo === 'vivienda') {
      state.loads = [
        {nombre:'Cocina',    tipo:'especial',   kw:2,  fp:1,   ef:1,cant:1,fd:0.6,fs:1,cont:false},
        {nombre:'Alumbrado', tipo:'iluminacion',kw:1,  fp:0.95,ef:1,cant:1,fd:0.8,fs:1,cont:true},
        {nombre:'Tomas',     tipo:'tomas',       kw:1.5,fp:0.9, ef:1,cant:1,fd:0.5,fs:1,cont:false},
      ];
      Object.assign(state, {system:'monofasico',voltageV:120,lengthM:25,mat:'cobre',unit:'AWG',tAmb:28,nCirc:1});
    }
    DimelecUI.render();
  }

  return {
    getState, setState, getStep,
    goStep, next, prev,
    calcular, calcularLocal, buildPayload, cargarEjemplo,
  };

})();

if (typeof module !== 'undefined') module.exports = DimelecApp;
