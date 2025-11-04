#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=====================================${NC}"
echo -e "${YELLOW}  ReplayHub Deployment Script${NC}"
echo -e "${YELLOW}=====================================${NC}"
echo ""
echo "This will build and deploy:"
echo "  1. Frontend (app.replayhub.app)"
echo "  2. Backend API (api.replayhub.app)"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [[ $confirm != "yes" && $confirm != "y" ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Build Frontend
echo -e "${YELLOW}[1/5] Pulling latest Frontend code...${NC}"
cd /var/www/vhosts/replayhub.app/app.replayhub.app || exit 1

if git pull origin main; then
    echo -e "${GREEN}✓ Frontend code updated${NC}"
else
    echo -e "${RED}✗ Frontend git pull failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[2/5] Building Frontend...${NC}"
if NEXT_PUBLIC_API_URL=https://api.replayhub.app/api npm run build; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[3/5] Running post-build script...${NC}"
if node scripts/post-build-web.js; then
    echo -e "${GREEN}✓ Post-build script completed${NC}"
else
    echo -e "${RED}✗ Post-build script failed${NC}"
    exit 1
fi

# Build Backend
echo ""
echo -e "${YELLOW}[4/5] Pulling latest Backend code...${NC}"
cd /var/www/vhosts/replayhub.app/api.replayhub.app || exit 1

if git pull origin main; then
    echo -e "${GREEN}✓ Backend code updated${NC}"
else
    echo -e "${RED}✗ Backend git pull failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[5/5] Building Backend API...${NC}"
if npm run build:api; then
    echo -e "${GREEN}✓ Backend API build successful${NC}"
else
    echo -e "${RED}✗ Backend API build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Remember to restart the API service:"
echo "  pm2 restart esports-api"
