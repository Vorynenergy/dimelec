# DimElec LATAM — v1.0.0 Voryn Ready

**Plataforma profesional de dimensionamiento eléctrico BT/MT para Latinoamérica.**
Part of **Voryn Energy Platform** — todos los archivos usan prefijo `dimelec_`.

---

## Descripción

DimElec LATAM automatiza el dimensionamiento preliminar de instalaciones eléctricas de baja y media tensión bajo normativas LATAM: RETIE (Colombia), NOM-001-SEDE (México), CNE (Perú), SEC (Chile), NEC-SB-IE (Ecuador), e IEC como base internacional.

## Funcionalidades

- Cálculo de cargas con criterio motor NEC 430.24
- Selección automática de conductores BT (AWG/mm²) y MT (XLPE/EPR/ACSR)
- Corrección de ampacidad: temperatura (tabla NEC 310.15) + agrupamiento + armónicos THD
- Regulación de tensión completa: `ΔV = k·I·L·(R·cosφ + X·sinφ)`
- Validación CC térmico: `S_min = I·√t/k` (IEC 60364-5-54)
- Cortocircuito IEC 60909 con impedancia de transformador
- Análisis económico Kelvin/VPN (IEC 60287-3-2)
- Selectividad temporal de protecciones
- Sección mínima conductor de tierra (NEC 250.122)
- Neutro con corrección por THD armónicos
- Perfil de tensión 10 puntos con V(pu)
- Gráficas: ΔV vs L, perfil tensión, comparación conductores, análisis económico
- Exportación JSON, CSV, DOCX (requiere backend)
- Modo offline completo para BT

## Bug fixes MT críticos (v1.0.1)

| # | Bug | Corrección |
|---|-----|-----------|
| 1 | XLPE 15kV seleccionado para 23/33 kV | Filtro vmax_kv — tabla XLPE_36kV para ≥15kV |
| 2 | Indicador emergencia ambiguo | Dos indicadores: transitoria (80%) y continua (100%) — IEC 60502-2 §14.1 |
| 3 | Sin recomendación cuando I_nom > amp_max | Recomendación de cables en paralelo — IEC 60502-2 §14.4 |
| 4 | ACSR sin vmax_kv | vmax_kv = 34.5 kV configurado |
| 5 | Cumplimiento global silenciaba fallos | ALL(criterios) estricto — ningún fallo oculto |

## Inicio rápido

```bash
# Abrir directamente en navegador (modo offline BT)
open index.html

# Con backend para DOCX + MT completo
pip install -r requirements.txt
cd app && uvicorn main:app --reload --port 8000
open index.html
```

## Estructura

```
dimelec-latam/
  index.html                    ← Entrada principal
  manifest.json                 ← Metadatos del producto
  css/
    dimelec_main.css            ← Design tokens + layout
    dimelec_components.css      ← Formularios, botones, tablas
    dimelec_responsive.css      ← Mobile/tablet
    dimelec_charts.css          ← Contenedores de gráficas
    dimelec_print.css           ← Impresión
  js/
    dimelec_standards.js        ← Motor normativo LATAM (tablas, factores, BIL)
    dimelec_calculations.js     ← Cálculo eléctrico (corriente, ΔV, CC, Kelvin)
    dimelec_conductor_selection.js ← Selección BT/MT + bug fixes
    dimelec_validations.js      ← Validación global ALL(criterios)
    dimelec_charts.js           ← Chart.js rendering
    dimelec_exports.js          ← JSON/CSV (XLSX/PDF pendiente)
    dimelec_backend.js          ← API connector + fallback offline
    dimelec_modals.js           ← Modales debug/error/info
    dimelec_app.js              ← Orquestador + estado global
    dimelec_ui.js               ← Wizard 9 pasos
  data/
    dimelec_countries.json      ← 6 países LATAM + IEC
    dimelec_conductors.json     ← AWG + mm² + MT-XLPE/EPR/ACSR
    dimelec_standards.json      ← Referencias normativas
    dimelec_ampacity_tables.json ← k_cc, tierra, BIL, transformadores
    dimelec_correction_factors.json ← Ft, Fa, THD, armónicos
    dimelec_protections.json    ← Tablas NEC/IEC + curvas B/C/D
    dimelec_voltage_drop.json   ← Límites ΔV por país
    dimelec_report_templates.json ← Estructura memoria DOCX
  docs/
    dimelec_project_map.md
    dimelec_mt_conductor_validation.md
    dimelec_validation_checklist.md
    dimelec_dependencies.md
    dimelec_architecture.md
  tests/
    dimelec_calculation_tests.md
    dimelec_mt_conductor_tests.md
```

## Integración Voryn Energy

```javascript
// Configurar URL de producción antes de cargar el JS
window.VORYN_API_URL = 'https://api.vorynenergy.com/dimelec';

// O variable secundaria
window.DIMELEC_API_URL = 'https://dimelec.vorynenergy.com';
```

Sin configuración, usa `http://localhost:8000` (desarrollo).

## Países soportados

| Código | País | Normativa | Unidad |
|--------|------|-----------|--------|
| CO | Colombia | RETIE 2024 / NTC 2050 | AWG |
| MX | México | NOM-001-SEDE | AWG |
| PE | Perú | CNE Utilización | mm² |
| CL | Chile | SEC / NCh Elec 4/2003 | mm² |
| EC | Ecuador | NEC-SB-IE / ARCONEL | mm² |
| IEC | Base IEC | IEC 60364 / 60502 / 60909 | mm² |

## Funcionamiento offline

El cálculo BT completo funciona sin backend:
- Motor de cálculo en JavaScript puro
- Tablas de conductores embebidas
- Exportación JSON y CSV
- Gráficas via Chart.js CDN

Requiere backend (Python FastAPI):
- Generación memorias DOCX
- Cálculo MT completo via API

## Advertencia técnica

Los resultados constituyen **ayuda técnica preliminar** para dimensionamiento eléctrico. La validación final, firma y legalización deben realizarse por un **Ingeniero Electricista o Electrónico habilitado**, conforme a normativa vigente del país y requerimientos del operador de red.
