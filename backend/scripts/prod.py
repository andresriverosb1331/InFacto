import sys
import pandas as pd
from datetime import datetime, timedelta
import math
import os
import re

# Argumentos: CSV de entrada, JSON de salida actual (servilleteras), JSON base de historial
csv_file = sys.argv[1]
output_actual_servilleteras = sys.argv[2]
output_historial_base = sys.argv[3]

# Leer CSV
pedidos = pd.read_csv(csv_file, sep=";")
pedidos["fecha_limite"] = pd.to_datetime(pedidos["fecha_limite"], format="%d-%m-%Y")

# Datos fijos
sevilleteras = pd.DataFrame([
    {"id_sevilletera": "S1", "rpm": 3232},
    {"id_sevilletera": "S2", "rpm": 3000},
    {"id_sevilletera": "S3", "rpm": 2500}
])
empaquetadoras = pd.DataFrame([
    {"id_empaquetadora": "E1", "cajasXm": 15},
    {"id_empaquetadora": "E2", "cajasXm": 12}
])
revs_por_unidad = {"A": 2, "B": 3}
hora_inicio = 7
hora_fin = 22

basename = os.path.basename(csv_file)  # Ej: planificacion-05-05-2025.csv
match = re.search(r"(\d{2}-\d{2}-\d{4})", basename)

if match:
    fecha_str = match.group(1)  # Ej: "05-05-2025"
    fecha_actual = datetime.strptime(fecha_str, "%d-%m-%Y") + timedelta(hours=7)

fecha_inicio = pedidos["fecha_limite"].min() - timedelta(days=5)
print(fecha_actual)
pedidos["dias_para_entrega"] = (pedidos["fecha_limite"] - fecha_actual).dt.days

def estimar_tiempo_produccion(pedido):
    revs_necesarias = pedido["cantidad"] * revs_por_unidad[pedido["tipo_producto"]]
    rpm_promedio = sevilleteras["rpm"].mean()
    return revs_necesarias / (rpm_promedio * 60)

pedidos["tiempo_estimado"] = pedidos.apply(estimar_tiempo_produccion, axis=1)
pedidos["presion"] = pedidos["tiempo_estimado"] / (pedidos["dias_para_entrega"] + 1)
pedidos = pedidos.sort_values("presion", ascending=False)

def calcular_unidades_Mhora(rpm, revs_unidad):
    return (rpm * 30) / revs_unidad

planificacion = []
planificacion_emp = []
ocupacion_diaria = {}
fecha_servilletera = fecha_actual
fecha_empaquetadora = fecha_servilletera

for _, pedido in pedidos.iterrows():
    cantidad_restante = pedido["cantidad"]
    servilletasProducidas = 0
    while cantidad_restante > 0 or servilletasProducidas != 0:
        if fecha_servilletera.hour >= hora_fin:
            fecha_servilletera = datetime.combine(fecha_servilletera.date() + timedelta(days=1), datetime.min.time()) + timedelta(hours=hora_inicio)
            fecha_empaquetadora = datetime.combine(fecha_empaquetadora.date() + timedelta(days=1), datetime.min.time()) + timedelta(hours=hora_inicio)
            continue

        for _, sev in sevilleteras.iterrows():
            clave = (sev["id_sevilletera"], fecha_servilletera.date(), fecha_servilletera.hour, fecha_servilletera.minute)
            ocupacion_diaria.setdefault(clave, 0)

            max_unidades = calcular_unidades_Mhora(sev["rpm"], revs_por_unidad[pedido["tipo_producto"]])
            if ocupacion_diaria[clave] >= max_unidades:
                continue

            disponibles = max_unidades - ocupacion_diaria[clave]
            unidades = min(disponibles, cantidad_restante)
            servilletasProducidas += unidades

            planificacion.append({
                "id_pedido": pedido["id_pedido"],
                "id_sevilletera": sev["id_sevilletera"],
                "fecha": fecha_servilletera.date(),
                "hora": f"{fecha_servilletera.hour:02d}:{fecha_servilletera.minute:02d}",
                "unidades_restantes": cantidad_restante,
                "unidades_producidas": math.floor(unidades)
            })

            ocupacion_diaria[clave] += unidades
            cantidad_restante -= unidades
            if cantidad_restante == 0:
                break
        fecha_servilletera += timedelta(minutes=30)

        for _, emp in empaquetadoras.iterrows():
            clave = (emp["id_empaquetadora"], fecha_empaquetadora.date(), fecha_empaquetadora.hour, fecha_empaquetadora.minute)
            ocupacion_diaria.setdefault(clave, 0)

            max_unidades = emp["cajasXm"] * 30 * 220
            if ocupacion_diaria[clave] >= max_unidades:
                continue

            disponibles = max_unidades - ocupacion_diaria[clave]
            unidades = min(disponibles, servilletasProducidas)

            planificacion_emp.append({
                "id_pedido": pedido["id_pedido"],
                "id_empaquetadora": emp["id_empaquetadora"],
                "fecha": fecha_empaquetadora.date(),
                "hora": f"{fecha_empaquetadora.hour:02d}:{fecha_empaquetadora.minute:02d}",
                "unidades_restantes": servilletasProducidas,
                "unidades_empaquetadas": math.floor(unidades)
            })

            ocupacion_diaria[clave] += unidades
            servilletasProducidas -= unidades
            if servilletasProducidas == 0:
                break
        fecha_empaquetadora += timedelta(minutes=30)

# ✅ Extraer fecha válida desde nombre base
basename = os.path.basename(output_historial_base)
match = re.search(r"(\d{2}-\d{2}-\d{4})", basename)
fecha = match.group(1) if match else "fecha-desconocida"

# ✅ Generar nombres consistentes
dir_historial = os.path.dirname(output_historial_base)
nombre_historial_serv = f"planificacion-servilleteras-{fecha}.json"
nombre_historial_emp = f"planificacion-empaquetadoras-{fecha}.json"

# Guardar resultados
df_serv = pd.DataFrame(planificacion)
df_emp = pd.DataFrame(planificacion_emp)

df_serv.to_json(output_actual_servilleteras, orient="records", date_format="iso")
df_serv.to_json(os.path.join(dir_historial, nombre_historial_serv), orient="records", date_format="iso")
df_emp.to_json(os.path.join(dir_historial, nombre_historial_emp), orient="records", date_format="iso")
