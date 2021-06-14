#!/usr/bin/env sh
#
# Usage: regenerate.sh
#
# regenerate.sh regenerates private key and certificate used in https tests and example
#

EXAMPLE_DIR="../../../../examples/https"
openssl req -x509 -nodes -newkey rsa -keyout server-key.pem -out server-cert.pem -days 3650 -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Root/OU=Test/CN=ca"
cp ./server-*.pem "$EXAMPLE_DIR/"
