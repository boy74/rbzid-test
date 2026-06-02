const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/api/verify', (req, res) => {
  const { fingerprint } = req.body;
  console.log('May nag-verify:', fingerprint);
  
  const token = 'rbzid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  res.json({ rbzid: token });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => console.log('RBZID running sa http://localhost:3000'));
