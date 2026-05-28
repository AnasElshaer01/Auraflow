#!/usr/bin/env bash
# AuraFlow — pull latest changes from GitHub
set -euo pipefail

REPO="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/AnasElshaer01/Auraflow.git"

echo "→ Fetching from GitHub..."
git fetch "$REPO" main

echo "→ Merging into local main..."
git merge FETCH_HEAD --ff-only

echo ""
echo "✓ Up to date with https://github.com/AnasElshaer01/Auraflow"
git log --oneline -5
