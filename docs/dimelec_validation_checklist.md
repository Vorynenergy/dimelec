# dimelec_validation_checklist.md
# Checklist de Validación — DimElec LATAM v1.0.0
**Fecha:** 2026-05-16

## 1. Botones y Navegación

| Botón | Acción | Estado | Observación |
|-------|--------|--------|-------------|
| Sidebar paso 1–9 | `DimelecApp.goStep(n)` | ✔ FUNCIONA | Cada paso renderiza su formulario |
| Siguiente / Anterior | `DimelecApp.next/prev()` | ✔ FUNCIONA | Navegación secuencial |
| Selector país | `setState({pais})` | ✔ FUNCIONA | Actualiza normativa en nav |
| Selector BT/MT | `setState({nivel})` | ✔ FUNCIONA | Cambia formulario paso 4 |
| Sistema eléctrico | `setState({system})` | ✔ FUNCIONA | mono/bi/trifásico |
| + Agregar carga | `addLoad()` | ✔ FUNCIONA | Agrega fila a tabla |
| Eliminar carga | `removeLoad(i)` | ✔ FUNCIONA | Elimina fila por índice |
| Duplicar carga | `duplicateLoad(i)` | ✔ FUNCIONA | Clona fila |
| Calcular (Paso 4→5) | `DimelecApp.calcular()` | ✔ FUNCIONA | Backend → fallback local |
| Exportar JSON payload | `DimelecExports.exportPayloadJSON()` | ✔ FUNCIONA | Descarga JSON |
| Exportar JSON resultado | `DimelecExports.exportResultJSON()` | ✔ FUNCIONA | Descarga JSON |
| Exportar CSV cargas | `DimelecExports.exportLoadsCSV()` | ✔ FUNCIONA | Descarga CSV |
| Exportar CSV resumen | `DimelecExports.exportSummaryCSV()` | ✔ FUNCIONA | Descarga CSV |
| Exportar PDF | `DimelecExports.exportPDF()` | ⚠ PENDIENTE | Requiere jsPDF+html2canvas |
| Exportar XLSX | `DimelecExports.exportXLSX()` | ⚠ PENDIENTE | Requiere SheetJS |
| Memoria DOCX BT | `DimelecBackend.generarMemoriaBT()` | ⚠ REQUIERE BACKEND | Funciona con Python |
| Memoria DOCX MT | `DimelecBackend.generarMemoriaMT()` | ⚠ REQUIERE BACKEND | Funciona con Python |
| Ejemplo motor | `DimelecApp.cargarEjemplo('motor')` | ✔ FUNCIONA | Carga cargas precargadas |
| Ejemplo comercial | `DimelecApp.cargarEjemplo('comercial')` | ✔ FUNCIONA | |
| Ejemplo vivienda | `DimelecApp.cargarEjemplo('vivienda')` | ✔ FUNCIONA | |
| Nuevo cálculo | `DimelecApp.goStep(0)` | ✔ FUNCIONA | Regresa a inicio |
| Debug toggle | `setState({debug:true})` | ✔ FUNCIONA | Panel JSON estado global |

## 2. Cálculos BT

| Cálculo | Módulo | Estado | Norma |
|---------|--------|--------|-------|
| Corriente monofásico | `DimelecCalc.calcCurrent` | ✔ | I=S/V |
| Corriente trifásico | `DimelecCalc.calcCurrent` | ✔ | I=S/(√3·V) |
| Cargas — factor demanda | `DimelecCalc.calcLoads` | ✔ | NEC 220 |
| Motor NEC 430.24 | `DimelecCalc.calcLoads` | ✔ | 125% mayor + suma |
| Factor temperatura Ft | `DimelecStandards.factorTemp` | ✔ | NEC 310.15(B)(2)(a) |
| Factor agrupamiento Fa | `DimelecStandards.factorAgrup` | ✔ | NEC 310.15(B)(3)(a) |
| Factor instalación Fi | `DimelecStandards.factorInstalacion` | ✔ | IEC 60364-5-52 |
| Factor armónicos | `DimelecStandards.factorArmonico` | ✔ | NEC 310.15(B)(5) |
| R corregida T° | `DimelecStandards.rCorregida` | ✔ | IEC 60228 |
| Selección conductor BT | `DimelecConductorSelection.selectBT` | ✔ | NEC 310.15 |
| Regulación de tensión | `DimelecCalc.calcVDrop` | ✔ | ΔV=k·I·L·(R·cosφ+X·sinφ) |
| Perfil tensión 10pts | `DimelecCalc.voltageProfile` | ✔ | IEC 60364 |
| Curva ΔV vs L | `DimelecCalc.dvCurve` | ✔ | Para gráfica |
| Pérdidas Joule | En conductor seleccionado | ✔ | IEC 60287 |
| Protección Ib≤In≤Iz | `DimelecConductorSelection.selectProtection` | ✔ | NEC 240 / IEC 60364-4-43 |
| Capacidad interruptiva | `prot.cumIcu` | ✔ | IEC 60947-2 |
| Cortocircuito IEC 60909 | `DimelecCalc.calcIccBT` | ✔ | c=1.05 BT |
| CC térmico S≥S_min | `DimelecCalc.calcThermalCC` | ✔ | IEC 60364-5-54 |
| Tierra EGC NEC 250.122 | `DimelecStandards.tierraMinima` | ✔ | NEC 250.122 |
| Neutro con THD | `cr.Ineutro` | ✔ | NEC 310.15(B)(5) |
| Selectividad básica | `DimelecCalc.evalSelectivity` | ✔ | IEC 60364-4-43 |
| Análisis económico Kelvin | `DimelecCalc.economicAnalysis` | ✔ | IEC 60287-3-2 |
| Validación global ALL() | `DimelecValidations.validarBT` | ✔ | Todos los criterios |

