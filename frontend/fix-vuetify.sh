#!/bin/bash

# Fix for Vuetify imports across all Vue files
echo "Fixing Vuetify imports in Vue files..."

# Remove old-style Vuetify imports
find src -name "*.vue" -type f -exec sed -i '' \
  -e '/import.*from "vuetify\/lib\/components/d' \
  -e '/import.*from "vuetify\/lib\/directives/d' \
  -e '/import.*from "vuetify\/lib\/labs/d' {} \;

# Remove any empty /* Vuetify */ comments
find src -name "*.vue" -type f -exec sed -i '' \
  -e '/\/\* Vuetify \*\//d' {} \;

echo "Fix complete! Restart your dev server." 