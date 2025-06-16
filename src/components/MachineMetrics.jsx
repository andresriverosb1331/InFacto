import React from 'react';

const metrics = [
  { key: 'rpm', label: 'RPM', icon: 'fa-tachometer', className: 'metric-rpm' },
  { key: 'uptime', label: 'Tiempo Activo', icon: 'fa-clock-o', className: 'metric-uptime' },
  { key: 'remaining', label: 'Tiempo Restante', icon: 'fa-hourglass-half', className: 'metric-remaining' },
  { key: 'downtime', label: 'Tiempo Parado', icon: 'fa-pause-circle', className: 'metric-downtime' },
];

const MachineMetrics = ({ data }) => (
  <div className="row metrics-row">
    {metrics.map(m => (
      <div className="col-md-3 col-sm-6 col-xs-12" key={m.key}>
        <div className={`metric-card ${m.className}`}>
          <div className="metric-icon">
            <i className={`fa ${m.icon}`}></i>
          </div>
          <div className="metric-value" id={`${m.key}Value`}>{data[m.key]}</div>
          <div className="metric-label">{m.label}</div>
        </div>
      </div>
    ))}
  </div>
);

export default MachineMetrics;
