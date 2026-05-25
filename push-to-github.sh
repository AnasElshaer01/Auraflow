#!/usr/bin/env bash
# AuraFlow → GitHub push script
# Run this once from the Replit Shell tab to connect and push your code.
set -euo pipefail

REPO="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/AnasElshaer01/Auraflow.git"

echo "→ Configuring git identity..."
git config user.email "auraflow@replit.dev"
git config user.name "AuraFlow"

echo "→ Setting up GitHub remote..."
git remote remove github 2>/dev/null || true
git remote add github "$REPO"

echo "→ Pushing to GitHub..."
git push github main

echo ""
echo "✓ Done! Your code is now at: https://github.com/AnasElshaer01/Auraflow"

# Clean up: remove the token-embedded remote and replace with a clean HTTPS URL
git remote set-url github "https://github.com/AnasElshaer01/Auraflow.git"
echo "✓ Remote URL sanitised (token removed from URL)."
