import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

// Función para generar un color hexadecimal aleatorio
const generarColorAleatorio = () => {
  let h = Math.floor(Math.random() * 360);
  while (h > 180 && h < 280) {
    h = Math.floor(Math.random() * 360);
  }
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 60) + 40;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Generar colores aleatorios para los pedidos
const coloresPedido = {};
const colorbarrasgrafico = "hsl(210, 31.40%, 58.80%)";

const horaAFecha = (horaStr) => {
  const [h, m] = horaStr.split(":").map(Number);
  const base = new Date("2025-06-06T00:00:00");
  base.setHours(h);
  base.setMinutes(m);
  return base.getTime();
};

const formatoHora = (timestamp) => {
  const d = new Date(timestamp);
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const fecha1 = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const fecha2 = d.toLocaleDateString('es-ES', { year: 'numeric' });

  return [hora, fecha1, fecha2];
};

const CustomTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;

  const [hora, fecha1, fecha2] = formatoHora(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill={colorbarrasgrafico} fontSize={13}>
        {hora}
      </text>
      <text x={0} y={0} dy={32} textAnchor="middle" fill={colorbarrasgrafico} fontSize={13}>
        {fecha1}
      </text>
      <text x={0} y={0} dy={48} textAnchor="middle" fill={colorbarrasgrafico} fontSize={13}>
        {fecha2}
      </text>
    </g>
  );
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

  // Obtener todos los id_pedido únicos
  const pedidosUnicos = [...new Set(datos.map(d => d.id_pedido))];

  // Asignar un color aleatorio a cada id_pedido si no existe
  pedidosUnicos.forEach(pedidoId => {
    if (!coloresPedido[pedidoId]) {
      coloresPedido[pedidoId] = generarColorAleatorio();
    }
  });

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

        // Calcular datos acumulados por pedido
        const datosAcumuladosPorPedido = pedidos.map((pedidoId) => {
          let acumulado = 0;
          return ticks.map((timestamp) => {
            const producidas = datosFiltrados
              .filter((d) => d.id_pedido === pedidoId && horaAFecha(d.hora) === timestamp)
              .reduce((sum, d) => sum + d.unidades_producidas, 0);
            acumulado += producidas;
            return { hora: timestamp, acumulado };
          });
        });

        // Calcular datos acumulados totales
        let acumuladoTotal = 0;
        const datosAcumuladosTotales = ticks.map((timestamp) => {
          const producidasEnTimestamp = datosFiltrados.filter(d => horaAFecha(d.hora) === timestamp)
            .reduce((sum, d) => sum + d.unidades_producidas, 0);
          acumuladoTotal += producidasEnTimestamp;
          return { hora: timestamp, acumulado: acumuladoTotal };
        });

        return (
          <div key={id} className='chart-container'>
            <h3 className="chart-title">
              Sevilletera {id}
            </h3>

            <ResponsiveContainer width="100%" height={420}>
              <LineChart margin={{ top: 20, right: 30, left: 10, bottom: 50 }}>
                <CartesianGrid stroke= {colorbarrasgrafico} />
                <XAxis
                  dataKey="hora"
                  type="number"
                  domain={[horaMinima, horaMaxima]}
                  ticks={ticks}
                  tick={<CustomTick />}
                  stroke={colorbarrasgrafico}
                  axisLine={{ stroke: colorbarrasgrafico }}
                  tickLine={{ stroke: colorbarrasgrafico }}
                  interval={0}
                  height={55}
                />
                <YAxis
                  stroke={colorbarrasgrafico}
                  tick={{ fill: colorbarrasgrafico, fontSize: 13 }}
                  axisLine={{ stroke: colorbarrasgrafico }}
                  tickLine={{ stroke: colorbarrasgrafico }}
                  width={60}
                />
                <Tooltip
                  labelFormatter={(label) => {
                    const [hora, fecha] = formatoHora(label);
                    return `${hora} - ${fecha}`;
                    }}
                    content={({ payload }) => (
                    <div className="p-2 rounded shadow" style={{ background: "#1a2236" }}>
                      {payload?.map((entry, i) => (
                      <div
                        key={i}
                        className="tooltip-item"
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
                  <Line
                    key={`line-${pedidos[index]}`}
                    type="monotone"
                    data={serie}
                    dataKey="producidas"
                    name={`Pedido ${pedidos[index]}`}
                    stroke={coloresPedido[pedidos[index]] || generarColorAleatorio()}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#fff",
                      stroke: coloresPedido[pedidos[index]] || generarColorAleatorio(),
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: coloresPedido[pedidos[index]] || generarColorAleatorio(),
                      strokeWidth: 4,
                    }}
                    connectNulls={true}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Gráficos de acumulado por pedido */}
            {datosAcumuladosPorPedido.map((data, index) => (
              <div key={`acumulado-${pedidos[index]}`} className="acumulado-chart-container">
                <h4 className="acumulado-chart-title">
                  Acumulado Pedido {pedidos[index]}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={colorbarrasgrafico} />
                    <XAxis
                      dataKey="hora"
                      type="number"
                      domain={[horaMinima, horaMaxima]}
                      ticks={ticks}
                       tick={<CustomTick />}
                      stroke={colorbarrasgrafico}
                      interval={0}
                       height={60}
                    />
                    <YAxis stroke={colorbarrasgrafico} tick={{ fill: colorbarrasgrafico, fontSize: 13 }} />
                    <Tooltip
                      labelFormatter={(label) => {
                        const [hora, fecha] = formatoHora(label);
                        return `${hora} - ${fecha}`;
                      }}
                      content={({ payload }) => (
                    <div className="p-2 rounded shadow" style={{ background: "#1a2236" }}>
                      {payload?.map((entry, i) => (
                      <div
                        key={i}
                        className="tooltip-item"
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
                    <Line
                      type="monotone"
                      dataKey="acumulado"
                      stroke={coloresPedido[pedidos[index]] || generarColorAleatorio()}
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        fill: "#fff",
                        stroke: coloresPedido[pedidos[index]] || generarColorAleatorio(),
                        strokeWidth: 3,
                      }}
                      activeDot={{
                        r: 7,
                        fill: "#fff",
                        stroke: coloresPedido[pedidos[index]] || generarColorAleatorio(),
                        strokeWidth: 4,
                      }}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}

            {/* Gráfico de acumulado total */}
            {/* Gráfico de acumulado total */}
            <div className="acumulado-total-chart-container">
              <h4 className="acumulado-total-chart-title">
                Acumulado Total (Todos los Pedidos)
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={datosAcumuladosTotales} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid stroke="var(--grid-color)" />
                  <XAxis
                    dataKey="hora"
                    type="number"
                    domain={[horaMinima, horaMaxima]}
                    ticks={ticks}
                    tick={<CustomTick />}
                    stroke="var(--axis-color)"
                    axisLine={{ stroke: "var(--axis-color)" }}
                    tickLine={{ stroke: "var(--axis-color)" }}
                    interval={0}
                    height={50}
                  />
                  <YAxis stroke="var(--axis-color)" tick={{ fill: "var(--tick-color)", fontSize: 13 }} />
                  <Tooltip
                    labelFormatter={(label) => {
                      const [hora, fecha] = formatoHora(label);
                      return `${hora} - ${fecha}`;
                    }}
                    content={({ payload }) => (
                    <div className="p-2 rounded shadow" style={{ background: "#1a2236" }}>
                      {payload?.map((entry, i) => (
                      <div
                        key={i}
                        className="tooltip-item"
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
                  <Line
                    type="monotone"
                    dataKey="acumulado"
                    stroke="#fff" // Color blanco para el acumulado total
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: "#fff",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#fff",
                      stroke: "#fff",
                      strokeWidth: 4,
                    }}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Línea divisoria */}
            {idx < sevilleteras.length - 1 && (
              <hr className="chart-divider" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlanificacionGrafico;
