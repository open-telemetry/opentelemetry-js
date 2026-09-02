#!/usr/bin/env sh
#
# Regenerate certificates that are used for tests using TLS.
# Certs are generated with a one year expiry, so periodic regen is required.
#
# Usage: npm run maint:regenerate-test-certs

rm ca.crt ca.key client.crt client.csr client.key server.crt server.csr server.key

openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Root/OU=Test/CN=ca"

openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Test/OU=Server/CN=localhost"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
openssl rsa -in server.key -out server.key

openssl genrsa -out client.key 4096
openssl req -new -key client.key -out client.csr -subj "/C=CL/ST=RM/L=OpenTelemetryTest/O=Test/OU=Client/CN=localhost"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
openssl rsa -in client.key -out client.key
