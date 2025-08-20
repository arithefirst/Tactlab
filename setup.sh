#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}Tactlab Docker Stack Setup${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/arithefirst/Tactlab/refs/heads/main/docker-compose.yml"
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo -e "${GREEN}Downloading docker-compose.yml from GitHub...${NC}"
curl -sSL "$DOCKER_COMPOSE_URL" -o "$DOCKER_COMPOSE_FILE"
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to download docker-compose.yml!${NC}"
  exit 1
fi
echo -e "${GREEN}Downloaded docker-compose.yml${NC}"

echo -e "${YELLOW}----------------------------------------${NC}"


# Prompt for environment variables
echo -e "${CYAN}Please enter the following environment variables:${NC}"

echo -en "${YELLOW}S3 Access Key:${NC} "
read MINIO_USER
echo -en "${YELLOW}S3 Secret Key:${NC} "
read MINIO_PASS
echo -en "${YELLOW}S3 Port:${NC} "
read S3_PORT
echo -en "${YELLOW}S3 Endpoint:${NC} "
read S3_ENDPOINT
echo -en "${YELLOW}S3 Use SSL (true/false) [default: false]:${NC} "
read S3_USE_SSL
if [ -z "$S3_USE_SSL" ]; then
  S3_USE_SSL="false"
fi
echo -en "${YELLOW}Clerk Publishable Key:${NC} "
read CLERK_PUB
echo -en "${YELLOW}Clerk Secret Key:${NC} "
read CLERK_SEC
echo -en "${YELLOW}Twelvelabs API Key:${NC} "
read TL_API
echo -en "${YELLOW}Twelvelabs Index ID:${NC} "
read TL_INDEX
echo -en "${YELLOW}Database Username:${NC} "
read DB_USER
echo -en "${YELLOW}Database Password:${NC} "
read DB_PASS

echo -e "${YELLOW}----------------------------------------${NC}"

# Replace placeholders in docker-compose.yml
echo -e "${GREEN}Configuring docker-compose.yml...${NC}"

sed -i "s/S3_ACCESSKEY=minioadmin/S3_ACCESSKEY=${MINIO_USER}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/S3_SECRETKEY=minioadmin/S3_SECRETKEY=${MINIO_PASS}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/S3_PORT=9000/S3_PORT=${S3_PORT}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/S3_ENDPOINT=127.0.0.1/S3_ENDPOINT=${S3_ENDPOINT}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/S3_USE_SSL=false/S3_USE_SSL=${S3_USE_SSL}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUB}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/CLERK_SECRET_KEY=your_clerk_secret_key_here/CLERK_SECRET_KEY=${CLERK_SEC}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/TL_API_KEY=your_tactlab_api_key_here/TL_API_KEY=${TL_API}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/TL_INDEX_ID=your_tactlab_index_id_here/TL_INDEX_ID=${TL_INDEX}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/<user>/${DB_USER}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/<password>/${DB_PASS}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/POSTGRES_USER=postgres/POSTGRES_USER=${DB_USER}/g" "$DOCKER_COMPOSE_FILE"
sed -i "s/POSTGRES_PASSWORD=postgres/POSTGRES_PASSWORD=${DB_PASS}/g" "$DOCKER_COMPOSE_FILE"

echo -e "${GREEN}docker-compose.yml configured successfully!${NC}"
echo -e "${CYAN}You can now run:${NC} ${YELLOW}docker compose up -d${NC}"