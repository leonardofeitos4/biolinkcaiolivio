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
const { cancelExpiredCreatedOrders } = require('../api/_lib/orders');

const app = express();
const root = path.join(__dirname, '..');
const origens = (process.env.ORIGENS_PERMITIDAS || '*').split(',');

app.set('trust proxy', 1);
app.use(cors({ origin: origens.includes('*') ? true : origens, credentials: true }));
app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/admin/')) {
    const startedAt = Date.now();
    res.on('finish', () => {
      console.info('[admin/http]', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        hasCookie: Boolean(req.headers.cookie),
        hasBearer: Boolean(req.headers.authorization),
        ms: Date.now() - startedAt,
      });
    });
  }
  next();
});
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

if (process.env.DATABASE_URL) {
  const cleanupEveryMinutes = Math.max(1, Number(process.env.ORDER_CLEANUP_INTERVAL_MINUTES || 5));
  const cleanup = () => {
    cancelExpiredCreatedOrders().catch(err => {
      console.error('[orders/cleanup]', err.message || err);
    });
  };

  setTimeout(cleanup, 10 * 1000);
  setInterval(cleanup, cleanupEveryMinutes * 60 * 1000);
}
