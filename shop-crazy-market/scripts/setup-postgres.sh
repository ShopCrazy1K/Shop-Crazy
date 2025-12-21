#!/bin/bash

# PostgreSQL Setup Script
# This script helps set up PostgreSQL for Shop Crazy Market

set -e

echo "🐘 PostgreSQL Setup for Shop Crazy Market"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check current DATABASE_URL
CURRENT_DB=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- || echo "")

if [[ "$CURRENT_DB" == *"file:"* ]] || [[ "$CURRENT_DB" == *"sqlite"* ]]; then
    echo -e "${YELLOW}Current database: SQLite${NC}"
    echo ""
    echo "Please choose a PostgreSQL provider:"
    echo "1) Supabase (Recommended - Free tier)"
    echo "2) Railway"
    echo "3) Neon"
    echo "4) Manual (I have a connection string)"
    echo ""
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            echo ""
            echo "📝 Supabase Setup:"
            echo "1. Go to https://supabase.com and create account"
            echo "2. Create a new project"
            echo "3. Go to Project Settings → Database"
            echo "4. Copy the 'Connection string' → 'URI'"
            echo ""
            read -p "Paste your Supabase connection string: " db_url
            ;;
        2)
            echo ""
            echo "📝 Railway Setup:"
            echo "1. Go to https://railway.app and create account"
            echo "2. Create new project → Provision PostgreSQL"
            echo "3. Go to PostgreSQL service → Variables tab"
            echo "4. Copy the DATABASE_URL"
            echo ""
            read -p "Paste your Railway connection string: " db_url
            ;;
        3)
            echo ""
            echo "📝 Neon Setup:"
            echo "1. Go to https://neon.tech and create account"
            echo "2. Create a new project"
            echo "3. Copy the connection string from dashboard"
            echo ""
            read -p "Paste your Neon connection string: " db_url
            ;;
        4)
            echo ""
            read -p "Paste your PostgreSQL connection string: " db_url
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    # Validate connection string
    if [[ "$db_url" != *"postgresql://"* ]] && [[ "$db_url" != *"postgres://"* ]]; then
        echo -e "${RED}❌ Invalid PostgreSQL connection string${NC}"
        echo "Connection string should start with 'postgresql://' or 'postgres://'"
        exit 1
    fi
    
    # Add sslmode if not present
    if [[ "$db_url" != *"sslmode"* ]]; then
        if [[ "$db_url" == *"?"* ]]; then
            db_url="${db_url}&sslmode=require"
        else
            db_url="${db_url}?sslmode=require"
        fi
    fi
    
    # Update .env file
    if grep -q "^DATABASE_URL=" .env; then
        # Replace existing DATABASE_URL
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        else
            # Linux
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        fi
    else
        # Add new DATABASE_URL
        echo "" >> .env
        echo "DATABASE_URL=\"$db_url\"" >> .env
    fi
    
    echo -e "${GREEN}✅ Updated DATABASE_URL in .env${NC}"
    echo ""
else
    echo -e "${GREEN}✅ PostgreSQL connection string already configured${NC}"
    echo "Current: ${CURRENT_DB:0:50}..."
    echo ""
fi

# Verify Prisma schema
echo "🔍 Validating Prisma schema..."
if npx prisma validate > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma schema is valid${NC}"
else
    echo -e "${RED}❌ Prisma schema validation failed${NC}"
    npx prisma validate
    exit 1
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
if npm run postinstall > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${YELLOW}⚠️  Running prisma generate manually...${NC}"
    npx prisma generate
fi

# Test database connection
echo ""
echo "🔌 Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${YELLOW}⚠️  Could not test connection automatically${NC}"
    echo "This is okay - we'll test when pushing schema"
fi

# Ask to push schema
echo ""
read -p "Push schema to PostgreSQL database? (y/n): " push_choice

if [[ "$push_choice" == "y" || "$push_choice" == "Y" ]]; then
    echo ""
    echo "📤 Pushing schema to database..."
    if npm run db:push; then
        echo -e "${GREEN}✅ Schema pushed successfully!${NC}"
        echo ""
        echo "🎉 PostgreSQL setup complete!"
        echo ""
        echo "Next steps:"
        echo "1. Verify in Prisma Studio: npm run db:studio"
        echo "2. Test your application"
        echo "3. Deploy to production"
    else
        echo -e "${RED}❌ Schema push failed${NC}"
        echo "Please check your connection string and database permissions"
        exit 1
    fi
else
    echo ""
    echo "⏭️  Skipping schema push"
    echo ""
    echo "To push schema later, run:"
    echo "  npm run db:push"
    echo ""
    echo "Or create a migration:"
    echo "  npm run db:migrate"
fi

echo ""
echo "✅ Setup script complete!"

