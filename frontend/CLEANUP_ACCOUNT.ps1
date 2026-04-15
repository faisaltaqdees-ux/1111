# Remove all account/auth-related code from the project
# Keep only WireFluid blockchain integration
# Windows PowerShell version

Write-Host "🗑️ Removing account-related functionality..." -ForegroundColor Cyan

# Remove authentication directories
if (Test-Path "app/login") { Remove-Item -Recurse -Force "app/login"; Write-Host "✅ Removed app/login" }
if (Test-Path "app/signup") { Remove-Item -Recurse -Force "app/signup"; Write-Host "✅ Removed app/signup" }
if (Test-Path "app/api/auth") { Remove-Item -Recurse -Force "app/api/auth"; Write-Host "✅ Removed app/api/auth" }

# Remove authentication files
if (Test-Path "components/AuthModal.tsx") { Remove-Item -Force "components/AuthModal.tsx"; Write-Host "✅ Removed AuthModal.tsx" }
if (Test-Path "lib/auth.ts") { Remove-Item -Force "lib/auth.ts"; Write-Host "✅ Removed auth.ts" }

# Remove mobile auth screens
if (Test-Path "mobile/screens/Auth.tsx") { Remove-Item -Force "mobile/screens/Auth.tsx"; Write-Host "✅ Removed mobile Auth.tsx" }

Write-Host ""
Write-Host "✅ All account-related directories and files removed!" -ForegroundColor Green
Write-Host "✅ Project now uses WireFluid blockchain only!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. npm install (to clean dependencies)"
Write-Host "2. npm run dev (to test)"
