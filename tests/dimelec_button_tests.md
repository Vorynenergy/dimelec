# dimelec_button_tests.md
# Inventario y Estado de Botones — DimElec LATAM v1.0.0

## Paso 1 — País y Normativa
| Botón/Control | Evento | Función JS | Estado |
|--------------|--------|-----------|--------|
| Select país | onchange | `setState({pais})` + re-render | ✔ |
| Select tipo instalación | onchange | `setState({tipoInst})` | ✔ |
| Select tipo circuito | onchange | `setState({tipoCir})` | ✔ |
| Select nivel BT/MT | onchange | `setState({nivel})` | ✔ |
| Botón Siguiente | onclick | `DimelecApp.next()` | ✔ |

## Paso 2 — Sistema Eléctrico
| Botón/Control | Estado |
|--------------|--------|
| Radio mono/bi/trifásico | ✔ |
| Input tensión V | ✔ |
| Input longitud m | ✔ |
| Botón Siguiente/Anterior | ✔ |

## Paso 3 — Conductor
| Botón/Control | Estado |
|--------------|--------|
| Select material Cu/Al | ✔ |
| Select unidad AWG/mm² | ✔ |
| Select método instalación | ✔ |
| Input temperatura ambiente | ✔ |
| Input temperatura operación | ✔ |
| Input N circuitos agrupados | ✔ |
| Input THD % | ✔ |
| Input reserva % | ✔ |

## Paso 4 — Cargas
| Botón/Control | Estado |
|--------------|--------|
| Botón + Agregar carga | ✔ |
| Botón Eliminar carga (×) | ✔ |
| Botón Duplicar | ✔ |
| Botón Ejemplo motor | ✔ |
| Botón Ejemplo comercial | ✔ |
| Botón Ejemplo vivienda | ✔ |
| Inputs tabla (nombre,kw,fp,etc) | ✔ |
| Select tipo carga | ✔ |
| Checkbox carga continua | ✔ |

## Paso 5 — Parámetros Avanzados
| Botón/Control | Estado |
|--------------|--------|
| Input trafo kVA | ✔ |
| Input trafo Z% | ✔ |
| Input trafo R% | ✔ |
| Input ICC disponible | ✔ |
| Input t despeje | ✔ |
| Select curva B/C/D | ✔ |
| Input protección aguas arriba | ✔ |
| Input empresa/profesional | ✔ |
| Checkbox modo debug | ✔ |
| **Botón CALCULAR** | ✔ CRÍTICO |

## Paso 6 — Resultados
| Botón/Control | Estado |
|--------------|--------|
| Visualización métricas | ✔ |
| Estado CUMPLE/NO CUMPLE | ✔ |
| Checklist criterios | ✔ |
| Botón Ir a Gráficas | ✔ |
| Botón Nuevo cálculo | ✔ |

## Paso 7 — Gráficas
| Botón/Control | Estado |
|--------------|--------|
| Gráfica ΔV vs longitud | ✔ Chart.js |
| Gráfica perfil tensión | ✔ Chart.js |
| Gráfica comparación conductores | ✔ Chart.js |
| Gráfica análisis económico | ✔ Chart.js |

## Paso 8 — Trazabilidad
| Botón/Control | Estado |
|--------------|--------|
| Tabla factores y ecuaciones | ✔ |
| Criterios normativos | ✔ |
| Panel debug JSON | ✔ (si debug=true) |

## Paso 9 — Memoria / Exportar
| Botón/Control | Estado |
|--------------|--------|
| Descargar Memoria DOCX | ⚠ REQUIERE BACKEND |
| Exportar JSON payload | ✔ |
| Exportar JSON resultado | ✔ |
| Exportar CSV cargas | ✔ |
| Exportar CSV resumen | ✔ |
| Exportar PDF | ⚠ PENDIENTE IMPLEMENTACIÓN |
| Exportar XLSX | ⚠ PENDIENTE IMPLEMENTACIÓN |
| Guardar proyecto | ⚠ PENDIENTE (requiere auth) |
| Nuevo cálculo | ✔ |

## Sidebar y Navegación
| Control | Estado |
|---------|--------|
| Pasos 1–9 sidebar | ✔ clickeables |
| Badges estado (activo/done) | ✔ |
| Tags nav (país + BT/MT) | ✔ |
| Responsive collapse sidebar | ✔ <768px |
