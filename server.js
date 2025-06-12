require('dotenv').config()

const axios = require('axios')

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN
const CHANNEL_ID = process.env.SLACK_CHANNEL

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