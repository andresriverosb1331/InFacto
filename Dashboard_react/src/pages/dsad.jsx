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
const coloresEmpaquetadora = {
  "E1": "rgba(52, 152, 219, 0.15)", // Azul suave
  "E2": "rgba(241, 196, 15, 0.15)", // Amarillo suave
};

const PlanificacionInicial = () => {
  const [datos, setDatos] = useState([]);
  const [modoGrafico, setModoGrafico] = useState(false);
  const [lineaProduccion, setLineaProduccion] = useState(1);
  const [mostrarSelectorLinea, setMostrarSelectorLinea] = useState(false);
  const [datosEmp, setDatosEmp] = useState([]);
  const [dia, setDia] = useState(""); // Inicialmente vacío

  useEffect(() => {
    fetch("http://localhost:5000/api/planificacion")
      .then((res) => res.json())
      .then((data) => {
        setDatos(data.planificacion || []);
        setDatosEmp(data.planificacion_emp || []);
        // Si no hay día seleccionado y hay datos, usar la fecha del primer registro
        if (!dia && data.planificacion && data.planificacion.length > 0) {
          const fechaPrimera = data.planificacion[0].fecha?.slice(0, 10);
          if (fechaPrimera) setDia(fechaPrimera);
        }
      })
      .catch((error) => {
        console.error("Error cargando planificación:", error);
      });
  }, []);

  // Filtrar datos por día seleccionado
  const datosFiltrados = datos.filter(fila => fila.fecha && fila.fecha.slice(0, 10) === dia);
  const datosEmpFiltrados = datosEmp.filter(fila => fila.fecha && fila.fecha.slice(0, 10) === dia);

  // Agrupar datos por sevilletera
  const datosPorSevilletera = datosFiltrados.reduce((acc, item) => {
    const sevilletera = item.id_sevilletera;
    if (!acc[sevilletera]) {
      acc[sevilletera] = [];
    }
    acc[sevilletera].push(item);
    return acc;
  }, {});

  // Agrupar datos por empaquetadora
  const datosPorEmpaquetadora = datosEmpFiltrados.reduce((acc, item) => {
    const emp = item.id_empaquetadora;
    if (!acc[emp]) {
      acc[emp] = [];
    }
    acc[emp].push(item);
    return acc;
  }, {});

  const lineasProduccion = [1, 2, 3, 4, 5];

  return (
    <div className="planificacion-container">
      <div className="planificacion-wrapper">
        {/* Header */}
        <div className="planificacion-header">
          <h1 className="planificacion-title" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            📋 Planificación del Día
            <input
              type="date"
              value={dia}
              onChange={e => setDia(e.target.value)}
              style={{ marginLeft: 8, fontSize: 18, padding: "2px 8px", borderRadius: 6, border: "1px solid #bbb" }}
            />
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
            {/* Empaquetadoras */}
            <div className="sevilleteras-container" style={{ marginTop: 32 }}>
              {['E1', 'E2'].map(empaquetadora => (
                <div key={empaquetadora} className="sevilletera-card">
                  {/* Header de la Empaquetadora */}
                  <div className="sevilletera-header">
                    <h3 className="sevilletera-title">
                      📦 Empaquetadora {empaquetadora.slice(1)}
                    </h3>
                  </div>
                  {/* Contenido de la Empaquetadora */}
                  <div className="sevilletera-content">
                    {datosPorEmpaquetadora[empaquetadora] && datosPorEmpaquetadora[empaquetadora].length > 0 ? (
                      <div className="pedidos-container">
                        {datosPorEmpaquetadora[empaquetadora].map((item, idx) => (
                          <div key={idx} className={`pedido-card ${empaquetadora.toLowerCase()}`}>
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
                                ✅ Empaquetadas: {item.unidades_empaquetadas}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanificacionInicial;