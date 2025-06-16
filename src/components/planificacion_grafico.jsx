import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area
} from "recharts";

const PlanificacionGrafico = ({ datos }) => {
  const sevilleteras = ["S1", "S2", "S3"];

  // Definir manualmente el rango de horas
  const horaMinima = horaAFecha("07:07");
  const horaMaxima = horaAFecha("17:07");
  const mediaHora = 30 * 60 * 1000; // 30 minutos en milisegundos
  
  // Generar ticks uniformes cada 30 minutos
  const ticks = [];
  for (let t = horaMinima; t <= horaMaxima; t += mediaHora) {
    ticks.push(t);
  }

  return (
    <div className="planificacion-grafico space-y-10">
      {sevilleteras.map((id, idx) => {
        const datosFiltrados = datos.filter(
          (d) => d.id_sevilletera === id
        );

        // Ordena los pedidos numéricamente: 1, 2, 3, ...
        const pedidos = [...new Set(datosFiltrados.map((d) => d.id_pedido))].sort((a, b) => a - b);

        // Para cada pedido, crear su serie con nulls en donde no hay dato
        const seriesPorPedido = pedidos.map((pedidoId) => {
          const mapa = Object.fromEntries(
            datosFiltrados
              .filter((d) => d.id_pedido === pedidoId)
              .map((d) => [horaAFecha(d.hora), d.unidades_producidas])
          );

          return ticks.map((timestamp) => ({
            hora: timestamp,
            producidas: mapa[timestamp] ?? null,
          }));
        });

        return (
          <div key={id} className="sevilletera-container">
            <h3 className="sevilletera-title text-xl font-semibold mb-4;">
              Sevilletera {id}
            </h3>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid stroke="var(--grid-color)" />
                <XAxis
                  dataKey="hora"
                  type="number"
                  domain={[horaMinima, horaMaxima]}
                  ticks={ticks}
                  tickFormatter={formatoHora}
                  stroke="var(--axis-color)"
                  tick={{ fill: "var(--tick-color)", fontSize: 13 }}
                  axisLine={{ stroke: "var(--axis-color)" }}
                  tickLine={{ stroke: "var(--axis-color)" }}
                  interval={0}
                />
                <YAxis
                  stroke="var(--axis-color)"
                  tick={{ fill: "var(--tick-color)", fontSize: 13 }}
                  axisLine={{ stroke: "var(--axis-color)" }}
                  tickLine={{ stroke: "var(--axis-color)" }}
                  width={60}
                />
                <Tooltip
                  labelFormatter={(label) => `Hora: ${formatoHora(label)}`}
                  content={({ label, payload }) => (
                    <div className="tooltip-container">
                      <div className="tooltip-label">
                        Hora: {formatoHora(label)}
                      </div>
                      {payload?.map((entry, i) => (
                        <div
                          key={i}
                          className="tooltip-entry"
                          style={{
                            color: entry.stroke,
                            marginBottom: "2px",
                          }}
                        >
                          Pedido {entry.name.split(" ")[1]}: {entry.value} unidades
                        </div>
                      ))}
                    </div>
                  )}
                />
                <Legend
                  verticalAlign="top"
                  iconType="plainline"
                  wrapperStyle={{
                    paddingBottom: 16,
                    color: "var(--legend-text-color)",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                />
                
                {/* Primero renderizar todas las áreas */}
                {seriesPorPedido.map((serie, index) => (
                  <Area
                    key={`area-${pedidos[index]}`}
                    type="monotone"
                    data={serie}
                    dataKey="producidas"
                    stroke="none"
                    fill={`var(--color-pedido-${pedidos[index]})`}
                    fillOpacity={0.18}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                ))}
                
                {/* Luego renderizar todas las líneas */}
                {seriesPorPedido.map((serie, index) => (
                  <Line
                    key={`line-${pedidos[index]}`}
                    type="monotone"
                    data={serie}
                    dataKey="producidas"
                    name={`Pedido ${pedidos[index]}`}
                    stroke={`var(--color-pedido-${pedidos[index]})`}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#fff",
                      stroke: `var(--color-pedido-${pedidos[index]})`,
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: `var(--color-pedido-${pedidos[index]})`,
                      strokeWidth: 4,
                    }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Línea divisoria */}
            {idx < sevilleteras.length - 1 && (
              <hr className="sevilletera-divider"/>
            )}
          </div>
        );
      })}
    </div>
  );
};

const coloresPedido = {
  1: "#4fc3f7", // azul claro
  2: "#81c784", // verde claro
  3: "#ba68c8", // violeta claro
  4: "#ffd54f", // amarillo claro
  5: "#e57373", // rojo claro
};

const chartBgColor = "#2c3e50"; // azul oscuro
const gridColor = "rgba(255,255,255,0.08)";
const axisColor = "#b0bec5";
const tickColor = "#ecf0f1";
const legendTextColor = "#4fc3f7"; // azul claro para leyenda

const horaAFecha = (horaStr) => {
  const [h, m] = horaStr.split(":").map(Number);
  const base = new Date("2025-06-06T00:00:00");
  base.setHours(h);
  base.setMinutes(m);
  return base.getTime(); // timestamp
};

const formatoHora = (timestamp) => {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export default PlanificacionGrafico;