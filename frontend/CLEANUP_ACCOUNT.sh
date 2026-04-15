#!/bin/bash
# Remove all account/auth-related code from the project
# Keep only WireFluid blockchain integration

echo "🗑️ Removing account-related functionality..."

# Remove authentication directories
rm -rf app/login
rm -rf app/signup
rm -rf app/api/auth

# Remove authentication files
rm -f components/AuthModal.tsx
rm -f lib/auth.ts

# Remove mobile auth screens
rm -f mobile/screens/Auth.tsx

echo "✅ Account-related directories and files removed!"
echo "✅ Project now uses WireFluid blockchain only!"
echo ""
echo "Next steps:"
echo "1. npm install to clean dependencies"
echo "2. npm run dev to test"
