#!/bin/sh
# Script de arranque del proxy Nginx con soporte HTTPS
#
# Genera un certificado SSL autofirmado la PRIMERA vez que arranca.
# En arranques siguientes reutiliza el certificado del volumen ssl-certs.

set -e

SSL_DIR="/etc/nginx/ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"
CNF_FILE="/tmp/ssl.cnf"

mkdir -p "$SSL_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "Instalando openssl..."
    apk add --no-cache openssl > /dev/null 2>&1

    echo "Generando certificado SSL autofirmado para localhost..."

    cat > "$CNF_FILE" << 'EOF'
[req]
distinguished_name = req_dn
x509_extensions    = v3_req
prompt             = no

[req_dn]
C  = ES
ST = Cadiz
L  = Jerez de la Frontera
O  = JerezSur Inmobiliaria
CN = localhost

[v3_req]
subjectAltName   = DNS:localhost,IP:127.0.0.1
keyUsage         = keyEncipherment,dataEncipherment,digitalSignature
extendedKeyUsage = serverAuth
basicConstraints = CA:FALSE
EOF

    openssl req \
        -x509 \
        -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out    "$CERT_FILE" \
        -sha256 \
        -days   365 \
        -nodes \
        -config "$CNF_FILE" 2>/dev/null

    chmod 600 "$KEY_FILE"
    echo "Certificado SSL generado correctamente (valido 365 dias)"
    echo "AVISO: El navegador mostrara una advertencia la primera vez, acepta el riesgo para continuar."
else
    echo "Certificado SSL ya existe, reutilizando."
fi

exec nginx -g "daemon off;"
