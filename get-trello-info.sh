#!/bin/bash

# Helper script to get Trello board and list information

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <API_KEY> <TOKEN>"
    echo ""
    echo "Get your API key from: https://trello.com/app-key"
    echo "Generate a token by visiting:"
    echo "https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&name=Todo%20Wallpaper&key=YOUR_API_KEY"
    exit 1
fi

API_KEY=$1
TOKEN=$2

echo "🔍 Fetching your Trello boards..."
echo ""

# Get boards
BOARDS=$(curl -s "https://api.trello.com/1/members/me/boards?key=$API_KEY&token=$TOKEN")

if [ $? -ne 0 ]; then
    echo "❌ Error fetching boards. Check your API key and token."
    exit 1
fi

echo "📋 Your boards:"
echo "$BOARDS" | jq -r '.[] | "\(.id) - \(.name)"' 2>/dev/null || {
    echo "$BOARDS" | grep -o '"id":"[^"]*"' | sed 's/"id":"//g' | sed 's/"//g'
    echo ""
    echo "⚠️  Install jq for better formatting: sudo apt-get install jq"
}

echo ""
echo "📝 To get lists for a board, run:"
echo "curl \"https://api.trello.com/1/boards/BOARD_ID/lists?key=$API_KEY&token=$TOKEN\""
echo ""
echo "💡 Copy the board ID and list IDs to your .env file!"