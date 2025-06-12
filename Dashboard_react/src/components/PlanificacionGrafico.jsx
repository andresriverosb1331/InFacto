import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const coloresPedido = {
  1: "#1f77b4",
  2: "#2ca02c",
  3: "#8c564b",
  4: "#d62728",
  5: "#9467bd",
};

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

  // Obtener todas las horas convertidas a timestamps ordenados
  const horasUnicas = [
    ...new Set(datos.map((d) => horaAFecha(d.hora))),
  ].sort((a, b) => a - b);

  const horaInicio = Math.min(...horasUnicas);
  const horaFin = Math.max(...horasUnicas);
  const mediaHora = 30 * 60 * 1000;

  // Generar ticks exactos cada 30 minutos
  const ticks = [];
  for (let t = horaInicio; t <= horaFin; t += mediaHora) {
    ticks.push(t);
  }

  return (
    <div className="space-y-10">
      {sevilleteras.map((id, idx) => {
        const datosFiltrados = datos.filter(
          (d) => d.id_sevilletera === id
        );

        const pedidos = [...new Set(datosFiltrados.map((d) => d.id_pedido))];

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
          <div key={id} style={{ marginBottom: "40px" }}>
            <h3 className="text-xl font-semibold mb-4">
              Sevilletera {id}
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  type="number"
                  domain={[horaInicio, horaFin]}
                  ticks={ticks}
                  tickFormatter={formatoHora}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => `Hora: ${formatoHora(label)}`}
                  content={({ label, payload }) => (
                    <div
                      style={{
                        background: "#1e2b3a",
                        padding: "10px 14px",
                        border: "1px solid #4c5c74",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "14px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "6px",
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "#ffffff",
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

                {seriesPorPedido.map((serie, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    data={serie}
                    dataKey="producidas"
                    name={`Pedido ${pedidos[index]}`}
                    stroke={coloresPedido[pedidos[index]] || "#999"}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls={false}
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
