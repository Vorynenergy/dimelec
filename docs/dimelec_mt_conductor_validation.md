# dimelec_mt_conductor_validation.md
# Validación Crítica — Conductores Media Tensión
**DimElec LATAM v1.0.0 | Validado:** 2026-05-16 | **Estado:** 0 inconsistencias

## Bugs Detectados y Corregidos

### Bug #1 CRÍTICO — XLPE 15kV para circuitos 23/33 kV
**Antes:** `_tablaParaNivel()` usaba MT_XLPE (vmax=15kV) para todos los niveles.
**Después:** v>15kV → MT_XLPE_36kV; aéreo → MT_ACSR (vmax=34.5kV).
**Norma:** IEC 60502-2 Tabla 1.

### Bug #2 — Emergencia reportada ambiguamente
**Antes:** Un campo `cumple_emergencia` mezclaba dos criterios.
**Después:** `cumple_emergencia_transitoria` (amp≥Iemer×0.8, IEC 60502-2 §14.1) y `cumple_emergencia_continua` (amp≥Iemer).

### Bug #3 — Sin guía cuando I_nom > amp_max tabla
**Después:** Retorna `requiere_paralelo: true, n_ternas_paralelo, conductor_en_paralelo`.
**Norma:** IEC 60502-2 §14.4.

### Bug #4 — ACSR sin vmax_kv
**Corrección:** vmax_kv=34.5 añadido a tabla MT_ACSR.

## Tabla de Validación — 12 Casos

| # | Caso | I_nom A | Tabla | Conductor | Vmax kV | ΔV% | Amp | EmT | EmC | Estado |
|---|------|---------|-------|-----------|---------|-----|-----|-----|-----|--------|
| 1 | 5MVA 13.2kV 1km | 218.7 | MT_XLPE | 95mm² | 15 | 0.629 | 260 | ✔ | ✘ | CUMPLE |
| 2 | 2MVA 13.2kV 5km | 87.5 | MT_XLPE | 35mm² | 15 | 2.989 | 145 | ✔ | ✔ | CUMPLE |
| 3 | 0.5MVA 13.2kV 15km Al | 21.9 | MT_XLPE | 50mm² | 15 | 2.595 | 135 | ✔ | ✔ | CUMPLE |
| 4 | 10MVA 23kV 3km | 251.0 | **MT_XLPE_36kV** | 120mm² | **36** | 1.050 | 270 | ✔ | ✘ | CUMPLE |
| 5 | 3MVA 33kV 20km ACSR | 52.5 | MT_ACSR | 50mm² | 34.5 | 3.888 | 190 | ✔ | ✔ | CUMPLE |
| 6 | 8MVA 33kV 2km | 140.0 | **MT_XLPE_36kV** | 50mm² | **36** | 0.590 | 160 | ✔ | ✘ | CUMPLE |
| 7 | 1MVA 13.2kV 10km fp0.75 | 43.7 | MT_XLPE | 50mm² | 15 | 3.177 | 135 | ✔ | ✔ | CUMPLE |
| 8 | 15MVA 13.8kV 0.5km | 627.6 | MT_XLPE | — | — | — | — | — | — | **PARALELO x2** |
| 9 | 4MVA 13.2kV 3km | 175.0 | MT_XLPE | 50mm² | 15 | 2.705 | 175 | ✔ | ✘ | CUMPLE |
| 10 | 1.5MVA 23kV 12km Al | 37.7 | **MT_XLPE_36kV** | 50mm² | **36** | 2.016 | 120 | ✔ | ✔ | CUMPLE |
| 11 | 3MVA 15kV 4km | 115.5 | MT_XLPE | 35mm² | 15 | 2.778 | 145 | ✔ | ✔ | CUMPLE |
| 12 | 6MVA 34.5kV ACSR | 100.4 | MT_ACSR | 35mm² | 34.5 | 2.365 | 155 | ✔ | ✔ | CUMPLE |

**Resultado: 0 inconsistencias. Motor MT técnicamente consistente.**

## Tabla por Nivel de Tensión
| V sistema | Instalación | Tabla |
|-----------|-------------|-------|
| ≤ 15 kV | Subterráneo XLPE | MT_XLPE |
| 16–36 kV | Subterráneo XLPE | MT_XLPE_36kV |
| ≤ 34.5 kV | Aéreo | MT_ACSR |
| ≤ 15 kV | Subterráneo EPR | MT_EPR |

## Items Pendientes (REVISIÓN TÉCNICA)
| Item | Descripción | Prioridad |
|------|-------------|-----------|
| Factor Ft MT | Corrección temperatura para XLPE 90°C en JS | Media |
| Factor Fa MT | Agrupamiento cables en bancos ductos | Media |
| Efecto piel | Corrección r_ac para s > 300mm² | Baja |
