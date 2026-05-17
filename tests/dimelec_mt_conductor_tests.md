# dimelec_mt_conductor_tests.md
# Tests de Conductor MT — DimElec LATAM v1.0.0

## Resultados de Validación (2026-05-16)

| # | Entrada | I_nom | Conductor | ΔV% | Estado | Bugs |
|---|---------|-------|-----------|-----|--------|------|
| 1 | 5MVA 13.2kV 1km Cu XLPE | 218.7A | 95mm² XLPE 15kV | 0.629% | ✔ CUMPLE | 0 |
| 2 | 2MVA 13.2kV 5km Cu XLPE | 87.5A | 35mm² XLPE 15kV | 2.989% | ✔ CUMPLE | 0 |
| 3 | 0.5MVA 13.2kV 15km Al | 21.9A | 50mm² Al XLPE | 2.595% | ✔ CUMPLE | 0 |
| 4 | 10MVA 23kV 3km Cu | 251.0A | 120mm² XLPE **36kV** | 1.050% | ✔ CUMPLE | fix#1 |
| 5 | 3MVA 33kV 20km Al ACSR | 52.5A | 50mm² ACSR | 3.888% | ✔ CUMPLE | fix#4 |
| 6 | 8MVA 33kV 2km Cu | 140.0A | 50mm² XLPE **36kV** | 0.590% | ✔ CUMPLE | fix#1 |
| 7 | 1MVA 13.2kV 10km Al fp0.75 | 43.7A | 50mm² Al XLPE | 3.177% | ✔ CUMPLE | 0 |
| 8 | 15MVA 13.8kV Cu | 627.6A | **PARALELO x2** 240mm² | — | INFO | fix#3 |
| 9 | 4MVA 13.2kV 3km Cu fp0.88 | 175.0A | 50mm² XLPE 15kV | 2.705% | ✔ CUMPLE | 0 |
| 10 | 1.5MVA 23kV 12km Al | 37.7A | 50mm² Al XLPE **36kV** | 2.016% | ✔ CUMPLE | fix#1 |
| 11 | 3MVA 15kV 4km Cu | 115.5A | 35mm² XLPE 15kV | 2.778% | ✔ CUMPLE | 0 |
| 12 | 6MVA 34.5kV Al ACSR | 100.4A | 35mm² ACSR 34.5kV | 2.365% | ✔ CUMPLE | fix#4 |

**Inconsistencias: 0 / 12 casos**

## Test Específico — Bug #1 (vmax_kv)
ANTES: 23kV usaba MT_XLPE (vmax=15kV) → cable subreseñado para nivel tensión
DESPUÉS: 23kV usa MT_XLPE_36kV (vmax=36kV) → CORRECTO

## Test Específico — Bug #2 (emergencia dual)
Caso 9 (175A, amp=175A):
- cumple_emergencia_transitoria: True  (175 >= 210×0.8=168) ✔
- cumple_emergencia_continua: False (175 < 210) — reportado correctamente

## Test Específico — Bug #3 (paralelo)
Caso 8 (627.6A > 465A máx tabla):
- Antes: "Sin conductor" sin guía
- Después: requiere_paralelo=true, n_ternas_paralelo=2, conductor_en_paralelo="240mm² XLPE"
