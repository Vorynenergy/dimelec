/**
 * dimelec_validations.js
 * DimElec LATAM — Motor de validación y cumplimiento global
 * REGLA CRÍTICA: cumple_global = ALL(criterios individuales)
 * Ningún fallo se oculta — se reporta causa + recomendación
 */

'use strict';

const DimelecValidations = (() => {

  /**
   * Evalúa cumplimiento global estricto.
   * cumple_global = true SOLO si TODOS los criterios pasan.
   */
  function evalGlobal(criterios) {
    const fallidos = criterios.filter(c => !c.cumple);
    const ok = fallidos.length === 0;
    return {
      cumple_global: ok,
      estado: ok ? 'CUMPLE' : 'NO CUMPLE',
      n_criterios: criterios.length,
      n_fallidos: fallidos.length,
      detalle: criterios.map(c => ({
        criterio: c.nombre,
        cumple:   c.cumple,
        valor:    c.valor,
        limite:   c.limite,
        ecuacion: c.ecuacion || '',
        norma:    c.norma || '',
        recomendacion: !c.cumple ? c.rec : null,
      })),
      causas_fallo: fallidos.map(c => ({
        criterio: c.nombre,
        causa:    `${c.valor} no cumple límite ${c.limite}`,
        recomendacion: c.rec,
      })),
    };
  }

  /** Construye criterios de validación BT y evalúa */
  function validarBT(loadRes, condRes, protRes, ccRes, tierraRes, rules) {
    const reg = condRes?.reg || {};
    const criterios = [
      {
        nombre: 'Ampacidad — Iz ≥ Ib',
        cumple: !!condRes?.ok,
        valor:  `Iz=${condRes?.ampCorr??'?'}A`,
        limite: `Ib=${loadRes?.Idis??'?'}A`,
        ecuacion: condRes?.trace?.ampEq || '',
        norma:    'NEC 310.15 / IEC 60364-5-52',
        rec: 'Seleccionar conductor de mayor calibre o aumentar tensión nominal.',
      },
      {
        nombre: 'Regulación de tensión — ΔV ≤ límite',
        cumple: parseFloat(reg.pct??100) <= parseFloat(reg.lim??5),
        valor:  `ΔV=${reg.pct??'?'}%`,
        limite: `${reg.lim??'?'}%`,
        ecuacion: condRes?.trace?.regEq || '',
        norma:    'RETIE / NEC / IEC 60364',
        rec: 'Aumentar calibre del conductor, reducir longitud o elevar tensión.',
      },
      {
        nombre: 'Protección — Ib ≤ In ≤ Iz',
        cumple: !!(protRes?.ok && protRes?.cumIz),
        valor:  `In=${protRes?.prot_a??'?'}A`,
        limite: protRes?.validacion || '?',
        ecuacion: 'Ib ≤ In ≤ Iz',
        norma:    'NEC 240 / IEC 60364-4-43',
        rec: 'Revisar coordinación de protecciones o aumentar sección del conductor.',
      },
      {
        nombre: 'Capacidad interruptiva — Icu ≥ Icc_max',
        cumple: protRes?.cumIcu !== false,
        valor:  `Icu=${protRes?.icu??'?'}kA`,
        limite: protRes?.validacion_icu || 'N/D',
        ecuacion: 'Icu ≥ Icc_max',
        norma:    'IEC 60947-2',
        rec: `Seleccionar interruptor con Icu ≥ ${protRes?.icc_max_ka??'?'} kA.`,
      },
    ];

    if (ccRes) {
      criterios.push({
        nombre: 'CC térmico — S ≥ S_min',
        cumple: !!ccRes.ok,
        valor:  `S=${ccRes.s_inst??'?'}mm²`,
        limite: `S_min=${ccRes.s_min??'?'}mm²`,
        ecuacion: ccRes.trace?.eq || '',
        norma:    'IEC 60364-5-54 Tabla 54.2',
        rec: ccRes.rec || 'Aumentar sección del conductor.',
      });
    }

    return evalGlobal(criterios);
  }

  /** Construye criterios de validación MT y evalúa */
  function validarMT(condRes, ccRes, rules) {
    const reg = condRes?.reg || {};
    const criterios = [
      {
        nombre: 'Ampacidad MT — Iz ≥ I_nom',
        cumple: !!condRes?.ok,
        valor:  `Iz=${condRes?.ampBase??'?'}A`,
        limite: `I_nom=${condRes?.Inom??'?'}A`,
        ecuacion: condRes?.trace?.eq_I || '',
        norma:    'IEC 60502-2 / IEC 60287',
        rec: 'Seleccionar conductor de mayor sección o cables en paralelo.',
      },
      {
        nombre: 'Nivel de tensión del cable — vmax ≥ V_sistema',
        cumple: parseFloat(condRes?.vmax_kv??0) >= parseFloat(rules.vKv??0),
        valor:  `vmax=${condRes?.vmax_kv??'?'}kV`,
        limite: `V_sistema=${rules.vKv??'?'}kV`,
        ecuacion: 'IEC 60502-2 Tabla 1 — nivel tensión nominal del cable',
        norma:    'IEC 60502-2',
        rec: 'Seleccionar cable de nivel de tensión superior (ej: XLPE 36kV para sistemas 23–33kV).',
      },
      {
        nombre: 'Regulación MT — ΔV ≤ límite',
        cumple: parseFloat(reg.pct??100) <= parseFloat(reg.limite??5),
        valor:  `ΔV=${reg.pct??'?'}%`,
        limite: `${reg.limite??5}%`,
        ecuacion: condRes?.trace?.eq_dv || '',
        norma:    'IEC 60364 / RETIE',
        rec: 'Aumentar sección del conductor o reducir longitud del alimentador.',
      },
    ];

    if (ccRes) {
      criterios.push({
        nombre: 'CC térmico MT — S ≥ S_min',
        cumple: !!ccRes.ok,
        valor:  `S=${ccRes.s_inst??'?'}mm²`,
        limite: `S_min=${ccRes.s_min??'?'}mm²`,
        ecuacion: ccRes.trace?.eq || '',
        norma:    'IEC 60364-5-54',
        rec: ccRes.rec || 'Aumentar sección del conductor.',
      });
    }

    return evalGlobal(criterios);
  }

  /** Mapa de recomendaciones según tipo de fallo */
  const REC_MAP = {
    'ampacidad':     'Aumentar calibre del conductor o reducir número de circuitos agrupados.',
    'regulacion':    'Aumentar calibre del conductor, reducir longitud o elevar tensión.',
    'proteccion':    'Verificar coordinación: In ≤ Iz. Puede requerir mayor sección.',
    'icu':           'Seleccionar interruptor con mayor capacidad interruptiva (Icu).',
    'cc_termico':    'Aumentar sección del conductor o instalar limitador de corriente.',
    'nivel_tension': 'Utilizar cable certificado para el nivel de tensión del sistema.',
  };

  return { evalGlobal, validarBT, validarMT, REC_MAP };

})();

if (typeof module !== 'undefined') module.exports = DimelecValidations;
