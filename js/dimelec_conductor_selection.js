/**
 * dimelec_conductor_selection.js
 * DimElec LATAM — Selección automática de conductores BT y MT
 *
 * BUG FIXES v1.0.1:
 *   #1 MT: Filtro vmax_kv — XLPE 15kV nunca se usa para 23/33 kV
 *   #2 MT: Emergencia reportada como transitoria (amp≥I_emer×0.8) Y continua (amp≥I_emer)
 *   #3 MT: Si I_nom > amp_max → recomendación de cables en paralelo
 *   #4 MT: Tablas XLPE_36kV y ACSR con vmax_kv correcto (34.5)
 */

'use strict';

const DimelecConductorSelection = (() => {

  // ── TABLAS DE CONDUCTORES ────────────────────────────────────
  // Fuente: NEC 2023 Tabla 310.15(B)(16) / IEC 60502-1 / IEC 60228
  // R_ac a 75°C [Ω/km] — X inductiva [Ω/km] — Ampacidad base a 30°C tubería

  const BT_AWG = [
    {cal:'14 AWG',s:2.08,  mat:'cobre',ais:'THHN',a75:20, r:8.286,x:0.118},
    {cal:'12 AWG',s:3.31,  mat:'cobre',ais:'THHN',a75:25, r:5.211,x:0.113},
    {cal:'10 AWG',s:5.26,  mat:'cobre',ais:'THHN',a75:35, r:3.277,x:0.108},
    {cal:'8 AWG', s:8.37,  mat:'cobre',ais:'THHN',a75:50, r:2.061,x:0.102},
    {cal:'6 AWG', s:13.3,  mat:'cobre',ais:'THHN',a75:65, r:1.296,x:0.095},
    {cal:'4 AWG', s:21.2,  mat:'cobre',ais:'THHN',a75:85, r:0.815,x:0.092},
    {cal:'2 AWG', s:33.6,  mat:'cobre',ais:'THHN',a75:115,r:0.513,x:0.085},
    {cal:'1 AWG', s:42.4,  mat:'cobre',ais:'THHN',a75:130,r:0.406,x:0.083},
    {cal:'1/0 AWG',s:53.5, mat:'cobre',ais:'THHN',a75:150,r:0.322,x:0.082},
    {cal:'2/0 AWG',s:67.4, mat:'cobre',ais:'THHN',a75:175,r:0.255,x:0.079},
    {cal:'3/0 AWG',s:85.0, mat:'cobre',ais:'THHN',a75:200,r:0.202,x:0.077},
    {cal:'4/0 AWG',s:107.2,mat:'cobre',ais:'THHN',a75:230,r:0.161,x:0.074},
    {cal:'250 kcmil',s:126.7,mat:'cobre',ais:'THHN',a75:255,r:0.136,x:0.072},
    {cal:'300 kcmil',s:152.0,mat:'cobre',ais:'THHN',a75:285,r:0.113,x:0.070},
    {cal:'350 kcmil',s:177.3,mat:'cobre',ais:'THHN',a75:310,r:0.098,x:0.068},
    {cal:'400 kcmil',s:202.7,mat:'cobre',ais:'THHN',a75:335,r:0.085,x:0.067},
    {cal:'500 kcmil',s:253.4,mat:'cobre',ais:'THHN',a75:380,r:0.069,x:0.065},
    {cal:'600 kcmil',s:304.0,mat:'cobre',ais:'THHN',a75:420,r:0.057,x:0.063},
    {cal:'750 kcmil',s:380.0,mat:'cobre',ais:'THHN',a75:475,r:0.046,x:0.062},
    {cal:'6 AWG', s:13.3,  mat:'aluminio',ais:'THHN',a75:50, r:2.143,x:0.095},
    {cal:'4 AWG', s:21.2,  mat:'aluminio',ais:'THHN',a75:65, r:1.347,x:0.092},
    {cal:'2 AWG', s:33.6,  mat:'aluminio',ais:'THHN',a75:90, r:0.848,x:0.085},
    {cal:'1/0 AWG',s:53.5, mat:'aluminio',ais:'THHN',a75:120,r:0.532,x:0.082},
    {cal:'2/0 AWG',s:67.4, mat:'aluminio',ais:'THHN',a75:135,r:0.422,x:0.079},
    {cal:'3/0 AWG',s:85.0, mat:'aluminio',ais:'THHN',a75:155,r:0.335,x:0.077},
    {cal:'4/0 AWG',s:107.2,mat:'aluminio',ais:'THHN',a75:180,r:0.266,x:0.074},
    {cal:'250 kcmil',s:126.7,mat:'aluminio',ais:'THHN',a75:205,r:0.225,x:0.072},
    {cal:'350 kcmil',s:177.3,mat:'aluminio',ais:'THHN',a75:250,r:0.162,x:0.068},
    {cal:'500 kcmil',s:253.4,mat:'aluminio',ais:'THHN',a75:310,r:0.114,x:0.065},
  ];

  const BT_MM2 = [
    {cal:'1.5 mm²',s:1.5,  mat:'cobre',ais:'THHN',a75:15, r:12.10,x:0.115},
    {cal:'2.5 mm²',s:2.5,  mat:'cobre',ais:'THHN',a75:21, r:7.41, x:0.113},
    {cal:'4 mm²',  s:4.0,  mat:'cobre',ais:'THHN',a75:28, r:4.61, x:0.110},
    {cal:'6 mm²',  s:6.0,  mat:'cobre',ais:'THHN',a75:36, r:3.08, x:0.108},
    {cal:'10 mm²', s:10.0, mat:'cobre',ais:'THHN',a75:50, r:1.83, x:0.102},
    {cal:'16 mm²', s:16.0, mat:'cobre',ais:'THHN',a75:66, r:1.15, x:0.095},
    {cal:'25 mm²', s:25.0, mat:'cobre',ais:'THHN',a75:84, r:0.727,x:0.090},
    {cal:'35 mm²', s:35.0, mat:'cobre',ais:'THHN',a75:104,r:0.524,x:0.085},
    {cal:'50 mm²', s:50.0, mat:'cobre',ais:'THHN',a75:125,r:0.387,x:0.083},
    {cal:'70 mm²', s:70.0, mat:'cobre',ais:'THHN',a75:158,r:0.268,x:0.080},
    {cal:'95 mm²', s:95.0, mat:'cobre',ais:'THHN',a75:192,r:0.193,x:0.077},
    {cal:'120 mm²',s:120.0,mat:'cobre',ais:'THHN',a75:220,r:0.153,x:0.075},
    {cal:'150 mm²',s:150.0,mat:'cobre',ais:'THHN',a75:252,r:0.124,x:0.073},
    {cal:'185 mm²',s:185.0,mat:'cobre',ais:'XLPE',a75:290,r:0.101,x:0.071},
    {cal:'240 mm²',s:240.0,mat:'cobre',ais:'XLPE',a75:342,r:0.0775,x:0.069},
    {cal:'300 mm²',s:300.0,mat:'cobre',ais:'XLPE',a75:395,r:0.0620,x:0.067},
    {cal:'400 mm²',s:400.0,mat:'cobre',ais:'XLPE',a75:456,r:0.0465,x:0.065},
    {cal:'16 mm²', s:16.0, mat:'aluminio',ais:'THHN',a75:52, r:1.91, x:0.095},
    {cal:'25 mm²', s:25.0, mat:'aluminio',ais:'THHN',a75:66, r:1.20, x:0.090},
    {cal:'35 mm²', s:35.0, mat:'aluminio',ais:'THHN',a75:82, r:0.868,x:0.085},
    {cal:'50 mm²', s:50.0, mat:'aluminio',ais:'THHN',a75:100,r:0.641,x:0.083},
    {cal:'70 mm²', s:70.0, mat:'aluminio',ais:'THHN',a75:128,r:0.443,x:0.080},
    {cal:'95 mm²', s:95.0, mat:'aluminio',ais:'THHN',a75:158,r:0.320,x:0.077},
    {cal:'120 mm²',s:120.0,mat:'aluminio',ais:'THHN',a75:183,r:0.253,x:0.075},
    {cal:'150 mm²',s:150.0,mat:'aluminio',ais:'THHN',a75:210,r:0.206,x:0.073},
    {cal:'185 mm²',s:185.0,mat:'aluminio',ais:'XLPE',a75:244,r:0.164,x:0.071},
    {cal:'240 mm²',s:240.0,mat:'aluminio',ais:'XLPE',a75:290,r:0.125,x:0.069},
    {cal:'300 mm²',s:300.0,mat:'aluminio',ais:'XLPE',a75:340,r:0.100,x:0.067},
  ];

  // MT — vmax_kv validado para cada nivel de tensión
  const MT_XLPE_15 = [
    {cal:'35 mm²', s:35, mat:'cobre',ais:'XLPE 15kV',a75:145,r:0.524,x:0.113,vmax:15},
    {cal:'50 mm²', s:50, mat:'cobre',ais:'XLPE 15kV',a75:175,r:0.387,x:0.110,vmax:15},
    {cal:'70 mm²', s:70, mat:'cobre',ais:'XLPE 15kV',a75:215,r:0.268,x:0.107,vmax:15},
    {cal:'95 mm²', s:95, mat:'cobre',ais:'XLPE 15kV',a75:260,r:0.193,x:0.104,vmax:15},
    {cal:'120 mm²',s:120,mat:'cobre',ais:'XLPE 15kV',a75:300,r:0.153,x:0.102,vmax:15},
    {cal:'150 mm²',s:150,mat:'cobre',ais:'XLPE 15kV',a75:345,r:0.124,x:0.100,vmax:15},
    {cal:'185 mm²',s:185,mat:'cobre',ais:'XLPE 15kV',a75:395,r:0.101,x:0.098,vmax:15},
    {cal:'240 mm²',s:240,mat:'cobre',ais:'XLPE 15kV',a75:465,r:0.0775,x:0.095,vmax:15},
    {cal:'50 mm²', s:50, mat:'aluminio',ais:'XLPE 15kV',a75:135,r:0.641,x:0.110,vmax:15},
    {cal:'70 mm²', s:70, mat:'aluminio',ais:'XLPE 15kV',a75:170,r:0.443,x:0.107,vmax:15},
    {cal:'95 mm²', s:95, mat:'aluminio',ais:'XLPE 15kV',a75:205,r:0.320,x:0.104,vmax:15},
    {cal:'120 mm²',s:120,mat:'aluminio',ais:'XLPE 15kV',a75:240,r:0.253,x:0.102,vmax:15},
    {cal:'150 mm²',s:150,mat:'aluminio',ais:'XLPE 15kV',a75:275,r:0.206,x:0.100,vmax:15},
    {cal:'185 mm²',s:185,mat:'aluminio',ais:'XLPE 15kV',a75:315,r:0.164,x:0.098,vmax:15},
    {cal:'240 mm²',s:240,mat:'aluminio',ais:'XLPE 15kV',a75:375,r:0.125,x:0.095,vmax:15},
  ];

  const MT_XLPE_36 = [
    {cal:'35 mm²', s:35, mat:'cobre',ais:'XLPE 36kV',a75:130,r:0.524,x:0.120,vmax:36},
    {cal:'50 mm²', s:50, mat:'cobre',ais:'XLPE 36kV',a75:160,r:0.387,x:0.117,vmax:36},
    {cal:'70 mm²', s:70, mat:'cobre',ais:'XLPE 36kV',a75:195,r:0.268,x:0.114,vmax:36},
    {cal:'95 mm²', s:95, mat:'cobre',ais:'XLPE 36kV',a75:235,r:0.193,x:0.111,vmax:36},
    {cal:'120 mm²',s:120,mat:'cobre',ais:'XLPE 36kV',a75:270,r:0.153,x:0.109,vmax:36},
    {cal:'150 mm²',s:150,mat:'cobre',ais:'XLPE 36kV',a75:310,r:0.124,x:0.107,vmax:36},
    {cal:'185 mm²',s:185,mat:'cobre',ais:'XLPE 36kV',a75:355,r:0.101,x:0.105,vmax:36},
    {cal:'240 mm²',s:240,mat:'cobre',ais:'XLPE 36kV',a75:415,r:0.0775,x:0.102,vmax:36},
    {cal:'300 mm²',s:300,mat:'cobre',ais:'XLPE 36kV',a75:475,r:0.0620,x:0.100,vmax:36},
    {cal:'50 mm²', s:50, mat:'aluminio',ais:'XLPE 36kV',a75:120,r:0.641,x:0.117,vmax:36},
    {cal:'70 mm²', s:70, mat:'aluminio',ais:'XLPE 36kV',a75:150,r:0.443,x:0.114,vmax:36},
    {cal:'95 mm²', s:95, mat:'aluminio',ais:'XLPE 36kV',a75:185,r:0.320,x:0.111,vmax:36},
    {cal:'120 mm²',s:120,mat:'aluminio',ais:'XLPE 36kV',a75:215,r:0.253,x:0.109,vmax:36},
    {cal:'150 mm²',s:150,mat:'aluminio',ais:'XLPE 36kV',a75:250,r:0.206,x:0.107,vmax:36},
    {cal:'185 mm²',s:185,mat:'aluminio',ais:'XLPE 36kV',a75:285,r:0.164,x:0.105,vmax:36},
    {cal:'240 mm²',s:240,mat:'aluminio',ais:'XLPE 36kV',a75:340,r:0.125,x:0.102,vmax:36},
  ];

  const MT_ACSR = [
    {cal:'35 mm²', s:35, mat:'aluminio',ais:'ACSR aéreo',a75:155,r:0.868,x:0.360,vmax:34.5},
    {cal:'50 mm²', s:50, mat:'aluminio',ais:'ACSR aéreo',a75:190,r:0.612,x:0.352,vmax:34.5},
    {cal:'70 mm²', s:70, mat:'aluminio',ais:'ACSR aéreo',a75:235,r:0.443,x:0.345,vmax:34.5},
    {cal:'95 mm²', s:95, mat:'aluminio',ais:'ACSR aéreo',a75:285,r:0.320,x:0.338,vmax:34.5},
    {cal:'120 mm²',s:120,mat:'aluminio',ais:'ACSR aéreo',a75:330,r:0.253,x:0.333,vmax:34.5},
    {cal:'150 mm²',s:150,mat:'aluminio',ais:'ACSR aéreo',a75:375,r:0.206,x:0.328,vmax:34.5},
    {cal:'185 mm²',s:185,mat:'aluminio',ais:'ACSR aéreo',a75:430,r:0.164,x:0.323,vmax:34.5},
    {cal:'240 mm²',s:240,mat:'aluminio',ais:'ACSR aéreo',a75:500,r:0.125,x:0.315,vmax:34.5},
  ];

  // ── SELECCIÓN DE TABLA MT CORRECTA ────────────────────────────
  function _mtTable(tipoRed, vKv) {
    const t = tipoRed.toUpperCase();
    if (t.includes('ACSR') || t.includes('AEREA')) return { table: MT_ACSR, key: 'MT_ACSR' };
    if (vKv <= 15) return { table: MT_XLPE_15, key: 'MT_XLPE_15kV' };
    return { table: MT_XLPE_36, key: 'MT_XLPE_36kV' };
  }

  // ════════════════════════════════════════════════════════════
  // BT SELECTION
  // ════════════════════════════════════════════════════════════
  function selectBT(Idis, params, rules, fArmAmpcity = 1.0) {
    const {unit='AWG', mat='cobre', tAmb=30, nCirc=1, system='trifasico',
           lengthM=30, voltageV=208, fp=0.9, circuitType='alimentador',
           tOper=50, method='tuberia'} = params;

    const tabla = (unit==='AWG' ? BT_AWG : BT_MM2).filter(c=>c.mat===mat).sort((a,b)=>a.s-b.s);

    const Ft = DimelecStandards.factorTemp(tAmb);
    const Fa = DimelecStandards.factorGroup(nCirc);
    const Fi = 1.0; // método instalación simplificado
    const F  = Ft * Fa * Fi * fArmAmpcity;

    const lim = circuitType==='terminal' ? (rules.dvT||3) : (rules.dvF||5);
    const evals = [];

    for (const c of tabla) {
      const ampC = c.a75 * F;
      const cumT = ampC >= Idis;

      const rCorr = DimelecStandards.rCorrected(c.r, tOper, mat);
      const reg   = DimelecCalc.calcVoltageDrop(Idis, system, voltageV, fp, rCorr, c.x, lengthM);
      const cumV  = reg.pct <= lim;
      const loss  = DimelecCalc.calcLosses(Idis, rCorr, lengthM);

      evals.push({cal:c.cal, s:c.s, ampC:r2(ampC), caida:r2(reg.pct), cumT, cumV});

      if (cumT && cumV) {
        return {
          ok: true,
          cal: c.cal, s: c.s, mat, ais: c.ais,
          ampBase: c.a75, ampCorr: r2(ampC),
          r75: c.r, rCorr: r2(rCorr), x: c.x,
          Ft: r4(Ft), Fa: r4(Fa), Fi, Ftotal: r4(F),
          reg, loss, lim, evals,
          trace: {
            ampEq:   `Iz = ${c.a75}×Ft(${r4(Ft)})×Fa(${r4(Fa)})×Fi(${Fi})×Farm(${r4(fArmAmpcity)}) = ${r2(ampC)} A`,
            regEq:   reg.trace.eq,
            normaAmp:'NEC 310.15(B)(16)',
            normaReg: `${rules.country==='CO'?'RETIE':'NEC/IEC'} — límite ${lim}%`,
            factors: [
              {n:'Ft temperatura', v:r4(Ft), src:`NEC 310.15(B)(2)(a) — T_amb=${tAmb}°C`},
              {n:'Fa agrupamiento',v:r4(Fa), src:`NEC 310.15(B)(3)(a) — ${nCirc} circuitos`},
              {n:'Fi instalación', v:Fi,      src:`Método: ${method}`},
              {n:'Farm armónicos', v:r4(fArmAmpcity), src:'NEC 310.15(B)(5)'},
              {n:'R corregida',    v:r2(rCorr), src:`IEC 60228 — T_oper=${tOper}°C`},
            ],
          },
        };
      }
    }

    return { ok: false, evals, msg: 'Ningún conductor cumple ampacidad y regulación simultáneamente.' };
  }

  // ════════════════════════════════════════════════════════════
  // MT SELECTION — CON TODOS LOS BUG FIXES
  // ════════════════════════════════════════════════════════════
  function selectMT(pMva, vKv, lKm, fp, mat, tipoRed, emerPct, rules, fcLoad=0.65) {
    const {table, key} = _mtTable(tipoRed, vKv);
    const cands = table.filter(c=>c.mat===mat).sort((a,b)=>a.s-b.s);

    const Inom  = (pMva*1000)/(Math.sqrt(3)*vKv);
    const Iemer = Inom*(1+emerPct/100);
    const cp=Math.max(fp,0.01); const sp=Math.sqrt(Math.max(1-cp*cp,0));
    const lim = rules.dvMT || 5;
    const bilInfo = DimelecStandards.bil(vKv);

    if (!cands.length)
      return { ok:false, evals:[], table:key, msg:`Sin conductores en ${key} para ${mat}` };

    const ampMax = Math.max(...cands.map(c=>c.a75));

    // BUG FIX #3: Recomendar paralelo si I_nom supera capacidad máxima de tabla
    if (Inom > ampMax) {
      const nPar = Math.ceil(Inom/ampMax);
      const best = cands[cands.length-1];
      return {
        ok: false,
        requiere_paralelo: true,
        n_ternas: nPar,
        conductor_paralelo: `${nPar} × ${best.cal} ${best.ais}`,
        Inom: r2(Inom), amp_max: ampMax,
        table: key,
        evals: [],
        msg: `I_nom=${r2(Inom)}A > amp_max=${ampMax}A. Se requieren ${nPar} ternas en paralelo de ${best.cal} (IEC 60502-2 §14.4).`,
      };
    }

    const evals = [];
    for (const c of cands) {
      // BUG FIX #1: verificar nivel de tensión del cable
      if ((c.vmax || 15) < vKv) {
        evals.push({cal:c.cal, s:c.s, amp:c.a75, ok:false, reason:`Cable vmax=${c.vmax}kV < sistema ${vKv}kV`});
        continue;
      }

      const cumT = c.a75 >= Inom;
      // BUG FIX #2: dos indicadores de emergencia
      const cumE_trans = c.a75 >= Iemer*0.80; // IEC 60502-2 §14.1 — transitorio ≤8h
      const cumE_cont  = c.a75 >= Iemer;       // operación continua

      const rm=c.r/1000; const xm=c.x/1000;
      const dv = Math.sqrt(3)*Inom*lKm*1000*(rm*cp+xm*sp);
      const dvR= Math.sqrt(3)*Inom*lKm*1000*rm*cp;
      const dvX= Math.sqrt(3)*Inom*lKm*1000*xm*sp;
      const pct = dv/(vKv*1000)*100;
      const cumV = pct <= lim;

      const Pkw = 3*Inom*Inom*(c.r/1000)*lKm;
      const Emwh= Pkw*8760/1000;

      evals.push({cal:c.cal, s:c.s, amp:c.a75, caida:r3(pct), Pkw:r3(Pkw), cumT, cumV, cumE_trans, cumE_cont});

      if (cumT && cumV) {
        // Perfil tensión 10 puntos
        const perfil=[];
        for(let i=0;i<=10;i++){
          const Li=lKm*i/10;
          const dvi=Math.sqrt(3)*Inom*Li*1000*(rm*cp+xm*sp);
          perfil.push({L_km:r2(Li), v_kv:r4(vKv-dvi/1000), v_pu:r4((vKv-dvi/1000)/vKv), pct:r3(dvi/(vKv*1000)*100)});
        }

        // Análisis económico
        const prices = DimelecStandards.getPrices();
        const econ = DimelecCalc.economicAnalysis(cands, Inom, lKm*1000, prices);

        return {
          ok: true,
          cal: c.cal, s: c.s, mat, ais: c.ais,
          table: key,
          vmax_kv: c.vmax || 15,
          bil: `${bilInfo.bil} kV BIL`, bil_norma: bilInfo.desc,
          ampBase: c.a75, Inom: r2(Inom), Iemer: r2(Iemer),
          cargabilidad_pct: r2(Inom/c.a75*100),
          cumE_transitoria: cumE_trans,
          cumE_continua: cumE_cont,
          nota_emergencia: cumE_trans && !cumE_cont
            ? `Soporta emergencia transitoria (≤8h, IEC 60502-2 §14.1) con reducción de vida útil`
            : (cumE_cont ? 'Soporta emergencia continua' : 'NO soporta emergencia'),
          r_ac: c.r, x: c.x,
          reg: {dv_v:r2(dv), dv_r:r2(dvR), dv_x:r2(dvX), pct:r3(pct), limite:lim, cosPhi:r4(cp), sinPhi:r4(sp)},
          perdidas: {kw:r3(Pkw), mwh_ano:r2(Emwh)},
          s_economica: r1(Inom/1.2),
          perfil, econ, evals,
          trace: {
            eq_I:   `I_nom = ${pMva*1000}kVA/(√3×${vKv}kV) = ${r2(Inom)} A`,
            eq_dv:  `ΔV = √3×${r2(Inom)}×${lKm}km×1000×(R·cosφ+X·sinφ) = ${r2(dv)} V`,
            eq_P:   `P = 3×${r2(Inom)}²×${c.r/1000}×${lKm*1000} = ${r3(Pkw)} kW`,
            norma:  'IEC 60502-2 / IEC 60287',
            bil_ref:`BIL=${bilInfo.bil}kV [${bilInfo.norma||'IEC 60071-1'}]`,
          },
        };
      }
    }

    return { ok:false, evals, table:key,
      msg:`Ningún conductor en ${key} cumple ampacidad (${r2(Inom)}A) y regulación (≤${lim}%) para ${vKv}kV / ${lKm}km.` };
  }

  // ── PROTECCIÓN BT ─────────────────────────────────────────────
  function selectProtection(Idis, Iz, unit, tipoLoad='general', curve='C', iccMaxKa=null) {
    const tabla = DimelecStandards.protTable(unit);
    let protA = null; let cumIz = true;
    for (const p of tabla.sort((a,b)=>a-b)) {
      if (Idis<=p && p<=Iz) { protA=p; break; }
    }
    if (!protA) {
      for (const p of tabla.sort((a,b)=>a-b)) {
        if (p>=Idis) { protA=p; cumIz=p<=Iz; break; }
      }
    }
    if (!protA) return { ok:false, msg:'Sin protección compatible' };

    const tipo = tipoLoad==='motor'
      ? (protA<=32?'Guardamotor TM':`MCCB curva ${curve} — motor`)
      : (protA<=63?`MCB curva ${curve}`:(protA<=630?`MCCB curva ${curve}`:'ACB'));
    const icu_val = DimelecStandards.icu(tipo);
    const cumIcu  = iccMaxKa==null ? true : icu_val >= iccMaxKa;
    const tDesp   = protA<=63?0.10:protA<=250?0.05:0.08;

    return {
      ok:true, prot_a:protA, tipo, curve,
      t_desp:tDesp, icu:icu_val, ics:r1(icu_val*0.75),
      icc_max_ka:iccMaxKa, cumIz, cumIcu,
      validacion: `Ib=${r2(Idis)}A ≤ In=${protA}A ≤ Iz=${r2(Iz)}A ${cumIz?'✔':'⚠'}`,
      validacion_icu: iccMaxKa ? `Icu=${icu_val}kA ${cumIcu?'≥':'<'} Icc_max=${iccMaxKa}kA ${cumIcu?'✔':'✘'}` : 'N/D',
      adv_iz:  !cumIz  ? `In=${protA}A > Iz=${r2(Iz)}A — aumentar sección conductor.` : null,
      adv_icu: !cumIcu ? `Icu=${icu_val}kA < Icc_max=${iccMaxKa}kA — seleccionar MCCB mayor Icu.` : null,
      trace: { criterio:'IEC 60364-4-43: Ib ≤ In ≤ Iz', criterio_icu:'IEC 60947-2: Icu ≥ Icc_max', norma:'NEC 240 / IEC 60364-4-43' },
    };
  }

  function r1(v){ return Math.round(v*10)/10; }
  function r2(v){ return Math.round(v*100)/100; }
  function r3(v){ return Math.round(v*1000)/1000; }
  function r4(v){ return Math.round(v*10000)/10000; }

  return { selectBT, selectMT, selectProtection, _tables:{ BT_AWG, BT_MM2, MT_XLPE_15, MT_XLPE_36, MT_ACSR } };
})();

if (typeof module !== 'undefined') module.exports = DimelecConductorSelection;
