.PHONY: check test lint servir publicar login

check: lint test

lint:
	@for f in sitio/js/*.js tests/*.js; do node --check "$$f" || exit 1; done; echo "sintaxis ok"

test:
	node --test

# Sirve el sitio en http://127.0.0.1:8766 para verlo en el navegador.
servir:
	python3 -m http.server 8766 --bind 127.0.0.1 --directory sitio

# Publica sitio/ en Cloudflare (Worker con estaticos) -> https://teclea.yanes.me
# La zona yanes.me vive en la cuenta de juan@yanes.me; su sesion de wrangler esta en ~/.config/wrangler-yanes
# (XDG_CONFIG_HOME aparte para no pisar la de Citadelta). Sin esa sesion: `make login`.
WRANGLER_YANES = XDG_CONFIG_HOME=$(HOME)/.config/wrangler-yanes CLOUDFLARE_ACCOUNT_ID=0d1d5d77742607b5a8f58e6a8ab02702

publicar: check
	$(WRANGLER_YANES) npx wrangler deploy

login:
	mkdir -p $(HOME)/.config/wrangler-yanes
	$(WRANGLER_YANES) npx wrangler login
