#!/bin/bash

# This script adds .js extensions to all local TypeScript imports for ESM compatibility

echo "🔧 Fixing ESM imports by adding .js extensions..."

# Find all .ts files and fix their imports
find src -name "*.ts" -type f -exec sed -i \
  -e 's|from "\(\.\/[^"]*\)";|from "\1.js";|g' \
  -e 's|from "\(\.\.\/[^"]*\)";|from "\1.js";|g' \
  -e "s|from '\(\.\/[^']*\)';|from '\1.js';|g" \
  -e "s|from '\(\.\.\/[^']*\)';|from '\1.js';|g" \
  {} \;

# Remove double .js.js extensions if any were accidentally created
find src -name "*.ts" -type f -exec sed -i \
  -e 's|\.js\.js"|.js"|g' \
  -e "s|\.js\.js'|.js'|g" \
  {} \;

echo "✅ Import fixes complete!"
