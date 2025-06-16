import { useEffect, useState } from "react";
import "../assets/planificacion.css";
import PlanificacionGrafico from "./PlanificacionGrafico";
import "../assets/csv.css";

// Definimos colores para cada sevilletera
const coloresSevilletera = {
  "S1": "rgba(75, 192, 192, 0.15)", // Verde agua (tono suave)
  "S2": "rgba(255, 159, 64, 0.15)", // Naranja (tono suave)
  "S3": "rgba(153, 102, 255, 0.15)", // Púrpura (tono suave)
};

const PlanificacionInicial = () => {
  const [datos, setDatos] = useState([]);
  const [modoGrafico, setModoGrafico] = useState(false);
  const [lineaProduccion, setLineaProduccion] = useState(1);
  const [mostrarSelectorLinea, setMostrarSelectorLinea] = useState(false);

  useEffect(() => {
    fetch("/planificacion.json")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  }, []);

  // Función para descargar CSV
  const descargarCSV = () => {
    // Crear headers del CSV
    const headers = ["Pedido", "Sevilletera", "Fecha", "Hora", "Producidas", "Restantes"];
    
    // Convertir datos a formato CSV
    const csvContent = [
      headers.join(","), // Header row
      ...datos.map(fila => [
        fila.id_pedido,
        fila.id_sevilletera,
        fila.fecha.slice(0, 10),
        fila.hora,
        fila.unidades_producidas,
        Math.floor(fila.unidades_restantes)
      ].join(","))
    ].join("\n");

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `planificacion_detallada_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Agrupar datos por sevilletera
  const datosPorSevilletera = datos.reduce((acc, item) => {
    const sevilletera = item.id_sevilletera;
    if (!acc[sevilletera]) {
      acc[sevilletera] = [];
    }
    acc[sevilletera].push(item);
    return acc;
  }, {});

  const lineasProduccion = [1, 2, 3, 4, 5];

  return (
    <div className="planificacion-container">
      <div className="planificacion-wrapper">
        
        {/* Header */}
        <div className="planificacion-header">
          <h1 className="planificacion-title">
            📋 Planificación del Día
          </h1>
          
          <div className="linea-produccion-selector">
            <h2 
              className={`linea-produccion-title ${mostrarSelectorLinea ? 'active' : ''}`}
              onMouseEnter={() => setMostrarSelectorLinea(true)}
              onMouseLeave={() => setMostrarSelectorLinea(false)}
            >
              📍 Línea de producción {lineaProduccion}
              {mostrarSelectorLinea && (
                <div className="linea-produccion-dropdown">
                  {lineasProduccion.map(linea => (
                    <div
                      key={linea}
                      onClick={() => setLineaProduccion(linea)}
                      className={`linea-produccion-option ${linea === lineaProduccion ? 'selected' : ''}`}
                    >
                      Línea de producción {linea}
                    </div>
                  ))}
                </div>
              )}
            </h2>
          </div>

          <div>
            <button
              onClick={() => setModoGrafico(!modoGrafico)}
              className="toggle-grafico-btn"
            >
              {modoGrafico ? "📋 Ver tabla" : "📊 Ver gráfico"}
            </button>
          </div>
        </div>

        {modoGrafico ? (
          <PlanificacionGrafico datos={datos} />
        ) : (
          <div>
            {/* Contenedores de Sevilleteras */}
            <div className="sevilleteras-container">
              {['S1', 'S2', 'S3'].map(sevilletera => (
                <div key={sevilletera} className="sevilletera-card">
                  {/* Header de la Sevilletera */}
                  <div className="sevilletera-header">
                    <h3 className="sevilletera-title">
                      🏭 Sevilletera {sevilletera.slice(1)}
                    </h3>
                  </div>

                  {/* Contenido de la Sevilletera */}
                  <div className="sevilletera-content">
                    {datosPorSevilletera[sevilletera] && datosPorSevilletera[sevilletera].length > 0 ? (
                      <div className="pedidos-container">
                        {datosPorSevilletera[sevilletera].map((item, idx) => (
                          <div key={idx} className={`pedido-card ${sevilletera.toLowerCase()}`}>
                            <div className="pedido-header">
                              <span className="pedido-id">
                                📦 Pedido {item.id_pedido}
                              </span>
                              <span className="pedido-fecha">
                                {item.fecha.slice(0, 10)}
                              </span>
                            </div>
                            
                            <div className="pedido-stats">
                              <span className="pedido-producidas">
                                ✅ Producidas: {item.unidades_producidas}
                              </span>
                              <span className="pedido-restantes">
                                ⏳ Restantes: {Math.floor(item.unidades_restantes)}
                              </span>
                            </div>
                            
                            <div className="pedido-hora">
                              🕐 {item.hora}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="sevilletera-vacia">
                        <div className="sevilletera-vacia-icon">
                          📭
                        </div>
                        <div>Sin pedidos programados</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla completa */}
            <div className="tabla-detallada-container">
              <div className="tabla-detallada-header">
                <h3 className="tabla-detallada-title">
                  📋 Vista Detallada Completa
                </h3>
                <button 
                  onClick={descargarCSV}
                  className="btn-descargar-csv"
                  title="Descargar tabla como CSV"
                >
                  📥 Descargar CSV
                </button>
              </div>
              
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
                    {datos.map((fila, idx) => (
                      <tr 
                        key={idx} 
                        className={`tabla-fila-${fila.id_sevilletera.toLowerCase()}`}
                        style={{
                          backgroundColor: coloresSevilletera[fila.id_sevilletera] || 'transparent'
                        }}
                      >
                        <td>{fila.id_pedido}</td>
                        <td className="tabla-sevilletera">{fila.id_sevilletera}</td>
                        <td>{fila.fecha.slice(0, 10)}</td>
                        <td>{fila.hora}</td>
                        <td className="tabla-producidas">{fila.unidades_producidas}</td>
                        <td className="tabla-restantes">{Math.floor(fila.unidades_restantes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanificacionInicial;