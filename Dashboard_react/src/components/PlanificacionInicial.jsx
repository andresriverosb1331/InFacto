import { useEffect, useState } from "react";
import PlanificacionGrafico from "./PlanificacionGrafico";

// Definimos colores para cada sevilletera
const coloresSevilletera = {
  "S1": "rgba(75, 192, 192, 0.15)", // Verde agua (tono suave)
  "S2": "rgba(255, 159, 64, 0.15)", // Naranja (tono suave)
  "S3": "rgba(153, 102, 255, 0.15)", // Púrpura (tono suave)
};

const PlanificacionInicial = () => {
  const [datos, setDatos] = useState([]);
  const [modoGrafico, setModoGrafico] = useState(false);

  useEffect(() => {
    fetch("/planificacion.json")
      .then((res) => res.json())
      .then((data) => setDatos(data));
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {modoGrafico ? "📊 Gráfico por Sevilletera" : "📋 Planificación Inicial del Día"}
        </h2>
        <button
          onClick={() => setModoGrafico(!modoGrafico)}
          className="btn-azul-oscuro"
        >
          {modoGrafico ? "Ver tabla" : "Ver gráfico"}
        </button>
      </div>

      {modoGrafico ? (
        <PlanificacionGrafico datos={datos} />
      ) : (
        <div className="overflow-auto">
          <table className="w-full border border-gray-300 text-sm text-center">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-2 py-1">Pedido</th>
                <th className="border px-2 py-1">Sevilletera</th>
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Hora</th>
                <th className="border px-2 py-1">Producidas</th>
                <th className="border px-2 py-1">Restantes</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-gray-50"
                  style={{ 
                    backgroundColor: coloresSevilletera[fila.id_sevilletera] || 'transparent', 
                  }}
                >
                  <td className="border px-2 py-1">{fila.id_pedido}</td>
                  <td className="border px-2 py-1 font-semibold">{fila.id_sevilletera}</td>
                  <td className="border px-2 py-1">{fila.fecha.slice(0, 10)}</td>
                  <td className="border px-2 py-1">{fila.hora}</td>
                  <td className="border px-2 py-1">{fila.unidades_producidas}</td>
                  <td className="border px-2 py-1">{Math.floor(fila.unidades_restantes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlanificacionInicial;
