# DimElec LATAM — Inventario técnico completo

## Módulos JS y sus funciones

| Módulo | Función | Riesgo modificación | Prioridad |
|--------|---------|-------------------|-----------|
| `dimelec_standards.js` | `factorTemp(t)` — interpolación tabla NEC 310.15 | Alto | Crítico |
| `dimelec_standards.js` | `factorGroup(n)` — interpolación tabla agrupamiento | Alto | Crítico |
| `dimelec_standards.js` | `factorHarmonic(thd)` — factor THD armónicos | Medio | Alto |
| `dimelec_standards.js` | `rCorrected(r75, tOper, mat)` — R(T) IEC 60228 | Alto | Crítico |
| `dimelec_standards.js` | `kCC(mat, ins)` — factor k CC térmico | Alto | Crítico |
| `dimelec_standards.js` | `bil(vKv)` — BIL por nivel tensión | Bajo | Medio |
| `dimelec_standards.js` | `minGroundConductor(prot, mat, unit)` — tierra NEC 250.122 | Medio | Alto |
| `dimelec_calculations.js` | `calcCurrent(kva, system, v)` — corriente | Alto | Crítico |
| `dimelec_calculations.js` | `calcLoads(loads, ...)` — motor cargas + criterio motor NEC 430.24 | Alto | Crítico |
| `dimelec_calculations.js` | `calcVoltageDrop(...)` — ΔV = k·I·L·(R·cosφ+X·sinφ) | Alto | Crítico |
| `dimelec_calculations.js` | `calcLosses(...)` — P = 3·I²·R·L | Medio | Alto |
| `dimelec_calculations.js` | `calcThermalCC(...)` — S_min = I·√t/k | Alto | Crítico |
| `dimelec_calculations.js` | `calcIccBT(...)` — IEC 60909 simplificado | Medio | Alto |
| `dimelec_calculations.js` | `voltageProfile(...)` — 10 puntos equidistantes | Bajo | Medio |
| `dimelec_calculations.js` | `dvCurve(...)` — curva ΔV vs L | Bajo | Bajo |
| `dimelec_calculations.js` | `economicAnalysis(...)` — Kelvin/VPN IEC 60287-3-2 | Bajo | Bajo |
| `dimelec_calculations.js` | `evalSelectivity(...)` — selectividad temporal | Bajo | Medio |
| `dimelec_conductor_selection.js` | `selectBT(...)` — iteración conductores BT | Alto | Crítico |
| `dimelec_conductor_selection.js` | `selectMT(...)` — iteración conductores MT + bug fixes | Alto | Crítico |
| `dimelec_conductor_selection.js` | `selectProtection(...)` — Ib≤In≤Iz + Icu≥Icc | Alto | Crítico |
| `dimelec_validations.js` | `evalGlobal(criterios)` — ALL(criterios) estricto | Alto | Crítico |
| `dimelec_validations.js` | `validarBT(...)` — 5 criterios BT | Alto | Crítico |
| `dimelec_validations.js` | `validarMT(...)` — 4 criterios MT | Alto | Crítico |
| `dimelec_charts.js` | `renderDvCurve(...)` — Chart.js ΔV vs L | Bajo | Medio |
| `dimelec_charts.js` | `renderVoltageProfile(...)` — perfil tensión | Bajo | Medio |
| `dimelec_charts.js` | `renderConductorComparison(...)` — comparación | Bajo | Bajo |
| `dimelec_charts.js` | `renderEconomicComparison(...)` — análisis económico | Bajo | Bajo |
| `dimelec_backend.js` | `checkHealth()` — ping backend | Bajo | Medio |
| `dimelec_backend.js` | `dimensionarBT(payload)` — POST API | Medio | Alto |
| `dimelec_backend.js` | `generarMemoriaBT(payload)` — descarga DOCX | Medio | Alto |
| `dimelec_exports.js` | `exportPayloadJSON(...)` | Bajo | Bajo |
| `dimelec_exports.js` | `exportXLSX()` — PENDIENTE IMPLEMENTACIÓN | — | Pendiente |
| `dimelec_exports.js` | `exportPDF()` — PENDIENTE IMPLEMENTACIÓN | — | Pendiente |
| `dimelec_app.js` | `calcular()` — orquestador principal | Alto | Crítico |
| `dimelec_app.js` | `calcularLocal()` — fallback offline | Alto | Crítico |
| `dimelec_app.js` | `buildPayload()` — construye JSON para API | Medio | Alto |
| `dimelec_app.js` | `cargarEjemplo(tipo)` — ejemplos predefinidos | Bajo | Bajo |
| `dimelec_ui.js` | `step0()…step8()` — renderizadores wizard | Medio | Medio |

## Variables globales críticas

| Variable | Módulo | Propósito |
|----------|--------|-----------|
| `DimelecStandards` | dimelec_standards.js | Motor normativo — acceso global |
| `DimelecCalc` | dimelec_calculations.js | Motor cálculo eléctrico |
| `DimelecConductorSelection` | dimelec_conductor_selection.js | Selección automática |
| `DimelecValidations` | dimelec_validations.js | Validación cumplimiento global |
| `DimelecCharts` | dimelec_charts.js | Renderizado gráficas |
| `DimelecBackend` | dimelec_backend.js | Conector API |
| `DimelecExports` | dimelec_exports.js | Exportaciones |
| `DimelecModals` | dimelec_modals.js | Modales UI |
| `DimelecApp` | dimelec_app.js | Estado global + orquestador |
| `DimelecUI` | dimelec_ui.js | Renderizadores wizard |
| `window.VORYN_API_URL` | global | URL API configurable para Voryn |
| `window.DIMELEC_API_URL` | global | URL API fallback |
