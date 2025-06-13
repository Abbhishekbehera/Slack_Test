const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config()

const SLACK_BOT = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL

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
    console.log(messages)
    io.emit('slack_messages', messages);

    res.json({ status: 'ok', messages });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch messages from Slack' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
});

async function postMsg() {
  try {
    const res = await axios.post(process.env.SLACK_URL, {
      channel: CHANNEL_ID,
      text: "I need a Backend Developer with 3+ years experience."
    }, {
      headers: {
        Authorization: `Bearer ${SLACK_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    console.log("Message Posted", res.data)
  } catch (e) {
    console.log("Error while passing message :", e)
  }
}

postMsg()

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
