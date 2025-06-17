import React, { useState, useEffect } from 'react';
import '../assets/estilos.css';
import '../assets/planificacion.css';
import '../assets/csv.css';
import '../assets/historial.css';

function Historial() {
  const [datos, setDatos] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
  });
  const [filtrados, setFiltrados] = useState([]);
  const [popupDia, setPopupDia] = useState(null);
  const coloresSevilletera = {
    "S1": "rgba(75, 192, 192, 0.15)", // Verde agua (tono suave)
    "S2": "rgba(255, 159, 64, 0.15)", // Naranja (tono suave)
    "S3": "rgba(153, 102, 255, 0.15)", // Púrpura (tono suave)
  };
  // Cargar datos del JSON
  useEffect(() => {
    fetch('/planificacion.json')
      .then(res => res.json())
      .then(data => setDatos(data));
  }, []);

  // Filtrar por rango de fechas
  useEffect(() => {
    let resultado = datos;
    if (filtros.fechaDesde)
      resultado = resultado.filter(d => d.fecha.slice(0, 10) >= filtros.fechaDesde);
    if (filtros.fechaHasta)
      resultado = resultado.filter(d => d.fecha.slice(0, 10) <= filtros.fechaHasta);
    setFiltrados(resultado);
  }, [datos, filtros]);

  // Agrupar por fecha
  const datosPorFecha = filtrados.reduce((acc, item) => {
    const fecha = item.fecha.slice(0, 10);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(item);
    return acc;
  }, {});

  // Descargar CSV de un día
  const descargarCSV = (fecha) => {
    const headers = ["Pedido", "Sevilletera", "Fecha", "Hora", "Producidas", "Restantes"];
    const filas = datosPorFecha[fecha].map(fila => [
      fila.id_pedido,
      fila.id_sevilletera,
      fila.fecha.slice(0, 10),
      fila.hora,
      fila.unidades_producidas,
      Math.floor(fila.unidades_restantes)
    ].join(","));
    const csvContent = [headers.join(","), ...filas].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `planificacion_${fecha}.csv`;
    link.click();
  };

  return (
    <div className="main-container">
      <div className="filtros-header">
        <h1 className="filtros-title">Filtrado de Documentos</h1>
        <p className="filtros-subtitle">Busca y descarga documentos por fecha</p>
      </div>

      <div className="filtros-container">
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label className="filtro-label">Fecha Desde</label>
            <input
              type="date"
              className="filtro-input"
              value={filtros.fechaDesde}
              onChange={e => setFiltros({ ...filtros, fechaDesde: e.target.value })}
            />
          </div>
          <div className="filtro-grupo">
            <label className="filtro-label">Fecha Hasta</label>
            <input
              type="date"
              className="filtro-input"
              value={filtros.fechaHasta}
              onChange={e => setFiltros({ ...filtros, fechaHasta: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="documentos-container">
        {Object.keys(datosPorFecha).length === 0 ? (
          <div>No hay datos para mostrar</div>
        ) : (
          Object.keys(datosPorFecha).sort().map(fecha => (
            <div key={fecha} className="documento-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ flex: 1, fontWeight: 'bold', fontSize: 18 }}>{fecha}</div>
              <button
                style={{ marginRight: 8 }}
                onClick={() => descargarCSV(fecha)}
                className="btn btn-descargar"
              >
                Descargar
              </button>
              <button
                onClick={() => setPopupDia(fecha)}
                className="btn btn-ver"
              >
                Ver
              </button>
            </div>
          ))
        )}
      </div>

      {/* Popup para ver resumen del día */}
    {popupDia && (
      <div className="popup-overlay" onClick={() => setPopupDia(null)}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          <h2>Resumen del día {popupDia}</h2>
          <div className="tabla-scroll">
            <table className="tabla-detallada">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Sevilletera</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Producidas</th>
                  <th>Restantes</th>
                </tr>
              </thead>
              <tbody>
                {datosPorFecha[popupDia].map((fila, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: coloresSevilletera[fila.id_sevilletera] || 'transparent'
                    }}
                  >
                    <td>{fila.id_pedido}</td>
                    <td>{fila.id_sevilletera}</td>
                    <td>{fila.fecha.slice(0, 10)}</td>
                    <td>{fila.hora}</td>
                    <td>{fila.unidades_producidas}</td>
                    <td>{Math.floor(fila.unidades_restantes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn" onClick={() => setPopupDia(null)} style={{ marginTop: 16 }}>Cerrar</button>
        </div>
      </div>
    )}
    </div>
  );
}

export default Historial;