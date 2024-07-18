build:
	docker build -t microsoftr .


up: down build
	docker-compose up -d

down:
	docker-compose down