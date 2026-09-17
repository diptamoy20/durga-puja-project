# ---------------------------------------------------------------------------
# Frontend image: Vite build served by nginx.
# ---------------------------------------------------------------------------

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

# Vite inlines VITE_ variables at build time, so the gateway URL has to be
# supplied here rather than at container start.
ARG VITE_API_URL=http://localhost:5050/api/v1
ARG VITE_APP_NAME="Durga Puja Global Connect"
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
