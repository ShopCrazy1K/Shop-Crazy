#!/bin/bash

# Checkout Flow Testing Script
# This script tests the checkout API endpoint with various scenarios

BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
API_URL="${BASE_URL}/api/checkout"

echo "🧪 Testing Checkout Flow Security"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test API endpoint
test_endpoint() {
    local test_name="$1"
    local expected_status="$2"
    local headers="$3"
    local data="$4"
    
    echo "Testing: $test_name"
    
    if [ -z "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
            -H "Content-Type: application/json" \
            -H "$headers" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $http_code (Expected: $expected_status)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - Status: $http_code (Expected: $expected_status)"
        echo "Response: $body"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: No authentication (should fail)
echo "Test 1: Unauthenticated Request"
test_endpoint "Unauthenticated checkout" 401 "" '{"items": [{"name": "Test", "price": 1000, "quantity": 1}]}'

# Test 2: Invalid user ID (should fail)
echo "Test 2: Invalid User ID"
test_endpoint "Invalid user ID" 401 "x-user-id: invalid-user-id" '{"items": [{"name": "Test", "price": 1000, "quantity": 1}]}'

# Test 3: Empty items array (should fail)
echo "Test 3: Empty Items Array"
test_endpoint "Empty items" 400 "x-user-id: test-user-id" '{"items": []}'

# Test 4: Invalid price (should fail)
echo "Test 4: Invalid Price (Negative)"
test_endpoint "Negative price" 400 "x-user-id: test-user-id" '{"items": [{"name": "Test", "price": -100, "quantity": 1}]}'

# Test 5: Invalid quantity (should fail)
echo "Test 5: Invalid Quantity (Zero)"
test_endpoint "Zero quantity" 400 "x-user-id: test-user-id" '{"items": [{"name": "Test", "price": 1000, "quantity": 0}]}'

# Test 6: Invalid shipping total (should fail)
echo "Test 6: Invalid Shipping Total (Negative)"
test_endpoint "Negative shipping" 400 "x-user-id: test-user-id" '{"items": [{"name": "Test", "price": 1000, "quantity": 1}], "shippingTotal": -100}'

# Test 7: Missing items (should fail)
echo "Test 7: Missing Items"
test_endpoint "Missing items" 400 "x-user-id: test-user-id" '{}'

# Summary
echo "=================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All security tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
    exit 1
fi

