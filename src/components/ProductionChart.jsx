import React from "react";
import { Line } from "react-chartjs-2";

const ProductionChart = ({ chartData, chartLabel, chartColor }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartLabel,
        data: chartData.data,
        fill: true,
        backgroundColor: chartColor.background,
        borderColor: chartColor.border,
        tension: 0.4,
        pointBackgroundColor: chartColor.border,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ecf0f1" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      x: {
        ticks: { color: "#ecf0f1" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#ecf0f1" },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Gráfico de Producción en Tiempo Real</h3>
      <div style={{ height: 400 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ProductionChart;