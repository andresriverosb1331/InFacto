import React, { useRef } from "react";

const CrearPlanificacion = () => {
  const fileInputRef = useRef();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Crear Planificación</h1>
      <div style={{ margin: "2rem 0" }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{ marginRight: 12 }}
        >
          Subir archivo
        </button>
        <button style={{ marginRight: 12 }}>
          Confirmar archivo
        </button>
        <button>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default CrearPlanificacion;
