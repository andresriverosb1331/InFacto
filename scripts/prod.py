from datetime import datetime, timedelta
import pandas as pd
import math




#datos dummies
pedidos = pd.DataFrame([
    {"id_pedido": 1, "cantidad": 100000, "fecha_limite": "2025-06-20", "tipo_producto": "A"},
    {"id_pedido": 2, "cantidad": 800000, "fecha_limite": "2025-06-18", "tipo_producto": "B"},
    {"id_pedido": 3, "cantidad": 5000, "fecha_limite": "2025-06-25", "tipo_producto": "A"},
])
sevilleteras = pd.DataFrame([
    {"id_sevilletera": "S1", "rpm": 120},
    {"id_sevilletera": "S2", "rpm": 100},
    {"id_sevilletera": "S3", "rpm": 90},
])
empaquetadoras = pd.DataFrame([
    {"id_empaquetadora": "E1", "rpm": 120},
    {"id_empaquetadora": "E2", "rpm": 100}
])
revs_por_unidad = {
    "A": 10,
    "B": 12
}
horas_por_turno = 8
turnos_por_dia = 2
minutos_por_dia = horas_por_turno * turnos_por_dia * 60

fecha_actual = datetime(2025, 6, 6, 7,7)

#Prioridad simple
pedidos["fecha_limite"] = pd.to_datetime(pedidos["fecha_limite"])
pedidos["dias_para_entrega"] = (pedidos["fecha_limite"] - fecha_actual).dt.days
pedidos = pedidos.sort_values("dias_para_entrega")

def calcular_unidades_Mhora(rpm, revs_unidad):
    total_revs_mh = rpm * 60*30
    return total_revs_mh / revs_unidad

planificacion = []
ocupacion_diaria = {} 

fecha = fecha_actual
for _, pedido in pedidos.iterrows():
    cantidad_restante = pedido["cantidad"]
    
    
    while cantidad_restante > 0:
        for _, sev in sevilleteras.iterrows():
            clave = (sev["id_sevilletera"], fecha.hour, fecha.minute)
            if clave not in ocupacion_diaria:
                ocupacion_diaria[clave] = 0  # iniciar ocupación en 0

            unidades_max = calcular_unidades_Mhora(
                sev["rpm"],
                revs_por_unidad[pedido["tipo_producto"]]
            )
            if ocupacion_diaria[clave] >= unidades_max:
                continue

            disponibles = unidades_max - ocupacion_diaria[clave]
            unidades_a_producir = min(disponibles, cantidad_restante)
            planificacion.append({
                "id_pedido": pedido["id_pedido"],
                "id_sevilletera": sev["id_sevilletera"],
                "fecha": fecha.date(),
                "hora": f"{fecha.hour:02d}:{fecha.minute:02d}",
                "unidades_restantes": cantidad_restante,
                "unidades_producidas": math.floor(unidades_a_producir)
            })

            ocupacion_diaria[clave] += unidades_a_producir
            cantidad_restante -= unidades_a_producir

            if cantidad_restante <= 0:
                break
        fecha += timedelta(minutes=30)

#print(planificacion)
df_planificacion = pd.DataFrame(planificacion)

# Mostrar resultados
print(df_planificacion.head(70))

# Exportar a archivo JSON
import os

# Obtener ruta absoluta a la carpeta "public"
ruta_base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ruta_salida = os.path.join(ruta_base, "public", "planificacion.json")

# Guardar el JSON
df_planificacion.to_json(ruta_salida, orient="records", date_format="iso")
print(f"Planificación guardada en {ruta_salida}")