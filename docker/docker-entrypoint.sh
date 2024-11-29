#!/bin/sh -eu

if [ ! -e /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.json ]

then

# file doesn't exist, so go with default settings file with env variable substitution
# if file exists, we skip this code as that means we've been supplied one from a mount

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in operationsgateway-settings.json from environment variables
sed -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"/operationsgateway\"|" \
    /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.example.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.json

rm "$TEMPFILE"

fi

# Run the CMD instruction
exec "$@"
