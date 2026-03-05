FROM node:20.14.0-bookworm-slim AS builder
ARG BUILD_CONFIGURATION=production
ARG BASE_HREF=/
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund || (echo "npm ci failed, printing npm logs:" && cat /root/.npm/_logs/* && exit 1)
COPY . .
RUN npm run build -- --configuration ${BUILD_CONFIGURATION} --base-href ${BASE_HREF}

FROM nginx:stable-alpine
EXPOSE 1026
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
