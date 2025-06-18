import sys
import pandas as pd
from datetime import datetime, timedelta
import math
import os

# Leer ruta del archivo CSV como argumento desde el backend
csv_file = sys.argv[1]
pedidos = pd.read_csv(csv_file, sep=";")

pedidos["fecha_limite"] = pd.to_datetime(pedidos["fecha_limite"], format="%d-%m-%Y")


sevilleteras = pd.DataFrame([
    {"id_sevilletera": "S1", "rpm": 3232},
    {"id_sevilletera": "S2", "rpm": 3000},
    {"id_sevilletera": "S3", "rpm": 2500}
])
empaquetadoras = pd.DataFrame([
    {"id_empaquetadora": "E1", "cajasXm": 15},
    {"id_empaquetadora": "E2", "cajasXm": 12}
])
revs_por_unidad = {
    "A": 2,
    "B": 3
}
hora_inicio = 7
hora_fin = 22


fecha_actual = datetime(2025, 5, 5, 7, 0)

#Prioridad mixta (tiempo estimado / tiempo restante)
pedidos["fecha_limite"] = pd.to_datetime(pedidos["fecha_limite"])
pedidos["dias_para_entrega"] = (pedidos["fecha_limite"] - fecha_actual).dt.days

# Calcular tiempo estimado de produccion
def estimar_tiempo_produccion(pedido):
    revs_necesarias = pedido["cantidad"] * revs_por_unidad[pedido["tipo_producto"]]
    rpm_promedio = sevilleteras["rpm"].mean()
    return revs_necesarias / (rpm_promedio * 60)

pedidos["tiempo_estimado"] = pedidos.apply(estimar_tiempo_produccion, axis=1)

# Índice de presión
pedidos["presion"] = pedidos["tiempo_estimado"] / (pedidos["dias_para_entrega"] + 1)

# Ordenar por presión (prioridad alta = más urgente)
pedidos = pedidos.sort_values("presion", ascending=False)


def calcular_unidades_Mhora(rpm, revs_unidad):
    total_revs_mh = rpm *30
    return total_revs_mh / revs_unidad

planificacion = []
planificacion_emp=[]
ocupacion_diaria = {} 

fecha_servilletera = fecha_actual
fecha_empaquetadora = datetime(2025, 5, 5, 7, 0)
for _, pedido in pedidos.iterrows():
    cantidad_restante = pedido["cantidad"]
    
    servilletasProducidas=0
    while (cantidad_restante > 0 or servilletasProducidas!=0):
        # Si pasa de las 10, reinicia desde las 7 del dia siguiente
        if fecha_servilletera.hour >= hora_fin:
            fecha_servilletera = datetime.combine(fecha_servilletera.date() + timedelta(days=1), datetime.min.time()) + timedelta(hours=hora_inicio)
            fecha_empaquetadora = datetime.combine(fecha_empaquetadora.date() + timedelta(days=1), datetime.min.time()) + timedelta(hours=hora_inicio)
            continue
        

        for _, sev in sevilleteras.iterrows():
            clave_servilletera = (sev["id_sevilletera"], fecha_servilletera.date(), fecha_servilletera.hour, fecha_servilletera.minute)

            if clave_servilletera not in ocupacion_diaria:
                ocupacion_diaria[clave_servilletera] = 0  # iniciar ocupación en 0

            unidades_max = calcular_unidades_Mhora(
                sev["rpm"],
                revs_por_unidad[pedido["tipo_producto"]]
            )
            if ocupacion_diaria[clave_servilletera] >= unidades_max:
                continue
            


            disponibles = unidades_max - ocupacion_diaria[clave_servilletera]
            unidades_a_producir = min(disponibles, cantidad_restante)
            servilletasProducidas+=unidades_a_producir
            
            planificacion.append({
                "id_pedido": pedido["id_pedido"],
                "id_sevilletera": sev["id_sevilletera"],
                "fecha": fecha_servilletera.date(),
                "hora": f"{fecha_servilletera.hour:02d}:{fecha_servilletera.minute:02d}",
                "unidades_restantes": cantidad_restante,
                "unidades_producidas": math.floor(unidades_a_producir)
            })

            ocupacion_diaria[clave_servilletera] += unidades_a_producir
            cantidad_restante -= unidades_a_producir

            if cantidad_restante == 0:
                break
        fecha_servilletera += timedelta(minutes=30)

        for _, emp in empaquetadoras.iterrows():
            clave_empaquetadora = (emp["id_empaquetadora"], fecha_empaquetadora.date(), fecha_empaquetadora.hour, fecha_empaquetadora.minute)

            if clave_empaquetadora not in ocupacion_diaria:
                ocupacion_diaria[clave_empaquetadora] = 0  # iniciar ocupación en 0

            unidades_max = emp["cajasXm"]*30*220
            if ocupacion_diaria[clave_empaquetadora] >= unidades_max:
                continue
            

            disponibles = unidades_max - ocupacion_diaria[clave_empaquetadora]
            unidades_a_producir = min(disponibles, servilletasProducidas)
            planificacion_emp.append({
                "id_pedido": pedido["id_pedido"],
                "id_empaquetadora": emp["id_empaquetadora"],
                "fecha": fecha_empaquetadora.date(),
                "hora": f"{fecha_empaquetadora.hour:02d}:{fecha_empaquetadora.minute:02d}",
                "unidades_restantes": servilletasProducidas,
                "unidades_empaquetadas":  math.floor(unidades_a_producir)
            })

            ocupacion_diaria[clave_empaquetadora] += unidades_a_producir
            servilletasProducidas -= unidades_a_producir

            #hay que hacer otro cantidad restante para las empaquetadoras
            if servilletasProducidas == 0:
                break
        fecha_empaquetadora += timedelta(minutes=30)


#print(planificacion)
df_planificacion = pd.DataFrame(planificacion)
print(df_planificacion.head(1000))
df_planificacion_emp = pd.DataFrame(planificacion_emp)



# Exportar a archivo JSON
import os

# Obtener ruta absoluta a la carpeta "public"
ruta_base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ruta_salida = os.path.join(ruta_base, "public", "planificacion.json")
ruta_salida_emp = os.path.join(ruta_base, "public", "planificacion_emp.json")

# Guardar el JSON
df_planificacion.to_json(ruta_salida, orient="records", date_format="iso")
df_planificacion_emp.to_json(ruta_salida_emp, orient="records", date_format="iso")
print(f"Planificación guardada en {ruta_salida}")
print(f"Planificación de empaquetadoras guardada en {ruta_salida_emp}")