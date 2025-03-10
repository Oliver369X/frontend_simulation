# Etapa de construcción
FROM node:16-alpine as build

WORKDIR /app

# Argumentos de construcción
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL

# Variables de entorno para la construcción
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente y construir
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar archivos de construcción
COPY --from=build /app/build /usr/share/nginx/html

# Configuración de nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 