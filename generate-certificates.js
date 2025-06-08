// Script para generar certificados autofirmados para desarrollo
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}
const certPath = path.join(certDir, 'cert.pem');
const keyPath = path.join(certDir, 'key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('Generando certificados SSL para backend...');
  try {
    execSync(`openssl req -x509 -newkey rsa:4096 -sha256 -days 365 -nodes -keyout "${keyPath}" -out "${certPath}" -subj "/CN=localhost"`);
    console.log('Certificados generados correctamente.');
  } catch (err) {
    console.error('Error generando certificados:', err);
  }
} else {
  console.log('Certificados ya existen.');
}
