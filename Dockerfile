FROM nginx:alpine

# Copiar arquivos do frontend
COPY frontend/ /usr/share/nginx/html/

# Configuração Nginx customizada
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Metadata
LABEL maintainer="BioAcustic Team"
LABEL description="BioAcustic - Classificador de Anfíbios com Deep Learning"
LABEL version="1.0"

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
