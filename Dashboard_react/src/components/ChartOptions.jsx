import React from 'react';

const options = [
  { key: 'rpm', label: 'RPM' },
  { key: 'temperature', label: 'Temperatura' },
  { key: 'pressure', label: 'Presión' },
  { key: 'efficiency', label: 'Eficiencia' },
  { key: 'production', label: 'Producción' },
];

const ChartOptions = ({ selected, setSelected }) => (
  <div className="chart-options">
    <h4>Opciones de Visualización</h4>
    <div className="option-buttons">
      {options.map(opt => (
        <button
          key={opt.key}
          className={`option-btn${selected === opt.key ? ' active' : ''}`}
          onClick={() => setSelected(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default ChartOptions;