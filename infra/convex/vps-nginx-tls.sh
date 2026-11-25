#!/bin/bash
set -e
nginx -t
systemctl reload nginx
certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
  -d convex-api.evidcheck.com
echo "--- TLS done, adding 8443 actions listener ---"
cat > /etc/nginx/sites-enabled/convex-api-actions.config <<'NGINX'
# Convex HTTP actions: REST API + Paystack webhook (plain path routing).
server {
	server_name convex-api.evidcheck.com;
	listen 8443 ssl;
	ssl_certificate /etc/letsencrypt/live/convex-api.evidcheck.com/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/convex-api.evidcheck.com/privkey.pem;
	include /etc/letsencrypt/options-ssl-nginx.conf;
	ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

	location / {
		proxy_pass http://127.0.0.1:3211;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
NGINX
nginx -t
systemctl reload nginx
echo "--- verifying listeners ---"
ss -tlnp | grep -E ':(443|8443) ' | head -5
curl -sk https://127.0.0.1:8443/version || curl -sk https://convex-api.evidcheck.com:8443/ -o /dev/null -w "site %{http_code}\n"
curl -s http://127.0.0.1:3210/version; echo
