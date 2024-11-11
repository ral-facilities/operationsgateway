# Dockerfile to build and serve OperationsGateway

# Build stage
FROM node:20.17.0-alpine3.20@sha256:2d07db07a2df6830718ae2a47db6fedce6745f5bcd174c398f2acdda90a11c03 as builder

WORKDIR /operationsgateway-build

# Enable dependency caching and share the cache between projects
ENV YARN_ENABLE_GLOBAL_CACHE=true
ENV YARN_GLOBAL_FOLDER=/root/.cache/.yarn

COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY public public

RUN --mount=type=cache,target=/root/.cache/.yarn/cache \
    set -eux; \
    \
    yarn workspaces focus --production;

COPY . .

RUN set -eux; \
    \
    # Set the React production variable which holds reference to the path of the plugin build \
    sed -i "s#VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY=.*#VITE_APP_OPERATIONS_GATEWAY_BUILD_DIRECTORY=/operationsgateway/#" .env.production; \
    \
    yarn build;

# Run stage
FROM httpd:2.4.62-alpine3.20@sha256:66c49302c02430619abb84240a438bcfc083015661009fcaaeaac931450f62cd

WORKDIR /usr/local/apache2/htdocs

COPY --from=builder /operationsgateway-build/dist/. ./operationsgateway/

RUN set -eux; \
    \
    # Enable mod_deflate \
    sed -i -e 's/^#LoadModule deflate_module/LoadModule deflate_module/' /usr/local/apache2/conf/httpd.conf; \
    # Compress all files except images \
    echo 'SetOutputFilter DEFLATE' >> /usr/local/apache2/conf/httpd.conf; \
    echo 'SetEnvIfNoCase Request_URI "\.(?:gif|jpe?g|png)$" no-gzip' >> /usr/local/apache2/conf/httpd.conf; \
    # Disable caching for .js, .json, and .html files \
    echo '<FilesMatch ".(js|json|html)$">' >> /usr/local/apache2/conf/httpd.conf; \
    echo '    Header set Cache-Control "no-cache"' >> /usr/local/apache2/conf/httpd.conf; \
    echo '</FilesMatch>' >> /usr/local/apache2/conf/httpd.conf; \
    \
    # Privileged ports are permitted to root only by default. \
    # setcap to bind to privileged ports (80) as non-root. \
    apk --no-cache add libcap; \
    setcap 'cap_net_bind_service=+ep' /usr/local/apache2/bin/httpd; \
    \
    # Change ownership of logs directory \
    chown www-data:www-data /usr/local/apache2/logs; \
    \
    # Change ownership of settings location \
    chown www-data:www-data -R /usr/local/apache2/htdocs/operationsgateway;

# Switch to non-root user defined in httpd image
USER www-data

ENV API_URL="/operationsgateway-api"
ENV PLUGIN_HOST="/operationsgateway"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
