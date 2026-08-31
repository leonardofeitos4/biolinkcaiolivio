const crypto = require('node:crypto');

function key() {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 16) throw new Error('APP_SECRET deve ter pelo menos 16 caracteres');
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(value) {
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decrypt(value) {
  if (!value) return null;
  const [ivRaw, tagRaw, encryptedRaw] = String(value).split('.');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key(),
    Buffer.from(ivRaw, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  const out = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64url')),
    decipher.final(),
  ]);
  return out.toString('utf8');
}

module.exports = { encrypt, decrypt };
