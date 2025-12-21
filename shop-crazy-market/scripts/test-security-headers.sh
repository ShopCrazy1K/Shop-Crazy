#!/bin/bash

# Security Headers Testing Script
# Tests that security headers are present on all routes

BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"

echo "🔒 Testing Security Headers"
echo "==========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Required headers
REQUIRED_HEADERS=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "X-XSS-Protection"
    "Content-Security-Policy"
)

# Optional but recommended
RECOMMENDED_HEADERS=(
    "Strict-Transport-Security"
    "Referrer-Policy"
)

# Pages to test
PAGES=(
    "/"
    "/marketplace"
    "/cart"
    "/login"
    "/signup"
)

check_headers() {
    local url="$1"
    local page="$2"
    
    echo "Checking: $page"
    
    headers=$(curl -s -I "$url" | grep -i "^[a-z-]*:")
    
    missing_required=()
    missing_recommended=()
    
    for header in "${REQUIRED_HEADERS[@]}"; do
        if ! echo "$headers" | grep -qi "^$header:"; then
            missing_required+=("$header")
        fi
    done
    
    for header in "${RECOMMENDED_HEADERS[@]}"; do
        if ! echo "$headers" | grep -qi "^$header:"; then
            missing_recommended+=("$header")
        fi
    done
    
    if [ ${#missing_required[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required headers present${NC}"
        if [ ${#missing_recommended[@]} -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Missing recommended headers: ${missing_recommended[*]}${NC}"
        fi
    else
        echo -e "${RED}❌ Missing required headers: ${missing_required[*]}${NC}"
    fi
    
    echo ""
}

# Test each page
for page in "${PAGES[@]}"; do
    check_headers "${BASE_URL}${page}" "$page"
done

echo "==========================="
echo "Security headers check complete!"

