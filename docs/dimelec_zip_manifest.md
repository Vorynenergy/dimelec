# dimelec_zip_manifest.md
# Manifiesto ZIP — dimelec-latam_v1.0.0_voryn-ready.zip
**DimElec LATAM v1.0.0 | Generado:** 2026-05-16

## Validación de Archivos

| Archivo | Carpeta | Propósito | Crítico | Validado |
|---------|---------|-----------|---------|----------|
| `README.md` | `raíz` | Documentación principal | No | — |
| `index.html` | `raíz` | Entrada SPA — wizard 9 pasos | SÍ | ✔ |
| `manifest.json` | `raíz` | Metadatos del producto Voryn | No | ✔ |
| `tests/dimelec_button_tests.md` | `tests` | Documentación / Test | No | — |
| `tests/dimelec_calculation_tests.md` | `tests` | Documentación / Test | No | — |
| `tests/dimelec_export_tests.md` | `tests` | Documentación / Test | No | — |
| `tests/dimelec_mt_conductor_tests.md` | `tests` | Documentación / Test | No | — |
| `data/dimelec_ampacity_tables.json` | `data` | k_cc, tierra, BIL, transformadores | No | ✔ |
| `data/dimelec_conductors.json` | `data` | Tablas BT+MT con bug fixes vmax_kv | SÍ | ✔ |
| `data/dimelec_correction_factors.json` | `data` | Ft, Fa, Fi, THD, alpha | No | ✔ |
| `data/dimelec_countries.json` | `data` | Reglas normativas 6 países LATAM | SÍ | ✔ |
| `data/dimelec_protections.json` | `data` | Protecciones comerciales NEC/IEC + curvas | No | ✔ |
| `data/dimelec_report_templates.json` | `data` | Estructura memoria DOCX | No | ✔ |
| `data/dimelec_standards.json` | `data` | Referencias normativas BT/MT | SÍ | ✔ |
| `data/dimelec_voltage_drop.json` | `data` | Límites ΔV por país + precios Kelvin | No | ✔ |
| `css/dimelec_charts.css` | `css` | Contenedores Chart.js | No | ✔ |
| `css/dimelec_components.css` | `css` | Forms, botones, tablas | No | ✔ |
| `css/dimelec_main.css` | `css` | Design tokens + layout dark theme | No | ✔ |
| `css/dimelec_print.css` | `css` | Impresión y PDF | No | ✔ |
| `css/dimelec_responsive.css` | `css` | Mobile/tablet | No | ✔ |
| `docs/dimelec_architecture.md` | `docs` | Documentación / Test | No | — |
| `docs/dimelec_dependencies.md` | `docs` | Documentación / Test | No | — |
| `docs/dimelec_mt_conductor_validation.md` | `docs` | Documentación / Test | No | — |
| `docs/dimelec_project_map.md` | `docs` | Documentación / Test | No | — |
| `docs/dimelec_validation_checklist.md` | `docs` | Documentación / Test | No | — |
| `docs/dimelec_zip_manifest.md` | `docs` | Documentación / Test | No | — |
| `js/dimelec_app.js` | `js` | Orquestador — estado global y flujo | SÍ | ✔ |
| `js/dimelec_backend.js` | `js` | Conector API + fallback offline | No | ✔ |
| `js/dimelec_calculations.js` | `js` | Motor cálculo BT/MT (JS offline) | SÍ | ✔ |
| `js/dimelec_charts.js` | `js` | Gráficas Chart.js | No | ✔ |
| `js/dimelec_conductor_selection.js` | `js` | Selección conductores BT+MT con bug fixes | SÍ | ✔ |
| `js/dimelec_exports.js` | `js` | JSON, CSV, PDF(pend), XLSX(pend) | No | ✔ |
| `js/dimelec_modals.js` | `js` | Helpers UI modales | No | ✔ |
| `js/dimelec_standards.js` | `js` | Tablas y factores normativos LATAM | SÍ | ✔ |
| `js/dimelec_ui.js` | `js` | Renderizado wizard — 9 pasos HTML | SÍ | ✔ |
| `js/dimelec_validations.js` | `js` | Validación global ALL(criterios) | SÍ | ✔ |

## Verificaciones Globales

| Check | Estado |
|-------|--------|
| Sin archivos ambiguos (main.css, app.js, etc.) | ✔ Todos tienen prefijo dimelec_ |
| Sin archivos de otros productos Voryn | ✔ Solo DimElec LATAM |
| index.html carga sin errores | ✔ |
| Todos los CSS referenciados existen | ✔ |
| Todos los JS referenciados existen | ✔ |
| Bug #1 MT (vmax_kv) corregido | ✔ v1.0.1 |
| Bug #2 MT (emergencia dual) corregido | ✔ v1.0.1 |
| Bug #3 MT (paralelo) corregido | ✔ v1.0.1 |
| Backend documentado y configurable | ✔ window.VORYN_API_URL |
| Exportaciones JSON/CSV funcionan | ✔ offline |
| PDF/XLSX marcados como PENDIENTE | ✔ |
| Documentación completa (5 docs) | ✔ |
| Tests incluidos (4 archivos) | ✔ |
| manifest.json actualizado | ✔ |

## Total archivos: 36
