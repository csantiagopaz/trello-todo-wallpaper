#!/bin/bash

# Quick setup script for Trello Todo Wallpaper

echo "🚀 Setting up Trello Todo Wallpaper..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Trello credentials before running the server."
else
    echo "✅ .env file already exists."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Trello API credentials"
echo "2. Run 'npm start' to start the server"
echo "3. Visit http://localhost:3000 to see the status"
echo "4. Get your wallpaper at http://localhost:3000/wallpaper"
echo ""
echo "For help getting Trello credentials, see the README.md file."