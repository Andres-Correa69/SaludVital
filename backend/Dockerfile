# 1. Usar una imagen base oficial de Node.js
FROM node:20-slim

# 2. Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar los archivos de definición de paquetes y dependencias
COPY package.json package-lock.json ./

# 4. Instalar las dependencias de producción
RUN npm install --production

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# 7. Definir el comando para iniciar la aplicación
CMD ["node", "server.js"]
