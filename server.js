const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "rbzid_1783268762598_h76kku";
const PAGE_ACCESS_TOKEN = "EAAOTZB73mu2IBRZCskpK4rCoZAUERkGXoyTcZBC0pxaGCYcuq63awLRVvT6XiIbLqOHWM2ZAvAOQmKH7fZAyoBaiBaQUZALvKZCHPaz06S5ZBXcOwpv4xbAt3OsaqlK6PqmE9mS1RnUsWk7pP8yv0sDPLyb9IZCf6zWycc2JukprqycVZBfDfbZAN8L2TWQZABqurPCIE4n675gZDZD"

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  console.log(`🔥 WEBHOOK HIT! Time: ${new Date().toLocaleTimeString()}`);
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      if (webhookEvent.message && webhookEvent.message.text) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;
        console.log('📨 Received message:', webhookEvent.message);
        await sendMessage(senderPsid, `Bot gumagana na! Nareceive ko: ${messageText}`);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function sendMessage(senderPsid, messageText) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderPsid },
        message: { text: messageText }
      }
    );
    console.log('Message sent to PSID:', senderPsid);
  } catch (error) {
    console.error('Unable to send message:', error.response.data);
  }
}

app.listen(3000, () => console.log('Server running on port 3000'));
