# IQ Outsourcing Frontend Makefile

.PHONY: help install dev build test lint format clean docker-build docker-run docker-dev start stop

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies"
	@echo "  dev          - Start development server"
	@echo "  build        - Build for production"
	@echo "  preview      - Preview production build"
	@echo "  test         - Run tests"
	@echo "  test:ui      - Run tests with UI"
	@echo "  lint         - Run linter"
	@echo "  lint:fix     - Fix linting issues"
	@echo "  format       - Format code"
	@echo "  format:check - Check code formatting"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build production Docker image"
	@echo "  docker-dev   - Build development Docker image"
	@echo "  docker-run   - Run production Docker container"
	@echo "  start        - Build and start production server"

# Install dependencies
install:
	npm install

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Preview production build
preview:
	npm run preview

# Testing
test:
	npm run test

test-ui:
	npm run test:ui

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Formatting
format:
	npm run format

format-check:
	npm run format:check

# Clean
clean:
	rm -rf dist
	rm -rf node_modules
	rm -rf coverage

# Docker commands
docker-build:
	docker build -t iq-tickets-frontend .

docker-dev:
	docker build -f Dockerfile.dev -t iq-tickets-frontend:dev .

docker-run:
	docker run -p 80:80 --name iq-tickets-frontend iq-tickets-frontend

docker-run-dev:
	docker run -p 3000:3000 -v $(PWD):/app --name iq-tickets-frontend-dev iq-tickets-frontend:dev

# Production commands
start:
	npm run start

# CI/CD commands
ci-install:
	npm ci

ci-test:
	npm run test -- --coverage

ci-build:
	npm run build

# Quality checks
quality: lint format-check test

# All checks (for CI)
ci: ci-install quality ci-build
