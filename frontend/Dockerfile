FROM node:18-alpine

WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache python3 make g++

# Copiar solo los archivos de dependencias primero
COPY package*.json ./

# Limpiar caché de npm y instalar dependencias
RUN npm cache clean --force && \
    npm install

# Copiar el resto de archivos
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Configurar variables de entorno
ENV VITE_API_URL=http://localhost:8000
ENV HOST=0.0.0.0
ENV PORT=5173
ENV NODE_ENV=development

# Comando para iniciar la aplicación con Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"] 