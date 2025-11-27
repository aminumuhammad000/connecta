#!/bin/bash

# Script to create an admin account on production server
# Usage: ./create-admin.sh

echo "========================================"
echo "Create Admin Account on Production"
echo "========================================"
echo ""

# Server URL
SERVER_URL="http://102.68.84.56:5000"

# Get admin details
read -p "Enter admin email: " EMAIL
read -sp "Enter admin password: " PASSWORD
echo ""
read -p "Enter first name: " FIRSTNAME
read -p "Enter last name: " LASTNAME

echo ""
echo "Creating admin account..."

# Create the admin user
RESPONSE=$(curl -s -w "\n%{http_code}" "$SERVER_URL/api/users/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"$FIRSTNAME\",
    \"lastName\": \"$LASTNAME\",
    \"userType\": \"admin\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo ""
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Admin account created successfully!"
  echo ""
  echo "Login credentials:"
  echo "Email: $EMAIL"
  echo "Password: [hidden]"
  echo ""
  echo "You can now login to the admin panel."
else
  echo "❌ Failed to create admin account"
  echo "Response: $BODY"
  echo "HTTP Code: $HTTP_CODE"
fi

echo ""
echo "========================================"
