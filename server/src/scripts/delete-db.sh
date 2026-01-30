#!/bin/bash

echo "🗑️ PostgreSQL Database Deletion Script"
echo "====================================="
echo ""

# List existing databases
echo "📋 Current databases:"
psql postgres -c "\l" | grep -E "^\s+\w" | awk '{print "   - " $1}'

echo ""
read -p "📝 Enter database name to delete: " DB_NAME

if [ -z "$DB_NAME" ]; then
    echo "❌ Database name cannot be empty!"
    exit 1
fi

read -p "👤 Enter database user to delete (optional, press Enter to skip): " DB_USER

echo ""
echo "⚠️  WARNING: This will permanently delete:"
echo "   Database: ${DB_NAME}"
if [ ! -z "$DB_USER" ]; then
    echo "   User: ${DB_USER}"
fi
echo ""

read -p "🤔 Are you absolutely sure? Type 'DELETE' to confirm: " confirm

if [ "$confirm" != "DELETE" ]; then
    echo "❌ Deletion cancelled."
    exit 1
fi

echo ""
echo "🗑️ Deleting database..."

# Terminate active connections
echo "🔌 Terminating active connections..."
psql postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}' AND pid <> pg_backend_pid();" 2>/dev/null

# Delete database
echo "🗑️ Dropping database..."
if psql postgres -c "DROP DATABASE ${DB_NAME};" 2>/dev/null; then
    echo "✅ Database '${DB_NAME}' deleted successfully"
else
    echo "❌ Failed to delete database '${DB_NAME}'"
    exit 1
fi

# Delete user if specified
if [ ! -z "$DB_USER" ]; then
    echo "👤 Dropping user..."
    if psql postgres -c "DROP USER ${DB_USER};" 2>/dev/null; then
        echo "✅ User '${DB_USER}' deleted successfully"
    else
        echo "❌ Failed to delete user '${DB_USER}' (might not exist or have dependencies)"
    fi
fi

# Clean up .env file
if [ -f .env ]; then
    echo "📝 Cleaning up .env file..."
    grep -v "^DATABASE_URL=" .env > .env.tmp 2>/dev/null || touch .env.tmp
    mv .env.tmp .env
    echo "✅ DATABASE_URL removed from .env"
fi

echo ""
echo "🎉 Database deletion complete!"
echo ""
echo "📋 Remaining databases:"
psql postgres -c "\l" | grep -E "^\s+\w" | awk '{print "   - " $1}'