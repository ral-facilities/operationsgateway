# Dockerfile to build and serve OperationsGateway

# Build stage
FROM node:20.12.0-alpine3.19@sha256:ef3f47741e161900ddd07addcaca7e76534a9205e4cd73b2ed091ba339004a75 as builder

WORKDIR /operationsgateway-build

COPY . .

RUN set -eux; \
    \
    # Set the React production variable which holds reference to the path of the plugin build \
    sed -i "s#REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY=.*#REACT_APP_OPERATIONSGATEWAY_BUILD_DIRECTORY=/operationsgateway/#" .env.production; \
    \
    cp public/operationsgateway-settings.example.json public/operationsgateway-settings.json; \
    \
    # Note yarn rebuild - this is to let yarn rebuild binaries
    yarn rebuild && yarn build;

# Run stage
FROM httpd:2.4.58-alpine3.19@sha256:92535cf7f151901ba91b04186292c3bd5bf82aa6ffa6eb7bc405fefbffedd480

WORKDIR /usr/local/apache2/htdocs

COPY --from=builder /operationsgateway-build/build/. ./operationsgateway/

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
    # Change ownership of settings file \
    chown www-data:www-data /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.json;

# Switch to non-root user defined in httpd image
USER www-data

ENV API_URL="/operationsgateway-api"
ENV PLUGIN_HOST="/operationsgateway"

COPY docker/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["httpd-foreground"]
EXPOSE 80
