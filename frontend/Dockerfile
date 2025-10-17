# ---- FASE 1: Construcción (Build) ----
# Usamos una imagen de Node para construir el proyecto
FROM node:20-slim AS build

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de configuración de paquetes
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Ejecutamos el script de build para generar los archivos de producción
RUN npm run build

# ---- FASE 2: Producción (Serve) ----
# Usamos una imagen de Nginx, que es un servidor web muy ligero
FROM nginx:stable-alpine

# Copiamos los archivos compilados desde la fase 'build' al directorio web de Nginx
# La ruta /app/dist/frontend/browser es la que Angular suele usar por defecto
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Exponemos el puerto 80, que es el que Nginx usa por defecto
EXPOSE 80
