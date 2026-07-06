Write-Host "=== Project Health Check ===" -ForegroundColor Cyan

Write-Host "`nChecking src folders..." -ForegroundColor Yellow
Get-ChildItem .\src -Directory

Write-Host "`nChecking tools folders..." -ForegroundColor Yellow
Get-ChildItem .\tools -Directory

Write-Host "`nRunning build..." -ForegroundColor Yellow
npm run build
