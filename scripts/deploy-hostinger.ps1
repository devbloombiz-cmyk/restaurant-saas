param(
  [string]$AppRoot = "/var/www/restaurant-saas",
  [string]$ReleaseName = "release"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Hostinger VPS deployment"

$releasePath = Join-Path $AppRoot $ReleaseName

Write-Host "Preparing release directory: $releasePath"
ssh root@YOUR_VPS_HOST "mkdir -p $releasePath"

Write-Host "Uploading project files"
scp -r .\* "root@YOUR_VPS_HOST:$releasePath"

$remoteScript = @"
set -e
cd $releasePath
npm ci
npm run build
mkdir -p logs
pm2 startOrReload scripts/pm2/ecosystem.config.cjs
pm2 save
sudo cp scripts/nginx/restaurant-saas.conf /etc/nginx/sites-available/restaurant-saas.conf
sudo ln -sf /etc/nginx/sites-available/restaurant-saas.conf /etc/nginx/sites-enabled/restaurant-saas.conf
sudo nginx -t
sudo systemctl reload nginx
"@

Write-Host "Executing remote release commands"
ssh root@YOUR_VPS_HOST $remoteScript

Write-Host "Deployment completed"
