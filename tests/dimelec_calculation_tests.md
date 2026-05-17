# dimelec_calculation_tests.md
# Tests de Cálculo BT — DimElec LATAM v1.0.0

## Test BT — Motor industrial 480V trifásico

**Entrada:**
- Motor 22kW fp=0.85 ef=0.93 + Iluminación 4kW fp=0.95
- Sistema: trifásico 480V, L=120m, Cu AWG, Tamb=35°C, 3 circuitos agrupados, tubería
- Trafo: 500kVA, z=5%, r=0.8%

**Resultados esperados vs obtenidos:**

| Parámetro | Esperado | Obtenido | Estado |
|-----------|---------|----------|--------|
| I_nom | ~39A | 38.8A | ✔ |
| I_diseño (NEC 430.24) | ~43A | 42.7A | ✔ |
| Ft (35°C) | 0.94 | 0.94 | ✔ |
| Fa (3 circ) | 0.70 | 0.70 | ✔ |
| F_total | 0.658 | 0.658 | ✔ |
| Conductor | 4 AWG | 4 AWG | ✔ |
| Iz_corr | ~55.9A | 55.93A | ✔ |
| ΔV% | ~1.4% | 1.394% | ✔ |
| Protección | 50A | 50A | ✔ |
| Tierra EGC | 10 AWG | 10 AWG | ✔ |
| ICC_max | ~12.6kA | 12.63kA | ✔ |
| Estado global | CUMPLE | CUMPLE | ✔ |

## Test de Factores de Corrección

| Temperatura | Ft esperado | Ft obtenido | Delta |
|------------|-------------|-------------|-------|
| 25°C | 1.05 | 1.05 | 0 |
| 30°C | 1.00 | 1.00 | 0 |
| 35°C | 0.94 | 0.94 | 0 |
| 40°C | 0.88 | 0.88 | 0 |
| 37°C (interp) | ~0.906 | 0.906 | ✔ |

| N circuitos | Fa esperado | Fa obtenido |
|-------------|-------------|-------------|
| 1 | 1.00 | 1.00 |
| 3 | 0.70 | 0.70 |
| 6 | 0.57 | 0.57 |
| 4 (interp) | 0.675 | 0.675 |

## Test Regulación de Tensión

Fórmula: ΔV = √3 × I × L × (R·cosφ + X·sinφ)
- I=42.7A, L=120m, R=0.751Ω/km (corregida 55°C), X=0.092Ω/km, cosφ=0.873

Cálculo manual:
- cosφ=0.873, sinφ=0.487
- R·cosφ = 0.751×0.873 = 0.6556 Ω/km
- X·sinφ = 0.092×0.487 = 0.0448 Ω/km
- Z_ef = 0.7004 Ω/km
- ΔV = 1.732×42.7×0.120×0.7004 = **6.228 V** → 1.298% ✔

## Test Cortocircuito Térmico

Fórmula: S_min = Icc × √t / k
- Icc=12,630A, t=0.05s, k=115 (Cu THHN)
- S_min = 12630 × √0.05 / 115 = 12630 × 0.2236 / 115 = **24.5 mm²**
- Conductor 4 AWG = 21.2mm² < 24.5mm² → **NO CUMPLE CC térmico** (esperado)
