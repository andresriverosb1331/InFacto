Levantar front

#1

En una terminal abrir carpeta Dasboard_react

#2 Ejecutar

docker build -t front-infacto .

#3 ejecutar

docker run -p 3000:80 front-infacto

Levantar back
#1 

Abrir otra terminal y abrir carpeta "backend"

#2 Ejecutar en caso no haberlo hecho en el PC

pip install -r requirements.txt

#3 Ejecutar 

py main.py