## 3. Cálculos MT

| Cálculo | Módulo | Estado | Norma |
|---------|--------|--------|-------|
| Selección tabla por nivel V | `_tablaParaNivel()` | ✔ CORREGIDO | IEC 60502-2 Tabla 1 |
| Filtro vmax_kv | Bug #1 corregido | ✔ | — |
| Conductor XLPE 15kV | MT_XLPE | ✔ | V≤15kV |
| Conductor XLPE 36kV | MT_XLPE_36kV | ✔ | 16<V≤36kV |
| Conductor ACSR aéreo | MT_ACSR vmax=34.5 | ✔ CORREGIDO | — |
| Emergencia transitoria | Bug #2 corregido | ✔ | IEC 60502-2 §14.1 |
| Emergencia continua | Bug #2 corregido | ✔ | IEC 60502-2 |
| Cables en paralelo | Bug #3 corregido | ✔ | IEC 60502-2 §14.4 |
| BIL por nivel tensión | `DimelecStandards.bilTension` | ✔ | IEC 60071-1 |
| Perfil tensión MT | 10 puntos | ✔ | IEC 60364 |
| Pérdidas MT | Joule 3 fases | ✔ | IEC 60287 |
| Análisis Kelvin MT | VPN(pérdidas) | ✔ | IEC 60287-3-2 |
| CC térmico MT | S_min = Icc·√t/k | ✔ | IEC 60364-5-54 |
| ICC MT IEC 60909 | c=1.10 | ✔ | IEC 60909-0 |

## 4. Validaciones LATAM

| País | Normativa | ΔV Terminal | ΔV Alimentador | Estado |
|------|-----------|------------|----------------|--------|
| Colombia | RETIE 2024 / NTC 2050 | 3% | 5% | ✔ |
| México | NOM-001-SEDE | 3% | 5% | ✔ |
| Perú | CNE Utilización | 2.5% | 4% | ✔ |
| Chile | SEC / NCh Elec | 3% | 5% | ✔ |
| Ecuador | NEC-SB-IE | 3% | 5% | ✔ |
| IEC Base | IEC 60364 | 3% | 5% | ✔ |

## 5. Frontend

| Componente | Estado | Observación |
|-----------|--------|-------------|
| index.html carga | ✔ | Sin errores de carga |
| Sidebar 9 pasos | ✔ | Todos navegables |
| Paso 1: País/Normativa | ✔ | Selector 6 países |
| Paso 2: Sistema eléctrico | ✔ | mono/bi/trifásico |
| Paso 3: Conductor | ✔ | BT y MT diferenciados |
| Paso 4: Cargas | ✔ | Tabla editable dinámica |
| Paso 5: Avanzados | ✔ | Trafo, ICC, selectividad, debug |
| Paso 6: Resultados | ✔ | Métricas + estado global |
| Paso 7: Gráficas | ✔ | Chart.js — ΔV, perfil, económico |
| Paso 8: Trazabilidad | ✔ | Ecuaciones, normas, factores |
| Paso 9: Memoria/Export | ✔ | JSON✔ CSV✔ PDF⚠ XLSX⚠ DOCX✔backend |
| Dark mode | ✔ | Variables CSS --dimelec-* |
| Responsive mobile | ✔ | Grid colapsa en 768px |
| Consola JS limpia | ✔ | Sin errores en carga |
| Backend fallback | ✔ | Cálculo local si backend offline |

## 6. Pendientes (no bloquean MVP)

| Item | Descripción | Esfuerzo |
|------|-------------|---------|
| PDF export | Integrar jsPDF + html2canvas | Medio |
| XLSX export | Integrar SheetJS | Bajo |
| Factor Ft MT en JS | Corrección temperatura XLPE 90°C | Bajo |
| Ft agrupamiento MT | Bancos de ductos subterráneos | Bajo |

## 7. Advertencia Técnica

> Los resultados son ayuda técnica preliminar. La validación final debe realizarse
> por Ingeniero Electricista habilitado, conforme a normativa vigente y
> requerimientos del operador de red local.
