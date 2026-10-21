# ==============================================================================
# FocusFlow v5.0.0 - Production Docker Container
# Multi-platform ultra-lightweight Alpine Nginx web server
# ==============================================================================

FROM nginx:alpine

LABEL maintainer="Atharav Katkar <contact@focusflow.local>"
LABEL version="5.0.0"
LABEL description="FocusFlow - Virtual Study Room & Pomodoro Workspace"

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom high-performance Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static application files into Nginx document root
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure Nginx server is actively responding
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
