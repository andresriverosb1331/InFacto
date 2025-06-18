CONTAINER_NAME := front-infacto

BUILD_COMMAND := docker build -t front-infacto .

RUN_COMMAND := docker run -d --name $(CONTAINER_NAME) -p 3000:80 front-infacto

REMOVE_COMMAND := docker stop $(CONTAINER_NAME) && docker rm $(CONTAINER_NAME)

all: remove build run

build:
	@echo "Construyendo la imagen Docker..."
	@$(BUILD_COMMAND)

run:
	@echo "Ejecutando el contenedor Docker..."
	@$(RUN_COMMAND)
	@echo "Contenedor $(CONTAINER_NAME) en ejecución."

remove:
	@echo "Deteniendo y eliminando el contenedor Docker (si existe)..."
	@$(REMOVE_COMMAND) || ver > nul
	@echo "Contenedor $(CONTAINER_NAME) eliminado (si existía)."

react:
	@npm start

.PHONY: all build run remove react