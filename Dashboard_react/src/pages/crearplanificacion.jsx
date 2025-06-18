import React, { useState } from "react";
import axios from "axios";

const CrearPlanificacion = () => {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubir = async () => {
    if (!archivo) {
      setMensaje("⚠️ Por favor selecciona un archivo CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);

    try {
      setMensaje("⏳ Subiendo y procesando...");
      const res = await axios.post("http://localhost:5000/upload", formData);
      setMensaje(`✅ ${res.data.message || "Planificación actualizada correctamente"}`);

      // 🔄 Recargar para mostrar nueva planificación
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al subir o procesar el archivo.");
    }
  };

  const handleCancelar = () => {
    setArchivo(null);
    setMensaje("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Crear Planificación</h1>
      <div style={{ margin: "2rem 0" }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleArchivoChange}
          style={{ marginRight: 12 }}
        />
        <button
          onClick={handleSubir}
          style={{ marginRight: 12 }}
        >
          Confirmar archivo
        </button>
        <button onClick={handleCancelar}>
          Cancelar
        </button>
      </div>
      <p>{mensaje}</p>
    </div>
  );
};

export default CrearPlanificacion;