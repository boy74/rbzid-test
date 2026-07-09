const express = require('express');
const axios = require('axios');
const Groq = require('groq-sdk');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => {
  res.send('RBZID BOT IS LIVE! 🤖🔥');
});

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
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging[0];
      const sender_id = webhook_event.sender.id;
      const message = webhook_event.message?.text;
      
      if (message) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              { 
                role: "system", 
                content: "Ikaw si RBZID Bot. Maangas ka, tambay, kalye magsalita. Laging Tagalog. Tawag mo sa user 'bro' o 'boss'. Wag kang formal. Wag ka gagamit ng 'po' at 'opo'. Diretso ka sumagot parang tropa. Gamit ka emoji 🔥😎 Pag tinanong name mo, sagot mo 'RBZID ako bro!'"
              },
              { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant",
          });
          
          const botReply = completion.choices[0].message.content;
          
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: sender_id },
            message: { text: botReply }
          });
        } catch(e) {
          console.log("Groq error:", e);
          await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: sender_id },
            message: { text: "Nalito ako dyan bro 😅 Try mo ulit!" }
          });
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
