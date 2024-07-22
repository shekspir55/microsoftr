build:
	docker compose build 

build_no_cache:
	docker compose build --no-cache

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down ; docker compose up -d

logs:
	docker compose logs
