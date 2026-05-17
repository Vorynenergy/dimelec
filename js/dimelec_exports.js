/**
 * dimelec_exports.js
 * DimElec LATAM — Exportaciones: JSON, CSV, PDF (PENDIENTE IMPLEMENTACIÓN)
 */

'use strict';

const DimelecExports = (() => {

  function _download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  /** Exporta payload JSON para uso con backend */
  function exportPayloadJSON(payload, pais = 'XX') {
    const ts = new Date().toISOString().slice(0,10);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    _download(blob, `dimelec_payload_${pais}_${ts}.json`);
  }

  /** Exporta resultado completo JSON */
  function exportResultJSON(resultado, pais = 'XX') {
    const ts = new Date().toISOString().slice(0,10);
    const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' });
    _download(blob, `dimelec_resultado_${pais}_${ts}.json`);
  }

  /** Exporta tabla de cargas como CSV */
  function exportLoadsCSV(loads, pais = 'XX') {
    const headers = ['Nombre','Tipo','kW unit.','Cantidad','FP','Efic.','F.Dem','F.Sim','Continua'];
    const rows = loads.map(c => [
      c.nombre, c.tipo, c.kw??c.potencia_kw, c.cant??c.cantidad??1,
      c.fp, c.ef??c.eficiencia??1, c.fd??c.factor_demanda??1,
      c.fs??c.factor_simultaneidad??1, c.cont??c.carga_continua?'Sí':'No',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    _download(blob, `dimelec_cargas_${pais}_${Date.now()}.csv`);
  }

  /** Exporta resumen de resultados como CSV */
  function exportSummaryCSV(resumen, pais = 'XX') {
    const rows = Object.entries(resumen).map(([k,v]) => [k, v]);
    const csv = [['Parámetro','Valor'], ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    _download(blob, `dimelec_resumen_${pais}_${Date.now()}.csv`);
  }

  /**
   * Exportar PDF — PENDIENTE IMPLEMENTACIÓN
   * Requiere jsPDF + html2canvas
   * Estado: marcado como pendiente hasta integración de dependencias
   */
  function exportPDF() {
    console.warn('[DimElec] exportPDF — PENDIENTE IMPLEMENTACIÓN. Requiere jsPDF + html2canvas.');
    alert('Exportación PDF: PENDIENTE IMPLEMENTACIÓN\n\nPor ahora use:\n• "Memoria DOCX" (requiere backend)\n• "Exportar JSON" para datos completos');
  }

  /**
   * Exportar XLSX — PENDIENTE IMPLEMENTACIÓN
   * Requiere SheetJS (xlsx)
   * Estado: marcado como pendiente hasta integración
   */
  function exportXLSX() {
    console.warn('[DimElec] exportXLSX — PENDIENTE IMPLEMENTACIÓN. Requiere SheetJS.');
    alert('Exportación XLSX: PENDIENTE IMPLEMENTACIÓN\n\nPor ahora use:\n• "Exportar CSV" para tablas\n• "Exportar JSON" para datos completos');
  }

  return { exportPayloadJSON, exportResultJSON, exportLoadsCSV, exportSummaryCSV, exportPDF, exportXLSX };

})();

if (typeof module !== 'undefined') module.exports = DimelecExports;
