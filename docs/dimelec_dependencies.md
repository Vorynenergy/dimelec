# dimelec_dependencies.md
# Dependencias — DimElec LATAM v1.0.0

## Dependencias Externas CDN

| Librería | Versión | CDN | Estado | Uso | Crítico |
|---------|---------|-----|--------|-----|---------|
| Chart.js | 4.4.0 | jsdelivr | ✔ ACTIVO | Todas las gráficas (paso 7) | Sí |
| jsPDF | 2.5.1 | cdnjs | ⚠ COMENTADO | Exportación PDF | No (MVP) |
| html2canvas | 1.4.1 | cdnjs | ⚠ COMENTADO | Captura para PDF | No (MVP) |
| SheetJS/xlsx | 0.18.5 | cdnjs | ⚠ COMENTADO | Exportación XLSX | No (MVP) |

## CDN Actual — Chart.js
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```
**Riesgo producción:** Bajo. jsdelivr tiene 99.99% SLA. Versión fijada en @4.4.0.  
**Recomendación:** Descargar localmente para entorno air-gap o auditoría.

## Backend Python (FastAPI)

| Endpoint | URL | Uso | Crítico |
|---------|-----|-----|---------|
| GET / | http://localhost:8000 | Health check | No |
| POST /api/v1/dimensionar-bt | http://localhost:8000 | Cálculo BT server | No (tiene fallback) |
| POST /api/v1/dimensionar-mt | http://localhost:8000 | Cálculo MT server | No (parcial) |
| POST /api/v1/generar-memoria-bt | http://localhost:8000 | DOCX BT | Sí (para DOCX) |
| POST /api/v1/generar-memoria-mt | http://localhost:8000 | DOCX MT | Sí (para DOCX) |

**Configuración para producción:**
```javascript
// En index.html antes de DOMContentLoaded:
window.VORYN_API_URL   = 'https://api.vorynenergy.com/dimelec';
window.DIMELEC_API_URL = 'https://dimelec.vorynenergy.com';
```

## Dependencias Python Backend

```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.0.0
python-docx>=1.0.0
```

Instalar: `pip install -r requirements.txt`  
Iniciar: `cd app && uvicorn main:app --reload --port 8000`

## Modo Offline (sin backend)

El frontend **funciona completamente sin backend** para:
- Cálculo BT completo (motor JS embebido)
- Exportación JSON/CSV
- Gráficas Chart.js

Requiere backend para:
- Cálculo MT completo (motor Python)
- Generación DOCX (python-docx)

## Riesgos de Producción

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| CDN Chart.js caído | Muy baja | Descargar js/chart.min.js localmente |
| Backend no disponible | Media | Fallback local para BT ✔ |
| CORS bloqueado | Alta en producción | Configurar CORS en FastAPI con dominio Voryn |
| Timeout backend | Baja | AbortSignal.timeout(2000) en health check |
