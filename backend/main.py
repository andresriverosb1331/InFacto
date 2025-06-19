from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "public"
HISTORIAL_FOLDER = "historial"
SCRIPT_PATH = "scripts/prod.py"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(HISTORIAL_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Guardar el CSV en /uploads
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # ✅ Extraer fecha con regex
    base_name = os.path.splitext(file.filename)[0]  # planificacion-26-05-2025
    match = re.search(r"(\d{2}-\d{2}-\d{4})", base_name)
    if match:
        fecha_solo = match.group(1)
    else:
        return jsonify({"error": "No se pudo extraer la fecha del nombre del archivo"}), 400

    # Nombres de salida
    json_servilleteras = f"planificacion-servilleteras-{fecha_solo}.json"
    json_empaquetadoras = f"planificacion-empaquetadoras-{fecha_solo}.json"

    path_servilleteras = os.path.join(HISTORIAL_FOLDER, json_servilleteras)
    path_empaquetadoras = os.path.join(HISTORIAL_FOLDER, json_empaquetadoras)
    path_actual = os.path.join(OUTPUT_FOLDER, "planificacion.json")  # solo servilleteras

    result = subprocess.run(
        ["python", SCRIPT_PATH, filepath, path_actual, path_servilleteras, path_empaquetadoras],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    import shutil
    if result.returncode != 0:
        print("Error en prod.py:", result.stderr)  # <--- Agrega esto
        return jsonify({"error": "Error al procesar el archivo", "details": result.stderr}), 500
    if os.path.exists(path_empaquetadoras):
        shutil.copy(path_empaquetadoras, os.path.join(OUTPUT_FOLDER, "planificacion_emp.json"))

    return jsonify({"message": "Archivo procesado exitosamente"}), 200

@app.route("/api/planificacion", methods=["GET"])
def obtener_planificacion():
    ruta_serv = os.path.join(OUTPUT_FOLDER, "planificacion.json")
    ruta_emp = os.path.join(OUTPUT_FOLDER, "planificacion_emp.json")
    planificacion = []
    planificacion_emp = []

    # Leer servilleteras
    if os.path.exists(ruta_serv):
        import json
        with open(ruta_serv, "r", encoding="utf-8") as f:
            planificacion = json.load(f)
    # Leer empaquetadoras
    if os.path.exists(ruta_emp):
        import json
        with open(ruta_emp, "r", encoding="utf-8") as f:
            planificacion_emp = json.load(f)

    return jsonify({
        "planificacion": planificacion,
        "planificacion_emp": planificacion_emp
    })

@app.route("/api/historial", methods=["GET"])
def obtener_historial():
    try:
        archivos = os.listdir(HISTORIAL_FOLDER)
        planificaciones = sorted([
            f for f in archivos
            if f.startswith("planificacion-servilleteras-") or f.startswith("planificacion-empaquetadoras-")
        ])
        return jsonify(planificaciones)
    except Exception as e:
        return jsonify({"error": "Error al listar el historial", "details": str(e)}), 500


@app.route("/api/historial/<nombre_archivo>", methods=["GET"])
def obtener_planificacion_historial(nombre_archivo):
    ruta = os.path.join(HISTORIAL_FOLDER, nombre_archivo)
    if os.path.exists(ruta):
        return send_from_directory(HISTORIAL_FOLDER, nombre_archivo, mimetype="application/json")
    else:
        return jsonify({"error": "Planificación no encontrada"}), 404

if __name__ == "__main__":
    app.run(port=5000, debug=True)


