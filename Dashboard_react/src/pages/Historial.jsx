import React, { useState, useEffect } from 'react';
import '../assets/estilos.css';
import '../assets/planificacion.css';
import '../assets/csv.css';
import '../assets/historial.css'; // ✅ nuevo archivo CSS con clases faltantes

function Historial() {
  const [documentos] = useState([
    {
    },
  ]);

  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    numeroPedido: '',
    tipoDocumento: '',
  });

  const [filtrados, setFiltrados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    setFiltrados(documentos);
  }, [documentos]);

  useEffect(() => {
    if (filtros.numeroPedido.length >= 3 || filtros.numeroPedido.length === 0) {
      aplicarFiltros();
    }
  }, [filtros.numeroPedido]);

  const aplicarFiltros = () => {
    setBuscando(true);
    setTimeout(() => {
      const resultado = documentos.filter((doc) => {
        const cumpleDesde = !filtros.fechaDesde || doc.fecha >= filtros.fechaDesde;
        const cumpleHasta = !filtros.fechaHasta || doc.fecha <= filtros.fechaHasta;
        const cumplePedido = !filtros.numeroPedido || doc.numeroPedido.toLowerCase().includes(filtros.numeroPedido.toLowerCase());
        const cumpleTipo = !filtros.tipoDocumento || doc.tipo === filtros.tipoDocumento;
        return cumpleDesde && cumpleHasta && cumplePedido && cumpleTipo;
      });
      setFiltrados(resultado);
      setBuscando(false);
    }, 800);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      numeroPedido: '',
      tipoDocumento: '',
    });
    setFiltrados(documentos);
  };

  const descargarCSV = () => {
    if (filtrados.length === 0) {
      alert('No hay documentos para descargar');
      return;
    }

    const headers = ['ID', 'Número de Pedido', 'Fecha', 'Tipo', 'Nombre', 'Estado'];
    const csv = [
      headers.join(','),
      ...filtrados.map((doc) =>
        [doc.id, doc.numeroPedido, doc.fecha, doc.tipo, `"${doc.nombre}"`, doc.estado].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `documentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="main-container">
      <div className="filtros-header">
        <h1 className="filtros-title">
          <i className="fas fa-filter"></i> Filtrado de Documentos
        </h1>
        <p className="filtros-subtitle">
          Busca y descarga documentos por fecha y número de pedido
        </p>
      </div>

      <div className="filtros-container">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label className="filtro-label">
              <i className="fas fa-calendar-alt"></i> Fecha Desde
            </label>
            <input
              type="date"
              className="filtro-input"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
            />
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">
              <i className="fas fa-calendar-check"></i> Fecha Hasta
            </label>
            <input
              type="date"
              className="filtro-input"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
            />
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">
              <i className="fas fa-hashtag"></i> Número de Pedido
            </label>
            <input
              type="text"
              className="filtro-input"
              placeholder="Ej: PED-2024-001"
              value={filtros.numeroPedido}
              onChange={(e) => setFiltros({ ...filtros, numeroPedido: e.target.value })}
            />
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label">
              <i className="fas fa-file-alt"></i> Tipo de Documento
            </label>
            <select
              className="filtro-input"
              value={filtros.tipoDocumento}
              onChange={(e) => setFiltros({ ...filtros, tipoDocumento: e.target.value })}
            >
              <option value="">Todos los tipos</option>
              <option value="factura">Facturas</option>
              <option value="orden">Órdenes de Producción</option>
              <option value="reporte">Reportes</option>
              <option value="planificacion">Planificación</option>
            </select>
          </div>
        </div>

        <div className="filtros-acciones">
          <button className="btn btn-filtrar" onClick={aplicarFiltros}>
            <i className="fas fa-search"></i> Buscar Documentos
          </button>
          <button className="btn btn-limpiar" onClick={limpiarFiltros}>
            <i className="fas fa-eraser"></i> Limpiar Filtros
          </button>
          <button className="btn btn-descargar" onClick={descargarCSV}>
            <i className="fas fa-download"></i> Descargar CSV
          </button>
        </div>
      </div>

      <div className="resultados-info">
        <div className="resultados-contador">
          <i className="fas fa-file-text"></i>{' '}
          <span>{filtrados.length}</span> documentos encontrados
        </div>
        <div className="resultados-filtros-activos">
          {Object.entries(filtros)
            .filter(([_, v]) => v)
            .map(([k, v]) => (
              <span key={k} className="filtro-activo">
                {`${k === 'fechaDesde' ? 'Desde' : k === 'fechaHasta' ? 'Hasta' : k === 'numeroPedido' ? 'Pedido' : 'Tipo'}: ${v}`}
              </span>
            ))}
        </div>
      </div>

      <div className="documentos-container">
        {buscando ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Buscando documentos...</span>
          </div>
        ) : (
          <>
            <div className="placeholder-icon">
              <i className="fas fa-folder-open"></i>
            </div>
            <div className="documentos-placeholder">
              {filtrados.length > 0
                ? `${filtrados.length} documentos encontrados`
                : 'No se encontraron documentos'}
            </div>
            <div className="placeholder-descripcion">
              {filtrados.length > 0
                ? 'Aquí se mostrarían los documentos filtrados. Puedes descargar los resultados en formato CSV.'
                : 'Prueba ajustando los filtros para encontrar documentos.'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Historial;
