import React from 'react';

const MachineStatus = ({ name, status, statusClass }) => (
  <div className="current-machine">
    <h2 id="currentMachineName">{name}</h2>
    <div className="machine-status">
      <span className={`status-indicator ${statusClass}`}></span>
      <span id="machineStatus">{status}</span>
    </div>
  </div>
);

export default MachineStatus;
