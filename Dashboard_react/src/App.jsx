import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import MachineSelector from "./components/MachineSelector";
import MachineStatus from "./components/MachineStatus";
import MachineMetrics from "./components/MachineMetrics";
import ProductionChart from "./components/ProductionChart";
import ChartOptions from "./components/ChartOptions";
import PlanificacionInicial from "./components/PlanificacionInicial"; // 👈 nuevo
import "./assets/estilos.css";

const machineData = {
  1: {
    name: "MÁQUINA 1",
    rpm: 1250,
    uptime: "8.5h",
    remaining: "2.3h",
    downtime: "0.2h",
    status: "Operando Normalmente",
    statusClass: "status-running",
  },
  2: {
    name: "MÁQUINA 2",
    rpm: 980,
    uptime: "6.2h",
    remaining: "3.8h",
    downtime: "1.1h",
    status: "Mantenimiento Programado",
    statusClass: "status-warning",
  },
  3: {
    name: "MÁQUINA 3",
    rpm: 1450,
    uptime: "12.1h",
    remaining: "1.2h",
    downtime: "0.0h",
    status: "Alto Rendimiento",
    statusClass: "status-running",
  },
  4: {
    name: "MÁQUINA 4",
    rpm: 0,
    uptime: "0.0h",
    remaining: "8.5h",
    downtime: "4.2h",
    status: "Fuera de Servicio",
    statusClass: "status-stopped",
  },
};

const chartColors = {
  rpm: { border: "#3498db", background: "rgba(52,152,219,0.1)" },
  temperature: { border: "#e74c3c", background: "rgba(231,76,60,0.1)" },
  pressure: { border: "#f39c12", background: "rgba(243,156,18,0.1)" },
  efficiency: { border: "#27ae60", background: "rgba(39,174,96,0.1)" },
  production: { border: "#9b59b6", background: "rgba(155,89,182,0.1)" },
};

const chartLabels = {
  rpm: "RPM",
  temperature: "Temperatura (°C)",
  pressure: "Presión (Bar)",
  efficiency: "Eficiencia (%)",
  production: "Producción (Unidades/min)",
};

function generateDataValue(option, machineId) {
  const machineInfo = machineData[machineId];
  const baseValue = machineInfo.rpm;
  if (
    machineInfo.statusClass === "status-stopped" &&
    (option === "rpm" || option === "production")
  ) {
    return 0;
  }
  let value;
  switch (option) {
    case "rpm":
      value = baseValue + (Math.random() - 0.5) * 100;
      break;
    case "temperature":
      value = 75 + (Math.random() - 0.5) * 20;
      break;
    case "pressure":
      value = 45 + (Math.random() - 0.5) * 10;
      break;
    case "efficiency":
      value =
        (machineInfo.statusClass === "status-running"
          ? 85
          : machineInfo.statusClass === "status-warning"
          ? 60
          : 0) +
        (Math.random() - 0.5) * 15;
      break;
    case "production":
      value = baseValue > 0 ? 150 + (Math.random() - 0.5) * 50 : 0;
      break;
    default:
      value = baseValue + (Math.random() - 0.5) * 100;
  }
  return Math.round(value * 100) / 100;
}

const initialChartData = (machineId, option) => {
  const now = new Date();
  const labels = [];
  const data = [];
  for (let i = 19; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30000);
    labels.push(t.toLocaleTimeString());
    data.push(generateDataValue(option, machineId));
  }
  return { labels, data };
};

const App = () => {
  const [currentMachine, setCurrentMachine] = useState(1);
  const [selectedOption, setSelectedOption] = useState("rpm");
  const [vistaActual, setVistaActual] = useState("dashboard"); // 👈 nueva vista

  const [chartData, setChartData] = useState(
    initialChartData(1, "rpm")
  );
  const intervalRef = useRef();

  useEffect(() => {
    setChartData(initialChartData(currentMachine, selectedOption));
    // eslint-disable-next-line
  }, [currentMachine, selectedOption]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setChartData((prev) => {
        const newLabels = prev.labels.slice(1);
        const newData = prev.data.slice(1);
        const now = new Date();
        newLabels.push(now.toLocaleTimeString());
        newData.push(generateDataValue(selectedOption, currentMachine));
        return { labels: newLabels, data: newData };
      });
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, [currentMachine, selectedOption]);

  const machine = machineData[currentMachine];

return (
  <div className="d-flex">
    <Sidebar setVistaActual={setVistaActual} />
    <div
      className="flex-grow-1"
      style={{ background: "var(--primary-bg)", minHeight: "100vh" }}
    >
      {vistaActual === "dashboard" && (
        <div className="main-container">
          <DashboardHeader />
          <MachineSelector
            currentMachine={currentMachine}
            setCurrentMachine={setCurrentMachine}
            machineData={machineData}
          />
          <MachineStatus
            name={machine.name}
            status={machine.status}
            statusClass={machine.statusClass}
          />
          <MachineMetrics data={machine} />
          <ProductionChart
            chartData={chartData}
            chartLabel={chartLabels[selectedOption]}
            chartColor={chartColors[selectedOption]}
          />
          <ChartOptions
            selected={selectedOption}
            setSelected={setSelectedOption}
          />
        </div>
      )}
      {vistaActual === "planificacionInicial" && <PlanificacionInicial />}
    </div>
  </div>
);

};

export default App;