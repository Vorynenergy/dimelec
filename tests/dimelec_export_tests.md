# dimelec_export_tests.md
# Tests de Exportación — DimElec LATAM v1.0.0

## JSON Payload
- ✔ Genera blob JSON con todos los campos del estado
- ✔ Filename: `dimelec_payload_CO_2026-05-16.json`
- ✔ Incluye cargas, empresa, normativa, conductor

## JSON Resultado
- ✔ Genera blob JSON con resultado completo
- ✔ Incluye resumen, trazabilidad, cumplimiento, perfil tensión

## CSV Cargas
- ✔ Headers: Nombre,Tipo,kW,Cantidad,FP,Efic,FD,FS,Continua
- ✔ Rows: una por carga
- ✔ Filename: `dimelec_cargas_CO_<timestamp>.csv`

## CSV Resumen
- ✔ Headers: Parámetro,Valor
- ✔ Exporta resumen plano del resultado

## PDF — PENDIENTE IMPLEMENTACIÓN
- Estado: Función declarada, muestra alerta con instrucciones
- Requiere: `jsPDF@2.5.1` + `html2canvas@1.4.1`
- CDN listo (comentado en index.html)

## XLSX — PENDIENTE IMPLEMENTACIÓN  
- Estado: Función declarada, muestra alerta
- Requiere: `SheetJS@0.18.5`
- CDN listo (comentado en index.html)

## DOCX Backend
- ✔ `DimelecBackend.generarMemoriaBT(payload)` → descarga .docx
- ✔ `DimelecBackend.generarMemoriaMT(payload)` → descarga .docx
- ⚠ Requiere backend Python en localhost:8000 o URL Voryn configurada
