const express = require('express');
const Trello = require('node-trello');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Trello client
let trello;
if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
  trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_TOKEN);
}

// Store for current todo data
let currentTodos = {
  work: [],
  university: [],
  lastUpdated: null
};

/**
 * Fetch cards from specified Trello lists
 */
async function fetchTrelloCards() {
  if (!trello) {
    console.log('Trello not configured, using sample data');
    return {
      work: [
        { name: 'Complete project documentation', due: '2024-01-15' },
        { name: 'Review code changes', due: '2024-01-16' },
        { name: 'Team meeting preparation', due: '2024-01-17' }
      ],
      university: [
        { name: 'Study for final exam', due: '2024-01-18' },
        { name: 'Submit assignment', due: '2024-01-19' },
        { name: 'Group project meeting', due: '2024-01-20' }
      ]
    };
  }

  try {
    const workListIds = process.env.WORK_LIST_IDS?.split(',') || [];
    const universityListIds = process.env.UNIVERSITY_LIST_IDS?.split(',') || [];
    
    const workCards = [];
    const universityCards = [];

    // Fetch work cards
    for (const listId of workListIds) {
      if (listId.trim()) {
        const cards = await new Promise((resolve, reject) => {
          trello.get(`/1/lists/${listId.trim()}/cards`, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        workCards.push(...cards.map(card => ({
          name: card.name,
          due: card.due,
          desc: card.desc
        })));
      }
    }

    // Fetch university cards
    for (const listId of universityListIds) {
      if (listId.trim()) {
        const cards = await new Promise((resolve, reject) => {
          trello.get(`/1/lists/${listId.trim()}/cards`, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        universityCards.push(...cards.map(card => ({
          name: card.name,
          due: card.due,
          desc: card.desc
        })));
      }
    }

    return {
      work: workCards,
      university: universityCards
    };
  } catch (error) {
    console.error('Error fetching Trello cards:', error);
    return currentTodos;
  }
}

/**
 * Generate wallpaper image from todo data
 */
function generateWallpaper(todos) {
  const width = parseInt(process.env.WALLPAPER_WIDTH) || 1179;
  const height = parseInt(process.env.WALLPAPER_HEIGHT) || 2556;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = process.env.BACKGROUND_COLOR || '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Text styling
  ctx.fillStyle = process.env.TEXT_COLOR || '#ffffff';
  const fontSize = parseInt(process.env.FONT_SIZE) || 24;
  ctx.font = `${fontSize}px Arial`;

  let y = 100;
  const lineHeight = fontSize + 10;
  const margin = 40;

  // Title
  ctx.font = `${fontSize + 10}px Arial Bold`;
  ctx.fillText('📋 Weekly Todo List', margin, y);
  y += lineHeight * 2;

  // Work section
  if (todos.work && todos.work.length > 0) {
    ctx.font = `${fontSize + 5}px Arial Bold`;
    ctx.fillText('💼 Work Tasks', margin, y);
    y += lineHeight;
    
    ctx.font = `${fontSize}px Arial`;
    todos.work.forEach((task, index) => {
      const taskText = `• ${task.name}`;
      const lines = wrapText(ctx, taskText, width - margin * 2);
      lines.forEach(line => {
        ctx.fillText(line, margin + 20, y);
        y += lineHeight;
      });
      
      if (task.due) {
        const dueDate = new Date(task.due).toLocaleDateString();
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`  Due: ${dueDate}`, margin + 40, y);
        ctx.fillStyle = process.env.TEXT_COLOR || '#ffffff';
        y += lineHeight;
      }
      y += 5; // Extra spacing between tasks
    });
    y += lineHeight;
  }

  // University section
  if (todos.university && todos.university.length > 0) {
    ctx.font = `${fontSize + 5}px Arial Bold`;
    ctx.fillText('🎓 University Tasks', margin, y);
    y += lineHeight;
    
    ctx.font = `${fontSize}px Arial`;
    todos.university.forEach((task, index) => {
      const taskText = `• ${task.name}`;
      const lines = wrapText(ctx, taskText, width - margin * 2);
      lines.forEach(line => {
        ctx.fillText(line, margin + 20, y);
        y += lineHeight;
      });
      
      if (task.due) {
        const dueDate = new Date(task.due).toLocaleDateString();
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`  Due: ${dueDate}`, margin + 40, y);
        ctx.fillStyle = process.env.TEXT_COLOR || '#ffffff';
        y += lineHeight;
      }
      y += 5; // Extra spacing between tasks
    });
  }

  // Last updated timestamp
  y = height - 100;
  ctx.font = `${fontSize - 6}px Arial`;
  ctx.fillStyle = '#888888';
  const timestamp = todos.lastUpdated || new Date().toISOString();
  ctx.fillText(`Last updated: ${new Date(timestamp).toLocaleString()}`, margin, y);

  return canvas;
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Update todos and generate new wallpaper
 */
async function updateTodos() {
  console.log('Updating todos...');
  try {
    const todos = await fetchTrelloCards();
    currentTodos = {
      ...todos,
      lastUpdated: new Date().toISOString()
    };

    // Generate wallpaper
    const canvas = generateWallpaper(currentTodos);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'wallpaper.png'), buffer);

    // Also create markdown file
    generateMarkdownTodo(currentTodos);

    console.log('Todos updated successfully');
    return currentTodos;
  } catch (error) {
    console.error('Error updating todos:', error);
    throw error;
  }
}

/**
 * Generate markdown todo file
 */
function generateMarkdownTodo(todos) {
  let markdown = '# 📋 Weekly Todo List\n\n';
  
  if (todos.work && todos.work.length > 0) {
    markdown += '## 💼 Work Tasks\n\n';
    todos.work.forEach(task => {
      markdown += `- [ ] ${task.name}`;
      if (task.due) {
        markdown += ` (Due: ${new Date(task.due).toLocaleDateString()})`;
      }
      markdown += '\n';
    });
    markdown += '\n';
  }

  if (todos.university && todos.university.length > 0) {
    markdown += '## 🎓 University Tasks\n\n';
    todos.university.forEach(task => {
      markdown += `- [ ] ${task.name}`;
      if (task.due) {
        markdown += ` (Due: ${new Date(task.due).toLocaleDateString()})`;
      }
      markdown += '\n';
    });
    markdown += '\n';
  }

  markdown += `---\n*Last updated: ${new Date(todos.lastUpdated).toLocaleString()}*\n`;

  fs.writeFileSync(path.join(__dirname, 'todo.md'), markdown);
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Trello Todo Wallpaper Generator',
    lastUpdated: currentTodos.lastUpdated,
    hasWorkTasks: currentTodos.work?.length > 0,
    hasUniversityTasks: currentTodos.university?.length > 0
  });
});

