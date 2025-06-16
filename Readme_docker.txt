# Instrucciones para ejecutar este proyecto con Docker en Windows

## 1. Instalar Docker Desktop
Descarga e instala Docker Desktop desde:
https://www.docker.com/products/docker-desktop/

Reiniciar PC

## 2. Clonar o copiar este proyecto en tu computadora

Asegúrate de tener todos los archivos del proyecto, incluyendo:
- Código fuente
- Dockerfile
- .dockerignore

## 3. Abrir la terminal CMD en la carpeta del proyecto

## 4. Construir la imagen Docker

Ejecuta el siguiente comando:

docker build -t front-infacto .

## 5. Ejecutar el contenedor

Ejecuta el siguiente comando:

docker run -p 3000:80 front-infacto


Esto hará que la aplicación esté disponible en tu navegador en:
http://localhost:3000

---

**Notas:**
- Si necesitas modificar el código fuente, hazlo antes de construir la imagen.
- Si el puerto 3000 está ocupado, puedes cambiarlo por otro disponible (por ejemplo, `-p 8080:80`).