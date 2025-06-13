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
    <div className="space-y-10">
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
          <div key={id} style={{
            marginBottom: "40px",
            background: chartBgColor,
            borderRadius: "10px",
            padding: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)"
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: "#fff" }}>
              Sevilletera {id}
            </h3>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid stroke={gridColor} />
                <XAxis
                  dataKey="hora"
                  type="number"
                  domain={[horaMinima, horaMaxima]}
                  ticks={ticks}
                  tickFormatter={formatoHora}
                  stroke={axisColor}
                  tick={{ fill: tickColor, fontSize: 13 }}
                  axisLine={{ stroke: axisColor }}
                  tickLine={{ stroke: axisColor }}
                  interval={0}
                />
                <YAxis
                  stroke={axisColor}
                  tick={{ fill: tickColor, fontSize: 13 }}
                  axisLine={{ stroke: axisColor }}
                  tickLine={{ stroke: axisColor }}
                  width={60}
                />
                <Tooltip
                  labelFormatter={(label) => `Hora: ${formatoHora(label)}`}
                  content={({ label, payload }) => (
                    <div
                      style={{
                        background: "#223a5e",
                        padding: "10px 14px",
                        border: "1px solid #4fc3f7",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "#fff",
                        }}
                      >
                        Hora: {formatoHora(label)}
                      </div>
                      {payload?.map((entry, i) => (
                        <div
                          key={i}
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
                    color: legendTextColor,
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
                    fill={coloresPedido[pedidos[index]] || "#4fc3f7"}
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
                    stroke={coloresPedido[pedidos[index]] || "#4fc3f7"}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#fff",
                      stroke: coloresPedido[pedidos[index]] || "#4fc3f7",
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: coloresPedido[pedidos[index]] || "#4fc3f7",
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
              <hr
                style={{
                  marginTop: "30px",
                  border: "0",
                  borderTop: "1px solid #4c5c74",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanificacionGrafico;
