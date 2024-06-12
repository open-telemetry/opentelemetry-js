#!/usr/bin/env sh
#
# Regenerate TLS certificates that are used by "examples/https/".
# Certs are generated with a one year expiry, so periodic regen is required.
#
# Usage: npm run maint:regenerate-test-certs

EXAMPLE_DIR="../../../../../examples/https"
openssl req -x509 -nodes -newkey rsa -keyout server-key.pem -out server-cert.pem -days 3650 -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Root/OU=Test/CN=ca"
cp ./server-*.pem "$EXAMPLE_DIR/"
