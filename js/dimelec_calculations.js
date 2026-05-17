/**
 * dimelec_calculations.js
 * DimElec LATAM — Motor de cálculo eléctrico BT/MT
 * Corriente, caída de tensión, cortocircuito, pérdidas, reserva futura
 * Trazabilidad completa: ecuación + norma + factores en cada resultado
 */

'use strict';

const DimelecCalc = (() => {

  // ─── CORRIENTE ────────────────────────────────────────────────
  function calcCurrent(kva, system, voltageV) {
    if (voltageV <= 0) return 0;
    const I = system === 'trifasico'
      ? (kva * 1000) / (Math.sqrt(3) * voltageV)
      : (kva * 1000) / voltageV;
    return round(I, 3);
  }

  // ─── CARGAS ───────────────────────────────────────────────────
  function calcLoads(loads, system, voltageV, rules, thdPct = 0) {
    let potInst=0, potDem=0, sumFpW=0, sumW=0, sumKvar=0;
    let hasMotor=false, iMotorMax=0, sumIMotores=0;
    const detail = [];
    const fArm = DimelecStandards.factorHarmonic(thdPct);

    for (const c of loads) {
      const pi  = c.kw * (c.cant || 1);
      const pd  = pi * (c.fd || 1) * (c.fs || 1) / Math.max(c.ef || 1, 0.001);
      const fp  = c.fp || 0.9;
      const kva = pd / Math.max(fp, 0.01);
      const I   = calcCurrent(kva, system, voltageV);
      const kvar = pd * Math.tan(Math.acos(Math.max(fp, 0.01)));

      potInst += pi; potDem += pd; sumFpW += pd*fp; sumW += pd; sumKvar += kvar;

      if (c.tipo === 'motor') {
        hasMotor = true;
        if (I > iMotorMax) iMotorMax = I;
        sumIMotores += I;
      }

      detail.push({
        nombre: c.nombre, tipo: c.tipo,
        pi: round(pi,3), pd: round(pd,3),
        kva: round(kva,3), kvar: round(kvar,3),
        fp, I: round(I,3),
      });
    }

    const fpProm  = sumW > 0 ? sumFpW / sumW : 0.9;
    const kvaTotal = potDem / Math.max(fpProm, 0.01);
    const Inom    = calcCurrent(kvaTotal, system, voltageV);

    // NEC 430.24 — 125% motor mayor + suma resto
    const fm = rules.fm || 1.25;
    let Idis = Inom;
    if (hasMotor) {
      const IOtros = Inom - sumIMotores;
      Idis = iMotorMax * fm + (sumIMotores - iMotorMax) + IOtros;
    }

    const Ineutro = thdPct > 0 ? Inom * fArm.neutral_mult : Inom * 0.6;

    return {
      potInst:  round(potInst, 3),
      potDem:   round(potDem, 3),
      kvar:     round(sumKvar, 3),
      kva:      round(kvaTotal, 3),
      fpProm:   round(fpProm, 4),
      Inom:     round(Inom, 3),
      Idis:     round(Idis, 3),
      Ineutro:  round(Ineutro, 3),
      hasMotor,
      fArmAmpcity: fArm.ampacity_mult,
      detail,
      trace: {
        eq: system==='trifasico'
          ? `I = S/(√3·V) = ${round(kvaTotal,3)}×1000/(1.732×${voltageV}) = ${round(Inom,3)} A`
          : `I = S/V = ${round(kvaTotal,3)}×1000/${voltageV} = ${round(Inom,3)} A`,
        norma: hasMotor ? 'NEC 430.24 — 125% motor mayor + suma resto' : 'NEC 210.19 / IEC 60364',
        fpEq: `FP = ΣP·fp/ΣP = ${round(sumFpW,3)}/${round(sumW,3)} = ${round(fpProm,4)}`,
        neutroEq: `I_neutro = ${round(Ineutro,3)} A (THD=${thdPct}% → mult=${fArm.neutral_mult})`,
      },
    };
  }

  // ─── REGULACIÓN DE TENSIÓN ────────────────────────────────────
  function calcVoltageDrop(Idis, system, voltageV, fp, rAcCorrOhmKm, xOhmKm, lengthM) {
    const cp = Math.max(fp, 0.01);
    const sp = Math.sqrt(Math.max(1 - cp*cp, 0));
    const k  = system === 'trifasico' ? Math.sqrt(3) : 2;
    const rm = rAcCorrOhmKm / 1000;
    const xm = xOhmKm / 1000;
    const zEf = rm*cp + xm*sp;
    const dv   = k * Idis * lengthM * zEf;
    const dvR  = k * rm * cp * Idis * lengthM;
    const dvX  = k * xm * sp * Idis * lengthM;
    const pct  = dv / voltageV * 100;

    return {
      dv_v:  round(dv, 4),
      dv_r:  round(dvR, 4),
      dv_x:  round(dvX, 4),
      pct:   round(pct, 4),
      cosPhi: round(cp, 4),
      sinPhi: round(sp, 4),
      zEf_ohm_m: round(zEf * 1000, 5),
      trace: {
        eq: `ΔV = ${k===Math.sqrt(3)?'√3':'2'}×${round(Idis,3)}×${lengthM}×(${round(rAcCorrOhmKm,5)}/1000×${round(cp,4)}+${xOhmKm}/1000×${round(sp,4)}) = ${round(dv,3)} V`,
        norma: 'IEC 60364 / RETIE / NEC — ΔV = k·I·L·(R·cosφ + X·sinφ)',
      },
    };
  }

  // ─── PÉRDIDAS ELÉCTRICAS ─────────────────────────────────────
  function calcLosses(Idis, rAcCorrOhmKm, lengthM, hoursPerYear = 8760) {
    const r_m = rAcCorrOhmKm / 1000;
    const Pkw = 3 * Idis*Idis * r_m * lengthM / 1000;
    const Ekwh = Pkw * hoursPerYear;
    return {
      kw:   round(Pkw, 4),
      kwh_annual: round(Ekwh, 1),
      mwh_annual: round(Ekwh / 1000, 3),
      trace: {
        eq: `P = 3×${round(Idis,2)}²×${round(rAcCorrOhmKm,5)}/1000×${lengthM} = ${round(Pkw,4)} kW`,
        norma: 'IEC 60287',
      },
    };
  }

  // ─── CORTOCIRCUITO TÉRMICO — IEC 60364-5-54 ──────────────────
  function calcThermalCC(sMm2, material, insulation, iccKa, tDespS) {
    const ki   = DimelecStandards.kCC(material, insulation);
    const k    = ki.k;
    const iccA = iccKa * 1000;
    const sMin = iccA * Math.sqrt(tDespS) / k;
    const ok   = sMm2 >= sMin;
    return {
      ok,
      s_inst:  sMm2,
      s_min:   round(sMin, 2),
      k, T_ini: ki.Ti, T_fin: ki.Tf,
      icc_ka: iccKa, t_s: tDespS,
      rec: ok ? null : `Aumentar sección a ≥${round(sMin*1.1,1)} mm² o instalar limitador de corriente.`,
      trace: {
        eq:    `S_min = ${iccA.toFixed(0)}×√${tDespS}/${k} = ${round(sMin,2)} mm²`,
        norma: 'IEC 60364-5-54 Tabla 54.2',
        tabla: `k=${k} para ${material}/${insulation} (T_ini=${ki.Ti}°C → T_fin=${ki.Tf}°C)`,
      },
    };
  }

  // ─── ICC BT — IEC 60909-0 ────────────────────────────────────
  function calcIccBT(trafoKva, trafoZpct, trafoRpct, vBt, lengthM, rKm, xKm) {
    const S  = trafoKva * 1000; const V = vBt;
    const Zb = V*V / S;
    const Zt = (trafoZpct/100)*Zb;
    const Rt = (trafoRpct/100)*Zb;
    const Xt = Math.sqrt(Math.max(Zt*Zt - Rt*Rt, 0));
    const c  = 1.05;
    const IccMax = c*V / (Math.sqrt(3)*Zt) / 1000;
    const Rc = rKm/1000*lengthM; const Xc = xKm/1000*lengthM;
    const ZtTot = Math.sqrt((Rt+2*Rc)**2 + (Xt+Xc)**2);
    const IccMin = 0.95*V / (Math.sqrt(3)*ZtTot) / 1000;
    return {
      icc_max_ka: round(IccMax, 3),
      icc_min_ka: round(IccMin, 3),
      z_trafo:    round(Zt, 5),
      xr:         round(Xt/Math.max(Rt,0.001), 2),
      trace: {
        eq_max: `I_cc_max = ${c}×${V}/(√3×${round(Zt,5)}) = ${round(IccMax,3)} kA`,
        eq_min: `I_cc_min = 0.95×${V}/(√3×${round(ZtTot,5)}) = ${round(IccMin,3)} kA`,
        norma: 'IEC 60909-0:2016',
      },
    };
  }

  // ─── PERFIL DE TENSIÓN ────────────────────────────────────────
  function voltageProfile(Idis, system, voltageV, fp, rCorrKm, xKm, lengthM, nPoints = 10) {
    const cp=Math.max(fp,0.01); const sp=Math.sqrt(Math.max(1-cp*cp,0));
    const k=system==='trifasico'?Math.sqrt(3):2;
    const rm=rCorrKm/1000; const xm=xKm/1000;
    const profile = [];
    for (let i=0; i<=nPoints; i++) {
      const L  = lengthM * i / nPoints;
      const dv = k * Idis * L * (rm*cp + xm*sp);
      const vPu = (voltageV - dv) / voltageV;
      profile.push({
        L_m:    round(L, 1),
        dv_v:   round(dv, 3),
        v_v:    round(voltageV - dv, 3),
        v_pu:   round(vPu, 4),
        pct:    round(dv/voltageV*100, 3),
      });
    }
    return profile;
  }

  // ─── CURVA ΔV vs LONGITUD ─────────────────────────────────────
  function dvCurve(Idis, system, voltageV, fp, rCorrKm, xKm, maxL = 500, step = 25) {
    const cp=Math.max(fp,0.01); const sp=Math.sqrt(Math.max(1-cp*cp,0));
    const k=system==='trifasico'?Math.sqrt(3):2;
    const rm=rCorrKm/1000; const xm=xKm/1000;
    const pts=[];
    for (let L=0; L<=maxL; L+=step)
      pts.push({ L_m:L, pct: round(k*Idis*L*(rm*cp+xm*sp)/voltageV*100, 4) });
    return pts;
  }

  // ─── ANÁLISIS ECONÓMICO KELVIN / VPN ─────────────────────────
  function economicAnalysis(candidates, Inom, lengthM, prices) {
    const {discount_rate:r, horizon_years:n, energy_usd_kwh:pe,
           install_usd_m:ci, load_factor:fc, density_kg_m3:dens,
           cu_usd_kg:pcu, al_usd_kg:pal} = prices || DimelecStandards.getPrices();
    const pvf = r > 0 ? (1-(1+r)**(-n))/r : n;
    const h = 8760;

    const results = candidates.map(c => {
      const mat  = c.mat || c.material || 'cobre';
      const pm   = mat==='cobre' ? pcu : pal;
      const d    = dens[mat] || 8900;
      const sM2  = c.s * 1e-6;
      const cCond = sM2 * lengthM * 4 * d * pm;
      const cInst = ci * lengthM;
      const Ploss = 3 * Inom*Inom * (c.r_ac || c.r || 0) / 1000 * lengthM * fc*fc;
      const Eanual = Ploss * h / 1000;
      const vpnLoss = Eanual * pe * pvf;
      const total = cCond + cInst + vpnLoss;
      return {
        cal:     c.cal || c.calibre,
        s:       c.s,
        c_cond:  round(cCond,2),
        c_inst:  round(cInst,2),
        ploss_kw:round(Ploss/1000,4),
        kwh_anual:round(Eanual,1),
        vpn_loss:round(vpnLoss,2),
        total:   round(total,2),
      };
    }).sort((a,b)=>a.total-b.total);

    return {
      optimal: results[0],
      comparison: results,
      params: { pvf:round(pvf,3), n, r, pe, fc },
      trace: {
        eq_losses: 'P_loss = 3×I²×R×L×fc²',
        eq_vpn:    `VPN = P_loss_anual×[(1-(1+r)^-n)/r] = C_anual×${round(pvf,3)}`,
        norma: 'IEC 60287-3-2 — Método Kelvin extendido',
      },
    };
  }

  // ─── SELECTIVIDAD ─────────────────────────────────────────────
  function evalSelectivity(protDown, protUp) {
    const In_d = protDown?.prot_a || 0;
    const In_u = protUp?.prot_a || 0;
    const t_d  = protDown?.t_s || 0.1;
    const t_u  = protUp?.t_s  || 0.2;
    const ratio = round(In_u / Math.max(In_d, 1), 2);
    const ok_In = In_u > In_d;
    const ok_t  = t_u >= t_d;
    const level = ratio >= 2.5 ? 'Total' : ratio >= 1.5 ? 'Parcial' : 'Insuficiente';
    return {
      ok: ok_In && ok_t, level, ratio,
      In_d, In_u, t_d, t_u,
      rec: (ok_In && ok_t) ? null :
        `Para selectividad total: In_arriba ≥ 2.5×In_abajo = ${round(In_d*2.5,0)}A. Ratio actual = ${ratio}.`,
      trace: {
        criterio: 'Selectividad: In_arriba > In_abajo y t_arriba > t_abajo',
        norma: 'IEC 60364-4-43 / IEC 60947-2',
      },
    };
  }

  // ─── HELPER ───────────────────────────────────────────────────
  function round(v, d) { return Math.round(v * 10**d) / 10**d; }

  return {
    calcCurrent, calcLoads, calcVoltageDrop, calcLosses,
    calcThermalCC, calcIccBT, voltageProfile, dvCurve,
    economicAnalysis, evalSelectivity,
  };

})();

if (typeof module !== 'undefined') module.exports = DimelecCalc;
