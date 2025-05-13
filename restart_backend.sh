#!/bin/bash

# Install pm2 globally if not available
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install pm2 -g
fi

# Kill existing services
pm2 stop appservice
pm2 stop scrapperservice

# App Server Setup
echo "Starting appservice..."

appserverpath="./backend/appserver"
npm install --prefix "$appserverpath"
pm2 start "$appserverpath/server.js" --name "appservice" --env "$appserverpath/.env"

# Common dependencies
npm install --prefix "./backend/common"

# Scrapper Setup
echo "Starting scrapperservice..."

scrapperpath="./backend/scrapper"
npm install --prefix "$scrapperpath"
pm2 start "$scrapperpath/server.js" --name "scrapperservice" --env "$scrapperpath/.env"

# Save PM2 process list
pm2 save

echo "All services restarted successfully!"