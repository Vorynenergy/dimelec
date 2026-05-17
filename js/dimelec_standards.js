/**
 * dimelec_standards.js
 * DimElec LATAM — Motor normativo LATAM
 * Tablas de conductores, factores de corrección, protecciones, BIL
 * Todas las tablas son configurables — ningún valor hardcodeado en lógica
 */

'use strict';

const DimelecStandards = (() => {

  // ── PAÍSES ──────────────────────────────────────────────────
  const COUNTRIES = {
    CO:  { name:'Colombia 🇨🇴',  std:'RETIE 2024 / NTC 2050', unit:'AWG', freq:60, base_t:30, dvT:3, dvF:5, dvMT:5, fm:1.25, vbt:[120,208,240,480], vmt:[11400,13200,13800,34500] },
    MX:  { name:'México 🇲🇽',    std:'NOM-001-SEDE',           unit:'AWG', freq:60, base_t:30, dvT:3, dvF:5, dvMT:5, fm:1.25, vbt:[127,220,480],     vmt:[13200,13800,23000,34500] },
    PE:  { name:'Perú 🇵🇪',      std:'CNE Utilización',        unit:'mm2', freq:60, base_t:30, dvT:2.5,dvF:4,dvMT:5,fm:1.25, vbt:[220,380,440],      vmt:[10000,22900,33000] },
    CL:  { name:'Chile 🇨🇱',     std:'SEC / NCh Elec 4/2003',  unit:'mm2', freq:50, base_t:25, dvT:3, dvF:5, dvMT:5, fm:1.25, vbt:[220,380,400],      vmt:[12000,23000,33000] },
    EC:  { name:'Ecuador 🇪🇨',   std:'NEC-SB-IE / ARCONEL',   unit:'mm2', freq:60, base_t:30, dvT:3, dvF:5, dvMT:5, fm:1.25, vbt:[120,208,220,380],  vmt:[6300,13800,22000,33000] },
    IEC: { name:'Base IEC 🌐',   std:'IEC 60364 / 60502',      unit:'mm2', freq:50, base_t:30, dvT:3, dvF:5, dvMT:5, fm:1.25, vbt:[230,400,690],      vmt:[6600,11000,22000,33000] },
  };

  // ── FACTORES TEMPERATURA — NEC Tabla 310.15(B)(2)(a) ────────
  const TEMP_FACTOR_75C = {10:1.20,15:1.15,20:1.11,25:1.05,30:1.00,35:0.94,40:0.88,45:0.82,50:0.75,55:0.67,60:0.58};

  // ── FACTORES AGRUPAMIENTO — NEC Tabla 310.15(B)(3)(a) ───────
  const GROUP_FACTOR = {1:1.00,2:0.80,3:0.70,4:0.65,5:0.60,6:0.57,7:0.54,8:0.52,9:0.50,10:0.50,12:0.45,16:0.41,20:0.38};

  // ── FACTORES ARMÓNICOS — IEC 61000-3-2 / NEC 310.15(B)(5) ──
  const HARMONIC_FACTORS = {
    'thd_0_20':  { ampacity_mult: 1.00, neutral_mult: 1.00 },
    'thd_20_33': { ampacity_mult: 0.86, neutral_mult: 1.35 },
    'thd_33_45': { ampacity_mult: 0.75, neutral_mult: 1.71 },
    'thd_45_60': { ampacity_mult: 0.65, neutral_mult: 2.16 },
  };

  // ── k PARA CC TÉRMICO — IEC 60364-5-54 Tabla 54.2 ──────────
  const K_CC = {
    cobre:    { THHN:{k:115,Ti:75,Tf:150}, XLPE:{k:143,Ti:90,Tf:250}, EPR:{k:143,Ti:90,Tf:250} },
    aluminio: { THHN:{k:74, Ti:75,Tf:150}, XLPE:{k:94, Ti:90,Tf:250}, EPR:{k:94, Ti:90,Tf:250} },
  };

  // ── PROTECCIONES COMERCIALES ─────────────────────────────────
  const PROT_NEC = [15,20,25,30,40,50,60,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,700,800,1000,1200,1600,2000];
  const PROT_IEC = [6,10,13,16,20,25,32,40,50,63,80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000];
  const FUSES_MT = [3,5,6,8,10,12,15,20,25,30,40,50,65,80,100,125,150,200];

  // ── CAPACIDADES INTERRUPTIVAS TÍPICAS — IEC 60947-2 ─────────
  const ICU_MAP = { MCB:10, MCCB_small:25, MCCB_medium:36, MCCB_large:50, ACB:65, fusible:100 };

  // ── BIL — IEC 60071-1 ────────────────────────────────────────
  const BIL_TABLE = [
    {vmax:7.2,  bil:60,  desc:'Clase 6.6 kV'},
    {vmax:12.0, bil:75,  desc:'Clase 10–12 kV'},
    {vmax:17.5, bil:95,  desc:'Clase 13.2–13.8 kV'},
    {vmax:24.0, bil:125, desc:'Clase 22–23 kV'},
    {vmax:36.0, bil:170, desc:'Clase 33–34.5 kV'},
    {vmax:52.0, bil:250, desc:'Clase 45 kV'},
  ];

  // ── TIERRA MÍNIMA — NEC Tabla 250.122 ───────────────────────
  const GROUND_TABLE = [
    {prot_max:15,   cu_mm2:2.1,  al_mm2:3.3,  cu_awg:'14 AWG', al_awg:'12 AWG'},
    {prot_max:20,   cu_mm2:3.3,  al_mm2:5.3,  cu_awg:'12 AWG', al_awg:'10 AWG'},
    {prot_max:60,   cu_mm2:5.3,  al_mm2:8.4,  cu_awg:'10 AWG', al_awg:'8 AWG'},
    {prot_max:100,  cu_mm2:8.4,  al_mm2:13.3, cu_awg:'8 AWG',  al_awg:'6 AWG'},
    {prot_max:200,  cu_mm2:13.3, al_mm2:21.2, cu_awg:'6 AWG',  al_awg:'4 AWG'},
    {prot_max:300,  cu_mm2:21.2, al_mm2:33.6, cu_awg:'4 AWG',  al_awg:'2 AWG'},
    {prot_max:400,  cu_mm2:26.7, al_mm2:42.4, cu_awg:'3 AWG',  al_awg:'1 AWG'},
    {prot_max:500,  cu_mm2:33.6, al_mm2:53.5, cu_awg:'2 AWG',  al_awg:'1/0 AWG'},
    {prot_max:800,  cu_mm2:53.5, al_mm2:67.4, cu_awg:'1/0 AWG','al_awg':'2/0 AWG'},
    {prot_max:1200, cu_mm2:67.4, al_mm2:107.2,cu_awg:'2/0 AWG','al_awg':'4/0 AWG'},
    {prot_max:1600, cu_mm2:85.0, al_mm2:126.7,cu_awg:'3/0 AWG','al_awg':'250 kcmil'},
    {prot_max:2000, cu_mm2:107.2,al_mm2:177.3,cu_awg:'4/0 AWG','al_awg':'350 kcmil'},
  ];

  // ── PRECIOS REFERENCIA LATAM 2024 ────────────────────────────
  const PRICES = {
    cu_usd_kg: 10.50, al_usd_kg: 3.20,
    energy_usd_kwh: 0.12, install_usd_m: 15.00,
    discount_rate: 0.10, horizon_years: 20,
    load_factor: 0.65,
    density_kg_m3: { cobre: 8900, aluminio: 2700 },
  };

  // ════════════════════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════════════════════

  function getCountry(code) {
    if (!COUNTRIES[code]) throw new Error(`País '${code}' no soportado.`);
    return COUNTRIES[code];
  }

  function getAllCountries() { return COUNTRIES; }

  /** Interpolación lineal de factor temperatura */
  function factorTemp(t) {
    const keys = Object.keys(TEMP_FACTOR_75C).map(Number).sort((a,b)=>a-b);
    if (t <= keys[0])  return TEMP_FACTOR_75C[keys[0]];
    if (t >= keys[keys.length-1]) return TEMP_FACTOR_75C[keys[keys.length-1]];
    for (let i=0; i<keys.length-1; i++) {
      const t0=keys[i], t1=keys[i+1];
      if (t0<=t && t<=t1) {
        const f0=TEMP_FACTOR_75C[t0], f1=TEMP_FACTOR_75C[t1];
        return f0 + (f1-f0)*(t-t0)/(t1-t0);
      }
    }
    return 1.0;
  }

  /** Interpolación lineal de factor agrupamiento */
  function factorGroup(n) {
    const keys = Object.keys(GROUP_FACTOR).map(Number).sort((a,b)=>a-b);
    if (n <= keys[0])  return GROUP_FACTOR[keys[0]];
    if (n >= keys[keys.length-1]) return GROUP_FACTOR[keys[keys.length-1]];
    for (let i=0; i<keys.length-1; i++) {
      const n0=keys[i], n1=keys[i+1];
      if (n0<=n && n<=n1) {
        const f0=GROUP_FACTOR[n0], f1=GROUP_FACTOR[n1];
        return f0 + (f1-f0)*(n-n0)/(n1-n0);
      }
    }
    return 1.0;
  }

  /** Factor armónico según THD% */
  function factorHarmonic(thd) {
    if (thd <= 20) return HARMONIC_FACTORS.thd_0_20;
    if (thd <= 33) return HARMONIC_FACTORS.thd_20_33;
    if (thd <= 45) return HARMONIC_FACTORS.thd_33_45;
    return HARMONIC_FACTORS.thd_45_60;
  }

  /** R corregida por temperatura — IEC 60228: R(T) = R75 × [1 + α(T−75)] */
  function rCorrected(r75, tOper, material) {
    const alpha = material === 'cobre' ? 0.00393 : 0.00403;
    return r75 * (1 + alpha * (tOper - 75));
  }

  /** k para verificación térmica CC */
  function kCC(material, insulation) {
    const ins = insulation.toUpperCase().includes('XLPE') ? 'XLPE'
              : insulation.toUpperCase().includes('EPR') ? 'EPR' : 'THHN';
    return K_CC[material]?.[ins] || K_CC.cobre.THHN;
  }

  /** Tabla de protecciones */
  function protTable(unit) {
    return unit === 'AWG' ? PROT_NEC : PROT_IEC;
  }

  function fusesMT() { return FUSES_MT; }

  /** Capacidad interruptiva típica por tipo de dispositivo */
  function icu(deviceType) {
    const t = deviceType.toUpperCase();
    if (t.includes('ACB'))    return ICU_MAP.ACB;
    if (t.includes('FUSIBLE'))return ICU_MAP.fusible;
    if (t.includes('MCCB') && t.includes('1600')) return ICU_MAP.MCCB_large;
    if (t.includes('MCCB') && t.includes('630'))  return ICU_MAP.MCCB_medium;
    if (t.includes('MCCB'))   return ICU_MAP.MCCB_small;
    return ICU_MAP.MCB;
  }

  /** BIL para un nivel de tensión dado */
  function bil(vKv) {
    for (const row of BIL_TABLE) {
      if (vKv <= row.vmax) return row;
    }
    return BIL_TABLE[BIL_TABLE.length - 1];
  }

  /** Sección mínima conductor de tierra */
  function minGroundConductor(protA, material, unit) {
    for (const row of GROUND_TABLE) {
      if (protA <= row.prot_max) {
        return {
          s_mm2:   material === 'cobre' ? row.cu_mm2 : row.al_mm2,
          calibre: material === 'cobre'
            ? (unit==='AWG' ? row.cu_awg : `${row.cu_mm2} mm²`)
            : (unit==='AWG' ? row.al_awg : `${row.al_mm2} mm²`),
          norma: 'NEC Tabla 250.122 / IEC 60364-5-54',
          prot_ref_a: row.prot_max,
        };
      }
    }
    const s = Math.round(protA * 0.125 * 10) / 10;
    return { s_mm2: s, calibre: `≥${s} mm²`, norma: 'NEC 250.122(B)', prot_ref_a: protA };
  }

  function getPrices() { return { ...PRICES }; }

  return {
    getCountry, getAllCountries,
    factorTemp, factorGroup, factorHarmonic,
    rCorrected, kCC,
    protTable, fusesMT, icu, bil,
    minGroundConductor, getPrices,
    // Raw tables exposed for debug mode
    _raw: { COUNTRIES, TEMP_FACTOR_75C, GROUP_FACTOR, K_CC, BIL_TABLE, GROUND_TABLE, PRICES },
  };

})();

// CommonJS / ES Module compatibility
if (typeof module !== 'undefined') module.exports = DimelecStandards;
