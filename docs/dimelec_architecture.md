# dimelec_architecture.md
# Arquitectura — DimElec LATAM v1.0.0

## Visión General

```
dimelec-latam/
├── index.html                    ← Entry point SPA
├── css/                          ← Estilos (5 archivos dimelec_*.css)
├── js/                           ← Módulos JS (10 archivos dimelec_*.js)
├── data/                         ← Tablas normativas (8 JSON dimelec_*.json)
├── docs/                         ← Documentación técnica
├── tests/                        ← Tests y checklists
└── assets/                       ← Logos, imágenes
```

## Módulos JS — Orden de Carga

```
dimelec_standards.js       ← Base normativa (sin dependencias)
dimelec_calculations.js    ← Motor cálculo (usa standards)
dimelec_conductor_selection.js ← Selección (usa calculations + standards)
dimelec_validations.js     ← Validación global (usa todos anteriores)
dimelec_charts.js          ← Gráficas Chart.js (usa calculations)
dimelec_exports.js         ← Exportaciones (usa app state)
dimelec_backend.js         ← API connector (independiente)
dimelec_modals.js          ← UI helpers (independiente)
dimelec_app.js             ← Orquestador (usa todos)
dimelec_ui.js              ← Wizard UI (usa app)
```

## Flujo de Cálculo BT

```
Usuario → Paso 1-5 → DimelecApp.calcular()
                          │
                    ┌─────▼─────┐
                    │ Backend?   │ ──✔──► POST /api/v1/dimensionar-bt
                    └─────┬─────┘         └── resultado
                          │✗ (offline)
                    calcularLocal()
                          │
                    ┌─────▼─────────────────────┐
                    │ DimelecCalc.calcLoads()    │ ← cargas, THD, motores
                    │ DimelecConductorSel.selectBT() ← Ft, Fa, Fi, Farm
                    │ DimelecCalc.calcIccBT()    │ ← IEC 60909
                    │ DimelecConductorSel.selectProtection() ← Icu
                    │ DimelecCalc.calcThermalCC()│ ← S_min
                    │ DimelecStandards.tierraMinima() ← EGC
                    │ DimelecCalc.voltageProfile()│ ← 10 puntos
                    │ DimelecCalc.evalSelectivity()│
                    │ DimelecCalc.economicAnalysis()│ ← Kelvin
                    │ DimelecValidations.validarBT()│ ← ALL(criterios)
                    └─────────────────────────────┘
                          │
                    DimelecUI.render() → Pasos 6-9
```

## Flujo MT (requiere backend)

```
Paso 4 (nivel=MT) → buildPayload() → POST /api/v1/dimensionar-mt
                                              │
                                    Python: motor_mt.py
                                    - _tablaParaNivel(tipo, vKv)  ← Bug#1 fix
                                    - selectMT() con filtro vmax_kv
                                    - emergencia dual (trans/cont) ← Bug#2 fix
                                    - paralelo si I > amp_max      ← Bug#3 fix
                                    - evaluar_mt() ALL(criterios)
```

## Integración Voryn Energy

```javascript
// Configurar antes de DOMContentLoaded en producción:
window.VORYN_API_URL = 'https://api.vorynenergy.com/dimelec';

// El sistema detecta automáticamente:
// window.VORYN_API_URL > window.DIMELEC_API_URL > http://localhost:8000
```

## Convenciones de Código

- **Prefijo archivos:** `dimelec_`
- **Namespace JS:** `Dimelec*` (DimelecApp, DimelecCalc, etc.)
- **Clases CSS:** `.dimelec-*`
- **Variables CSS:** `--dimelec-*`
- **IDs HTML:** `dimelec-*`
- **Modo:** 'use strict' en todos los módulos JS
- **Exports:** `if (typeof module !== 'undefined') module.exports = ...`

## Separación de Responsabilidades

| Módulo | Responsabilidad | Tiene estado |
|--------|----------------|-------------|
| standards.js | Tablas y factores normativos | No |
| calculations.js | Fórmulas matemáticas | No |
| conductor_selection.js | Algoritmo selección | No |
| validations.js | Criterios de cumplimiento | No |
| charts.js | Visualización | No |
| exports.js | Descarga de archivos | No |
| backend.js | HTTP y API | Sí (_backendOnline) |
| modals.js | UI helpers | No |
| app.js | Estado global + orquestación | **Sí** (state) |
| ui.js | Renderizado HTML | No |
