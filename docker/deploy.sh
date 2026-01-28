#!/bin/bash

# Portfolio Docker Deployment Script
# Usage: ./deploy.sh [build|up|down|restart|logs]

set -e

PROJECT_DIR="/var/www/portfolio"
cd $PROJECT_DIR

case "$1" in
    build)
        echo "Building Docker image..."
        docker compose build --no-cache
        ;;
    up)
        echo "Starting containers..."
        docker compose up -d
        ;;
    down)
        echo "Stopping containers..."
        docker compose down
        ;;
    restart)
        echo "Restarting containers..."
        docker compose down
        docker compose up -d
        ;;
    logs)
        docker compose logs -f
        ;;
    update)
        echo "Updating and rebuilding..."
        git pull origin master
        docker compose build
        docker compose down
        docker compose up -d
        echo "Done! Checking status..."
        docker compose ps
        ;;
    status)
        docker compose ps
        ;;
    *)
        echo "Usage: $0 {build|up|down|restart|logs|update|status}"
        exit 1
        ;;
esac
