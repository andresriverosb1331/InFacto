import React, { useState } from "react";
import axios from "axios";

const ImportadorCSV = () => {
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
  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">📤 Importar CSV de Planificación</h2>

      <input type="file" accept=".csv" onChange={handleArchivoChange} className="mb-4" />

      <button
        onClick={handleSubir}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        Subir CSV
      </button>

      <p className="mt-4">{mensaje}</p>
    </div>
  );
};

export default ImportadorCSV;
