import React, { useState, useEffect } from 'react';
import '../assets/estilos.css';
import '../assets/planificacion.css';
import '../assets/csv.css';
import '../assets/historial.css';
import * as XLSX from "xlsx";

function Historial() {
  const [datos, setDatos] = useState([]);
  const [datosEmp, setDatosEmp] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
  });
  const [filtrados, setFiltrados] = useState([]);
  const [popupDia, setPopupDia] = useState(null);
  const [popupVista, setPopupVista] = useState("servilleteras");
  const coloresSevilletera = {
    "S1": "rgba(75, 192, 192, 0.15)",
    "S2": "rgba(255, 159, 64, 0.15)",
    "S3": "rgba(153, 102, 255, 0.15)",
  };
  const coloresEmpaquetadora = {
    "E1": "rgba(52, 152, 219, 0.15)",
    "E2": "rgba(241, 196, 15, 0.15)",
  };

  // Cargar datos desde la API
  useEffect(() => {
    fetch('http://localhost:5000/api/planificacion')
      .then(res => res.json())
      .then(data => {
        setDatos(data.planificacion || []);
        setDatosEmp(data.planificacion_emp || []);
      });
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

  // Agrupar por fecha para empaquetadoras
  const datosEmpPorFecha = datosEmp.reduce((acc, item) => {
    const fecha = item.fecha.slice(0, 10);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(item);
    return acc;
  }, {});

  // Descargar Excel con dos hojas
  const descargarExcel = (fecha) => {
    // Servilleteras
    const headersS = ["Pedido", "Sevilletera", "Fecha", "Hora", "Producidas", "Restantes"];
    const filasS = (datosPorFecha[fecha] || []).map(fila => [
      fila.id_pedido,
      fila.id_sevilletera,
      fila.fecha.slice(0, 10),
      fila.hora,
      fila.unidades_producidas,
      Math.floor(fila.unidades_restantes)
    ]);
    // Empaquetadoras
    const headersE = ["Pedido", "Empaquetadora", "Fecha", "Hora", "Empaquetadas", "Restantes"];
    const filasE = (datosEmpPorFecha[fecha] || []).map(fila => [
      fila.id_pedido,
      fila.id_empaquetadora,
      fila.fecha.slice(0, 10),
      fila.hora,
      fila.unidades_empaquetadas,
      Math.floor(fila.unidades_restantes)
    ]);
    // Crear libro y hojas
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([headersS, ...filasS]);
    XLSX.utils.book_append_sheet(wb, ws1, "Servilleteras");
    const ws2 = XLSX.utils.aoa_to_sheet([headersE, ...filasE]);
    XLSX.utils.book_append_sheet(wb, ws2, "Empaquetadoras");
    XLSX.writeFile(wb, `planificacion_${fecha}.xlsx`);
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
                onClick={() => descargarExcel(fecha)}
                className="btn btn-descargar"
              >
                Descargar
              </button>
              <button
                onClick={() => { setPopupDia(fecha); setPopupVista("servilleteras"); }}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <button
                onClick={e => { e.stopPropagation(); setPopupVista("servilleteras"); }}
                style={{
                  marginRight: 16,
                  fontSize: 22,
                  background: popupVista === "servilleteras" ? "#e0e0e0" : "#fff",
                  border: "1px solid #bbb",
                  borderRadius: 6,
                  padding: "2px 10px",
                  cursor: "pointer"
                }}
                title="Ver Servilleteras"
              >
                &#8592;
              </button>
              <span style={{ fontWeight: 600, fontSize: 18 }}>
                {popupVista === "servilleteras" ? "Servilleteras" : "Empaquetadoras"}
              </span>
              <button
                onClick={e => { e.stopPropagation(); setPopupVista("empaquetadoras"); }}
                style={{
                  marginLeft: 16,
                  fontSize: 22,
                  background: popupVista === "empaquetadoras" ? "#e0e0e0" : "#fff",
                  border: "1px solid #bbb",
                  borderRadius: 6,
                  padding: "2px 10px",
                  cursor: "pointer"
                }}
                title="Ver Empaquetadoras"
              >
                &#8594;
              </button>
            </div>
            <h2>Resumen del día {popupDia}</h2>
            <div className="tabla-scroll">
              {popupVista === "servilleteras" ? (
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
                    {(datosPorFecha[popupDia] || []).map((fila, idx) => (
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
              ) : (
                <table className="tabla-detallada">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Empaquetadora</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Empaquetadas</th>
                      <th>Restantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(datosEmpPorFecha[popupDia] || []).map((fila, idx) => (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: coloresEmpaquetadora[fila.id_empaquetadora] || 'transparent'
                        }}
                      >
                        <td>{fila.id_pedido}</td>
                        <td>{fila.id_empaquetadora}</td>
                        <td>{fila.fecha.slice(0, 10)}</td>
                        <td>{fila.hora}</td>
                        <td>{fila.unidades_empaquetadas}</td>
                        <td>{Math.floor(fila.unidades_restantes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <button className="btn" onClick={() => setPopupDia(null)} style={{ marginTop: 16 }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historial;