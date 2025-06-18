from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde cualquier origen (React incluido)

# Configuraciones
UPLOAD_FOLDER = "uploads"
OUTPUT_FILE = "public/planificacion.json"
OUTPUT_EMP_FILE = "public/planificacion_emp.json"
SCRIPT_PATH = "scripts/prod.py"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs("public", exist_ok=True)

# ⬆️ Ruta para recibir CSV
@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    result = subprocess.run(
        ["python", SCRIPT_PATH, filepath],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if result.returncode != 0:
        return jsonify({"error": "Error al procesar el archivo", "details": result.stderr}), 500

    return jsonify({"message": "Archivo procesado exitosamente"}), 200


# 🟢 Ruta para entregar el JSON de planificación
@app.route("/api/planificacion", methods=["GET"])
def obtener_planificacion():
    planificacion = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            planificacion = json.load(f)
    else:
        planificacion = {}

    planificacion_emp = {}
    if os.path.exists(OUTPUT_EMP_FILE):
        with open(OUTPUT_EMP_FILE, "r", encoding="utf-8") as f:
            planificacion_emp = json.load(f)
    else:
        planificacion_emp = {}

    # Devuelve ambos archivos en un solo JSON
    return jsonify(
        {"planificacion": planificacion, "planificacion_emp": planificacion_emp}
    )


if __name__ == "__main__":
    app.run(port=5000, debug=True)
