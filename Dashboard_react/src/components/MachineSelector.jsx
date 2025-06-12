import React from 'react';

const MachineSelector = ({ currentMachine, setCurrentMachine, machineData }) => (
  <div className="machine-selector">
    <div className="machine-buttons">
      {Object.entries(machineData).map(([id, data]) => (
        <button
          key={id}
          className={`machine-btn${parseInt(id) === currentMachine ? ' active' : ''}`}
          onClick={() => setCurrentMachine(parseInt(id))}
        >
          {data.name}
        </button>
      ))}
    </div>
  </div>
);

export default MachineSelector;