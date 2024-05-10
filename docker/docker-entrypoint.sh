#!/bin/sh -eu

# Use a tempfile instead of sed -i so that only the file, not the directory needs to be writable
TEMPFILE="$(mktemp)"

# Set values in operationsgateway-settings.json from environment variables
sed -e "s|\"apiUrl\": \".*\"|\"apiUrl\": \"$API_URL\"|" \
    -e "s|\"pluginHost\": \".*\"|\"pluginHost\": \"/operationsgateway\"|" \
    /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.json > "$TEMPFILE"

cat "$TEMPFILE" > /usr/local/apache2/htdocs/operationsgateway/operationsgateway-settings.json

rm "$TEMPFILE"

# Run the CMD instruction
exec "$@"
