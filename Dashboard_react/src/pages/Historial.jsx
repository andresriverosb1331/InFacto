import { useEffect, useState } from "react";
import "../assets/planificacion.css";
import "../assets/estilos.css";

function Historial() {
  const [archivosServ, setArchivosServ] = useState([]);
  const [archivosEmp, setArchivosEmp] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [contenido, setContenido] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");
  const [popupVista, setPopupVista] = useState("servilleteras");

  useEffect(() => {
    fetch("http://localhost:5000/api/historial")
      .then((res) => res.json())
      .then((data) => {
        const serv = data
          .filter((a) => a.includes("servilleteras"))
          .sort((a, b) => b.localeCompare(a));
        const emp = data
          .filter((a) => a.includes("empaquetadoras"))
          .sort((a, b) => b.localeCompare(a));
        setArchivosServ(serv);
        setArchivosEmp(emp);
      })
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  const cargarPlanificacion = (nombreBase) => {
    const nombreCompleto = `${nombreBase}.json`;

    fetch(`http://localhost:5000/api/historial/${nombreCompleto}`)
      .then((res) => res.json())
      .then((data) => {
        setSeleccionado(nombreBase);
        setContenido(data);
      })
      .catch((err) => console.error("Error cargando planificación:", err));
  };

  const descargarComoCSV = (archivo) => {
    fetch(`http://localhost:5000/api/historial/${archivo}`)
      .then((res) => res.json())
      .then((data) => {
        const headers = archivo.includes("empaquetadoras")
          ? ["Pedido", "Empaquetadora", "Fecha", "Hora", "Empaquetadas", "Restantes"]
          : ["Pedido", "Sevilletera", "Fecha", "Hora", "Producidas", "Restantes"];

        const csv = [
          headers.join(","),
          ...data.map((fila) => [
            fila.id_pedido,
            fila.id_empaquetadora || fila.id_sevilletera,
            fila.fecha?.slice(0, 10),
            fila.hora,
            fila.unidades_empaquetadas || fila.unidades_producidas,
            Math.floor(fila.unidades_restantes),
          ].join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${archivo.replace(".json", ".csv")}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => console.error("Error exportando CSV:", err));
  };

  const aplicarFiltro = (archivos) =>
    filtroFecha
      ? archivos.filter((archivo) =>
          archivo.includes(filtroFecha.split("-").reverse().join("-"))
        )
      : archivos;

  const renderLista = (tipo, archivos) => (
    <div className="sevilletera-card">
      <h3 className="sevilletera-title">
        📁 Planificaciones de {tipo === "servilleteras" ? "Servilleteras" : "Empaquetadoras"}
      </h3>
      <ul className="lista-planificaciones">
        {archivos.map((archivo) => {
          const nombre = archivo.replace(".json", "");
          const fecha = nombre.replace(`planificacion-${tipo}-`, "");
          return (
            <li key={archivo} className="item-planificacion">
              <button
                className={`btn-cargar ${seleccionado === nombre ? "activo" : ""}`}
                onClick={() => cargarPlanificacion(nombre)}
              >
                📅 {fecha}
              </button>
              <button
                className="btn-descargar"
                title={`Descargar CSV`}
                onClick={() => descargarComoCSV(archivo)}
              >
                ⬇️
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="planificacion-container">
      <h1 className="planificacion-title">🗂️ Historial de Planificaciones</h1>

      <div className="busqueda-fecha">
        <label>
          📅 Buscar por fecha:&nbsp;
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
          {filtroFecha && (
            <button className="btn-limpiar-fecha" onClick={() => setFiltroFecha("")}>
              ❌ Limpiar
            </button>
          )}
        </label>
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {renderLista("servilleteras", aplicarFiltro(archivosServ))}
        {renderLista("empaquetadoras", aplicarFiltro(archivosEmp))}
      </div>

      {contenido.length > 0 && (
        <>
          <button
            className="btn"
            style={{ margin: "20px 0" }}
            onClick={() => setContenido([])}
          >
            Cerrar Detalles
          </button>
          <div className="popup-overlay" style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div className="popup-content" style={{
              background: "#232c3b",
              padding: 32,
              borderRadius: 12,
              minWidth: 320,
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative"
            }}>
              <h2>Resumen de planificación</h2>
              <div className="tabla-scroll">
                {/* Tabla de Servilleteras */}
                {contenido.some(fila => fila.id_sevilletera) && (
                  <>
                    <h3 style={{marginTop: 0}}>Servilleteras</h3>
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
                        {contenido
                          .filter(fila => fila.id_sevilletera)
                          .map((fila, idx) => (
                            <tr key={idx}>
                              <td>{fila.id_pedido}</td>
                              <td>{fila.id_sevilletera}</td>
                              <td>{fila.fecha?.slice(0, 10)}</td>
                              <td>{fila.hora}</td>
                              <td>{fila.unidades_producidas}</td>
                              <td>{Math.floor(fila.unidades_restantes)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                )}
                {/* Tabla de Empaquetadoras */}
                {contenido.some(fila => fila.id_empaquetadora) && (
                  <>
                    <h3 style={{marginTop: 24}}>Empaquetadoras</h3>
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
                        {contenido
                          .filter(fila => fila.id_empaquetadora)
                          .map((fila, idx) => (
                            <tr key={idx}>
                              <td>{fila.id_pedido}</td>
                              <td>{fila.id_empaquetadora}</td>
                              <td>{fila.fecha?.slice(0, 10)}</td>
                              <td>{fila.hora}</td>
                              <td>{fila.unidades_empaquetadas}</td>
                              <td>{Math.floor(fila.unidades_restantes)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <button
                className="btn"
                style={{ marginTop: 16 }}
                onClick={() => setContenido([])}
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}

      {/* Estilos locales */}
      <style>{`
        .item-planificacion {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .btn-descargar {
          text-decoration: none;
          color: white;
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #3a3f47;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .btn-descargar:hover {
          background-color: #536079;
          transform: scale(1.1);
        }

        .btn-cargar.activo {
          background-color: #0b79d0;
        }
      `}</style>
    </div>
  );
}

export default Historial;
