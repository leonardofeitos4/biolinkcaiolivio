require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('node:path');

const criarPreferencia = require('../api/criar-preferencia');
const webhook = require('../api/webhook');
const obrasStatus = require('../api/obras-status');
const adminLogin = require('../api/admin/login');
const adminLogout = require('../api/admin/logout');
const adminOrders = require('../api/admin/orders');
const mpConnect = require('../api/admin/mp/connect');
const mpCallback = require('../api/admin/mp/callback');
const mpStatus = require('../api/admin/mp/status');

const app = express();
const root = path.join(__dirname, '..');
const origens = (process.env.ORIGENS_PERMITIDAS || '*').split(',');

app.set('trust proxy', 1);
app.use(cors({ origin: origens.includes('*') ? true : origens, credentials: true }));
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  if (/\.(html|js|css)$/.test(req.path)) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});
app.use(express.static(root));

app.all('/api/criar-preferencia', criarPreferencia);
app.all('/criar-preferencia', criarPreferencia);
app.all('/api/webhook', webhook);
app.all('/webhook', webhook);
app.all('/api/obras-status', obrasStatus);
app.all('/api/admin/login', adminLogin);
app.all('/api/admin/logout', adminLogout);
app.all('/api/admin/orders', adminOrders);
app.all('/api/admin/mp/connect', mpConnect);
app.all('/api/admin/mp/callback', mpCallback);
app.all('/api/admin/mp/status', mpStatus);

app.get('/saude', (_, res) => res.json({ ok: true }));

const PORTA = process.env.PORTA || 3005;
app.listen(PORTA, () => {
  console.log(`Backend Caio Livio em http://localhost:${PORTA}`);
});
