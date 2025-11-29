#!/bin/bash

# List of files to process
files=(
  "src/pages/Notifications.tsx"
  "src/pages/Payments.tsx"
  "src/pages/Analytics.tsx"
  "src/pages/Settings.tsx"
  "src/pages/Jobs.tsx"
  "src/pages/Profile.tsx"
  "src/pages/Reviews.tsx"
  "src/pages/Contracts.tsx"
  "src/pages/Projects.tsx"
  "src/pages/GigApplications.tsx"
  "src/pages/Proposals.tsx"
  "src/pages/Users.tsx"
  "src/pages/Dashboard.tsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  # Remove the import line
  sed -i "/import AppLayout from/d" "$file"
  # Remove <AppLayout> opening tags
  sed -i "s/<AppLayout>//g" "$file"
  # Remove </AppLayout> closing tags
  sed -i "s/<\/AppLayout>//g" "$file"
done

echo "Done!"
