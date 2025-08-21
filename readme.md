# Trello Todo Wallpaper Generator

This project creates iPhone wallpapers from your Trello todo lists using webhooks. It fetches tasks from your Trello boards and generates a wallpaper image that you can set as your iPhone background.

## Features

- 🔄 **Trello Webhook Integration** - Automatically updates when your Trello board changes
- 📱 **iPhone Wallpaper Generation** - Creates properly sized wallpaper images (1179x2556)
- 📋 **Multiple List Support** - Separate sections for work and university tasks
- 📝 **Markdown Export** - Also generates a markdown todo file
- ⚡ **Real-time Updates** - Updates immediately when Trello cards change
- 🎨 **Customizable Design** - Configure colors, fonts, and layout

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/csantiagopaz/trello-todo-wallpaper.git
   cd trello-todo-wallpaper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Trello API**
   - Get your Trello API key from: https://trello.com/app-key
   - Generate a token by visiting: `https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&name=Todo%20Wallpaper&key=YOUR_API_KEY`
   - Copy `.env.example` to `.env` and fill in your credentials

4. **Find your Board and List IDs**
   ```bash
   # Get your boards
   curl "https://api.trello.com/1/members/me/boards?key=YOUR_API_KEY&token=YOUR_TOKEN"
   
   # Get lists from a board
   curl "https://api.trello.com/1/boards/BOARD_ID/lists?key=YOUR_API_KEY&token=YOUR_TOKEN"
   ```

5. **Configure your lists in `.env`**
   ```env
   TRELLO_API_KEY=your_api_key
   TRELLO_TOKEN=your_token
   TRELLO_BOARD_ID=your_board_id
   WORK_LIST_IDS=list_id_1,list_id_2
   UNIVERSITY_LIST_IDS=list_id_3,list_id_4
   ```

6. **Start the server**
   ```bash
   npm start
   ```

## Usage

### Endpoints

- `GET /` - Health check and status
- `GET /wallpaper` - Download the generated wallpaper image
- `GET /todo.md` - Download the markdown todo file
- `GET /todos` - Get the current todos as JSON
- `POST /refresh` - Manually trigger a refresh
- `POST /webhook` - Trello webhook endpoint

### Setting up Trello Webhook

1. Create a webhook pointing to your server:
   ```bash
   curl -X POST \
     "https://api.trello.com/1/tokens/YOUR_TOKEN/webhooks/?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "description": "Todo Wallpaper Webhook",
       "callbackURL": "https://your-server.com/webhook",
       "idModel": "YOUR_BOARD_ID"
     }'
   ```

### Setting iPhone Wallpaper

1. Open `http://your-server.com/wallpaper` in Safari on your iPhone
2. Save the image to Photos
3. Go to Settings > Wallpaper > Choose a New Wallpaper
4. Select the saved image from Photos

## Configuration

Edit `.env` to customize:

- **WALLPAPER_WIDTH/HEIGHT** - Wallpaper dimensions (default: iPhone 14 Pro)
- **BACKGROUND_COLOR** - Background color (default: #1a1a1a)
- **TEXT_COLOR** - Text color (default: #ffffff)
- **FONT_SIZE** - Font size for tasks (default: 24)

## Development

```bash
# Start in development mode
npm run dev

# Test the webhook
curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{}'

# Manual refresh
curl -X POST http://localhost:3000/refresh
```

## File Structure

```
├── index.js          # Main server application
├── package.json      # Dependencies and scripts
├── .env.example      # Environment configuration template
├── todo.md          # Generated markdown todo list
├── wallpaper.png    # Generated wallpaper image
└── readme.md        # This file
```

## Troubleshooting

- **No tasks showing**: Check your list IDs in the `.env` file
- **Wallpaper not generating**: Ensure Canvas dependencies are installed
- **Webhook not working**: Verify the webhook URL is accessible from the internet
- **Trello API errors**: Check your API key and token are correct

## License

MIT

