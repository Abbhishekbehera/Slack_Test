const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SLACK_BOT = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL;

app.get('/slack-messages', async (req, res) => {
  try {
    const response = await axios.get('https://slack.com/api/conversations.history', {
      headers: {
        Authorization: `Bearer ${SLACK_BOT}`,
      },
      params: {
        channel: CHANNEL_ID,
      },
    });

    const messages = response.data.messages;

    // Optional: transform data here if needed (e.g., extract user, text, ts)
    console.log(messages);

    // Emit to all connected clients
    io.emit('slack_messages', messages);

    res.json({ status: 'ok', messages });
  } catch (error) {
    console.error("Slack API error:", error.message);
    res.status(500).json({ error: 'Failed to fetch messages from Slack' });
  }
});

// Socket.io connection listener
io.on('connection', (socket) => {
  console.log('Client connected via WebSocket');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
