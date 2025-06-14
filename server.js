const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

const SLACK_BOT = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL;

// 🔧 Get username from Slack API if userId is present (for human users)
async function getUsernameFromUserId(userId) {
  if (!userId) return 'Unknown';
  try {
    const res = await axios.get('https://slack.com/api/users.info', {
      headers: {
        Authorization: `Bearer ${SLACK_BOT}`,
      },
      params: { user: userId },
    });

    return res.data.user?.real_name || 'Unknown';
  } catch (e) {
    console.error(`Error fetching username for ${userId}:`, e.message);
    return 'Unknown';
  }
}

// 🟢 Route to fetch Slack messages
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

    const rawMessages = response.data.messages;
    

    const userMessages = rawMessages.filter(msg => !msg.subtype);

    const messages = await Promise.all(
      userMessages.map(async (msg) => {
        const userId = msg.user || msg.bot_profile?.user_id || null;

        // Handle bot vs user
        let username = 'Unknown';
        if (msg.bot_profile && msg.bot_profile.name) {
          username = msg.bot_profile.name; //  use bot name
        } else {
          username = await getUsernameFromUserId(userId); //  fallback to API
        }

        return {
          user_id: userId,
          username,
          text: msg.text || '',
          app_id: msg.app_id || null,
        };
      })
    );

    console.log(messages);

    io.emit('slack_messages', messages);
    res.json({ status: 'ok', messages });
  } catch (error) {
    console.error("Slack API error:", error.message);
    res.status(500).json({ error: 'Failed to fetch messages from Slack' });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected via WebSocket');
});

// Start server
const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
