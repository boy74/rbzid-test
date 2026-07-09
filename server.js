const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const Groq = require('groq-sdk');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "rbzid_1783268762598_h76kku";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "EAAOTZB73mu2IBRZCskpK4rCoZAUERkGXoyTcZBC0pxaGCYcuq63awLRVvT6XiIbLqOHWM2ZAvAOQmKH7fZAyoBaiBaQUZALvKZCHPaz06S5ZBXcOwpv4xbAt3OsaqlK6PqmE9mS1RnUsWk7pP8yv0sDPLyb9IZCf6zWycc2JukprqycVZBfDfbZAN8L2TWQZABqurPCIE4n675gZDZD";

const groq = process.env.GROQ_API_KEY? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

app.get('/', (req, res) => res.send('RBZID BOT IS LIVE! 🤖🔥'));
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  console.log(`🔥 WEBHOOK HIT! ${new Date().toLocaleTimeString()}`);
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const ev = entry.messaging[0];
      if (ev.message && ev.message.text) {
        const sender = ev.sender.id;
        const text = ev.message.text;
        console.log(`Message from ${sender}: ${text}`);
        let reply = `You said: ${text}`;
        if (groq) {
          try {
            const completion = await groq.chat.completions.create({
              messages: [{ role: "user", content: text }],
              model: "llama-3.1-8b-instant",
            });
            reply = completion.choices[0]?.message?.content || reply;
          } catch(e){ console.log("Groq error:", e.message); }
        }
        await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
          recipient: { id: sender },
          message: { text: reply }
        }).catch(e=>console.log(e.response?.data || e.message));
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else res.sendStatus(404);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