// Get current todos
app.get('/todos', (req, res) => {
  res.json(currentTodos);
});

// Get wallpaper image
app.get('/wallpaper', (req, res) => {
  const wallpaperPath = path.join(__dirname, 'wallpaper.png');
  if (fs.existsSync(wallpaperPath)) {
    res.sendFile(wallpaperPath);
  } else {
    res.status(404).json({ error: 'Wallpaper not found. Try refreshing todos first.' });
  }
});

// Get markdown todo
app.get('/todo.md', (req, res) => {
  const todoPath = path.join(__dirname, 'todo.md');
  if (fs.existsSync(todoPath)) {
    res.sendFile(todoPath);
  } else {
    res.status(404).json({ error: 'Todo markdown not found. Try refreshing todos first.' });
  }
});

// Manual refresh endpoint
app.post('/refresh', async (req, res) => {
  try {
    const todos = await updateTodos();
    res.json({
      success: true,
      message: 'Todos refreshed successfully',
      todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Trello webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  
  // Verify webhook if secret is configured
  if (process.env.WEBHOOK_SECRET) {
    // Add webhook verification logic here if needed
  }

  // Trigger todo update asynchronously
  updateTodos().catch(console.error);

  res.status(200).send('OK');
});

// Initialize on startup
updateTodos().catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Wallpaper endpoint: http://localhost:${PORT}/wallpaper`);
  console.log(`Todos endpoint: http://localhost:${PORT}/todos`);
  console.log(`Markdown todo: http://localhost:${PORT}/todo.md`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = app;