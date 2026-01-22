#!/bin/bash

# This script adds .js extensions to dynamic imports for ESM compatibility

echo "🔧 Fixing dynamic imports by adding .js extensions..."

# Fix dynamic imports with double quotes
find src -name "*.ts" -type f -exec sed -i \
  -e 's|import("\(\.\/[^"]*\)")|import("\1.js")|g' \
  -e 's|import("\(\.\.\/[^"]*\)")|import("\1.js")|g' \
  {} \;

# Fix dynamic imports with single quotes
find src -name "*.ts" -type f -exec sed -i \
  -e "s|import('\(\.\/[^']*\)')|import('\1.js')|g" \
  -e "s|import('\(\.\.\/[^']*\)')|import('\1.js')|g" \
  {} \;

# Remove double .js.js extensions if any were accidentally created
find src -name "*.ts" -type f -exec sed -i \
  -e 's|\.js\.js")|.js")|g' \
  -e "s|\.js\.js')|.js')|g" \
  {} \;

echo "✅ Dynamic import fixes complete!"
