#!/bin/bash

echo "🚀 PostgreSQL Database Setup Script"
echo "===================================="
echo ""

# Get user input
read -p "📝 Enter database name (default: myapp_db): " DB_NAME
DB_NAME=${DB_NAME:-myapp_db}

read -p "👤 Enter database user (default: myapp_user): " DB_USER
DB_USER=${DB_USER:-myapp_user}

# Read password securely (hidden input)
echo -n "🔒 Enter database password: "
read -s DB_PASSWORD
echo ""

# Confirm password
echo -n "🔒 Confirm password: "
read -s DB_PASSWORD_CONFIRM
echo ""

# Check if passwords match
if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match! Please try again."
    exit 1
fi

DB_HOST="localhost"
DB_PORT="5432"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo "📋 Summary:"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo "   Host: ${DB_HOST}:${DB_PORT}"
echo ""

# Confirm before proceeding
read -p "🤔 Continue with these settings? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled."
    exit 1
fi

echo ""
echo "🚀 Starting setup..."

# Check if PostgreSQL is installed
echo "🔍 Checking if PostgreSQL is installed..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo ""
    echo "📦 Install it first:"
    echo "   Mac:    brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "   CentOS: sudo yum install postgresql postgresql-server"
    exit 1
fi
echo "✅ PostgreSQL is installed"

# Start PostgreSQL
echo "🚀 Starting PostgreSQL service..."
if command -v brew &> /dev/null; then
    # macOS with Homebrew
    brew services start postgresql 2>/dev/null && echo "✅ PostgreSQL started (Homebrew)"
elif command -v systemctl &> /dev/null; then
    # Linux with systemd
    sudo systemctl start postgresql 2>/dev/null && echo "✅ PostgreSQL started (systemd)"
elif command -v service &> /dev/null; then
    # Linux with service
    sudo service postgresql start 2>/dev/null && echo "✅ PostgreSQL started (service)"
else
    echo "⚠️  Could not start PostgreSQL automatically. Make sure it's running manually."
fi

# Function to run PostgreSQL command with error handling
run_psql_command() {
    local command="$1"
    local description="$2"
    
    echo "📝 $description..."
    if psql postgres -c "$command" 2>/dev/null; then
        echo "✅ $description completed"
    else
        echo "❌ Failed: $description"
        echo "💡 You might need to run as postgres user:"
        echo "   sudo -u postgres psql -c \"$command\""
        return 1
    fi
}

# Create database and user
echo ""
echo "🗄️  Setting up database..."

# Drop existing database and user if they exist
run_psql_command "DROP DATABASE IF EXISTS ${DB_NAME};" "Removing existing database"
run_psql_command "DROP USER IF EXISTS ${DB_USER};" "Removing existing user"

# Create new user and database
run_psql_command "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}' CREATEDB;" "Creating user"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create user. Exiting."
    exit 1
fi

run_psql_command "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" "Creating database"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create database. Exiting."
    exit 1
fi

run_psql_command "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" "Granting privileges"

# Test connection
echo ""
echo "🔗 Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" &> /dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."
if [ -f .env ]; then
    # Remove existing DATABASE_URL line
    grep -v "^DATABASE_URL=" .env > .env.tmp 2>/dev/null
    mv .env.tmp .env
fi

# Add new DATABASE_URL
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
echo "✅ .env file updated"

# Setup Prisma
echo ""
echo "🔧 Setting up Prisma..."

if command -v npx &> /dev/null; then
    echo "📦 Generating Prisma client..."
    if npx prisma generate; then
        echo "✅ Prisma client generated"
    else
        echo "❌ Failed to generate Prisma client"
        exit 1
    fi

    echo "📤 Pushing schema to database..."
    if npx prisma db push; then
        echo "✅ Schema pushed to database"
    else
        echo "❌ Failed to push schema"
        exit 1
    fi
else
    echo "⚠️  npx not found. Please run manually:"
    echo "   npx prisma generate"
    echo "   npx prisma db push"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 Database Details:"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo "   Host: ${DB_HOST}"
echo "   Port: ${DB_PORT}"
echo ""
echo "🔗 Connection URL:"
echo "   ${DATABASE_URL}"
echo ""
echo "🎯 Next steps:"
echo "   1. Run: npx prisma studio"
echo "   2. Open: http://localhost:5555"
echo "   3. View your data in the browser!"
echo ""
echo "💾 Your credentials have been saved to .env file"
echo "🔄 To reset the database, just run this script again"