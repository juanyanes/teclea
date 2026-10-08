.PHONY: check test lint servir publicar

check: lint test

lint:
	@for f in sitio/js/*.js tests/*.js; do node --check "$$f" || exit 1; done; echo "sintaxis ok"

test:
	node --test

# Sirve el sitio en http://127.0.0.1:8766 para verlo en el navegador.
servir:
	python3 -m http.server 8766 --bind 127.0.0.1 --directory sitio

# Publica sitio/ en Cloudflare (Worker con estaticos) -> https://teclea.yanes.me
publicar: check
	npx wrangler deploy
