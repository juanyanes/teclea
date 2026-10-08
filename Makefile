.PHONY: check test lint practicar stats instalar

check: lint test

lint:
	uv run ruff check .

test:
	uv run pytest -q

practicar:
	uv run teclea

stats:
	uv run teclea stats

# Deja el comando `teclea` disponible en ~/.local/bin.
instalar:
	uv tool install --force --editable .
