#!/bin/bash

# Terminal Passthrough API Test
# Testing if we can create a VZC user through Terminal's passthrough

TERMINAL_SECRET_KEY="sk_sandbox_Cffv94cF6htJWR3neaTcugYPztedgk6A"
CONNECTION_TOKEN="con_tkn_CndKiCmKFkJiWiT37cDVmuuQFUBEp4wF"

echo "=== Terminal Passthrough API Test ==="
echo ""
echo "Test 1: List VZC Users via Passthrough"
echo "--------------------------------------"

# Test 1: GET users (should work)
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer $TERMINAL_SECRET_KEY" \
  -H "Connection-Token: $CONNECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "path": "/cmd/v1/users"
  }' | jq '.'

echo ""
echo ""
echo "Test 2: Create VZC User via Passthrough"
echo "----------------------------------------"

# Test 2: POST user (test if passthrough supports write operations)
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer $TERMINAL_SECRET_KEY" \
  -H "Connection-Token: $CONNECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/cmd/v1/users",
    "body": "{\"FirstName\":\"Test\",\"LastName\":\"User\",\"Email\":\"testuser@terminal.test\",\"UserName\":\"testuser_terminal\",\"Password\":\"TestPass123!\",\"TimeZone\":\"America/New_York\"}"
  }' | jq '.'

echo ""
echo ""
echo "Test 3: List VZC Groups via Passthrough (for comparison)"
echo "----------------------------------------------------------"

# Test 3: GET groups (should work - we know this endpoint exists)
curl -X POST https://api.sandbox.withterminal.com/passthrough \
  -H "Authorization: Bearer $TERMINAL_SECRET_KEY" \
  -H "Connection-Token: $CONNECTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "GET",
    "path": "/cmd/v1/groups"
  }' | jq '.'
